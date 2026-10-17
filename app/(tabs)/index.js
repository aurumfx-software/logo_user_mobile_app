// Home Screen - Discover nearby businesses
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import {
    Animated,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdBannerSlider from '../../components/AdBannerSlider';
import BusinessCard from '../../components/BusinessCard';
import CategoryIcon from '../../components/CategoryIcon';
import FeaturedOffersSection from '../../components/FeaturedOffersSection';
import KeralaDiscoveryFooter from '../../components/KeralaDiscoveryFooter';
import NewsUpdatesSection from '../../components/NewsUpdatesSection';
import LocationChip from '../../components/LocationChip';
import SearchBar from '../../components/SearchBar';
import { CardShimmer } from '../../components/ShimmerLoader';
import { BorderRadius, Colors, FontSize, Shadow, Spacing } from '../../constants/theme';
import useApi from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { useAppLocation } from '../../context/AppLocationContext';
import {
    fetchCategories,
    fetchMerchants,
    fetchPromotions,
} from '../../services/api';
import { filterMerchantsByArea, pickNearbyBusinesses } from '../../utils/geo';

const { width } = Dimensions.get('window');
const CATEGORY_COLUMNS = 5;
const MAX_HOME_CATEGORIES = CATEGORY_COLUMNS * 3;

function nameInitial(name, email) {
  const n = (name || email || 'G').trim();
  return n.charAt(0).toUpperCase();
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { selection, displayLabel, coordsForDistance } = useAppLocation();
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
      const [
        categories,
        merchants,
        promotions,
        tickerPromotions,
        featuredOffers,
        specialOffers,
        footerPromotions,
      ] = await Promise.all([
        fetchCategories({ force }),
        fetchMerchants({}, { force }),
        fetchPromotions({ placement: 'Home Top' }).catch((err) => {
          console.warn('Home Top promotions failed:', err?.message || err);
          return [];
        }),
        fetchPromotions({ placement: 'Moving Text' }).catch(() => []),
        fetchPromotions({ placement: 'Featured Offers' }).catch(() => []),
        fetchPromotions({ placement: 'Special Offer' }).catch(() => []),
        fetchPromotions({ placement: 'Above Footer' }).catch(() => []),
      ]);
      const seenOfferIds = new Set();
      const featuredOfferPromotions = [...featuredOffers, ...specialOffers].filter((p) => {
        if (seenOfferIds.has(p.id)) return false;
        seenOfferIds.add(p.id);
        return true;
      });
      return {
        categories,
        merchants,
        promotions,
        tickerPromotions,
        featuredOfferPromotions,
        footerPromotions,
      };
    },
    [],
    {
      categories: [],
      merchants: [],
      promotions: [],
      tickerPromotions: [],
      featuredOfferPromotions: [],
      footerPromotions: [],
    }
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
  const areaFilteredMerchants = useMemo(() => {
    if (!selection || selection.type === 'state') return businesses;
    const key = selection.type === 'district' ? selection.district || selection.name : selection.name;
    return filterMerchantsByArea(businesses, key);
  }, [businesses, selection]);
  const nearbyBusinesses = useMemo(
    () =>
      pickNearbyBusinesses(areaFilteredMerchants, coordsForDistance, {
        limit: 10,
        min: 4,
        fallbackMerchants: businesses,
      }),
    [areaFilteredMerchants, coordsForDistance, businesses]
  );
  const featuredBusinesses = businesses.filter((b) => b.isFeatured);
  const promotions = data.promotions;
  const tickerPromotions = data.tickerPromotions;
  const featuredOfferPromotions = data.featuredOfferPromotions;
  const footerPromotions = data.footerPromotions;
  const locationLabel = selection?.type !== 'state' ? displayLabel : null;

  const onRefresh = () => refresh();

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>
          {isAuthenticated && user?.name ? `Hello, ${user.name.split(' ')[0]}! 👋` : 'Hello! 👋'}
        </Text>
        <Text style={styles.subtitle}>
          {locationLabel ? `Showing places in ${locationLabel}` : 'Browse all of Kerala'}
        </Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.notifButton}>
          <Ionicons name="notifications-outline" size={22} color={Colors.text} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => router.push(isAuthenticated ? '/(tabs)/profile' : '/sign-in')}
          accessibilityLabel={isAuthenticated ? 'Open profile' : 'Sign in'}
        >
          <Text style={styles.avatarText}>{nameInitial(user?.name, user?.email)}</Text>
        </TouchableOpacity>
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
              params:
                selection?.type !== 'state' && selection?.name
                  ? { location: selection.name }
                  : undefined,
            })
          }
        >
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      {nearbyBusinesses.map((business) => (
        <BusinessCard key={business.id} business={business} variant="vertical" />
      ))}
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
          {/* ── Ad banner at top: ticker + full-width carousel ── */}
          <AdBannerSlider
            loading={loading}
            promotions={promotions}
            tickerItems={tickerPromotions}
            onPress={(item) => item.merchantId && router.push(`/business/${item.merchantId}`)}
          />

          {renderHeader()}

          <View style={styles.locationChipWrapper}>
            <LocationChip />
          </View>

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
              {renderNearby()}
              <FeaturedOffersSection
                offers={featuredOfferPromotions}
                onPressOffer={(item) => {
                  if (item.merchantId) {
                    router.push(`/business/${item.merchantId}`);
                  }
                }}
              />
              {renderFeatured()}
              <NewsUpdatesSection />
              <KeralaDiscoveryFooter
                promotions={footerPromotions}
                onPressPromo={(item) => {
                  if (item.merchantId) {
                    router.push(`/business/${item.merchantId}`);
                  } else {
                    router.push('/(tabs)/search');
                  }
                }}
              />
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
  locationChipWrapper: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xs,
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
