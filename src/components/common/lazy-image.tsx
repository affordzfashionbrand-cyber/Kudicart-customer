import React, { useState, useMemo } from 'react';
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
 * - automatic width/height inheritance
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

  // Normalize source: string URL -> { uri: string }
  const resolvedSource = useMemo(() => {
    if (!source) return undefined;
    if (typeof source === 'string') {
      return { uri: source };
    }
    return source;
  }, [source]);

  // Extract layout dimensions so the container wrapper matches the requested styling
  const flattenedStyle = useMemo(() => (StyleSheet.flatten(style) || {}) as ViewStyle, [style]);

  return (
    <View
      style={[
        styles.container,
        {
          position: flattenedStyle.position ?? 'relative',
          top: flattenedStyle.top,
          left: flattenedStyle.left,
          right: flattenedStyle.right,
          bottom: flattenedStyle.bottom,
          width: flattenedStyle.width ?? '100%',
          height: flattenedStyle.height ?? '100%',
          borderRadius: flattenedStyle.borderRadius,
          borderTopLeftRadius: flattenedStyle.borderTopLeftRadius,
          borderTopRightRadius: flattenedStyle.borderTopRightRadius,
          borderBottomLeftRadius: flattenedStyle.borderBottomLeftRadius,
          borderBottomRightRadius: flattenedStyle.borderBottomRightRadius,
        },
        containerStyle,
      ]}
    >
      {showSkeletonWhileLoading && !isLoaded && !hasError && (
        <View style={StyleSheet.absoluteFill}>
          <Skeleton
            width="100%"
            height="100%"
            borderRadius={typeof flattenedStyle.borderRadius === 'number' ? flattenedStyle.borderRadius : 0}
          />
        </View>
      )}

      <Image
        source={resolvedSource}
        style={[
          styles.image,
          style,
          hasError && styles.errorImage,
        ]}
        contentFit={contentFit}
        transition={transition}
        cachePolicy={cachePolicy}
        priority={priority}
        placeholder={customPlaceholder ? { blurhash: customPlaceholder } : undefined}
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
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F4F1EA',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  errorImage: {
    opacity: 0.6,
  },
});
