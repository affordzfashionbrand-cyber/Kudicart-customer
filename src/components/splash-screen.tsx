import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/icon';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export function SplashScreenView({
  onFinish,
  duration = 2400,
}: SplashScreenProps) {
  const { width: windowWidth, height } = useWindowDimensions();
  const width = Math.min(windowWidth, 440);

  // Animation values using stable useState initializers
  const [logoScale] = useState(() => new Animated.Value(0.6));
  const [logoOpacity] = useState(() => new Animated.Value(0));
  const [textOpacity] = useState(() => new Animated.Value(0));
  const [textTranslateY] = useState(() => new Animated.Value(20));
  const [glowPulse] = useState(() => new Animated.Value(1));
  const [progressAnim] = useState(() => new Animated.Value(0));
  const [screenOpacity] = useState(() => new Animated.Value(1));

  const [loadingStep, setLoadingStep] = useState('Locating nearest Affordz express hub...');
  const isNative = Platform.OS !== 'web';

  useEffect(() => {
    // 1. Logo entrance: scale & fade in
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        bounciness: 8,
        speed: 10,
        useNativeDriver: isNative,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: isNative,
      }),
    ]).start();

    // 2. Title & tagline entrance
    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 700,
        delay: 350,
        useNativeDriver: isNative,
      }),
      Animated.spring(textTranslateY, {
        toValue: 0,
        bounciness: 6,
        speed: 12,
        delay: 350,
        useNativeDriver: isNative,
      }),
    ]).start();

    // 3. Glow breathing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1.14,
          duration: 1200,
          useNativeDriver: isNative,
        }),
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: isNative,
        }),
      ])
    ).start();

    // 4. Progress bar loading animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration - 600,
      useNativeDriver: false,
    }).start();

    // Milestone text updates
    const t1 = setTimeout(() => {
      setLoadingStep('Syncing 18-min doorstep drops...');
    }, 700);

    const t2 = setTimeout(() => {
      setLoadingStep('Curating atelier designer capsules...');
    }, 1500);

    // 5. Exit transition: smooth fade out
    const exitTimer = setTimeout(() => {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: isNative,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, duration);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(exitTimer);
    };
  }, [duration, onFinish]);

  const handleSkip = () => {
    Animated.timing(screenOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: isNative,
    }).start(() => {
      if (onFinish) onFinish();
    });
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width,
          height,
          opacity: screenOpacity,
        },
      ]}
    >
      {/* Ambient background glow circles */}
      <View style={styles.ambientBackground}>
        <Animated.View
          style={[
            styles.glowAura,
            {
              transform: [{ scale: glowPulse }],
            },
          ]}
        />
        <View style={styles.topRightAccent} />
        <View style={styles.bottomLeftAccent} />
      </View>

      {/* Skip Button in Top Corner */}
      <TouchableOpacity
        onPress={handleSkip}
        activeOpacity={0.7}
        style={styles.skipButton}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Center Brand Identity Pod */}
      <View style={styles.centerContent}>
        {/* Animated Brand Logo */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoShadowBox}>
            <Image
              source={require('@/assets/images/logo-removebg-preview.png')}
              style={styles.logoImage}
              contentFit="contain"
              transition={150}
            />
          </View>
        </Animated.View>

        {/* Brand Name & Tagline */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <View style={styles.brandTitleRow}>
            <Text style={styles.brandTitleKudi}>AFFORDZ</Text>
            <Text style={[styles.brandTitleCart, { color: '#FF5A1F' }]}>.</Text>
          </View>

          {/* Express Badge */}
          <View style={styles.expressBadge}>
            <Icon name="bolt" size={14} color="#FF5A1F" />
            <Text style={styles.expressBadgeText}>
              18-MIN CONCIERGE DROP
            </Text>
          </View>

          <Text style={styles.brandTagline}>
            CURATED ATELIERS. 18-MIN DOORSTEP TRY & BUY.
          </Text>
        </Animated.View>
      </View>

      {/* Bottom Loading Progress & Footer */}
      <View style={styles.footerSection}>
        {/* Progress bar */}
        <View style={styles.progressBarTrack}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressWidth,
              },
            ]}
          />
        </View>

        <Text style={styles.loadingStepText}>{loadingStep}</Text>

        {/* Micro Guarantee Note */}
        <View style={styles.guaranteeRow}>
          <Icon name="verified" size={13} color="#FF5A1F" />
          <Text style={styles.guaranteeText}>
            10-Min Doorstep Fit Check & Instant Concierge Exchange
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  ambientBackground: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FDFBF7',
    overflow: 'hidden',
  },
  glowAura: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#F4F1EA',
    opacity: 0.8,
  },
  topRightAccent: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#EBE7DF',
    opacity: 0.5,
  },
  bottomLeftAccent: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#EBE7DF',
    opacity: 0.6,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F4F1EA',
    borderWidth: 1,
    borderColor: '#D9D9D5',
  },
  skipText: {
    color: '#111111',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoShadowBox: {
    width: 140,
    height: 140,
    borderRadius: 36,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: '#D9D9D5',
    padding: 12,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandTitleKudi: {
    fontSize: 36,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: -0.5,
  },
  brandTitleCart: {
    fontSize: 36,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: -0.5,
  },
  expressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#F4F1EA',
    borderWidth: 1,
    borderColor: '#D9D9D5',
  },
  expressBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: 0.8,
  },
  brandTagline: {
    fontSize: 12,
    color: '#6B6667',
    marginTop: 12,
    textAlign: 'center',
    maxWidth: 280,
    letterSpacing: 2,
    fontWeight: '700',
  },
  footerSection: {
    width: '100%',
    alignItems: 'center',
    maxWidth: 320,
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#D9D9D5',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF5A1F',
    borderRadius: 2,
  },
  loadingStepText: {
    fontSize: 12,
    color: '#6B6667',
    fontWeight: '600',
    marginBottom: 12,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guaranteeText: {
    fontSize: 11,
    color: '#6B6667',
    fontWeight: '600',
  },
});
