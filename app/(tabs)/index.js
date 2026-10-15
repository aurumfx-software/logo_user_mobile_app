// Home Screen - Discover nearby businesses
import React, { useRef, useEffect, useMemo } from 'react';
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
import {
  fetchCategories,
  fetchMerchants,
  fetchPromotions,
} from '../../services/api';
import useApi from '../../hooks/useApi';
import useUserLocation from '../../hooks/useUserLocation';
import { derivePlacesNearUser, pickNearbyBusinesses } from '../../utils/geo';
import { CardShimmer } from '../../components/ShimmerLoader';
import BusinessCard from '../../components/BusinessCard';
import CategoryIcon from '../../components/CategoryIcon';
import SearchBar from '../../components/SearchBar';
import PlaceCard from '../../components/PlaceCard';
import AdBannerSlider from '../../components/AdBannerSlider';

const { width } = Dimensions.get('window');
const CATEGORY_COLUMNS = 5;
const MAX_HOME_CATEGORIES = CATEGORY_COLUMNS * 3;

export default function HomeScreen() {
  const router = useRouter();
  const { location: userLocation, status: locationStatus } = useUserLocation();
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

  const { data, loading, error, refreshing, refresh, reload } = useApi(
    async (force) => {
      const [categories, merchants, promotions, tickerPromotions] = await Promise.all([
        fetchCategories({ force }),
        fetchMerchants({}, { force }),
        fetchPromotions({ placement: 'Home Top' }).catch((err) => {
          console.warn('Home Top promotions failed:', err?.message || err);
          return [];
        }),
        fetchPromotions({ placement: 'Moving Text' }).catch(() => []),
      ]);
      return { categories, merchants, promotions, tickerPromotions };
    },
    [],
    { categories: [], merchants: [], promotions: [], tickerPromotions: [] }
  );

  // Sort categories by actual merchant count so popular ones appear first
  const categoryCounts = {};
  data.merchants.forEach((m) => {
    const key = m.category; // slug
    categoryCounts[key] = (categoryCounts[key] || 0) + 1;
  });
  const sortedCategories = [...data.categories].sort(
    (a, b) => (categoryCounts[b.slug] || 0) - (categoryCounts[a.slug] || 0)
  );
  let homeCategoryCount = Math.min(sortedCategories.length, MAX_HOME_CATEGORIES);
  if (homeCategoryCount % CATEGORY_COLUMNS !== 0) {
    const fullRowCount =
      Math.ceil(homeCategoryCount / CATEGORY_COLUMNS) * CATEGORY_COLUMNS;
    homeCategoryCount = Math.min(sortedCategories.length, fullRowCount);
  }
  const categories = sortedCategories.slice(0, homeCategoryCount);
  const businesses = data.merchants;
  const nearbyBusinesses = useMemo(
    () => pickNearbyBusinesses(businesses, userLocation, 10),
    [businesses, userLocation]
  );
  const featuredBusinesses = businesses.filter((b) => b.isFeatured);
  const places = useMemo(
    () => derivePlacesNearUser(businesses, userLocation, 12),
    [businesses, userLocation]
  );
  const promotions = data.promotions;
  const tickerPromotions = data.tickerPromotions;
  const locationLabel =
    locationStatus === 'granted' && userLocation?.label ? userLocation.label : null;

  const onRefresh = () => refresh();

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Hello! 👋</Text>
        <Text style={styles.subtitle}>
          {locationLabel ? `Showing places near ${locationLabel}` : 'What do you need today?'}
        </Text>
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

  // replaced by AdBannerSlider above scroll content
  const _renderBanner = null;

  const renderCategories = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.categoryGrid}>
        {categories.map((category) => (
          <View key={category.id} style={styles.categoryGridItem}>
            <CategoryIcon category={category} />
          </View>
        ))}
      </View>
    </View>
  );

  // promotions now shown in AdBannerSlider at top
  const _renderPromotions = null;

  const renderNearby = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {locationLabel ? `Near ${locationLabel}` : 'Near You'}
        </Text>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/(tabs)/search',
              params: userLocation?.city ? { location: userLocation.city } : undefined,
            })
          }
        >
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

  const renderPlaces = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="location" size={20} color={Colors.primary} style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>
            {locationLabel ? 'Nearby Places' : 'Places'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/places')}>
          <Text style={styles.viewAll}>View All ({places.length})</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={places}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlaceCard
            place={item}
            variant="horizontal"
            onPress={() =>
              router.push({
                pathname: '/(tabs)/search',
                params: { location: item.name },
              })
            }
          />
        )}
        contentContainerStyle={styles.horizontalList}
      />
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
          {/* ── Ad banner at top: ticker + full-width carousel ── */}
          <AdBannerSlider
            loading={loading}
            promotions={promotions}
            tickerItems={tickerPromotions}
            onPress={(item) => item.merchantId && router.push(`/business/${item.merchantId}`)}
          />

          {renderHeader()}

          <View style={styles.searchWrapper}>
            <SearchBar onPress={() => router.push('/(tabs)/search')} />
          </View>

          {loading ? (
            <View style={{ paddingHorizontal: Spacing.xl, marginTop: Spacing.xl }}>
              <CardShimmer />
              <CardShimmer />
              <CardShimmer />
            </View>
          ) : error ? (
            <View style={styles.errorBox}>
              <Ionicons name="cloud-offline-outline" size={36} color={Colors.primary} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => reload()}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {renderCategories()}
              {renderQuickActions()}
              {renderPlaces()}
              {renderNearby()}
              {renderFeatured()}
            </>
          )}

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
  promoCard: {
    width: width * 0.75,
    height: 140,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginRight: Spacing.md,
    backgroundColor: Colors.surface,
    ...Shadow.small,
  },
  promoImage: {
    width: '100%',
    height: '100%',
  },
  promoOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.md,
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  errorBox: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  errorText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
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
    justifyContent: 'flex-start',
    rowGap: Spacing.lg,
  },
  categoryGridItem: {
    width: `${100 / CATEGORY_COLUMNS}%`,
    alignItems: 'center',
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
