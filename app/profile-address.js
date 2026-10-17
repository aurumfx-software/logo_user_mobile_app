import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import ProfileScreenHeader from '../components/ProfileScreenHeader';
import ProfileDetailRow, { ProfileSection } from '../components/ProfileDetailRow';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../constants/theme';

export default function ProfileAddressScreen() {
  const router = useRouter();
  const { user, isAuthenticated, bootstrapping, refreshUser } = useAuth();

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) refreshUser();
    }, [isAuthenticated, refreshUser])
  );

  if (bootstrapping) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 48 }} />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated || !user) {
    router.replace('/sign-in');
    return null;
  }

  const hasCoords = user.latitude != null && user.longitude != null;

  const openMaps = () => {
    if (!hasCoords) return;
    const q = `${user.latitude},${user.longitude}`;
    const url = Platform.select({
      ios: `maps:0,0?q=${q}`,
      android: `geo:${q}?q=${q}`,
      default: `https://maps.google.com/?q=${q}`,
    });
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ProfileScreenHeader title="My address" rightIcon="create-outline" onRightPress={() => router.push('/edit-profile')} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.mapCard}>
          <Ionicons name="map-outline" size={32} color={Colors.primary} />
          <Text style={styles.mapTitle}>Saved delivery location</Text>
          <Text style={styles.mapSub}>Used for nearby shops and offers in Kerala</Text>
        </View>

        {user.address ? (
          <View style={styles.addressHighlight}>
            <Ionicons name="home-outline" size={22} color={Colors.primary} />
            <Text style={styles.addressHighlightText}>{user.address}</Text>
          </View>
        ) : null}

        <ProfileSection title="Address breakdown">
          <ProfileDetailRow label="District" value={user.district} />
          <ProfileDetailRow label="City / town" value={user.city} />
          <ProfileDetailRow label="Area / locality" value={user.location} />
          <ProfileDetailRow label="State" value="Kerala" />
          <ProfileDetailRow
            label="GPS"
            value={
              hasCoords
                ? `${Number(user.latitude).toFixed(5)}, ${Number(user.longitude).toFixed(5)}`
                : null
            }
            last
          />
        </ProfileSection>

        {hasCoords ? (
          <TouchableOpacity style={styles.mapsBtn} onPress={openMaps} activeOpacity={0.85}>
            <Ionicons name="navigate-outline" size={20} color="#FFF" />
            <Text style={styles.mapsBtnText}>Open in Maps</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/profile-details')}>
          <Text style={styles.secondaryBtnText}>Full profile details</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl },
  mapCard: {
    backgroundColor: Colors.primaryUltraLight,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.15)',
  },
  mapTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginTop: Spacing.sm },
  mapSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  addressHighlight: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    ...Shadow.small,
  },
  addressHighlightText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 22,
    fontWeight: '500',
  },
  mapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    marginTop: Spacing.sm,
  },
  mapsBtnText: { color: '#FFF', fontWeight: '700', fontSize: FontSize.md },
  secondaryBtn: { alignItems: 'center', paddingVertical: Spacing.xl },
  secondaryBtnText: { color: Colors.primary, fontWeight: '600', fontSize: FontSize.sm },
});
