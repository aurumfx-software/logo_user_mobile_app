// CategoryIcon Component - Animated category icon button
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BorderRadius, Spacing, FontSize } from '../constants/theme';

export default function CategoryIcon({ category }) {
  const router = useRouter();

  const handlePress = () => {
    if (category.slug === 'more') {
      // Could navigate to a full category list
      return;
    }
    router.push(`/category/${category.slug}`);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: category.bgColor }]}>
        {category.iconUrl ? (
          <Image source={{ uri: category.iconUrl }} style={styles.iconImage} resizeMode="contain" />
        ) : (
          <Ionicons name={category.icon} size={26} color={category.color} />
        )}
      </View>
      <Text style={styles.label} numberOfLines={1}>{category.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 75,
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: 34,
    height: 34,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: '#4A4A5A',
    textAlign: 'center',
  },
});
