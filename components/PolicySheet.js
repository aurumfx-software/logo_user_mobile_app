import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PolicyBody from './PolicyBody';
import { BorderRadius, Colors, FontSize, Spacing } from '../constants/theme';
import useApi from '../hooks/useApi';
import { fetchPolicy } from '../services/api';

const BADGE = {
  privacy: { icon: 'shield-checkmark', label: 'DATA PRIVACY' },
  terms: { icon: 'document-text', label: 'LEGAL' },
};

export default function PolicySheet({ policyKey = 'privacy', onClose }) {
  const insets = useSafeAreaInsets();
  const key = String(policyKey || 'privacy');

  const { data: policy, loading, error, reload } = useApi(
    () => fetchPolicy(key),
    [key],
    null
  );

  const badge = BADGE[key] || BADGE.privacy;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityLabel="Close">
          <Ionicons name="close" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => reload()}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
          >
            <View style={styles.badge}>
              <Ionicons name={badge.icon} size={14} color={Colors.primary} />
              <Text style={styles.badgeText}>{badge.label}</Text>
            </View>

            <Text style={styles.title}>{policy?.label || 'Policy'}</Text>
            <Text style={styles.subtitle}>
              Logo Kerala • Hyperlocal Verified Merchant Network • AurumFX Pvt Ltd
            </Text>

            <PolicyBody content={policy?.content} />

            {policy?.lastUpdated ? (
              <Text style={styles.updated}>Last Updated: {policy.lastUpdated}</Text>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.primaryBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Understood & Close</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: Colors.primaryUltraLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginBottom: Spacing.xl,
    lineHeight: 18,
  },
  updated: {
    marginTop: Spacing.xl,
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  retryBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  retryText: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
