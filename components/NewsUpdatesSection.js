import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, FontSize, Spacing } from '../constants/theme';

const CONTACT_PHONE = '+918606080074';
const CONTACT_DISPLAY = '+91 860 60 800 74';

const PLANS = [
  {
    id: 'standard',
    colors: ['#2563EB', '#1D4ED8'],
    badge: 'JOIN US',
    badgeBg: 'rgba(255,255,255,0.18)',
    tag: 'STANDARD LISTING',
    titleAccent: '#93C5FD',
    highlight: 'BUSINESS & OFFERS',
    highlightColor: '#FFFFFF',
    check: 'checkmark-circle',
    checkColor: '#93C5FD',
    points: [
      'Multi Photos & Store Details',
      'Address & Exact GPS Location',
      'Direct Calling & One-Tap WhatsApp',
      'Social Page Sharing & Distance',
    ],
    offer: 'Special Launch Offer\n50% OFF',
    cta: 'List Business',
    ctaBg: '#FFFFFF',
    ctaColor: '#1D4ED8',
  },
  {
    id: 'premium',
    colors: ['#0F172A', '#1E293B'],
    badge: 'PREMIUM SUBSCRIPTION',
    badgeBg: '#22C55E',
    tag: 'TOP RANKING',
    titleAccent: '#86EFAC',
    highlight: 'BUSINESS & OFFERS',
    highlightColor: '#FACC15',
    check: 'checkmark-circle',
    checkColor: '#4ADE80',
    points: [
      'E-Commerce Portal Access',
      'Video Reels & HD Image Gallery',
      'Flash Offers & Distance Filter',
      'Customer Analytics & Direct Leads',
    ],
    offer: 'Annual Plan Savings\n50% OFF',
    cta: 'Get Premium',
    ctaBg: '#FFFFFF',
    ctaColor: '#0F172A',
  },
  {
    id: 'festival',
    colors: ['#BE123C', '#9F1239'],
    badge: 'SPECIAL OFFER',
    badgeBg: 'rgba(255,255,255,0.16)',
    tag: 'FESTIVAL PROMO',
    titleAccent: '#FDA4AF',
    highlight: 'BUSINESS & OFFERS',
    highlightColor: '#FFFFFF',
    check: 'checkmark-circle',
    checkColor: '#FDA4AF',
    points: [
      'Verified Blue Tick Merchant Badge',
      'Boosted Top 3 Search Ranking',
      'WhatsApp Catalog & Direct Orders',
      'Dedicated Account Manager & Support',
    ],
    offer: 'Festival Promotion\n50% OFF',
    cta: 'Claim Offer',
    ctaBg: '#FFFFFF',
    ctaColor: '#9F1239',
  },
];

function PlanCard({ plan }) {
  const call = () => Linking.openURL(`tel:${CONTACT_PHONE}`).catch(() => {});

  return (
    <LinearGradient colors={plan.colors} style={styles.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={styles.cardTop}>
        <View style={[styles.badge, { backgroundColor: plan.badgeBg }]}>
          <Text style={styles.badgeText}>{plan.badge}</Text>
        </View>
        <Text style={styles.tag}>{plan.tag}</Text>
      </View>

      <Text style={styles.brand}>My Locality Info</Text>
      <Text style={[styles.malayalam, { color: plan.titleAccent }]}>
        Mobile Application ൽ ലിസ്റ്റ് ചെയ്യൂ{'\n'}ലോകമറിയട്ടെ നിങ്ങളുടെ
      </Text>
      <Text style={[styles.highlight, { color: plan.highlightColor }]}>{plan.highlight}</Text>

      <View style={styles.pointsBox}>
        {plan.points.map((point) => (
          <View key={point} style={styles.pointRow}>
            <Ionicons name={plan.check} size={16} color={plan.checkColor} />
            <Text style={styles.pointText}>{point}</Text>
          </View>
        ))}
      </View>

      <View style={styles.ctaRow}>
        <Text style={styles.offerText}>{plan.offer}</Text>
        <TouchableOpacity style={[styles.ctaBtn, { backgroundColor: plan.ctaBg }]} onPress={call} activeOpacity={0.85}>
          <Text style={[styles.ctaText, { color: plan.ctaColor }]}>{plan.cta}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.phoneRow} onPress={call} activeOpacity={0.8}>
        <Ionicons name="call" size={14} color="#fff" />
        <Text style={styles.phoneText}>Mob: {CONTACT_DISPLAY}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

export default function NewsUpdatesSection() {
  return (
    <View style={styles.section}>
      <View style={styles.kickerWrap}>
        <Ionicons name="newspaper-outline" size={12} color="#2563EB" />
        <Text style={styles.kicker}>LOGO BUSINESS NETWORK</Text>
      </View>
      <Text style={styles.title}>News & Updates</Text>
      <Text style={styles.subtitle}>Grow Your Business With Kerala&apos;s Fastest Growing Local Directory</Text>
      {PLANS.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  kickerWrap: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#2563EB',
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: '#64748B',
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  tag: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  brand: {
    color: '#fff',
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  malayalam: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 20,
  },
  highlight: {
    fontSize: FontSize.md,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  pointsBox: {
    backgroundColor: 'rgba(15,23,42,0.18)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: 8,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: '600',
    flex: 1,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  offerText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: '700',
    lineHeight: 18,
    flex: 1,
  },
  ctaBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
  },
  ctaText: {
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.md,
  },
  phoneText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
