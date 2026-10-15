// AdBannerSlider — scrolling ticker + full-width auto-slide image/video carousel
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { BannerShimmer } from './ShimmerLoader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_HEIGHT = Math.round(SCREEN_WIDTH * 0.55); // 55 % aspect ratio
const AUTO_PLAY_MS = 4500;
const TICKER_HEIGHT = 38;
const TICKER_SPEED = 45; // px/s — similar pace to web landing ticker
const TICKER_BADGE_WIDTH = 44;
const TICKER_FADE_WIDTH = 28;

const DEFAULT_TICKER_ITEMS = [
  { id: 't1', title: '⚡ Festive Season Offers — Check Out Exclusive Deals Near You' },
  { id: 't2', title: '📍 Explore 1000+ Local Shops, Restaurants & Services in Kerala' },
  { id: 't3', title: '💎 Gold & Jewellery Collections — Trending Now' },
  { id: 't4', title: '🍕 Top Rated Restaurants & Cafes — Order or Visit Today' },
  { id: 't5', title: '🔥 Mega Deals Festival — Up to 60% Off on Top Brands' },
];

// ─── Ticker bar (matches web zeas-ticker-bar / Moving Text promos) ─────────────
function TickerBar({ items }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const segmentWidth = useRef(0);
  const loopRef = useRef(null);

  const announcements =
    items.length > 0
      ? items
      : DEFAULT_TICKER_ITEMS;

  const startLoop = useCallback(
    (width) => {
      if (!width) return;
      segmentWidth.current = width;
      loopRef.current?.stop();
      translateX.setValue(0);
      const duration = (width / TICKER_SPEED) * 1000;
      loopRef.current = Animated.loop(
        Animated.timing(translateX, {
          toValue: -width,
          duration,
          useNativeDriver: true,
        })
      );
      loopRef.current.start();
    },
    [translateX]
  );

  useEffect(() => {
    return () => loopRef.current?.stop();
  }, []);

  useEffect(() => {
    if (segmentWidth.current) {
      startLoop(segmentWidth.current);
    }
  }, [announcements, startLoop]);

  const renderRow = (prefix) =>
    announcements.map((item, index) => {
      const label = item.title || item.description;
      if (!label) return null;
      return (
        <View key={`${prefix}-${item.id || index}`} style={styles.tickerItem}>
          <Text style={styles.tickerItemText} numberOfLines={1}>
            {label}
          </Text>
          <Text style={styles.tickerBullet} accessibilityElementsHidden>
            •
          </Text>
        </View>
      );
    });

  return (
    <View style={styles.ticker} accessibilityLabel="Live Announcements">
      <View style={styles.tickerBadge} pointerEvents="none">
        <Ionicons name="megaphone-outline" size={16} color="#38bdf8" />
      </View>

      <View style={styles.tickerMarquee}>
        <LinearGradient
          colors={['#0f172a', 'rgba(15,23,42,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.tickerFadeLeft}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['rgba(15,23,42,0)', '#0f172a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.tickerFadeRight}
          pointerEvents="none"
        />
        <Animated.View
          style={[styles.tickerTrack, { transform: [{ translateX }] }]}
          collapsable={false}
        >
          <View
            style={styles.tickerSegment}
            onLayout={(e) => startLoop(e.nativeEvent.layout.width)}
          >
            {renderRow('a')}
          </View>
          <View style={styles.tickerSegment} importantForAccessibility="no-hide-descendants">
            {renderRow('b')}
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

function VideoAdSlide({ item, isActive, onVideoEnd, onPlaybackChange }) {
  const player = useVideoPlayer(item.videoUrl, (p) => {
    p.loop = false;
    p.muted = true;
  });
  const endedRef = useRef(false);
  const viewMountedRef = useRef(false);

  useEffect(() => {
    if (!isActive) {
      player.pause();
      onPlaybackChange?.(false);
      return;
    }

    endedRef.current = false;
    onPlaybackChange?.(false);

    const playWhenReady = () => {
      if (!isActive || !viewMountedRef.current) return;
      try {
        if (player.status === 'readyToPlay') {
          player.currentTime = 0;
          player.play();
        }
      } catch {
        // Native player not attached yet.
      }
    };

    const statusSub = player.addListener('statusChange', ({ status }) => {
      if (!isActive) return;
      if (status === 'readyToPlay') {
        playWhenReady();
      }
      if (status === 'error') {
        onPlaybackChange?.(false);
      }
    });
    const loadSub = player.addListener('sourceLoad', () => {
      if (isActive) playWhenReady();
    });
    const playingSub = player.addListener('playingChange', ({ isPlaying }) => {
      if (isActive) onPlaybackChange?.(isPlaying);
    });
    const endSub = player.addListener('playToEnd', () => {
      if (!isActive || endedRef.current) return;
      endedRef.current = true;
      onVideoEnd?.();
    });

    const retryTimer = setTimeout(playWhenReady, 200);
    const retryTimer2 = setTimeout(playWhenReady, 800);

    return () => {
      clearTimeout(retryTimer);
      clearTimeout(retryTimer2);
      statusSub.remove();
      loadSub.remove();
      playingSub.remove();
      endSub.remove();
    };
  }, [player, item.videoUrl, isActive, onVideoEnd, onPlaybackChange]);

  return (
    <VideoView
      style={[
        styles.slideMediaVideo,
        !isActive && styles.slideMediaVideoHidden,
      ]}
      player={player}
      contentFit="cover"
      nativeControls={false}
      allowsFullscreen={false}
      allowsPictureInPicture={false}
      surfaceType={Platform.OS === 'android' ? 'textureView' : undefined}
      onLayout={() => {
        viewMountedRef.current = true;
        if (isActive && player.status === 'readyToPlay') {
          try {
            player.play();
          } catch {
            // ignore
          }
        }
      }}
    />
  );
}

// ─── Single slide (image + optional video when active) ─────────────────────────
function AdSlide({ item, isActive, onVideoEnd }) {
  const [imageReady, setImageReady] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const uri = item?.image;
  const hasVideo = !!item?.videoUrl;

  useEffect(() => {
    setImageReady(false);
    setVideoPlaying(false);
    if (uri) Image.prefetch(uri).catch(() => {});
  }, [uri, item?.videoUrl]);

  const showVideoBuffering = hasVideo && isActive && !videoPlaying;

  return (
    <View style={styles.slide}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.slideMedia,
            hasVideo && isActive && videoPlaying && styles.slideMediaHidden,
          ]}
          resizeMode="cover"
          onLoadEnd={() => setImageReady(true)}
          onError={() => setImageReady(true)}
        />
      ) : (
        <View style={styles.slideMedia} />
      )}
      {uri && !imageReady && !(hasVideo && isActive) && (
        <View style={styles.mediaLoading}>
          <ActivityIndicator color="#fff" size="small" />
        </View>
      )}
      {hasVideo && (
        <VideoAdSlide
          item={item}
          isActive={isActive}
          onVideoEnd={onVideoEnd}
          onPlaybackChange={setVideoPlaying}
        />
      )}
      {hasVideo && (
        <View style={styles.videoBadge}>
          <Ionicons name="play-circle" size={13} color="#fff" />
          <Text style={styles.videoBadgeText}>VIDEO</Text>
        </View>
      )}
      {showVideoBuffering && (
        <View style={styles.mediaLoading} pointerEvents="none">
          <ActivityIndicator color="#fff" size="small" />
        </View>
      )}

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.62)']}
        style={styles.slideGradient}
        pointerEvents="none"
      />

      {!!(item.title) && (
        <View style={styles.slideCaption}>
          <Text style={styles.slideCaptionText} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Main carousel ──────────────────────────────────────────────────────────────
export default function AdBannerSlider({
  promotions = [],
  tickerItems = [],
  onPress,
  loading = false,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const timerRef = useRef(null);

  const slides = useMemo(
    () => promotions.filter((p) => String(p.image || '').trim() || String(p.videoUrl || '').trim()),
    [promotions]
  );
  const slidesKey = slides.map((s) => s.id).join('|');

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 85 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const next = viewableItems[0]?.index;
    if (next != null) {
      setActiveIndex(next);
    }
  }).current;

  useEffect(() => {
    if (!slides.length) return;
    setActiveIndex(0);
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    });
  }, [slidesKey]);

  useEffect(() => {
    if (!slides.length) return;
    const uri = slides[0]?.image;
    if (uri) {
      Image.prefetch(uri).catch(() => {});
    }
  }, [slidesKey, slides]);

  const scrollToSlide = useCallback(
    (index, animated = true) => {
      if (!flatListRef.current || slides.length === 0) return;
      const safeIndex = (index + slides.length) % slides.length;
      flatListRef.current.scrollToOffset({
        offset: safeIndex * SCREEN_WIDTH,
        animated,
      });
      setActiveIndex(safeIndex);
    },
    [slides.length]
  );

  const goTo = useCallback(
    (idx) => {
      scrollToSlide(idx, true);
    },
    [scrollToSlide]
  );

  // Advance to next slide
  const advanceSlide = useCallback(() => {
    scrollToSlide(activeIndex + 1, true);
  }, [activeIndex, scrollToSlide]);

  const onVideoEnd = useCallback(() => {
    advanceSlide();
  }, [advanceSlide]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const current = slides[activeIndex];
    if (current?.videoUrl) return;
    timerRef.current = setTimeout(() => {
      advanceSlide();
    }, AUTO_PLAY_MS);
    return () => clearTimeout(timerRef.current);
  }, [slides, activeIndex, advanceSlide]);

  const handleMomentumEnd = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(idx);
  };

  return (
    <View style={styles.container}>
      {/* Scrolling ticker */}
      <TickerBar items={tickerItems} />

      {/* Slider */}
      {loading ? (
        <BannerShimmer height={SLIDE_HEIGHT} />
      ) : slides.length > 0 ? (
      <View style={styles.sliderWrapper}>
        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          extraData={activeIndex}
          initialNumToRender={2}
          windowSize={3}
          removeClippedSubviews={false}
          keyExtractor={(item) => String(item.id)}
          getItemLayout={(_, i) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * i, index: i })}
          onMomentumScrollEnd={handleMomentumEnd}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onScrollToIndexFailed={(info) => {
            flatListRef.current?.scrollToOffset({
              offset: info.index * SCREEN_WIDTH,
              animated: false,
            });
          }}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => onPress && onPress(item)}
              style={{ width: SCREEN_WIDTH }}
            >
              <AdSlide
                item={item}
                isActive={index === activeIndex}
                onVideoEnd={onVideoEnd}
              />
            </TouchableOpacity>
          )}
        />

        {/* Left arrow */}
        {slides.length > 1 && (
          <TouchableOpacity
            style={[styles.arrowBtn, styles.arrowLeft]}
            onPress={() => goTo(activeIndex - 1)}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Right arrow */}
        {slides.length > 1 && (
          <TouchableOpacity
            style={[styles.arrowBtn, styles.arrowRight]}
            onPress={() => goTo(activeIndex + 1)}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Dots */}
        {slides.length > 1 && (
          <View style={styles.dots}>
            {slides.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => goTo(i)}>
                <View
                  style={[
                    styles.dot,
                    i === activeIndex ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      ) : (
        <View style={[styles.sliderWrapper, styles.sliderEmpty]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
  },

  // ── ticker (web: zeas-ticker-bar) ──
  ticker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    height: TICKER_HEIGHT,
    width: SCREEN_WIDTH,
    overflow: 'hidden',
  },
  tickerBadge: {
    width: TICKER_BADGE_WIDTH,
    height: TICKER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(148,163,184,0.35)',
    zIndex: 3,
  },
  tickerMarquee: {
    flex: 1,
    height: TICKER_HEIGHT,
    overflow: 'hidden',
    justifyContent: 'center',
    position: 'relative',
  },
  tickerFadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: TICKER_FADE_WIDTH,
    zIndex: 2,
  },
  tickerFadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: TICKER_FADE_WIDTH,
    zIndex: 2,
  },
  tickerTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  tickerSegment: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  tickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    paddingLeft: 12,
    paddingRight: 4,
  },
  tickerItemText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    flexShrink: 0,
    maxHeight: TICKER_HEIGHT,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
  tickerBullet: {
    color: '#38bdf8',
    fontSize: 14,
    marginLeft: 12,
    opacity: 0.85,
    flexShrink: 0,
  },

  // ── slider ──
  sliderWrapper: {
    width: SCREEN_WIDTH,
    height: SLIDE_HEIGHT,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SLIDE_HEIGHT,
  },
  slideMedia: {
    width: SCREEN_WIDTH,
    height: SLIDE_HEIGHT,
    backgroundColor: '#222',
  },
  slideMediaVideo: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111',
    zIndex: 1,
  },
  slideMediaVideoHidden: {
    opacity: 0,
  },
  slideMediaHidden: {
    opacity: 0,
  },
  videoBadge: {
    position: 'absolute',
    right: 12,
    bottom: 36,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
    zIndex: 2,
  },
  videoBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  mediaLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  sliderEmpty: {
    backgroundColor: '#111',
  },
  slideGradient: {
    ...StyleSheet.absoluteFillObject,
    top: '40%',
  },
  slideCaption: {
    position: 'absolute',
    left: 16,
    right: 60,
    bottom: 30,
  },
  slideCaptionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // ── arrows ──
  arrowBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  arrowLeft: { left: 10 },
  arrowRight: { right: 10 },

  // ── dots ──
  dots: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 22,
    backgroundColor: '#fff',
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
});
