import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  Platform,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { Search, X, ArrowLeft } from 'lucide-react-native';
import { Fonts } from '@/constants/theme';
import { SEARCH_PLACEHOLDERS, bespokeEasing } from '@/data/homeData';

export interface UniversalSearchBarProps {
  query?: string;
  onQueryChange?: (text: string) => void;
  onPress?: () => void;
  onOpenOverlay?: () => void;
  onSelectSearchQuery?: (text: string) => void;
  onClear?: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
  showLogoInside?: boolean;
  placeholder?: string;
  containerStyle?: ViewStyle;
  editable?: boolean;
  autoFocus?: boolean;
}

export const UniversalSearchBar = React.memo(function UniversalSearchBar({
  query = '',
  onQueryChange,
  onPress,
  onOpenOverlay,
  onSelectSearchQuery,
  onClear,
  onBack,
  showBackButton,
  showLogoInside = false,
  placeholder,
  containerStyle,
  editable,
}: UniversalSearchBarProps) {
  // Rolling placeholder animation
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const placeholderTranslateAnim = useRef(new Animated.Value(0)).current;
  const placeholderOpacityAnim = useRef(new Animated.Value(1)).current;

  // Search Focus Animations
  const [isFocused, setIsFocused] = useState(false);
  const searchFocusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // If a custom static placeholder is provided, don't tick
    if (placeholder) return;

    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(placeholderTranslateAnim, {
          toValue: -14,
          duration: 250,
          easing: bespokeEasing,
          useNativeDriver: true,
        }),
        Animated.timing(placeholderOpacityAnim, {
          toValue: 0,
          duration: 200,
          easing: bespokeEasing,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
        placeholderTranslateAnim.setValue(14);
        Animated.parallel([
          Animated.timing(placeholderTranslateAnim, {
            toValue: 0,
            duration: 280,
            easing: bespokeEasing,
            useNativeDriver: true,
          }),
          Animated.timing(placeholderOpacityAnim, {
            toValue: 1,
            duration: 260,
            easing: bespokeEasing,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 3200);

    return () => clearInterval(interval);
  }, [placeholder, placeholderOpacityAnim, placeholderTranslateAnim]);

  const handleBarPress = () => {
    if (onOpenOverlay) {
      onOpenOverlay();
    } else if (onPress) {
      onPress();
    }
  };

  const handleBackOrClear = (e?: any) => {
    if (Platform.OS === 'web') {
      e?.stopPropagation?.();
    }
    if (onBack) {
      onBack();
    } else if (onClear) {
      onClear();
    } else if (onQueryChange) {
      onQueryChange('');
    }
  };

  const handleClear = (e?: any) => {
    if (Platform.OS === 'web') {
      e?.stopPropagation?.();
    }
    if (onClear) {
      onClear();
    } else if (onQueryChange) {
      onQueryChange('');
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(searchFocusAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(searchFocusAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const isOverlayMode = Boolean(onOpenOverlay);
  const shouldShowBack = Boolean(showBackButton || query.length > 0);

  return (
    <Animated.View
      style={[
        {
          width: '100%',
          height: 46,
          borderRadius: 23,
          borderWidth: 1.5,
          borderColor: searchFocusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['#D9D9D5', '#FF5A1F'],
          }),
          backgroundColor: searchFocusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['#F7F7F5', '#ffffff'],
          }),
          shadowColor: '#FF5A1F',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: searchFocusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.08],
          }),
          shadowRadius: 6,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          position: 'relative',
          overflow: 'hidden',
        },
        containerStyle,
      ]}
    >
      {/* Left Slot: Back Button or Search Glass & Logo */}
      {shouldShowBack ? (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={handleBackOrClear}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={({ pressed }) => ({
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: pressed ? '#E8E5DF' : '#F4F1EA',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 6,
              borderWidth: 1,
              borderColor: '#E8E5DF',
              ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
            })}
            accessibilityRole="button"
            accessibilityLabel="Back / Exit Search"
          >
            <ArrowLeft size={17} color="#FF5A1F" />
          </Pressable>
          {showLogoInside && (
            <Image
              source={require('@/assets/images/logo-removebg-preview.png')}
              style={{ width: 22, height: 22, marginRight: 6 }}
              contentFit="contain"
              transition={150}
            />
          )}
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8, gap: 6 }}>
          {showLogoInside && (
            <Image
              source={require('@/assets/images/logo-removebg-preview.png')}
              style={{ width: 22, height: 22 }}
              contentFit="contain"
              transition={150}
            />
          )}
          <Pressable
            onPress={handleBarPress}
            hitSlop={8}
            style={{ justifyContent: 'center', alignItems: 'center' }}
          >
            <Search size={17} color={isFocused ? '#FF5A1F' : '#6B6667'} />
          </Pressable>
        </View>
      )}

      {/* Center Slot: Touchable Text / Placeholder in Overlay Mode, or Real TextInput */}
      {isOverlayMode ? (
        <Pressable
          onPress={handleBarPress}
          style={{
            flex: 1,
            height: '100%',
            justifyContent: 'center',
            ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
          }}
          accessibilityRole="search"
          accessibilityLabel="Search fashion items"
        >
          {query.length > 0 ? (
            <Text
              numberOfLines={1}
              style={{
                fontSize: 14,
                color: '#111111',
                fontFamily: Fonts.sansSemiBold,
              }}
            >
              {query}
            </Text>
          ) : placeholder ? (
            <Text
              numberOfLines={1}
              style={{
                fontSize: 13.5,
                color: '#6B6667',
                fontFamily: Fonts.sansMedium,
              }}
            >
              {placeholder}
            </Text>
          ) : (
            <Animated.View
              style={{
                opacity: placeholderOpacityAnim,
                transform: [{ translateY: placeholderTranslateAnim }],
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 13.5,
                  color: '#6B6667',
                  fontFamily: Fonts.sans,
                }}
              >
                Search{' '}
                <Text
                  style={{
                    fontFamily: Fonts.sansSemiBold,
                    color: '#111111',
                  }}
                >
                  {`"${SEARCH_PLACEHOLDERS[placeholderIndex]}"`}
                </Text>
              </Text>
            </Animated.View>
          )}
        </Pressable>
      ) : (
        <View style={{ flex: 1, height: '100%', justifyContent: 'center' }}>
          {query.length === 0 && (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                justifyContent: 'center',
              }}
            >
              {placeholder ? (
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 13.5,
                    color: '#6B6667',
                    fontFamily: Fonts.sansMedium,
                  }}
                >
                  {placeholder}
                </Text>
              ) : (
                <Animated.View
                  style={{
                    opacity: placeholderOpacityAnim,
                    transform: [{ translateY: placeholderTranslateAnim }],
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 13.5,
                      color: '#6B6667',
                      fontFamily: Fonts.sans,
                    }}
                  >
                    Search{' '}
                    <Text
                      style={{
                        fontFamily: Fonts.sansSemiBold,
                        color: '#111111',
                      }}
                    >
                      {`"${SEARCH_PLACEHOLDERS[placeholderIndex]}"`}
                    </Text>
                  </Text>
                </Animated.View>
              )}
            </View>
          )}
          <TextInput
            editable={editable !== false}
            value={query}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChangeText={onQueryChange}
            selectionColor="#FF5A1F"
            placeholder=""
            style={[
              {
                width: '100%',
                height: '100%',
                fontSize: 14,
                color: '#111111',
                fontFamily: Fonts.sansMedium,
                paddingVertical: 0,
              },
              Platform.OS === 'web'
                ? ({
                    outline: 'none',
                    outlineWidth: 0,
                    outlineStyle: 'none',
                    boxShadow: 'none',
                  } as any)
                : {},
            ]}
          />
        </View>
      )}

      {/* Right Slot: Clear X */}
      {query.length > 0 && (
        <Pressable
          onPress={handleClear}
          hitSlop={12}
          style={({ pressed }) => ({
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: pressed ? '#D9D9D5' : '#E8E5DF',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 4,
            ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
          })}
          accessibilityRole="button"
          accessibilityLabel="Clear query"
        >
          <X size={14} color="#111111" />
        </Pressable>
      )}
    </Animated.View>
  );
});

// Backward-compatible SearchBar export
export const SearchBar = UniversalSearchBar;
