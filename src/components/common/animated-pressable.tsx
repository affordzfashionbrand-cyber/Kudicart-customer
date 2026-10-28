import React, { useRef } from 'react';
import { Animated, Pressable, StyleProp, ViewStyle, StyleSheet, Platform, Insets } from 'react-native';

export interface AnimatedPressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  onPress?: (e?: any) => void;
  scaleTo?: number;
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  hitSlop?: Insets | number;
}

export const AnimatedPressable = React.memo(function AnimatedPressable({
  children,
  style,
  className,
  onPress,
  scaleTo = 0.975,
  containerStyle,
  disabled,
  hitSlop = 6,
}: AnimatedPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const isNative = Platform.OS !== 'web';

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: scaleTo,
      speed: 60,
      bounciness: 3,
      useNativeDriver: isNative,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      speed: 45,
      bounciness: 6,
      useNativeDriver: isNative,
    }).start();
  };

  const flattenedStyle = (StyleSheet.flatten(style) || {}) as ViewStyle;
  const isFullWidth = flattenedStyle.width === '100%';

  return (
    <Pressable
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      hitSlop={hitSlop}
      style={[
        isFullWidth ? { width: '100%' } : null,
        containerStyle,
      ]}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]} className={className}>
        {children}
      </Animated.View>
    </Pressable>
  );
});
