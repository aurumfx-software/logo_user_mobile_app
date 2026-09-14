// Business Detail Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/theme';
import { getBusinessById } from '../../constants/businesses';
import { categories } from '../../constants/categories';
import RatingStars from '../../components/RatingStars';

const { width } = Dimensions.get('window');

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);

  const business = getBusinessById(id);
  const category = categories.find(c => c.id === business?.category);

  if (!business) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Business not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleCall = () => {
    Linking.openURL(`tel:${business.phone}`);
  };

  const handleDirection = () => {
    const url = `https://maps.google.com/?q=${business.latitude},${business.longitude}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: business.image }} style={styles.heroImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.6)']}
            style={styles.heroGradient}
          />

          {/* Top Actions */}
          <SafeAreaView style={styles.topActions} edges={['top']}>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.topRight}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={22} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setIsFavorite(!isFavorite)}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isFavorite ? Colors.secondary : '#FFF'}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Status Badge */}
          <View style={styles.heroBottom}>
            <View style={[styles.statusBadge, {
              backgroundColor: business.isOpen ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 107, 107, 0.9)',
            }]}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{business.isOpen ? 'Open Now' : 'Closed'}</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Name & Category */}
          <View style={styles.nameSection}>
            <View style={styles.nameRow}>
              <Text style={styles.businessName}>{business.name}</Text>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: category?.bgColor }]}>
              <Ionicons name={category?.icon} size={14} color={category?.color} />
              <Text style={[styles.categoryText, { color: category?.color }]}>{category?.name}</Text>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingSection}>
            <RatingStars rating={business.rating} reviewCount={business.reviewCount} size={18} />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionBtn} onPress={handleCall}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="call" size={22} color="#4CAF50" />
              </View>
              <Text style={styles.quickActionLabel}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} onPress={handleDirection}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="navigate" size={22} color="#2196F3" />
              </View>
              <Text style={styles.quickActionLabel}>Direction</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="globe" size={22} color="#FF9800" />
              </View>
              <Text style={styles.quickActionLabel}>Website</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#F0EFFF' }]}>
                <Ionicons name="chatbubble" size={22} color="#6C63FF" />
              </View>
              <Text style={styles.quickActionLabel}>Chat</Text>
            </TouchableOpacity>
          </View>

          {/* Info Cards */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>About</Text>
            <Text style={styles.infoDescription}>{business.description}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Details</Text>

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="location" size={18} color="#2196F3" />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{business.address}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="call" size={18} color="#4CAF50" />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{business.phone}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="time" size={18} color="#FF9800" />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Hours</Text>
                <Text style={styles.infoValue}>{business.hours}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: '#F0EFFF' }]}>
                <Ionicons name="navigate" size={18} color="#6C63FF" />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Distance</Text>
                <Text style={styles.infoValue}>{business.distance} away</Text>
              </View>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsSection}>
            <Text style={styles.infoTitle}>Tags</Text>
            <View style={styles.tagsRow}>
              {business.tags.map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Reviews Placeholder */}
          <View style={styles.infoCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.infoTitle}>Reviews</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllReviews}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.reviewPlaceholder}>
              <Ionicons name="chatbubbles-outline" size={36} color={Colors.primaryLight} />
              <Text style={styles.reviewPlaceholderText}>Reviews coming soon</Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FontSize.lg,
    color: Colors.text,
    fontWeight: '600',
  },
  backLink: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: Spacing.md,
  },

  // Hero
  heroContainer: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  topActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  topRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBottom: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: '600',
  },

  // Content
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    marginTop: -24,
  },
  nameSection: {
    gap: Spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  businessName: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    flex: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  ratingSection: {
    marginTop: Spacing.md,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.xl,
    ...Shadow.small,
  },
  quickActionBtn: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  // Info Cards
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadow.small,
  },
  infoTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  infoDescription: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '500',
    marginTop: 2,
  },

  // Tags
  tagsSection: {
    marginBottom: Spacing.lg,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    backgroundColor: Colors.primaryUltraLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  tagText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Reviews
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllReviews: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  reviewPlaceholder: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  reviewPlaceholderText: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
  },
});
