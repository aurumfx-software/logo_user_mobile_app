// Favorites Screen - Saved/bookmarked businesses
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/theme';
import { businesses } from '../../constants/businesses';
import { categories } from '../../constants/categories';

// Mock favorites - using first few businesses
const initialFavorites = businesses.slice(0, 5);

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState(initialFavorites);

  const removeFavorite = (id) => {
    setFavorites(prev => prev.filter(b => b.id !== id));
  };

  const renderFavoriteItem = ({ item }) => {
    const cat = categories.find(c => c.id === item.category);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/business/${item.id}`)}
        activeOpacity={0.85}
      >
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <View style={styles.cardTop}>
            <View style={[styles.categoryBadge, { backgroundColor: cat?.bgColor }]}>
              <Ionicons name={cat?.icon} size={12} color={cat?.color} />
              <Text style={[styles.categoryText, { color: cat?.color }]}>{cat?.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.heartButton}
              onPress={() => removeFavorite(item.id)}
            >
              <Ionicons name="heart" size={20} color={Colors.secondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.cardMeta}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#FFB946" />
              <Text style={styles.ratingText}>{item.rating}</Text>
              <Text style={styles.reviewText}>({item.reviewCount})</Text>
            </View>
            <View style={styles.distanceRow}>
              <Ionicons name="navigate-outline" size={12} color={Colors.primary} />
              <Text style={styles.distanceText}>{item.distance}</Text>
            </View>
          </View>
          <View style={styles.cardBottom}>
            <Ionicons name="location-outline" size={13} color={Colors.textLight} />
            <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBg}>
        <Ionicons name="heart-outline" size={48} color={Colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptySubtitle}>
        Save businesses you love and they'll appear here
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => router.push('/(tabs)/search')}
      >
        <Text style={styles.exploreButtonText}>Explore Businesses</Text>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        {favorites.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{favorites.length}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderFavoriteItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />
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
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  countBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },

  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadow.small,
  },
  cardImage: {
    width: 110,
    height: '100%',
    minHeight: 120,
    resizeMode: 'cover',
  },
  cardContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  heartButton: {
    padding: 2,
  },
  cardName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewText: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  distanceText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: Spacing.xs,
  },
  addressText: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    flex: 1,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryUltraLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xl,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
