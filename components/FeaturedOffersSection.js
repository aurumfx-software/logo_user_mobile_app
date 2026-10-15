import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef } from 'react';
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
const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.72);
const CARD_GAP = Spacing.md;
const SCROLL_STEP = CARD_WIDTH + CARD_GAP;

function placementLabel(placement) {
  const value = String(placement || '').trim();
  return value || 'Featured Offers';
}

function OfferCard({ item, onPress }) {
  const imageUri = item.image || item.videoUrl;
  const subtitle = placementLabel(item.placement);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => onPress?.(item)}
    >
      <View style={styles.imageWrap}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}
        <View style={styles.offerBadge}>
          <Text style={styles.offerBadgeText}>SPECIAL OFFER</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.placementText}>{subtitle}</Text>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        {!!item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.footer}>
          <Text style={styles.limitedTime}>Limited Time</Text>
          {!!item.category && (
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText} numberOfLines={1}>
                {item.category}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function FeaturedOffersSection({ offers = [], onPressOffer }) {
  const listRef = useRef(null);
  const scrollOffset = useRef(0);
  const maxOffset = Math.max(0, offers.length * SCROLL_STEP - SCREEN_WIDTH + Spacing.xl * 2);

  const scrollBy = useCallback(
    (delta) => {
      const next = Math.max(0, Math.min(maxOffset, scrollOffset.current + delta));
      scrollOffset.current = next;
      listRef.current?.scrollToOffset({ offset: next, animated: true });
    },
    [maxOffset]
  );

  if (!offers.length) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔥 Featured Offers</Text>
        <View style={styles.headerArrows}>
          <TouchableOpacity
            style={styles.arrowBtn}
            onPress={() => scrollBy(-SCROLL_STEP)}
            accessibilityLabel="Previous offers"
          >
            <Ionicons name="chevron-back" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.arrowBtn}
            onPress={() => scrollBy(SCROLL_STEP)}
            accessibilityLabel="Next offers"
          >
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={offers}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <OfferCard item={item} onPress={onPressOffer} />
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
        onScroll={(e) => {
          scrollOffset.current = e.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  headerArrows: {
    flexDirection: 'row',
    gap: Spacing.sm,
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
    ...Shadow.small,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    ...Shadow.small,
  },
  imageWrap: {
    width: '100%',
    height: Math.round(CARD_WIDTH * 0.52),
    backgroundColor: Colors.borderLight,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: '#E5E7EB',
  },
  offerBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  offerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.3,
  },
  body: {
    padding: Spacing.md,
    paddingTop: Spacing.sm,
  },
  placementText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.info,
    marginBottom: 4,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  limitedTime: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    flexShrink: 0,
  },
  categoryPill: {
    maxWidth: '58%',
    backgroundColor: Colors.infoLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  categoryPillText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.info,
  },
});
