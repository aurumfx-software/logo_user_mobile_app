import React, { useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AuthTextField from '../components/AuthTextField';
import { useAuth } from '../context/AuthContext';
import useUserLocation from '../hooks/useUserLocation';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../constants/theme';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { location: gps, status: gpsStatus } = useUserLocation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setPhone(user.phone || '');
    setDistrict(user.district || '');
    setCity(user.city || '');
    setLocationLabel(user.location || '');
    setAddress(user.address || '');
    setLatitude(user.latitude ?? null);
    setLongitude(user.longitude ?? null);
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/sign-in');
    }
  }, [isAuthenticated, router]);

  const applyCurrentLocation = () => {
    if (gpsStatus !== 'granted' || !gps) {
      Alert.alert('Location unavailable', 'Enable location or update fields manually.');
      return;
    }
    setLatitude(gps.latitude);
    setLongitude(gps.longitude);
    if (gps.city) setCity(gps.city);
    if (gps.region) setDistrict(gps.region);
    if (gps.label) setLocationLabel(gps.label);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    setSubmitting(true);
    try {
      await updateProfile(
        { name: name.trim(), phone: phone.trim(), address: address.trim() },
        {
          district: district.trim(),
          city: city.trim(),
          location: locationLabel.trim(),
          address: address.trim(),
          latitude,
          longitude,
        }
      );
      Alert.alert('Saved', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Update failed', err?.message || 'Could not save changes.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 48 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>

          <Text style={styles.title}>Edit profile</Text>
          <Text style={styles.subtitle}>Update your contact and location details.</Text>

          <Text style={styles.readOnly}>Email: {user.email}</Text>
          {user.user_code ? <Text style={styles.readOnly}>Member ID: {user.user_code}</Text> : null}

          <Text style={styles.sectionLabel}>Contact</Text>
          <AuthTextField label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
          <AuthTextField
            label="Mobile number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.sectionLabel}>Location</Text>
          <TouchableOpacity style={styles.gpsBtn} onPress={applyCurrentLocation}>
            <Ionicons name="locate" size={18} color={Colors.primary} />
            <Text style={styles.gpsBtnText}>Refresh from GPS</Text>
          </TouchableOpacity>
          {latitude != null && longitude != null && (
            <Text style={styles.gpsHint}>
              Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </Text>
          )}

          <AuthTextField label="District" value={district} onChangeText={setDistrict} autoCapitalize="words" />
          <AuthTextField label="City / town" value={city} onChangeText={setCity} autoCapitalize="words" />
          <AuthTextField
            label="Area / locality"
            value={locationLabel}
            onChangeText={setLocationLabel}
            autoCapitalize="words"
          />
          <AuthTextField
            label="Full address"
            value={address}
            onChangeText={setAddress}
            multiline
            autoCapitalize="sentences"
          />

          <TouchableOpacity
            style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled]}
            onPress={handleSave}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.primaryBtnText}>Save changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl },
  back: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    ...Shadow.small,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  readOnly: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryUltraLight,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  gpsBtnText: { color: Colors.primary, fontWeight: '600', fontSize: FontSize.sm },
  gpsHint: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: Spacing.md },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { color: '#FFF', fontSize: FontSize.md, fontWeight: '700' },
});
