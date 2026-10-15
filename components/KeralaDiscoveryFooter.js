import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Colors, FontSize, Shadow, Spacing } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PAD = Spacing.xl;
const CARD_WIDTH = SCREEN_WIDTH - H_PAD * 2;
const CARD_HEIGHT = Math.round(CARD_WIDTH * 0.72);

const HIGHLIGHT_PILLS = [
  { icon: 'shield-checkmark-outline', label: 'Verified Shops' },
  { icon: 'pricetag-outline', label: 'Exclusive Deals' },
  { icon: 'star-outline', label: 'Top Rated' },
  { icon: 'location-outline', label: 'Kerala' },
];

function AccentTitle({ title }) {
  const words = String(title || '').trim().split(/\s+/);
  if (!words.length) return null;
  const first = words[0];
  const rest = words.slice(1).join(' ');
  return (
    <Text style={styles.heroTitle}>
      <Text style={styles.heroTitleAccent}>{first} </Text>
      <Text style={styles.heroTitleRest}>{rest}</Text>
    </Text>
  );
}

function FooterPromoCard({ item, onPress }) {
  const imageUri = item.image || item.videoUrl;
  const categoryLabel = String(item.category || 'Featured').toUpperCase();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.92}
      onPress={() => onPress?.(item)}
    >
      <View style={styles.cardInner}>
        <View style={styles.textCol}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{categoryLabel}</Text>
          </View>
          <AccentTitle title={item.title} />
          {!!item.description && (
            <Text style={styles.description} numberOfLines={3}>
              {item.description}
            </Text>
          )}
          <View style={styles.pillsRow}>
            {HIGHLIGHT_PILLS.map((pill) => (
              <View key={pill.label} style={styles.pill}>
                <Ionicons name={pill.icon} size={12} color={Colors.info} />
                <Text style={styles.pillText}>{pill.label}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.cta} onPress={() => onPress?.(item)} activeOpacity={0.85}>
            <Text style={styles.ctaText}>Explore Kerala Shops</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={[styles.heroImage, styles.heroImagePlaceholder]} />
        )}
        <LinearGradient
          colors={['#FFFFFF', 'rgba(255,255,255,0.85)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.imageFade}
          pointerEvents="none"
        />
      </View>
      {!!item.videoUrl && (
        <View style={styles.reelBadge}>
          <Ionicons name="play-circle" size={14} color="#fff" />
          <Text style={styles.reelBadgeText}>HD Live Reel</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function KeralaQuoteBlock() {
  return (
    <View style={styles.quoteBlock}>
      <Text style={styles.quoteMark}>“</Text>
      <Text style={styles.quoteText}>
        Connecting neighborhoods, empowering local merchants, and celebrating the authentic spirit
        of Kerala.
      </Text>
      <View style={styles.quoteDivider} />
      <Text style={styles.quoteBrand}>LOGO KERALA</Text>
      <Text style={styles.quoteTagline}>
        Hyperlocal Discovery & Verified Merchant Network Across 14 Districts
      </Text>
    </View>
  );
}

export default function KeralaDiscoveryFooter({ promotions = [], onPressPromo }) {
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);
  const slides = promotions.filter((p) => p.image || p.videoUrl || p.title);

  const scrollTo = useCallback(
    (next) => {
      if (!slides.length) return;
      const i = (next + slides.length) % slides.length;
      listRef.current?.scrollToOffset({ offset: i * CARD_WIDTH, animated: true });
      setIndex(i);
    },
    [slides.length]
  );

  return (
    <View style={styles.section}>
      {slides.length > 0 && (
        <>
          <FlatList
            ref={listRef}
            data={slides}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => String(item.id)}
            getItemLayout={(_, i) => ({ length: CARD_WIDTH, offset: CARD_WIDTH * i, index: i })}
            onMomentumScrollEnd={(e) => {
              const i = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
              setIndex(i);
            }}
            renderItem={({ item }) => (
              <FooterPromoCard item={item} onPress={onPressPromo} />
            )}
            style={styles.carousel}
          />
          <View style={styles.carouselControls}>
            <TouchableOpacity style={styles.arrowBtn} onPress={() => scrollTo(index - 1)}>
              <Ionicons name="chevron-back" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.dots}>
              {slides.map((_, i) => (
                <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
              ))}
            </View>
            <TouchableOpacity style={styles.arrowBtn} onPress={() => scrollTo(index + 1)}>
              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </>
      )}
      <KeralaQuoteBlock />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: H_PAD,
    marginBottom: Spacing.lg,
  },
  carousel: {
    marginBottom: Spacing.sm,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    ...Shadow.medium,
  },
  cardInner: {
    flex: 1,
    flexDirection: 'row',
  },
  textCol: {
    flex: 1,
    padding: Spacing.md,
    paddingRight: Spacing.sm,
    zIndex: 2,
    justifyContent: 'center',
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.infoLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginBottom: 6,
  },
  categoryPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.info,
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 4,
  },
  heroTitleAccent: {
    color: Colors.primary,
  },
  heroTitleRest: {
    color: '#0F172A',
  },
  description: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  pillText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: Colors.info,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  ctaText: {
    color: '#fff',
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  heroImage: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '46%',
  },
  heroImagePlaceholder: {
    backgroundColor: Colors.borderLight,
  },
  imageFade: {
    position: 'absolute',
    right: '38%',
    top: 0,
    bottom: 0,
    width: '18%',
    zIndex: 1,
  },
  reelBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15,23,42,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    zIndex: 3,
  },
  reelBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  carouselControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 22,
    backgroundColor: Colors.info,
  },
  quoteBlock: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  quoteMark: {
    fontSize: 36,
    lineHeight: 36,
    color: Colors.infoLight,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  quoteText: {
    fontSize: FontSize.lg,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#334155',
    lineHeight: 26,
    marginBottom: Spacing.lg,
  },
  quoteDivider: {
    width: 48,
    height: 3,
    backgroundColor: Colors.info,
    borderRadius: 2,
    marginBottom: Spacing.md,
  },
  quoteBrand: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    letterSpacing: 2,
    color: Colors.info,
    marginBottom: 6,
  },
  quoteTagline: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});
