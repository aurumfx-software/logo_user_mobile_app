// Home Screen - Discover nearby businesses
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/theme';
import { categories } from '../../constants/categories';
import { businesses, featuredBusinesses, nearbyBusinesses } from '../../constants/businesses';
import BusinessCard from '../../components/BusinessCard';
import CategoryIcon from '../../components/CategoryIcon';
import SearchBar from '../../components/SearchBar';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Hello! 👋</Text>
        <Text style={styles.subtitle}>What do you need today?</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.notifButton}>
          <Ionicons name="notifications-outline" size={22} color={Colors.text} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
      </View>
    </View>
  );

  const renderBanner = () => (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      <View style={styles.bannerContent}>
        <View style={styles.bannerTextContent}>
          <Text style={styles.bannerTitle}>Discover Local{'\n'}Businesses</Text>
          <Text style={styles.bannerSubtitle}>Find shops, services & more near you</Text>
          <TouchableOpacity
            style={styles.bannerButton}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Text style={styles.bannerButtonText}>Explore Now</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.bannerIllustration}>
          <View style={styles.illustrationCircle}>
            <Ionicons name="location" size={40} color={Colors.primary} />
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderCategories = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.categoryGrid}>
        {categories.map((category) => (
          <CategoryIcon key={category.id} category={category} />
        ))}
      </View>
    </View>
  );

  const renderNearby = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Near You</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={nearbyBusinesses}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BusinessCard business={item} />}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );

  const renderFeatured = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      {featuredBusinesses.slice(0, 4).map((business) => (
        <BusinessCard key={business.id} business={business} variant="vertical" />
      ))}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsRow}>
      {[
        { icon: 'flash', label: 'Quick\nServices', color: '#FF6B6B', bg: '#FFE8E8' },
        { icon: 'time', label: 'Open\nNow', color: '#4CAF50', bg: '#E8F5E9' },
        { icon: 'star', label: 'Top\nRated', color: '#FFB946', bg: '#FFF3E0' },
        { icon: 'trending-up', label: 'Trending', color: '#6C63FF', bg: '#F0EFFF' },
      ].map((action, idx) => (
        <TouchableOpacity key={idx} style={[styles.quickAction, { backgroundColor: action.bg }]} activeOpacity={0.7}>
          <Ionicons name={action.icon} size={22} color={action.color} />
          <Text style={[styles.quickActionLabel, { color: action.color }]}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {renderHeader()}

          <View style={styles.searchWrapper}>
            <SearchBar onPress={() => router.push('/(tabs)/search')} />
          </View>

          {renderBanner()}
          {renderCategories()}
          {renderQuickActions()}
          {renderNearby()}
          {renderFeatured()}

          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2024 AurumFX Pvt Ltd</Text>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  notifButton: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.small,
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  searchWrapper: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },

  // Banner
  banner: {
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  bannerTextContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  bannerSubtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  bannerButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  bannerIllustration: {
    marginLeft: Spacing.md,
  },
  illustrationCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Sections
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  viewAll: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },

  // Category Grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.lg,
  },

  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  quickAction: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  quickActionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },

  // Horizontal List
  horizontalList: {
    paddingLeft: 0,
    paddingRight: Spacing.xl,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },
});
