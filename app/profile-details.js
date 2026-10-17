import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import ProfileScreenHeader from '../components/ProfileScreenHeader';
import ProfileDetailRow, { ProfileSection } from '../components/ProfileDetailRow';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

function initials(name, email) {
  const source = (name || email || '?').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default function ProfileDetailsScreen() {
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

  const coords =
    user.latitude != null && user.longitude != null
      ? `${Number(user.latitude).toFixed(5)}, ${Number(user.longitude).toFixed(5)}`
      : null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ProfileScreenHeader
        title="Profile details"
        rightIcon="create-outline"
        onRightPress={() => router.push('/edit-profile')}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(user.name, user.email)}</Text>
          </View>
          <Text style={styles.heroName}>{user.name}</Text>
          <Text style={styles.heroEmail}>{user.email}</Text>
          {user.user_code ? <Text style={styles.heroMeta}>Member ID · {user.user_code}</Text> : null}
        </LinearGradient>

        <ProfileSection title="Contact">
          <ProfileDetailRow label="Full name" value={user.name} />
          <ProfileDetailRow label="Email" value={user.email} />
          <ProfileDetailRow label="Mobile" value={user.phone} last />
        </ProfileSection>

        <ProfileSection title="Location">
          <ProfileDetailRow label="District" value={user.district} />
          <ProfileDetailRow label="City / town" value={user.city} />
          <ProfileDetailRow label="Area / locality" value={user.location} />
          <ProfileDetailRow label="Full address" value={user.address} />
          <ProfileDetailRow label="GPS coordinates" value={coords} last />
        </ProfileSection>

        <ProfileSection title="Account">
          <ProfileDetailRow label="Role" value={user.role} />
          <ProfileDetailRow label="Status" value={user.status || (user.is_active ? 'ACTIVE' : 'INACTIVE')} />
          <ProfileDetailRow label="Member since" value={formatDate(user.created_at)} last />
        </ProfileSection>

        <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit-profile')} activeOpacity={0.85}>
          <Text style={styles.editBtnText}>Edit profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkBtn} onPress={() => router.push('/profile-address')} activeOpacity={0.85}>
          <Text style={styles.linkBtnText}>View address only</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl },
  hero: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: { fontSize: FontSize.xxl, fontWeight: '700', color: '#FFF' },
  heroName: { fontSize: FontSize.xl, fontWeight: '700', color: '#FFF' },
  heroEmail: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  heroMeta: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.65)', marginTop: 8 },
  editBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  editBtnText: { color: '#FFF', fontWeight: '700', fontSize: FontSize.md },
  linkBtn: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  linkBtnText: { color: Colors.primary, fontWeight: '600', fontSize: FontSize.sm },
});
