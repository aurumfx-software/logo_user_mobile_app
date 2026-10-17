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
import { COMPANY } from '../constants/companyInfo';
import { BorderRadius, Colors, FontSize, Spacing } from '../constants/theme';
import useApi from '../hooks/useApi';
import { fetchPolicy } from '../services/api';

const BADGE = {
  privacy: { icon: 'shield-checkmark', label: 'DATA PRIVACY' },
  terms: { icon: 'document-text', label: 'LEGAL' },
};

export default function PolicySheet({ policyKey = 'privacy', onClose, onOpenPolicy }) {
  const insets = useSafeAreaInsets();
  const key = String(policyKey || 'privacy');

  const { data: policy, loading, error, reload } = useApi(
    () => fetchPolicy(key),
    [key],
    null
  );

  const badge = BADGE[key] || BADGE.privacy;
  const otherKey = key === 'terms' ? 'privacy' : 'terms';
  const otherLabel = otherKey === 'privacy' ? 'Privacy Policy' : 'Terms of Service';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.lg }]}
          showsVerticalScrollIndicator
          bounces
        >
          <View style={styles.badge}>
            <Ionicons name={badge.icon} size={14} color={Colors.primary} />
            <Text style={styles.badgeText}>{badge.label}</Text>
          </View>

          <Text style={styles.title}>{policy?.label || 'Policy'}</Text>
          <Text style={styles.subtitle}>
            {COMPANY.brand} • {COMPANY.tagline} • {COMPANY.legalName}
          </Text>

          <PolicyBody content={policy?.content} />

          {policy?.lastUpdated ? (
            <Text style={styles.updated}>Last Updated: {policy.lastUpdated}</Text>
          ) : null}

          {onOpenPolicy ? (
            <TouchableOpacity style={styles.altPolicyLink} onPress={() => onOpenPolicy(otherKey)}>
              <Text style={styles.altPolicyText}>Read {otherLabel}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={styles.primaryBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Understood & Close</Text>
          </TouchableOpacity>
        </ScrollView>
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
    marginTop: Spacing.lg,
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },
  altPolicyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  altPolicyText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  primaryBtn: {
    marginTop: Spacing.lg,
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
