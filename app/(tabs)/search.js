// Search / Explore Screen
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/theme';
import { fetchMerchants, fetchCategories } from '../../services/api';
import useApi from '../../hooks/useApi';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import BusinessCard from '../../components/BusinessCard';
import SearchBar from '../../components/SearchBar';

const recentSearches = ['Restaurants', 'Pharmacy', 'Advocates', 'Physiotherapy'];

const matches = (b, q) => {
  const s = q.toLowerCase();
  return (
    b.name.toLowerCase().includes(s) ||
    b.categoryName.toLowerCase().includes(s) ||
    b.city.toLowerCase().includes(s) ||
    b.address.toLowerCase().includes(s) ||
    b.tags.some((t) => String(t).toLowerCase().includes(s)) ||
    b.description.toLowerCase().includes(s)
  );
};

export default function SearchScreen() {
  const { location } = useLocalSearchParams();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { data, loading } = useApi(
    async () => {
      const [businesses, categories] = await Promise.all([fetchMerchants(), fetchCategories()]);
      return { businesses, categories };
    },
    [],
    { businesses: [], categories: [] }
  );
  const { businesses } = data;
  // Only show category chips that actually have merchants
  const categories = useMemo(() => {
    const used = new Set(businesses.map((b) => b.category));
    return data.categories.filter((c) => used.has(c.id));
  }, [data, businesses]);

  const results = useMemo(() => {
    let list = businesses;
    if (location) list = list.filter((b) => b.city.toLowerCase() === String(location).toLowerCase());
    if (selectedCategory) list = list.filter((b) => b.category === selectedCategory);
    if (query) list = list.filter((b) => matches(b, query));
    return list;
  }, [businesses, location, selectedCategory, query]);

  const handleSearch = useCallback((text) => setQuery(text), []);

  const handleCategoryFilter = (catId) => {
    setSelectedCategory((prev) => (prev === catId ? null : catId));
  };

  const renderEmptySearch = () => loading ? (
    <View style={styles.emptyContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  ) : (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBg}>
        <Ionicons name="search-outline" size={48} color={Colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>No results found</Text>
      <Text style={styles.emptySubtitle}>Try a different search term or category</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{location ? `Explore ${location}` : 'Explore'}</Text>
      </View>

      <View style={styles.searchWrapper}>
        <SearchBar
          value={query}
          onChangeText={handleSearch}
          placeholder="Search businesses, services..."
        />
      </View>

      {/* Recent Searches */}
      {!query && !selectedCategory && (
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Recent Searches</Text>
          <View style={styles.recentChips}>
            {recentSearches.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.recentChip}
                onPress={() => handleSearch(item)}
              >
                <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.recentChipText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryFilters}
      >
        {categories.filter(c => c.slug !== 'more').map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.filterChip,
              selectedCategory === cat.id && { backgroundColor: Colors.primary },
            ]}
            onPress={() => handleCategoryFilter(cat.id)}
          >
            <Ionicons
              name={cat.icon}
              size={16}
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

      {/* Results count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>{results.length} results found</Text>
        <TouchableOpacity style={styles.sortButton}>
          <Ionicons name="funnel-outline" size={16} color={Colors.primary} />
          <Text style={styles.sortText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BusinessCard business={item} variant="vertical" />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptySearch}
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  searchWrapper: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },

  // Recent Searches
  recentSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  recentTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  recentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    ...Shadow.small,
  },
  recentChipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // Category Filters
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

  // Results
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  resultsCount: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sortText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
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
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
