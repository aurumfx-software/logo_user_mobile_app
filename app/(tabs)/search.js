// Search / Explore Screen
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../../constants/theme';
import { fetchMerchants } from '../../services/api';
import useApi from '../../hooks/useApi';
import { useLocalSearchParams } from 'expo-router';
import BusinessCard from '../../components/BusinessCard';
import LocationChip from '../../components/LocationChip';
import SearchBar from '../../components/SearchBar';
import { useAppLocation } from '../../context/AppLocationContext';
import { filterMerchantsByArea } from '../../utils/geo';

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
  const { location: routeLocation } = useLocalSearchParams();
  const { selection, displayLabel } = useAppLocation();
  const [query, setQuery] = useState('');

  const { data, loading } = useApi(
    async () => {
      const businesses = await fetchMerchants();
      return { businesses };
    },
    [],
    { businesses: [] }
  );
  const { businesses } = data;

  const results = useMemo(() => {
    let list = businesses;
    const areaFromRoute = routeLocation ? String(routeLocation) : null;
    if (areaFromRoute) {
      list = filterMerchantsByArea(list, areaFromRoute);
    } else if (selection && selection.type !== 'state') {
      const key =
        selection.type === 'district' ? selection.district || selection.name : selection.name;
      list = filterMerchantsByArea(list, key);
    }
    if (query) list = list.filter((b) => matches(b, query));
    return list;
  }, [businesses, routeLocation, selection, query]);

  const handleSearch = useCallback((text) => setQuery(text), []);

  const renderEmptySearch = () =>
    loading ? (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    ) : (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBg}>
          <Ionicons name="search-outline" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>No results found</Text>
        <Text style={styles.emptySubtitle}>Try a different search term</Text>
      </View>
    );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {routeLocation ? `Explore ${routeLocation}` : selection?.type !== 'state' ? displayLabel : 'Explore'}
        </Text>
        <LocationChip compact />
      </View>

      <View style={styles.searchWrapper}>
        <SearchBar
          value={query}
          onChangeText={handleSearch}
          placeholder="Search businesses, services..."
        />
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>{results.length} results found</Text>
        <TouchableOpacity style={styles.sortButton}>
          <Ionicons name="funnel-outline" size={16} color={Colors.primary} />
          <Text style={styles.sortText}>Sort</Text>
        </TouchableOpacity>
      </View>

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
    gap: Spacing.sm,
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
