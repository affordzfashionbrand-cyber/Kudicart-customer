import React, { useRef } from 'react';
import { Animated, Pressable, StyleProp, ViewStyle } from 'react-native';
import { bespokeEasing } from '@/data/homeData';

export interface AnimatedPressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  onPress?: () => void;
  scaleTo?: number;
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export const AnimatedPressable = React.memo(function AnimatedPressable({
  children,
  style,
  className,
  onPress,
  scaleTo = 0.96,
  containerStyle,
  disabled,
}: AnimatedPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scale, {
      toValue: scaleTo,
      duration: 300,
      easing: bespokeEasing,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 300,
      easing: bespokeEasing,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={containerStyle}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]} className={className}>
        {children}
      </Animated.View>
    </Pressable>
  );
});
