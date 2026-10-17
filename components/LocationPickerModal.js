import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  KERALA_DISTRICTS,
  POPULAR_TOWNS,
} from '../constants/keralaLocations';
import { BorderRadius, Colors, FontSize, Spacing } from '../constants/theme';
import { useAppLocation } from '../context/AppLocationContext';
import { fetchMerchantLocations } from '../services/api';

function SectionHeader({ title }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function LocationRow({ icon, title, subtitle, onPress, highlighted }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        highlighted && styles.rowHighlight,
        pressed && styles.rowPressed,
      ]}
    >
      <Ionicons name={icon} size={18} color={Colors.textSecondary} style={styles.rowIcon} />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
    </Pressable>
  );
}

export default function LocationPickerModal() {
  const insets = useSafeAreaInsets();
  const {
    pickerVisible,
    closePicker,
    selectTown,
    selectDistrict,
    selectKerala,
    useGpsLocation,
    gpsStatus,
    selection,
  } = useAppLocation();

  const [query, setQuery] = useState('');
  const [apiLocations, setApiLocations] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    if (!pickerVisible) return;
    setQuery('');
    setApiLoading(true);
    fetchMerchantLocations()
      .then(setApiLocations)
      .catch(() => setApiLocations([]))
      .finally(() => setApiLoading(false));
  }, [pickerVisible]);

  const onGps = useCallback(() => {
    if (gpsStatus === 'denied') {
      Alert.alert(
        'Location permission',
        'Enable location access in your device settings to discover shops near you.'
      );
      return;
    }
    if (gpsStatus === 'loading' || gpsStatus === 'idle') {
      Alert.alert('Please wait', 'Detecting your location…');
      return;
    }
    if (!useGpsLocation()) {
      Alert.alert('Location unavailable', 'Could not read your GPS position. Try again or pick a town manually.');
    }
  }, [gpsStatus, useGpsLocation]);

  const filteredDistricts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return KERALA_DISTRICTS;
    return KERALA_DISTRICTS.filter((d) => d.toLowerCase().includes(q));
  }, [query]);

  const filteredTowns = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return POPULAR_TOWNS;
    return POPULAR_TOWNS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) || t.district.toLowerCase().includes(q)
    );
  }, [query]);

  const filteredApi = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return apiLocations.filter((l) => l.name.toLowerCase().includes(q)).slice(0, 12);
  }, [query, apiLocations]);

  const showSearchResults = query.trim().length > 0;

  return (
    <Modal visible={pickerVisible} animationType="slide" transparent onRequestClose={closePicker}>
      <Pressable style={styles.backdrop} onPress={closePicker} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
        <View style={styles.sheetHandleRow}>
          <Text style={styles.sheetTitle}>Choose location</Text>
          <Pressable onPress={closePicker} hitSlop={12}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </Pressable>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search town, district or area..."
            placeholderTextColor={Colors.textLight}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="words"
          />
        </View>

        <ScrollView
          style={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          {!showSearchResults && (
            <>
              <Pressable style={styles.gpsCard} onPress={onGps}>
                <View style={styles.gpsIconWrap}>
                  <Ionicons name="locate" size={22} color={Colors.primary} />
                </View>
                <View style={styles.gpsText}>
                  <Text style={styles.gpsTitle}>Use current location (GPS)</Text>
                  <Text style={styles.gpsSubtitle}>Discover verified shops closest to you</Text>
                </View>
              </Pressable>

              <Pressable
                style={[
                  styles.keralaBtn,
                  selection?.type === 'state' && styles.keralaBtnActive,
                ]}
                onPress={selectKerala}
              >
                <Ionicons name="location" size={18} color={Colors.textOnPrimary} />
                <Text style={styles.keralaBtnText}>Kerala</Text>
              </Pressable>

              <SectionHeader title="ALL 14 DISTRICTS" />
              {filteredDistricts.map((district) => (
                <LocationRow
                  key={district}
                  icon="location-outline"
                  title={`${district} District`}
                  onPress={() => selectDistrict(district)}
                  highlighted={
                    selection?.type === 'district' && selection?.name === district
                  }
                />
              ))}

              <SectionHeader title="POPULAR TOWNS IN KERALA" />
              {filteredTowns.map((town) => (
                <LocationRow
                  key={`${town.name}-${town.district}`}
                  icon="location-outline"
                  title={town.name}
                  subtitle={town.district}
                  onPress={() => selectTown(town.name, town.district)}
                  highlighted={
                    selection?.type !== 'state' &&
                    selection?.name?.toLowerCase() === town.name.toLowerCase()
                  }
                />
              ))}

              {apiLoading ? (
                <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.lg }} />
              ) : null}
            </>
          )}

          {showSearchResults && (
            <>
              {filteredApi.length > 0 && (
                <>
                  <SectionHeader title="AREAS WITH SHOPS" />
                  {filteredApi.map((loc) => (
                    <LocationRow
                      key={loc.name}
                      icon="storefront-outline"
                      title={loc.name}
                      subtitle={loc.count ? `${loc.count} shops` : undefined}
                      onPress={() => selectTown(loc.name, null)}
                    />
                  ))}
                </>
              )}
              {filteredTowns.length > 0 && (
                <>
                  <SectionHeader title="TOWNS" />
                  {filteredTowns.map((town) => (
                    <LocationRow
                      key={`s-${town.name}`}
                      icon="location-outline"
                      title={town.name}
                      subtitle={town.district}
                      onPress={() => selectTown(town.name, town.district)}
                    />
                  ))}
                </>
              )}
              {filteredDistricts.length > 0 && (
                <>
                  <SectionHeader title="DISTRICTS" />
                  {filteredDistricts.map((district) => (
                    <LocationRow
                      key={`s-${district}`}
                      icon="location-outline"
                      title={district}
                      onPress={() => selectDistrict(district)}
                    />
                  ))}
                </>
              )}
              {filteredApi.length === 0 &&
                filteredTowns.length === 0 &&
                filteredDistricts.length === 0 && (
                  <Text style={styles.emptySearch}>No locations match your search.</Text>
                )}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  sheetHandleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sheetTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    gap: 8,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    padding: 0,
  },
  scroll: {
    flexGrow: 0,
  },
  gpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.primaryUltraLight,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  gpsIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsText: { flex: 1 },
  gpsTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primary,
  },
  gpsSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  keralaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  keralaBtnActive: {
    opacity: 0.92,
  },
  keralaBtnText: {
    color: Colors.textOnPrimary,
    fontWeight: '700',
    fontSize: FontSize.md,
  },
  sectionHeader: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 0.6,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  rowHighlight: {
    backgroundColor: Colors.primaryUltraLight,
  },
  rowPressed: {
    opacity: 0.85,
  },
  rowIcon: {
    width: 28,
  },
  rowText: { flex: 1 },
  rowTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  rowSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emptySearch: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginVertical: Spacing.xl,
    fontSize: FontSize.sm,
  },
});
