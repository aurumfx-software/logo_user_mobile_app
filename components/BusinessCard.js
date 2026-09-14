// BusinessCard Component - Displays a business listing card
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, BorderRadius, Shadow, Spacing, FontSize } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

export default function BusinessCard({ business, variant = 'horizontal' }) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/business/${business.id}`);
  };

  if (variant === 'vertical') {
    return (
      <TouchableOpacity style={styles.verticalCard} onPress={handlePress} activeOpacity={0.85}>
        <Image source={{ uri: business.image }} style={styles.verticalImage} />
        <View style={styles.verticalContent}>
          <View style={styles.rowBetween}>
            <Text style={styles.verticalName} numberOfLines={1}>{business.name}</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#FFB946" />
              <Text style={styles.ratingText}>{business.rating}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.infoText} numberOfLines={1}>{business.address}</Text>
          </View>
          <View style={styles.rowBetween}>
            <View style={styles.distanceBadge}>
              <Ionicons name="navigate-outline" size={11} color={Colors.primary} />
              <Text style={styles.distanceText}>{business.distance}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: business.isOpen ? Colors.successLight : Colors.secondaryLight }]}>
              <View style={[styles.statusDot, { backgroundColor: business.isOpen ? Colors.success : Colors.secondary }]} />
              <Text style={[styles.statusText, { color: business.isOpen ? Colors.success : Colors.secondary }]}>
                {business.isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.85}>
      <Image source={{ uri: business.image }} style={styles.image} />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={[styles.statusBadgeAbs, { backgroundColor: business.isOpen ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 107, 107, 0.9)' }]}>
            <Text style={styles.statusTextWhite}>{business.isOpen ? 'Open' : 'Closed'}</Text>
          </View>
          <View style={styles.ratingBadgeAbs}>
            <Ionicons name="star" size={12} color="#FFB946" />
            <Text style={styles.ratingTextWhite}>{business.rating}</Text>
          </View>
        </View>
        <View style={styles.bottomContent}>
          <Text style={styles.name} numberOfLines={1}>{business.name}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.8)" />
            <Text style={styles.metaText} numberOfLines={1}>{business.distance} away</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Horizontal card (for scrollable lists)
  card: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    ...Shadow.medium,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: BorderRadius.lg,
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadgeAbs: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusTextWhite: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  ratingBadgeAbs: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 3,
  },
  ratingTextWhite: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  bottomContent: {
    gap: 4,
  },
  name: {
    color: '#FFFFFF',
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSize.sm,
  },

  // Vertical card (for lists)
  verticalCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadow.small,
  },
  verticalImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  verticalContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  verticalName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF8E7',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  ratingText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: '#E6A300',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  distanceText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
