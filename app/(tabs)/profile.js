// Profile Screen - User profile & settings
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/theme';
import PolicyModal from '../../components/PolicyModal';
import { useAuth } from '../../context/AuthContext';

const stats = [
  { label: 'Visited', value: '12', icon: 'location' },
  { label: 'Reviews', value: '8', icon: 'chatbubble' },
  { label: 'Favorites', value: '5', icon: 'heart' },
  { label: 'Photos', value: '23', icon: 'camera' },
];

const accountMenuItems = [
  { icon: 'id-card-outline', label: 'Profile Details', color: Colors.primary, href: '/profile-details' },
  { icon: 'person-outline', label: 'Edit Profile', color: '#5A52D5', href: '/edit-profile' },
  { icon: 'location-outline', label: 'My Addresses', color: '#FF9800', href: '/profile-address' },
  { icon: 'notifications-outline', label: 'Notifications', color: '#2196F3' },
  {
    icon: 'shield-outline',
    label: 'Privacy & Security',
    color: '#4CAF50',
    href: '/privacy-policy',
  },
];

const supportMenuItems = [
  { icon: 'help-circle-outline', label: 'Help Center', color: '#FFB946', href: '/contact-us' },
  { icon: 'chatbox-outline', label: 'Contact Us', color: '#2196F3', href: '/contact-us' },
  { icon: 'document-text-outline', label: 'Terms & Conditions', color: '#6C63FF', policyKey: 'terms' },
  { icon: 'information-circle-outline', label: 'About', color: '#607D8B', href: '/about' },
];

function initials(name, email) {
  const source = (name || email || '?').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, bootstrapping, signOut } = useAuth();
  const [openPolicy, setOpenPolicy] = useState(null);

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  if (bootstrapping) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const displayName = user?.name || 'Guest';
  const displayEmail = user?.email || 'Sign in to sync your account';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {isAuthenticated ? (
          <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/profile-details')}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <View style={styles.profileRow}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials(user?.name, user?.email)}</Text>
                </View>
                <View style={styles.onlineDot} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{displayName}</Text>
                <Text style={styles.profileEmail}>{displayEmail}</Text>
                {user?.user_code ? (
                  <Text style={styles.profileMeta}>ID: {user.user_code}</Text>
                ) : null}
                {user?.phone ? (
                  <Text style={styles.profileMeta}>{user.phone}</Text>
                ) : null}
                {(user?.city || user?.district) && (
                  <Text style={styles.profileMeta}>
                    {[user.city, user.district].filter(Boolean).join(', ')}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.statsRow}>
              {stats.map((stat, idx) => (
                <View key={idx} style={styles.statItem}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.viewDetailsHint}>Tap to view full profile details</Text>
          </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.guestCard}>
            <View style={styles.guestIconWrap}>
              <Ionicons name="person-circle-outline" size={56} color={Colors.primary} />
            </View>
            <Text style={styles.guestTitle}>You&apos;re not signed in</Text>
            <Text style={styles.guestSubtitle}>
              Sign in or create an account to save favorites and personalize your experience.
            </Text>
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={() => router.push('/sign-in')}
              activeOpacity={0.85}
            >
              <Text style={styles.signInBtnText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.signUpBtn}
              onPress={() => router.push('/sign-up')}
              activeOpacity={0.85}
            >
              <Text style={styles.signUpBtnText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {isAuthenticated && user?.address ? (
          <TouchableOpacity
            style={styles.addressCard}
            onPress={() => router.push('/profile-address')}
            activeOpacity={0.85}
          >
            <Ionicons name="location-outline" size={18} color={Colors.primary} />
            <Text style={styles.addressText} numberOfLines={3}>{user.address}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
          </TouchableOpacity>
        ) : null}

        {isAuthenticated ? (
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.menuCard}>
              {accountMenuItems.map((item, iIdx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuItem,
                    iIdx < accountMenuItems.length - 1 && styles.menuItemBorder,
                  ]}
                  activeOpacity={0.6}
                  onPress={() => {
                    if (item.policyKey) setOpenPolicy(item.policyKey);
                    else if (item.href) router.push(item.href);
                  }}
                >
                  <View style={[styles.menuIconBg, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuCard}>
            {supportMenuItems.map((item, iIdx) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.menuItem,
                  iIdx < supportMenuItems.length - 1 && styles.menuItemBorder,
                ]}
                activeOpacity={0.6}
                onPress={() => {
                  if (item.policyKey) setOpenPolicy(item.policyKey);
                  else if (item.href) router.push(item.href);
                }}
              >
                <View style={[styles.menuIconBg, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {isAuthenticated ? (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.secondary} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.appInfo}>
          <Text style={styles.appName}>Logo</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => router.push('/privacy-policy')}>
              <Text style={styles.legalLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}>·</Text>
            <TouchableOpacity onPress={() => setOpenPolicy('terms')}>
              <Text style={styles.legalLinkText}>Terms</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.appOwner}>© 2024 AurumFX Pvt Ltd</Text>
        </View>
      </ScrollView>

      <PolicyModal
        visible={Boolean(openPolicy)}
        policyKey={openPolicy || 'privacy'}
        onClose={() => setOpenPolicy(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.small,
  },

  viewDetailsHint: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.65)',
    marginTop: Spacing.md,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    ...Shadow.small,
  },
  addressText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  guestCard: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    ...Shadow.medium,
  },
  guestIconWrap: {
    marginBottom: Spacing.md,
  },
  guestTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  signInBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  signInBtnText: {
    color: '#FFF',
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  signUpBtn: {
    width: '100%',
    backgroundColor: Colors.primaryUltraLight,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  signUpBtnText: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },

  profileCard: {
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileEmail: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  profileMeta: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },

  menuSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    ...Shadow.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.text,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  menuValue: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.secondaryLight,
    borderRadius: BorderRadius.lg,
  },
  logoutText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.secondary,
  },

  appInfo: {
    alignItems: 'center',
    paddingBottom: Spacing.xxxl,
  },
  appName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  appVersion: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginTop: 2,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  legalLinkText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
  },
  legalDot: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },
  appOwner: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginTop: 2,
  },
});
