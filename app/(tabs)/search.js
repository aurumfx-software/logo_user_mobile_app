// Search / Explore Screen
import React, { useState, useCallback } from 'react';
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
import { categories } from '../../constants/categories';
import { businesses, searchBusinesses } from '../../constants/businesses';
import BusinessCard from '../../components/BusinessCard';
import SearchBar from '../../components/SearchBar';

const recentSearches = ['Restaurants', 'Pharmacy', 'ATM near me', 'Hair salon'];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [results, setResults] = useState(businesses);

  const handleSearch = useCallback((text) => {
    setQuery(text);
    if (text.length > 0) {
      setResults(searchBusinesses(text));
      setSelectedCategory(null);
    } else if (selectedCategory) {
      setResults(businesses.filter(b => b.category === selectedCategory));
    } else {
      setResults(businesses);
    }
  }, [selectedCategory]);

  const handleCategoryFilter = (catId) => {
    if (selectedCategory === catId) {
      setSelectedCategory(null);
      if (query) {
        setResults(searchBusinesses(query));
      } else {
        setResults(businesses);
      }
    } else {
      setSelectedCategory(catId);
      const filtered = businesses.filter(b => b.category === catId);
      if (query) {
        setResults(filtered.filter(b =>
          b.name.toLowerCase().includes(query.toLowerCase()) ||
          b.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
        ));
      } else {
        setResults(filtered);
      }
    }
  };

  const renderEmptySearch = () => (
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
        <Text style={styles.title}>Explore</Text>
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
