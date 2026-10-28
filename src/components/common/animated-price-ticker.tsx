import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleProp, Text, TextStyle, View } from 'react-native';
import { bespokeEasing, formatPrice } from '@/data/homeData';

interface AnimatedPriceTickerProps {
  value: number;
  style?: StyleProp<TextStyle>;
  prefix?: string;
  duration?: number;
  showStrikethrough?: boolean;
}

export const AnimatedPriceTicker: React.FC<AnimatedPriceTickerProps> = ({
  value,
  style,
  prefix = '₹',
  duration = 420,
  showStrikethrough = false,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const animValue = useRef(new Animated.Value(value)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const prevValueRef = useRef<number>(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      // 1. Subtle tactile scale pop
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.08,
          duration: 120,
          easing: bespokeEasing,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(pulseScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();

      // 2. Continuous value roll
      const listenerId = animValue.addListener(({ value: current }) => {
        setDisplayValue(Math.round(current));
      });

      Animated.timing(animValue, {
        toValue: value,
        duration,
        easing: bespokeEasing,
        useNativeDriver: false, // Required for numeric listener interpolation
      }).start(() => {
        setDisplayValue(value);
        animValue.removeListener(listenerId);
      });

      prevValueRef.current = value;
      return () => {
        animValue.removeListener(listenerId);
      };
    }
  }, [value, duration, animValue, pulseScale]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseScale }] }}>
      <Text
        style={[
          style,
          showStrikethrough ? { textDecorationLine: 'line-through' } : {},
        ]}
      >
        {prefix}
        {displayValue.toLocaleString('en-IN')}
      </Text>
    </Animated.View>
  );
};
