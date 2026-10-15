// ShimmerLoader Component - Animated loading placeholder
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../constants/theme';

function ShimmerBlock({ width, height, style }) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: Colors.borderLight,
          borderRadius: BorderRadius.sm,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function CardShimmer() {
  return (
    <View style={styles.cardShimmer}>
      <ShimmerBlock width="100%" height={150} style={{ borderRadius: BorderRadius.lg }} />
      <View style={styles.cardContent}>
        <ShimmerBlock width="70%" height={18} />
        <ShimmerBlock width="90%" height={14} style={{ marginTop: Spacing.sm }} />
        <View style={styles.cardRow}>
          <ShimmerBlock width={60} height={14} />
          <ShimmerBlock width={50} height={20} style={{ borderRadius: BorderRadius.full }} />
        </View>
      </View>
    </View>
  );
}

export function HorizontalCardShimmer() {
  return (
    <ShimmerBlock
      width={280}
      height={200}
      style={{ borderRadius: BorderRadius.lg, marginRight: Spacing.lg }}
    />
  );
}

export function BannerShimmer({ height }) {
  return (
    <View style={[styles.bannerShimmer, { height }]}>
      <ShimmerBlock width="100%" height="100%" style={{ borderRadius: 0 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  cardShimmer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  cardContent: {
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  bannerShimmer: {
    width: '100%',
    backgroundColor: '#111',
    overflow: 'hidden',
  },
});
