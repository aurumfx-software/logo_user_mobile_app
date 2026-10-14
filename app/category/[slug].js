// Category Listing Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/theme';
import { fetchCategories, fetchMerchants, slugify } from '../../services/api';
import useApi from '../../hooks/useApi';
import { CardShimmer } from '../../components/ShimmerLoader';
import BusinessCard from '../../components/BusinessCard';
import { Image, ActivityIndicator } from 'react-native';

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();

  const { data, loading } = useApi(
    async () => {
      const cats = await fetchCategories();
      const category = cats.find((c) => c.slug === slug) || null;
      const list = await fetchMerchants({ category: category?.name || slug });
      return { category, businesses: list.filter((b) => b.category === slugify(category?.name || slug)) };
    },
    [slug],
    { category: null, businesses: [] }
  );
  const category = data.category;
  const categoryBusinesses = data.businesses;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.headerIcon, { backgroundColor: category?.bgColor }]}>
            {category?.iconUrl ? (
              <Image source={{ uri: category.iconUrl }} style={{ width: 22, height: 22 }} />
            ) : (
              <Ionicons name={category?.icon || 'pricetag-outline'} size={20} color={category?.color} />
            )}
          </View>
          <Text style={styles.headerTitle}>{category?.name || 'Category'}</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="funnel-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Description */}
      <View style={styles.descriptionCard}>
        <Text style={styles.descriptionText}>{category?.description}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{loading ? '…' : categoryBusinesses.length} places</Text>
        </View>
      </View>

      {/* Business List */}
      <FlatList
        data={categoryBusinesses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BusinessCard business={item} variant="vertical" />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View>
              <CardShimmer />
              <CardShimmer />
            </View>
          ) : (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconBg, { backgroundColor: category?.bgColor }]}>
              <Ionicons name={category?.icon || 'pricetag-outline'} size={40} color={category?.color} />
            </View>
            <Text style={styles.emptyTitle}>No {category?.name} Found</Text>
            <Text style={styles.emptySubtitle}>We couldn't find any businesses in this category near you</Text>
          </View>
          )
        }
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
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.small,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryUltraLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Description
  descriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.small,
  },
  descriptionText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: Spacing.md,
  },
  countBadge: {
    backgroundColor: Colors.primaryUltraLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  countText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
  },

  // List
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: Spacing.xxxl,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
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
});
