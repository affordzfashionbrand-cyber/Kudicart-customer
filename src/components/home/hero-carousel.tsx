import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { HERO_BANNERS, HeroBanner } from '@/data/mockBanners';
import { Icon } from '@/components/icon';
import { FontStyles } from '@/constants/theme';
import { LazyImage } from '@/components/common/lazy-image';

interface HeroCarouselProps {
  onBannerPress?: (banner: HeroBanner) => void;
}

export function HeroCarousel({ onBannerPress }: HeroCarouselProps) {
  const { width } = useWindowDimensions();
  const effectiveWidth = Math.min(width, 440);
  const bannerWidth = effectiveWidth - 32; // 16px padding on each side
  const [activeIndex, setActiveIndex] = useState(0);

  // Animations for text and image using stable useState initializers
  const [fadeAnim] = useState(() => new Animated.Value(1));
  const [slideAnim] = useState(() => new Animated.Value(0));

  const triggerTransition = (newIndex: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 12,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveIndex(newIndex);
      slideAnim.setValue(-12);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          bounciness: 6,
          speed: 12,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % HERO_BANNERS.length;
    triggerTransition(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = (activeIndex - 1 + HERO_BANNERS.length) % HERO_BANNERS.length;
    triggerTransition(prevIdx);
  };

  // Auto-advance carousel every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 4500);

    return () => clearInterval(timer);
  }, [activeIndex]);

  const banner = HERO_BANNERS[activeIndex];

  return (
    <View style={styles.container}>
      <View style={[styles.card, { width: bannerWidth }]}>
        {/* Background Image with Dark Gradient Tint */}
        <LazyImage
          source={{ uri: banner.image }}
          style={styles.bannerImage}
          contentFit="cover"
          priority="high"
        />

        {/* Gradient Scrim Overlay */}
        <View style={styles.gradientOverlay} />

        {/* Animated Banner Content */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Badge */}
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>{banner.badge}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {banner.title}
          </Text>

          {/* Subtitle */}
          <Text style={styles.subtitle} numberOfLines={2}>
            {banner.subtitle}
          </Text>

          {/* CTA Button */}
          <TouchableOpacity
            onPress={() => onBannerPress && onBannerPress(banner)}
            activeOpacity={0.85}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaText}>{banner.ctaText}</Text>
            <Icon name="arrow_forward" size={16} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>

        {/* Previous / Next Chevron Buttons */}
        <TouchableOpacity
          onPress={handlePrev}
          style={[styles.arrowButton, styles.leftArrow]}
          activeOpacity={0.7}
        >
          <Icon name="chevron_left" size={22} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          style={[styles.arrowButton, styles.rightArrow]}
          activeOpacity={0.7}
        >
          <Icon name="chevron_right" size={22} color="#ffffff" />
        </TouchableOpacity>

        {/* Pagination Dots */}
        <View style={styles.paginationDots}>
          {HERO_BANNERS.map((_, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => triggerTransition(idx)}
                style={[
                  styles.dot,
                  isSelected && styles.activeDot,
                ]}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F7F7F5',
  },
  card: {
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#111111',
    borderWidth: 1.5,
    borderColor: '#D9D9D5',
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(17, 17, 17, 0.45)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 20,
    zIndex: 10,
    maxWidth: '85%',
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: {
    ...FontStyles.sansBold,
    color: '#ffffff',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  title: {
    ...FontStyles.serifSemiBold,
    fontSize: 22,
    color: '#F7F7F5',
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  subtitle: {
    ...FontStyles.sansMedium,
    fontSize: 12,
    color: '#D9D9D5',
    marginTop: 6,
    lineHeight: 16,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 14,
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  ctaText: {
    ...FontStyles.sansBold,
    color: '#111111',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  arrowButton: {
    position: 'absolute',
    top: '40%',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(17, 17, 17, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  leftArrow: {
    left: 8,
  },
  rightArrow: {
    right: 8,
  },
  paginationDots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    zIndex: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  activeDot: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
});
