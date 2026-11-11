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

export const AnimatedPriceTicker: React.FC<AnimatedPriceTickerProps> = React.memo(function AnimatedPriceTicker({
  value,
  style,
  prefix = '₹',
  duration = 420,
  showStrikethrough = false,
}) {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const animValue = useRef(new Animated.Value(value)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const prevValueRef = useRef<number>(value);
  const lastShownRef = useRef<number>(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      // 1. Subtle tactile scale pop
      const popAnim = Animated.sequence([
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
      ]);
      popAnim.start();

      // 2. Stepped value roll avoiding duplicate re-renders for unchanged integers
      const listenerId = animValue.addListener(({ value: current }) => {
        const rounded = Math.round(current);
        if (rounded !== lastShownRef.current) {
          lastShownRef.current = rounded;
          setDisplayValue(rounded);
        }
      });

      const rollAnim = Animated.timing(animValue, {
        toValue: value,
        duration,
        easing: bespokeEasing,
        useNativeDriver: false, // Required for numeric listener interpolation
      });
      rollAnim.start(() => {
        lastShownRef.current = value;
        setDisplayValue(value);
        animValue.removeListener(listenerId);
      });

      prevValueRef.current = value;
      return () => {
        popAnim.stop();
        rollAnim.stop();
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
});
