import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileScreenHeader from '../components/ProfileScreenHeader';
import { COMPANY } from '../constants/companyInfo';
import { BorderRadius, Colors, FontSize, Spacing } from '../constants/theme';

const HIGHLIGHTS = [
  { icon: 'shield-checkmark', text: 'Verified merchants across Kerala' },
  { icon: 'navigate', text: 'GPS directions & distance to shops' },
  { icon: 'chatbubble-ellipses', text: 'Direct call & WhatsApp to stores' },
  { icon: 'pricetag', text: 'Festival offers & local deals' },
  { icon: 'map', text: 'All 14 districts covered' },
  { icon: 'heart', text: '0% commission on direct contact' },
];

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ProfileScreenHeader title="About" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.logoMark}>
            <Ionicons name="location" size={28} color={Colors.textOnPrimary} />
          </View>
          <Text style={styles.brand}>{COMPANY.brand}</Text>
          <Text style={styles.tagline}>{COMPANY.tagline}</Text>
          <View style={styles.badge}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={styles.badgeText}>{COMPANY.verifiedBadge}</Text>
          </View>
        </View>

        <Text style={styles.about}>{COMPANY.about}</Text>

        <Text style={styles.sectionLabel}>What you can do</Text>
        <View style={styles.card}>
          {HIGHLIGHTS.map((item, index) => (
            <View
              key={item.text}
              style={[styles.highlightRow, index < HIGHLIGHTS.length - 1 && styles.rowBorder]}
            >
              <Ionicons name={item.icon} size={20} color={Colors.primary} />
              <Text style={styles.highlightText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Operated by</Text>
        <View style={styles.card}>
          <Text style={styles.legalName}>{COMPANY.legalName}</Text>
          <Text style={styles.address}>{COMPANY.address.full}</Text>
        </View>

        <Text style={styles.footer}>© {new Date().getFullYear()} {COMPANY.legalName}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  brand: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
  },
  tagline: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.successLight,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.success,
  },
  about: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  highlightText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '500',
  },
  legalName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  address: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },
});
