// AdBannerSlider — scrolling ticker + full-width auto-slide image/video carousel
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDE_HEIGHT = Math.round(SCREEN_WIDTH * 0.55); // 55 % aspect ratio
const AUTO_PLAY_MS = 4500;
const TICKER_SPEED = 60; // px/s

// ─── Ticker bar ────────────────────────────────────────────────────────────────
function TickerBar({ items }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const totalWidth = useRef(0);

  // Build one long string from all titles
  const text = items.map((i) => `  •  ${i.title || i.description || ''}  `).join('') + '     ';

  useEffect(() => {
    if (!totalWidth.current) return;
    const duration = (totalWidth.current / TICKER_SPEED) * 1000;
    translateX.setValue(0);
    const anim = Animated.loop(
      Animated.timing(translateX, {
        toValue: -totalWidth.current,
        duration,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [totalWidth.current, text]);

  return (
    <View style={styles.ticker}>
      <Animated.Text
        style={[styles.tickerText, { transform: [{ translateX }] }]}
        numberOfLines={1}
        onLayout={(e) => {
          totalWidth.current = e.nativeEvent.layout.width;
          // re-trigger effect once we know width
          translateX.setValue(0);
          const duration = (totalWidth.current / TICKER_SPEED) * 1000;
          Animated.loop(
            Animated.timing(translateX, {
              toValue: -totalWidth.current,
              duration,
              useNativeDriver: true,
            })
          ).start();
        }}
      >
        {text + text}
      </Animated.Text>
    </View>
  );
}

// ─── Single slide ───────────────────────────────────────────────────────────────
function AdSlide({ item, isActive }) {
  const videoRef = useRef(null);
  const isVideo = !!(item.videoUrl);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.playAsync().catch(() => {});
    } else {
      videoRef.current.pauseAsync().catch(() => {});
    }
  }, [isActive]);

  return (
    <View style={styles.slide}>
      {isVideo ? (
        <Video
          ref={videoRef}
          source={{ uri: item.videoUrl }}
          style={styles.slideMedia}
          resizeMode={ResizeMode.COVER}
          isLooping
          isMuted
          shouldPlay={isActive}
          posterSource={item.image ? { uri: item.image } : undefined}
          posterStyle={styles.slideMedia}
        />
      ) : (
        <Image
          source={{ uri: item.image }}
          style={styles.slideMedia}
          resizeMode="cover"
        />
      )}

      {/* gradient overlay at bottom */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.62)']}
        style={styles.slideGradient}
        pointerEvents="none"
      />

      {/* VIDEO badge */}
      {isVideo && (
        <View style={styles.videoBadge}>
          <Ionicons name="play-circle" size={13} color="#fff" />
          <Text style={styles.videoBadgeText}>VIDEO</Text>
        </View>
      )}

      {/* slide title */}
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
export default function AdBannerSlider({ promotions = [], onPress }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const timerRef = useRef(null);

  const slides = promotions.filter((p) => p.image || p.videoUrl);

  const goTo = useCallback(
    (idx) => {
      const next = (idx + slides.length) % slides.length;
      setActiveIndex(next);
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
    },
    [slides.length]
  );

  // auto-play
  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % slides.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, AUTO_PLAY_MS);
    return () => clearInterval(timerRef.current);
  }, [slides.length]);

  if (!slides.length) return null;

  const handleMomentumEnd = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(idx);
  };

  return (
    <View style={styles.container}>
      {/* Scrolling ticker */}
      {promotions.length > 0 && <TickerBar items={promotions} />}

      {/* Slider */}
      <View style={styles.sliderWrapper}>
        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          getItemLayout={(_, i) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * i, index: i })}
          onMomentumScrollEnd={handleMomentumEnd}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => onPress && onPress(item)}
              style={{ width: SCREEN_WIDTH }}
            >
              <AdSlide item={item} isActive={index === activeIndex} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
  },

  // ── ticker ──
  ticker: {
    backgroundColor: '#1A1A2E',
    height: 34,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingVertical: 4,
  },
  tickerText: {
    color: '#E0E0FF',
    fontSize: 12.5,
    fontWeight: '500',
    letterSpacing: 0.3,
    // no wrapping — runs in one long line
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
    width: '100%',
    height: '100%',
    backgroundColor: '#222',
  },
  slideGradient: {
    ...StyleSheet.absoluteFillObject,
    top: '40%',
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
  },
  videoBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
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
