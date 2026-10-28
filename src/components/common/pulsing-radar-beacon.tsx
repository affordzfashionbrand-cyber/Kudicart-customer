import React, { useEffect, useRef } from 'react';
import { View, Animated, Platform } from 'react-native';

interface PulsingRadarBeaconProps {
  color?: string;
  size?: number;
}

export const PulsingRadarBeacon: React.FC<PulsingRadarBeaconProps> = ({
  color = '#22C55E',
  size = 8,
}) => {
  const rippleScale = useRef(new Animated.Value(1)).current;
  const rippleOpacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.timing(rippleScale, {
          toValue: 2.6,
          duration: 1500,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(rippleOpacity, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [rippleScale, rippleOpacity]);

  return (
    <View
      style={{
        width: size * 2.6,
        height: size * 2.6,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Expanding Ripple Ring */}
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: rippleOpacity,
          transform: [{ scale: rippleScale }],
        }}
      />
      {/* Solid Center Core */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
};
