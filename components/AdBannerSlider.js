// AdBannerSlider — scrolling ticker + full-width auto-slide image/video carousel
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BannerShimmer } from './ShimmerLoader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_HEIGHT = Math.round(SCREEN_WIDTH * 0.55); // 55 % aspect ratio
const AUTO_PLAY_MS = 4500;
const TICKER_HEIGHT = 38;
const TICKER_SPEED = 45; // px/s — similar pace to web landing ticker
const TICKER_BADGE_WIDTH = 44;
const TICKER_FADE_WIDTH = 28;
/** Space between end of copy A and start of copy B (included in scroll distance). */
const TICKER_SEGMENT_GAP = 48;

/** Defer work until the UI is idle (replaces deprecated InteractionManager). */
function runWhenIdle(callback) {
  const g = globalThis;
  if (typeof g.requestIdleCallback === 'function') {
    const id = g.requestIdleCallback(callback, { timeout: 500 });
    return () => {
      if (typeof g.cancelIdleCallback === 'function') g.cancelIdleCallback(id);
    };
  }
  const timer = setTimeout(callback, 0);
  return () => clearTimeout(timer);
}

const DEFAULT_TICKER_ITEMS = [
  { id: 't1', title: '⚡ Festive Season Offers — Check Out Exclusive Deals Near You' },
  { id: 't2', title: '📍 Explore 1000+ Local Shops, Restaurants & Services in Kerala' },
  { id: 't3', title: '💎 Gold & Jewellery Collections — Trending Now' },
  { id: 't4', title: '🍕 Top Rated Restaurants & Cafes — Order or Visit Today' },
  { id: 't5', title: '🔥 Mega Deals Festival — Up to 60% Off on Top Brands' },
];

// ─── Ticker bar — single-line marquee (one Text per segment avoids flex overlap) ─
function TickerBar({ items }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const segmentWidth = useRef(0);
  const loopRef = useRef(null);

  const announcements = items.length > 0 ? items : DEFAULT_TICKER_ITEMS;

  const marqueeText = useMemo(() => {
    const parts = announcements
      .map((item) => String(item.title || item.description || '').trim())
      .filter(Boolean);
    return parts.join('   •   ');
  }, [announcements]);

  const startLoop = useCallback(
    (width) => {
      if (!width || width < 1) return;
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
  }, [marqueeText, startLoop]);

  if (!marqueeText) {
    return null;
  }

  const TickerCopy = ({ onMeasure }) => (
    <View
      style={styles.tickerCopy}
      onLayout={onMeasure ? (e) => onMeasure(e.nativeEvent.layout.width) : undefined}
    >
      <Text style={styles.tickerLineText} allowFontScaling={false}>
        {marqueeText}
      </Text>
      <View style={styles.tickerCopyGap} />
    </View>
  );

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
          <TickerCopy onMeasure={startLoop} />
          <TickerCopy />
        </Animated.View>
      </View>
    </View>
  );
}

const VIDEO_PLAY_RETRY_MS = 280;
const VIDEO_PLAY_MAX_ATTEMPTS = 40;

/** Full-bleed overlay on top of carousel — avoids FlatList clipping/recycle issues. */
function TopCarouselVideo({ videoUrl, onVideoEnd, onPlaybackChange }) {
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = false;
    p.muted = true;
  });
  const endedRef = useRef(false);
  const playingRef = useRef(false);

  const forcePlay = useCallback(() => {
    if (!videoUrl) return;
    try {
      if (player.status === 'readyToPlay' || player.status === 'idle') {
        player.play();
      } else {
        player.play();
      }
    } catch {
      // retry on next tick
    }
  }, [player, videoUrl]);

  useFocusEffect(
    useCallback(() => {
      endedRef.current = false;
      const t = setTimeout(forcePlay, 100);
      return () => clearTimeout(t);
    }, [forcePlay, videoUrl])
  );

  useEffect(() => {
    endedRef.current = false;
    playingRef.current = false;
    onPlaybackChange?.(false);

    const statusSub = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay' || status === 'loading') {
        forcePlay();
      }
      if (status === 'error') {
        onPlaybackChange?.(false);
        setTimeout(onVideoEnd, 800);
      }
    });
    const loadSub = player.addListener('sourceLoad', forcePlay);
    const playingSub = player.addListener('playingChange', ({ isPlaying }) => {
      playingRef.current = isPlaying;
      onPlaybackChange?.(isPlaying);
    });
    const endSub = player.addListener('playToEnd', () => {
      if (endedRef.current) return;
      endedRef.current = true;
      onVideoEnd?.();
    });

    const cancelIdle = runWhenIdle(forcePlay);
    const timers = [0, 120, 350, 700, 1200, 2000].map((ms) => setTimeout(forcePlay, ms));

    let attempts = 0;
    const retryId = setInterval(() => {
      attempts += 1;
      if (playingRef.current || attempts >= VIDEO_PLAY_MAX_ATTEMPTS) {
        clearInterval(retryId);
        return;
      }
      forcePlay();
    }, VIDEO_PLAY_RETRY_MS);

    return () => {
      cancelIdle();
      timers.forEach(clearTimeout);
      clearInterval(retryId);
      try {
        player.pause();
      } catch {
        // ignore
      }
      statusSub.remove();
      loadSub.remove();
      playingSub.remove();
      endSub.remove();
    };
  }, [player, videoUrl, onVideoEnd, onPlaybackChange, forcePlay]);

  return (
    <VideoView
      style={styles.topVideoView}
      player={player}
      contentFit="cover"
      nativeControls={false}
      allowsFullscreen={false}
      allowsPictureInPicture={false}
      surfaceType={Platform.OS === 'android' ? 'textureView' : undefined}
      collapsable={false}
      onLayout={forcePlay}
    />
  );
}

