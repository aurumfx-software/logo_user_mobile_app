import { Ionicons } from '@expo/vector-icons';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileScreenHeader from '../components/ProfileScreenHeader';
import { COMPANY } from '../constants/companyInfo';
import { BorderRadius, Colors, FontSize, Spacing } from '../constants/theme';

async function openUrl(url, failMessage) {
  try {
    const can = await Linking.canOpenURL(url);
    if (!can) throw new Error('unavailable');
    await Linking.openURL(url);
  } catch {
    Alert.alert('Unable to open', failMessage);
  }
}

function ContactRow({ icon, label, value, onPress, last }) {
  return (
    <TouchableOpacity
      style={[styles.row, !last && styles.rowBorder]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={18} color={Colors.textLight} /> : null}
    </TouchableOpacity>
  );
}

export default function ContactUsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ProfileScreenHeader title="Contact Us" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Reach {COMPANY.brand} or {COMPANY.legalName} for support, merchant enquiries, or
          partnership opportunities.
        </Text>

        <Text style={styles.sectionLabel}>Corporate office</Text>
        <View style={styles.card}>
          <ContactRow
            icon="business-outline"
            label="Company"
            value={COMPANY.legalName}
          />
          <ContactRow
            icon="location-outline"
            label="Address"
            value={COMPANY.address.full}
            last
          />
        </View>

        <Text style={styles.sectionLabel}>Get in touch</Text>
        <View style={styles.card}>
          <ContactRow
            icon="mail-outline"
            label="Email"
            value={COMPANY.email}
            onPress={() => openUrl(`mailto:${COMPANY.email}`, 'Could not open your mail app.')}
          />
          {COMPANY.phones.map((p) => (
            <ContactRow
              key={p.tel}
              icon="call-outline"
              label={p.label}
              value={p.display}
              onPress={() => openUrl(`tel:${p.tel}`, 'Could not start a phone call.')}
            />
          ))}
          <ContactRow
            icon="storefront-outline"
            label="Merchant helpline"
            value={COMPANY.merchantHelpline.display}
            onPress={() =>
              openUrl(`tel:${COMPANY.merchantHelpline.tel}`, 'Could not start a phone call.')
            }
            last
          />
        </View>

        <Text style={styles.sectionLabel}>Privacy & support</Text>
        <View style={styles.card}>
          <ContactRow
            icon="shield-outline"
            label="Data protection"
            value={COMPANY.privacyEmail}
            onPress={() =>
              openUrl(`mailto:${COMPANY.privacyEmail}`, 'Could not open your mail app.')
            }
          />
          <ContactRow
            icon="help-buoy-outline"
            label="General support"
            value={COMPANY.supportEmail}
            onPress={() =>
              openUrl(`mailto:${COMPANY.supportEmail}`, 'Could not open your mail app.')
            }
            last
          />
        </View>

        <Text style={styles.hours}>
          Typical response time: 1–2 business days. For urgent merchant listing issues, call the
          merchant helpline.
        </Text>
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
  intro: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
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
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
  },
  rowLabel: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginBottom: 2,
  },
  rowValue: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '500',
    lineHeight: 22,
  },
  hours: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    lineHeight: 20,
    textAlign: 'center',
  },
});
