// Places Screen - All Towns and Locations matching mylocalityinfo.com/place.php
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../constants/theme';
import { fetchMerchants, derivePlaces } from '../services/api';
import useApi from '../hooks/useApi';
import PlaceCard from '../components/PlaceCard';

const { width } = Dimensions.get('window');

export default function PlacesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: places } = useApi(async () => derivePlaces(await fetchMerchants()), [], []);

  const filteredPlaces = places.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.subtitle && p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const bannerItems = [
    {
      id: 'b1',
      title: 'BAG BAZAAR',
      sub: 'Top Brands & Huge Offers!',
      bg: '#DC2626',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    },
    {
      id: 'b2',
      title: 'ART CLASSES',
      sub: 'Explore Creativity in 1 Hour!',
      bg: '#D97706',
      image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400',
    },
    {
      id: 'b3',
      title: 'V R HERO MOTORS',
      sub: 'Authorized Sales & Service',
      bg: '#1E293B',
      image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* App Bar / Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleRow}>
          <Ionicons name="location" size={22} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.headerTitle}>Logo Places</Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Dark Hero Banner with Search */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Find Place</Text>
          <Text style={styles.heroSub}>Discover business solutions in your local area</Text>

          {/* Search Box */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#64748B" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="What are you finding?"
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Horizontal Banners Slider */}
        <View style={styles.bannersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.lg }}>
            {bannerItems.map((item) => (
              <View key={item.id} style={[styles.adCard, { backgroundColor: item.bg }]}>
                <View style={styles.adCardText}>
                  <Text style={styles.adCardTitle}>{item.title}</Text>
                  <Text style={styles.adCardSub}>{item.sub}</Text>
                </View>
                <Image source={{ uri: item.image }} style={styles.adCardImg} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Places Section Header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Places</Text>
            <Text style={styles.sectionSub}>Select a locality to view available services</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{filteredPlaces.length} Locations</Text>
          </View>
        </View>

        {/* Places 2-Column Grid */}
        <View style={styles.placesGrid}>
          {filteredPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              variant="grid"
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/search',
                  params: { location: place.name },
                })
              }
            />
          ))}
        </View>

        {/* Footer Section */}
        <View style={styles.footerContainer}>
          <View style={styles.footerBrandRow}>
            <Ionicons name="location" size={28} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.footerBrandText}>Logo</Text>
          </View>
          <Text style={styles.footerDesc}>
            Get your work done quickly and easily. Logo is a digital service provider that helps you in finding solutions to a variety of needs in your local area.
          </Text>

          <View style={styles.footerDivider} />

          <View style={styles.contactItem}>
            <Ionicons name="business" size={18} color="#93C5FD" style={styles.contactIcon} />
            <Text style={styles.contactText}>
              AURUMFX PVT LTD{'\n'}
              V/664, First Floor, Thekkekkara Antony Master Square,{'\n'}
              Kunnathangadi, Thrissur, Kerala - 680 012
            </Text>
          </View>

          <View style={styles.contactItem}>
            <Ionicons name="mail" size={18} color="#93C5FD" style={styles.contactIcon} />
            <Text style={styles.contactText}>info@aurumfx.net</Text>
          </View>

          <View style={styles.contactItem}>
            <Ionicons name="call" size={18} color="#93C5FD" style={styles.contactIcon} />
            <Text style={styles.contactText}>+91 75102 14060 / 75102 14080</Text>
          </View>

          <View style={styles.footerDivider} />

          <Text style={styles.copyrightText}>
            © COPYRIGHT 2026 | AURUMFX PVT LTD | ALL RIGHTS RESERVED
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    padding: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },  heroSection: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroSub: {
    fontSize: FontSize.sm,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    width: '100%',
    ...Shadow.medium,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: '#0F172A',
  },
  bannersSection: {
    marginTop: -Spacing.lg,
    marginBottom: Spacing.lg,
  },
  adCard: {
    width: 250,
    height: 100,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...Shadow.small,
  },
  adCardText: {
    flex: 1,
    marginRight: 8,
  },
  adCardTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  adCardSub: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  adCardImg: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  sectionSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: Colors.primaryUltraLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  countBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  placesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  footerContainer: {
    backgroundColor: '#1A1A2E',
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  footerBrandText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  footerDesc: {
    fontSize: FontSize.xs,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
    marginTop: 4,
  },
  footerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: Spacing.lg,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  contactIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  contactText: {
    fontSize: FontSize.xs,
    color: '#FFFFFF',
    lineHeight: 18,
    flex: 1,
  },
  copyrightText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontWeight: '600',
  },
});;
