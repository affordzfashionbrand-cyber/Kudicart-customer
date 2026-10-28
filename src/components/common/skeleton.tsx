import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, StyleProp, Platform, useWindowDimensions } from 'react-native';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * High-performance pulsing skeleton primitive.
 * Animates smoothly between #EAE7E1 and #F7F5F0 matching the luxury oyster/paper palette.
 */
export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 6,
  style,
}: SkeletonProps) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 900,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 900,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    pulseLoop.start();

    return () => {
      pulseLoop.stop();
    };
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: '#E5E2DC',
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
}

/**
 * Skeleton placeholder for Product Cards (feed, grids, carousels)
 */
export function ProductCardSkeleton({ cardWidth = 160 }: { cardWidth?: number }) {
  const imageHeight = Math.round(cardWidth * 1.35);

  return (
    <View style={[styles.productCard, { width: cardWidth }]}>
      {/* Image Skeleton */}
      <View style={{ width: '100%', height: imageHeight, borderRadius: 12, overflow: 'hidden', backgroundColor: '#EFECE6' }}>
        <Skeleton width="100%" height="100%" borderRadius={12} />
      </View>

      <View style={{ padding: 10, gap: 6 }}>
        {/* Brand Tag */}
        <Skeleton width="45%" height={10} borderRadius={4} />

        {/* Product Title */}
        <Skeleton width="90%" height={13} borderRadius={4} />
        <Skeleton width="65%" height={13} borderRadius={4} />

        {/* Rating Stars Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <Skeleton width={32} height={11} borderRadius={4} />
          <Skeleton width={24} height={11} borderRadius={4} />
        </View>

        {/* Pricing Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <Skeleton width={50} height={16} borderRadius={4} />
          <Skeleton width={40} height={12} borderRadius={4} />
        </View>

        {/* Add to Bag Button */}
        <View style={{ marginTop: 6 }}>
          <Skeleton width="100%" height={30} borderRadius={8} />
        </View>
      </View>
    </View>
  );
}

/**
 * Skeleton placeholder for Hero Banners
 */
export function HeroBannerSkeleton({ bannerWidth }: { bannerWidth?: number }) {
  const { width: winWidth } = useWindowDimensions();
  const effectiveWidth = bannerWidth || Math.min(winWidth, 440) - 32;

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F7F7F5' }}>
      <View
        style={{
          width: effectiveWidth,
          height: 220,
          borderRadius: 20,
          backgroundColor: '#E8E5DF',
          overflow: 'hidden',
          padding: 22,
          justifyContent: 'center',
          gap: 10,
        }}
      >
        <Skeleton width={80} height={18} borderRadius={6} />
        <Skeleton width="70%" height={24} borderRadius={6} />
        <Skeleton width="50%" height={14} borderRadius={4} />
        <Skeleton width={110} height={36} borderRadius={12} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

/**
 * Skeleton placeholder for Horizontal Category Strip
 */
export function CategoryStripSkeleton() {
  return (
    <View style={{ paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', gap: 14 }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View key={i} style={{ alignItems: 'center', gap: 6 }}>
          <Skeleton width={58} height={58} borderRadius={29} />
          <Skeleton width={44} height={10} borderRadius={4} />
        </View>
      ))}
    </View>
  );
}

/**
 * Skeleton placeholder for Order Cards
 */
export function OrderCardSkeleton() {
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E8E5DF',
        marginBottom: 14,
        gap: 12,
      }}
    >
      {/* Header Row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width={120} height={14} borderRadius={4} />
        <Skeleton width={85} height={22} borderRadius={11} />
      </View>

      {/* Item Preview */}
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Skeleton width={52} height={64} borderRadius={10} />
        <View style={{ flex: 1, gap: 6 }}>
          <Skeleton width="80%" height={14} borderRadius={4} />
          <Skeleton width="50%" height={12} borderRadius={4} />
          <Skeleton width="30%" height={12} borderRadius={4} />
        </View>
      </View>

      {/* Footer Row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F4F1EA' }}>
        <Skeleton width={90} height={16} borderRadius={4} />
        <Skeleton width={110} height={34} borderRadius={17} />
      </View>
    </View>
  );
}

/**
 * Skeleton placeholder for Product Detail Screen
 */
export function ProductDetailSkeleton() {
  const { width } = useWindowDimensions();
  const effectiveWidth = Math.min(width, 480);
  const galleryHeight = Math.round(effectiveWidth * 1.15);

  return (
    <View style={{ flex: 1, backgroundColor: '#FDFBF7' }}>
      {/* Top Header Placeholder */}
      <View style={{ height: 56, borderBottomWidth: 1, borderBottomColor: '#ECE8DF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, justifyContent: 'space-between' }}>
        <Skeleton width={38} height={38} borderRadius={19} />
        <Skeleton width={160} height={20} borderRadius={6} />
        <Skeleton width={38} height={38} borderRadius={19} />
      </View>

      {/* Main Gallery Skeleton */}
      <View style={{ width: '100%', height: galleryHeight, backgroundColor: '#EFECE6' }}>
        <Skeleton width="100%" height="100%" borderRadius={0} />
      </View>

      {/* Thumbnails Row */}
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} width={50} height={62} borderRadius={8} />
        ))}
      </View>

      {/* Details Block */}
      <View style={{ paddingHorizontal: 16, gap: 10, marginTop: 8 }}>
        <Skeleton width="40%" height={12} borderRadius={4} />
        <Skeleton width="85%" height={26} borderRadius={6} />
        <Skeleton width="55%" height={26} borderRadius={6} />

        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}>
          <Skeleton width={70} height={14} borderRadius={4} />
          <Skeleton width={120} height={14} borderRadius={4} />
        </View>

        {/* Price Row */}
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 6 }}>
          <Skeleton width={100} height={28} borderRadius={6} />
          <Skeleton width={70} height={18} borderRadius={4} />
          <Skeleton width={80} height={20} borderRadius={6} />
        </View>

        {/* Color Swatches */}
        <View style={{ marginTop: 12, gap: 8 }}>
          <Skeleton width={120} height={14} borderRadius={4} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} width={80} height={32} borderRadius={12} />
            ))}
          </View>
        </View>

        {/* Size Selector */}
        <View style={{ marginTop: 12, gap: 8 }}>
          <Skeleton width={100} height={14} borderRadius={4} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} width={48} height={40} borderRadius={10} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

/**
 * Skeleton placeholder for Reviews Section
 */
export function ReviewSectionSkeleton() {
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 24, gap: 14 }}>
      {/* Title & Write Review Row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width={140} height={20} borderRadius={6} />
        <Skeleton width={110} height={32} borderRadius={16} />
      </View>

      {/* Summary Score Card */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor: '#E8E5DF',
          gap: 8,
        }}
      >
        <Skeleton width={100} height={32} borderRadius={6} />
        <Skeleton width="80%" height={14} borderRadius={4} />
        <Skeleton width="50%" height={12} borderRadius={4} />
      </View>

      {/* Review Cards */}
      {[1, 2].map((i) => (
        <View
          key={i}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: '#E8E5DF',
            gap: 10,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Skeleton width={34} height={34} borderRadius={17} />
              <View style={{ gap: 4 }}>
                <Skeleton width={100} height={14} borderRadius={4} />
                <Skeleton width={70} height={10} borderRadius={4} />
              </View>
            </View>
            <Skeleton width={70} height={14} borderRadius={4} />
          </View>
          <Skeleton width="100%" height={14} borderRadius={4} />
          <Skeleton width="85%" height={14} borderRadius={4} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E5DF',
    marginBottom: 12,
  },
});