// Poster-only slide; video renders in TopCarouselVideo overlay.
function AdSlide({ item, hidePoster }) {
  const [imageReady, setImageReady] = useState(false);
  const uri = item?.image;
  const hasVideo = !!String(item?.videoUrl || '').trim();

  useEffect(() => {
    setImageReady(false);
    if (uri) Image.prefetch(uri).catch(() => {});
  }, [uri, item?.videoUrl]);

  return (
    <View style={styles.slide}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.slideMedia, hidePoster && styles.slideMediaHidden]}
          resizeMode="cover"
          onLoadEnd={() => setImageReady(true)}
          onError={() => setImageReady(true)}
        />
      ) : (
        <View style={[styles.slideMedia, hasVideo && styles.slideMediaPoster]} />
      )}
      {uri && !imageReady && !hidePoster && (
        <View style={styles.mediaLoading}>
          <ActivityIndicator color="#fff" size="small" />
        </View>
      )}
      {hasVideo && (
        <View style={styles.videoBadge}>
          <Ionicons name="play-circle" size={13} color="#fff" />
          <Text style={styles.videoBadgeText}>VIDEO</Text>
        </View>
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.62)']}
        style={styles.slideGradient}
        pointerEvents="none"
      />
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
  const [videoPlaying, setVideoPlaying] = useState(false);
  const flatListRef = useRef(null);
  const timerRef = useRef(null);

  const slides = useMemo(() => {
    const list = promotions.filter(
      (p) => String(p.image || '').trim() || String(p.videoUrl || '').trim()
    );
    return [...list].sort((a, b) => {
      const aVideo = String(a.videoUrl || '').trim();
      const bVideo = String(b.videoUrl || '').trim();
      if (aVideo && !bVideo) return -1;
      if (!aVideo && bVideo) return 1;
      return Number(b.id) - Number(a.id);
    });
  }, [promotions]);

  const activeSlide = slides[activeIndex];
  const activeVideoUrl = String(activeSlide?.videoUrl || '').trim();
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

  useEffect(() => {
    setVideoPlaying(false);
  }, [activeIndex, activeVideoUrl]);

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
    if (String(current?.videoUrl || '').trim()) return;
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
                hidePoster={index === activeIndex && videoPlaying && !!activeVideoUrl}
              />
            </TouchableOpacity>
          )}
        />

        {activeVideoUrl ? (
          <View style={styles.topVideoLayer} pointerEvents="none">
            <TopCarouselVideo
              key={`top-video-${activeIndex}-${activeVideoUrl}`}
              videoUrl={activeVideoUrl}
              onVideoEnd={onVideoEnd}
              onPlaybackChange={setVideoPlaying}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.62)']}
              style={styles.slideGradient}
              pointerEvents="none"
            />
            {!videoPlaying && (
              <View style={styles.topVideoBuffering} pointerEvents="none">
                <ActivityIndicator color="#fff" size="small" />
              </View>
            )}
          </View>
        ) : null}

        {!!activeSlide?.title && (
          <View style={styles.slideCaptionOverlay} pointerEvents="none">
            <Text style={styles.slideCaptionText} numberOfLines={2}>
              {activeSlide.title}
            </Text>
          </View>
        )}

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
    height: TICKER_HEIGHT,
  },
  tickerCopy: {
    flexDirection: 'row',
    flexShrink: 0,
    height: TICKER_HEIGHT,
    alignItems: 'center',
  },
  tickerCopyGap: {
    width: TICKER_SEGMENT_GAP,
    height: 1,
  },
  tickerLineText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    lineHeight: Platform.OS === 'android' ? 18 : 17,
    paddingLeft: 12,
    flexShrink: 0,
    ...(Platform.OS === 'android' ? { includeFontPadding: false, textAlignVertical: 'center' } : null),
  },

  // ── slider ──
  sliderWrapper: {
    width: SCREEN_WIDTH,
    height: SLIDE_HEIGHT,
    overflow: 'hidden',
    backgroundColor: '#111',
    position: 'relative',
  },
  topVideoLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    backgroundColor: '#000',
  },
  topVideoView: {
    width: SCREEN_WIDTH,
    height: SLIDE_HEIGHT,
    backgroundColor: '#000',
  },
  topVideoBuffering: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 2,
  },
  slideCaptionOverlay: {
    position: 'absolute',
    left: 16,
    right: 60,
    bottom: 30,
    zIndex: 25,
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
  slideMediaPoster: {
    backgroundColor: '#111',
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
    zIndex: 10,
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
    zIndex: 6,
  },
  sliderEmpty: {
    backgroundColor: '#111',
  },
  slideGradient: {
    ...StyleSheet.absoluteFillObject,
    top: '40%',
    zIndex: 8,
  },
  slideCaption: {
    position: 'absolute',
    left: 16,
    right: 60,
    bottom: 30,
    zIndex: 9,
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
    zIndex: 30,
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
    zIndex: 30,
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
