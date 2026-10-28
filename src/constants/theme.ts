/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform, TextStyle } from 'react-native';

export const BrandColors = {
  softWhite: '#F7F7F5',
  concrete: '#D9D9D5',
  graphite: '#353335',
  inkBlack: '#111111',
  signalOrange: '#FF5A1F',
  oyster: '#F4F1EA',
  grey: '#6B6667',
} as const;

export const Colors = {
  light: {
    text: '#111111',
    background: '#F7F7F5',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EAEAE7',
    textSecondary: '#6B6667',
    border: '#D9D9D5',
    primary: '#111111',
    accent: '#FF5A1F',
  },
  dark: {
    text: '#F7F7F5',
    background: '#111111',
    backgroundElement: '#1F1F1F',
    backgroundSelected: '#353335',
    textSecondary: '#A3A39E',
    border: '#353335',
    primary: '#FFFFFF',
    accent: '#FF5A1F',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = {
  // Plus Jakarta Sans (Modern Sans-serif)
  sans: Platform.select({
    web: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    ios: 'PlusJakartaSans_400Regular',
    android: 'PlusJakartaSans_400Regular',
    default: 'PlusJakartaSans_400Regular',
  }) as string,
  sansMedium: Platform.select({
    web: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    ios: 'PlusJakartaSans_500Medium',
    android: 'PlusJakartaSans_500Medium',
    default: 'PlusJakartaSans_500Medium',
  }) as string,
  sansSemiBold: Platform.select({
    web: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    ios: 'PlusJakartaSans_600SemiBold',
    android: 'PlusJakartaSans_600SemiBold',
    default: 'PlusJakartaSans_600SemiBold',
  }) as string,
  sansBold: Platform.select({
    web: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    ios: 'PlusJakartaSans_700Bold',
    android: 'PlusJakartaSans_700Bold',
    default: 'PlusJakartaSans_700Bold',
  }) as string,
  sansExtraBold: Platform.select({
    web: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    ios: 'PlusJakartaSans_700Bold',
    android: 'PlusJakartaSans_700Bold',
    default: 'PlusJakartaSans_700Bold',
  }) as string,

  // Playfair Display (Serif / Editorial)
  serif: Platform.select({
    web: "'Playfair Display', Georgia, 'Times New Roman', serif",
    ios: 'PlayfairDisplay_600SemiBold',
    android: 'PlayfairDisplay_600SemiBold',
    default: 'PlayfairDisplay_600SemiBold',
  }) as string,
  serifRegular: Platform.select({
    web: "'Playfair Display', Georgia, 'Times New Roman', serif",
    ios: 'PlayfairDisplay_400Regular',
    android: 'PlayfairDisplay_400Regular',
    default: 'PlayfairDisplay_400Regular',
  }) as string,
  serifMedium: Platform.select({
    web: "'Playfair Display', Georgia, 'Times New Roman', serif",
    ios: 'PlayfairDisplay_500Medium',
    android: 'PlayfairDisplay_500Medium',
    default: 'PlayfairDisplay_500Medium',
  }) as string,
  serifSemiBold: Platform.select({
    web: "'Playfair Display', Georgia, 'Times New Roman', serif",
    ios: 'PlayfairDisplay_600SemiBold',
    android: 'PlayfairDisplay_600SemiBold',
    default: 'PlayfairDisplay_600SemiBold',
  }) as string,
  serifBold: Platform.select({
    web: "'Playfair Display', Georgia, 'Times New Roman', serif",
    ios: 'PlayfairDisplay_700Bold',
    android: 'PlayfairDisplay_700Bold',
    default: 'PlayfairDisplay_700Bold',
  }) as string,
  serifItalic: Platform.select({
    web: "'Playfair Display', Georgia, 'Times New Roman', serif",
    ios: 'PlayfairDisplay_400Regular_Italic',
    android: 'PlayfairDisplay_400Regular_Italic',
    default: 'PlayfairDisplay_400Regular_Italic',
  }) as string,

  rounded: 'normal',
  mono: Platform.select({
    web: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    ios: 'ui-monospace',
    default: 'monospace',
  }) as string,
};

/**
 * Universal cross-platform font style presets.
 * Guarantees proper rendering on Web (with CSS fontWeight)
 * AND native Android/iOS (without breaking native font lookup by double-specifying weights).
 */
export const FontStyles = {
  sansRegular: {
    fontFamily: Fonts.sans,
    fontWeight: Platform.select({ web: '400', default: undefined }),
  } as TextStyle,
  sansMedium: {
    fontFamily: Fonts.sansMedium,
    fontWeight: Platform.select({ web: '500', default: undefined }),
  } as TextStyle,
  sansSemiBold: {
    fontFamily: Fonts.sansSemiBold,
    fontWeight: Platform.select({ web: '600', default: undefined }),
  } as TextStyle,
  sansBold: {
    fontFamily: Fonts.sansBold,
    fontWeight: Platform.select({ web: '700', default: undefined }),
  } as TextStyle,
  sansExtraBold: {
    fontFamily: Fonts.sansExtraBold,
    fontWeight: Platform.select({ web: '800', default: undefined }),
  } as TextStyle,

  serifRegular: {
    fontFamily: Fonts.serifRegular,
    fontWeight: Platform.select({ web: '400', default: undefined }),
  } as TextStyle,
  serifMedium: {
    fontFamily: Fonts.serifMedium,
    fontWeight: Platform.select({ web: '500', default: undefined }),
  } as TextStyle,
  serifSemiBold: {
    fontFamily: Fonts.serifSemiBold,
    fontWeight: Platform.select({ web: '600', default: undefined }),
  } as TextStyle,
  serifBold: {
    fontFamily: Fonts.serifBold,
    fontWeight: Platform.select({ web: '700', default: undefined }),
  } as TextStyle,
  serifItalic: {
    fontFamily: Fonts.serifItalic,
    fontStyle: 'italic',
    fontWeight: Platform.select({ web: '400', default: undefined }),
  } as TextStyle,

  mono: {
    fontFamily: Fonts.mono,
  } as TextStyle,
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
