// RatingStars Component - Displays star ratings
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontSize, Spacing } from '../constants/theme';

export default function RatingStars({ rating, reviewCount, size = 14, showCount = true }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={styles.container}>
      {[...Array(fullStars)].map((_, i) => (
        <Ionicons key={`full-${i}`} name="star" size={size} color="#FFB946" />
      ))}
      {hasHalfStar && <Ionicons name="star-half" size={size} color="#FFB946" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Ionicons key={`empty-${i}`} name="star-outline" size={size} color="#FFB946" />
      ))}
      {showCount && (
        <Text style={[styles.count, { fontSize: size - 2 }]}>
          {rating} ({reviewCount})
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  count: {
    color: '#9CA3AF',
    fontWeight: '500',
    marginLeft: Spacing.xs,
  },
});
