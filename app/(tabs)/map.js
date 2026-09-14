// Map Screen - Shows businesses on a map
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/theme';
import { businesses } from '../../constants/businesses';
import { categories } from '../../constants/categories';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const router = useRouter();
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredBusinesses = selectedCategory
    ? businesses.filter(b => b.category === selectedCategory)
    : businesses;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Map View</Text>
        <TouchableOpacity style={styles.listButton}>
          <Ionicons name="list-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryFilters}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            !selectedCategory && { backgroundColor: Colors.primary },
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.filterChipText, !selectedCategory && { color: '#FFF' }]}>All</Text>
        </TouchableOpacity>
        {categories.filter(c => c.slug !== 'more').map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.filterChip,
              selectedCategory === cat.id && { backgroundColor: Colors.primary },
            ]}
            onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
          >
            <Ionicons
              name={cat.icon}
              size={14}
              color={selectedCategory === cat.id ? '#FFF' : cat.color}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === cat.id && { color: '#FFF' },
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapGrid}>
            {/* Decorative grid lines */}
            {[...Array(8)].map((_, i) => (
              <View key={`h-${i}`} style={[styles.gridLineH, { top: `${(i + 1) * 11}%` }]} />
            ))}
            {[...Array(6)].map((_, i) => (
              <View key={`v-${i}`} style={[styles.gridLineV, { left: `${(i + 1) * 14}%` }]} />
            ))}
          </View>

          {/* Business pins */}
          {filteredBusinesses.map((biz, idx) => {
            const cat = categories.find(c => c.id === biz.category);
            const pinTop = 15 + (idx * 37) % 65;
            const pinLeft = 10 + (idx * 53) % 75;
            return (
              <TouchableOpacity
                key={biz.id}
                style={[styles.mapPin, { top: `${pinTop}%`, left: `${pinLeft}%` }]}
                onPress={() => setSelectedBusiness(biz)}
                activeOpacity={0.8}
              >
                <View style={[styles.pinBody, {
                  backgroundColor: selectedBusiness?.id === biz.id ? Colors.primary : (cat?.color || Colors.primary),
                }]}>
                  <Ionicons
                    name={cat?.icon || 'location'}
                    size={14}
                    color="#FFFFFF"
                  />
                </View>
                <View style={[styles.pinTail, {
                  borderTopColor: selectedBusiness?.id === biz.id ? Colors.primary : (cat?.color || Colors.primary),
                }]} />
              </TouchableOpacity>
            );
          })}

          {/* Center location indicator */}
          <View style={styles.centerDot}>
            <View style={styles.centerDotInner} />
            <View style={styles.centerDotRing} />
          </View>
        </View>

        <View style={styles.mapOverlayInfo}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
          <Text style={styles.mapInfoText}>
            Interactive map coming soon! Tap pins to preview.
          </Text>
        </View>
      </View>

      {/* Selected Business Card */}
      {selectedBusiness && (
        <TouchableOpacity
          style={styles.previewCard}
          onPress={() => router.push(`/business/${selectedBusiness.id}`)}
          activeOpacity={0.9}
        >
          <View style={styles.previewContent}>
            <View style={[styles.previewIcon, { backgroundColor: categories.find(c => c.id === selectedBusiness.category)?.bgColor }]}>
              <Ionicons
                name={categories.find(c => c.id === selectedBusiness.category)?.icon || 'location'}
                size={24}
                color={categories.find(c => c.id === selectedBusiness.category)?.color}
              />
            </View>
            <View style={styles.previewText}>
              <Text style={styles.previewName} numberOfLines={1}>{selectedBusiness.name}</Text>
              <View style={styles.previewMeta}>
                <View style={styles.previewRating}>
                  <Ionicons name="star" size={12} color="#FFB946" />
                  <Text style={styles.previewRatingText}>{selectedBusiness.rating}</Text>
                </View>
                <Text style={styles.previewDot}>•</Text>
                <Text style={styles.previewDistance}>{selectedBusiness.distance}</Text>
                <Text style={styles.previewDot}>•</Text>
                <Text style={[styles.previewStatus, { color: selectedBusiness.isOpen ? Colors.success : Colors.secondary }]}>
                  {selectedBusiness.isOpen ? 'Open' : 'Closed'}
                </Text>
              </View>
              <Text style={styles.previewAddress} numberOfLines={1}>{selectedBusiness.address}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  listButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryUltraLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryFilters: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },

  // Map
  mapContainer: {
    flex: 1,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    ...Shadow.medium,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#F0F2FF',
    position: 'relative',
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(108, 99, 255, 0.06)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(108, 99, 255, 0.06)',
  },
  mapPin: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  pinBody: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.small,
  },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  centerDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    zIndex: 2,
  },
  centerDotRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
  },
  mapOverlayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.primaryUltraLight,
  },
  mapInfoText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '500',
    flex: 1,
  },

  // Preview Card
  previewCard: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    ...Shadow.medium,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    flex: 1,
  },
  previewName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  previewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 2,
  },
  previewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  previewRatingText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.text,
  },
  previewDot: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },
  previewDistance: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  previewStatus: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  previewAddress: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginTop: 2,
  },
});
