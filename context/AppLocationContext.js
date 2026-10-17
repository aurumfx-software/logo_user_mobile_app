import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import LocationPickerModal from '../components/LocationPickerModal';
import { KERALA_STATE_SELECTION } from '../constants/keralaLocations';
import useUserLocation from '../hooks/useUserLocation';

const STORAGE_KEY = 'logo_app_selected_location';

async function loadStored() {
  try {
    const raw =
      Platform.OS === 'web'
        ? globalThis.localStorage?.getItem(STORAGE_KEY)
        : await SecureStore.getItemAsync(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function saveStored(selection) {
  const raw = JSON.stringify(selection);
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(STORAGE_KEY, raw);
    return;
  }
  await SecureStore.setItemAsync(STORAGE_KEY, raw);
}

function buildSelection({ name, district, type = 'town', latitude, longitude, label }) {
  const town = name?.trim();
  const dist = district?.trim() || null;
  const display =
    label ||
    (dist && town && dist.toLowerCase() !== town.toLowerCase()
      ? `${town}, ${dist}`
      : town
        ? `${town}, Kerala`
        : 'Kerala');
  return {
    id: `${type}-${town || 'kerala'}-${dist || ''}`,
    name: town || 'Kerala',
    district: dist,
    state: 'Kerala',
    type,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    label: display,
  };
}

const AppLocationContext = createContext(null);

export function AppLocationProvider({ children }) {
  const { location: gps, status: gpsStatus } = useUserLocation();
  const [selection, setSelection] = useState(KERALA_STATE_SELECTION);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    loadStored().then((stored) => {
      if (stored) setSelection(stored);
      setHydrated(true);
    });
  }, []);

  const applySelection = useCallback(async (next) => {
    setSelection(next);
    await saveStored(next);
    setPickerVisible(false);
  }, []);

  const selectTown = useCallback(
    (name, district) => {
      applySelection(buildSelection({ name, district, type: 'town' }));
    },
    [applySelection]
  );

  const selectDistrict = useCallback(
    (district) => {
      applySelection(buildSelection({ name: district, district, type: 'district' }));
    },
    [applySelection]
  );

  const selectKerala = useCallback(() => {
    applySelection(KERALA_STATE_SELECTION);
  }, [applySelection]);

  const useGpsLocation = useCallback(() => {
    if (gpsStatus !== 'granted' || !gps) return false;
    applySelection(
      buildSelection({
        name: gps.city || gps.label,
        district: gps.region,
        type: 'gps',
        latitude: gps.latitude,
        longitude: gps.longitude,
        label: gps.city
          ? `${gps.city}, Kerala`
          : gps.label || 'Your location',
      })
    );
    return true;
  }, [gps, gpsStatus, applySelection]);

  const openPicker = useCallback(() => setPickerVisible(true), []);
  const closePicker = useCallback(() => setPickerVisible(false), []);

  const coordsForDistance = useMemo(() => {
    if (selection?.latitude != null && selection?.longitude != null) {
      return { latitude: selection.latitude, longitude: selection.longitude, city: selection.name };
    }
    if (gpsStatus === 'granted' && gps) return gps;
    return null;
  }, [selection, gps, gpsStatus]);

  const value = useMemo(
    () => ({
      selection,
      hydrated,
      pickerVisible,
      openPicker,
      closePicker,
      selectTown,
      selectDistrict,
      selectKerala,
      useGpsLocation,
      gpsStatus,
      coordsForDistance,
      displayLabel: selection?.label || 'Kerala',
    }),
    [
      selection,
      hydrated,
      pickerVisible,
      openPicker,
      closePicker,
      selectTown,
      selectDistrict,
      selectKerala,
      useGpsLocation,
      gpsStatus,
      coordsForDistance,
    ]
  );

  return (
    <AppLocationContext.Provider value={value}>
      {children}
      <LocationPickerModal />
    </AppLocationContext.Provider>
  );
}

export function useAppLocation() {
  const ctx = useContext(AppLocationContext);
  if (!ctx) throw new Error('useAppLocation must be used within AppLocationProvider');
  return ctx;
}
