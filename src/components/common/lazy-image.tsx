import React, { useState } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Image, ImageProps } from 'expo-image';
import { Skeleton } from '@/components/common/skeleton';

// Luxury subtle warm oyster blurhash matching the brand's off-white canvas
export const ATELIER_BLURHASH = 'L9B:x^00~q_3_3xuxuof_3of?bof';

export interface LazyImageProps extends Omit<ImageProps, 'placeholder'> {
  showSkeletonWhileLoading?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  customPlaceholder?: string;
}

/**
 * LazyImage wraps expo-image with:
 * - memory-disk caching
 * - smooth fade transition
 * - blurhash placeholder
 * - optional synchronized skeleton shimmer while in flight
 */
export function LazyImage({
  source,
  style,
  containerStyle,
  contentFit = 'cover',
  transition = 220,
  cachePolicy = 'memory-disk',
  priority = 'low',
  showSkeletonWhileLoading = true,
  customPlaceholder,
  onLoad,
  onError,
  ...restProps
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {showSkeletonWhileLoading && !isLoaded && !hasError && (
        <View style={StyleSheet.absoluteFill}>
          <Skeleton width="100%" height="100%" borderRadius={0} />
        </View>
      )}

      <Image
        source={source}
        style={[style, hasError && styles.errorImage]}
        contentFit={contentFit}
        transition={transition}
        cachePolicy={cachePolicy}
        priority={priority}
        placeholder={{ blurhash: customPlaceholder || ATELIER_BLURHASH }}
        onLoad={(e) => {
          setIsLoaded(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          setHasError(true);
          setIsLoaded(true);
          onError?.(e);
        }}
        {...restProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  errorImage: {
    opacity: 0.6,
  },
});
