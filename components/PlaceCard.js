// PlaceCard Component - Card design for Places matching website design
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Shadow, FontSize, Spacing } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function PlaceCard({ place, onPress, variant = 'grid' }) {
  if (!place) return null;

  const isGrid = variant === 'grid';
  const cardWidth = isGrid ? (width - Spacing.lg * 2 - Spacing.md) / 2 : 150;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { width: cardWidth },
        !isGrid && styles.horizontalCard,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: place.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.badgeOverlay}>
          <Ionicons name="location" size={10} color="#FFFFFF" style={{ marginRight: 2 }} />
          <Text style={styles.badgeText}>{place.businessCount || 10}+</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {place.name}
        </Text>
        {place.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {place.subtitle}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadow.small,
  },
  horizontalCard: {
    marginRight: Spacing.md,
    marginBottom: 0,
  },
  imageContainer: {
    width: '100%',
    height: 105,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
  },
  content: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  name: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
});
