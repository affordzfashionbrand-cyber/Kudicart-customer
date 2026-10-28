import '../global.css';
import { DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View, StyleSheet, Platform, LogBox } from 'react-native';

LogBox.ignoreLogs([
  '"shadow*" style props are deprecated',
  '"textShadow*" style props are deprecated',
  'props.pointerEvents is deprecated',
  'Image: style.resizeMode is deprecated',
  'Animated: `useNativeDriver` is not supported',
  'Fetch request has been canceled',
]);

if (Platform.OS === 'web' && typeof console !== 'undefined') {
  const _origWarn = console.warn;
  console.warn = (...args: any[]) => {
    const first = args[0];
    if (
      typeof first === 'string' &&
      (first.includes('deprecated') ||
        first.includes('useNativeDriver') ||
        first.includes('pointerEvents') ||
        first.includes('canceled') ||
        first.includes('aborted'))
    ) {
      return;
    }
    _origWarn(...args);
  };
}
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';

import { useFonts } from 'expo-font';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular_Italic,
} from '@expo-google-fonts/playfair-display';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_400Regular_Italic,
} from '@expo-google-fonts/plus-jakarta-sans';

import { SplashScreenView } from '@/components/splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => {});

const BrandTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FDFBF7',
    card: '#FDFBF7',
    text: '#111111',
    border: '#D9D9D5',
  },
};

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_400Regular_Italic,
    'Playfair Display': PlayfairDisplay_600SemiBold,
    'Playfair-Display': PlayfairDisplay_600SemiBold,
    'PlayfairDisplay': PlayfairDisplay_600SemiBold,
    'PlayfairDisplay-Regular': PlayfairDisplay_400Regular,
    'PlayfairDisplay-Medium': PlayfairDisplay_500Medium,
    'PlayfairDisplay-SemiBold': PlayfairDisplay_600SemiBold,
    'PlayfairDisplay-Bold': PlayfairDisplay_700Bold,
    'PlayfairDisplay-Italic': PlayfairDisplay_400Regular_Italic,
    'Plus Jakarta Sans': PlusJakartaSans_400Regular,
    'Plus-Jakarta-Sans': PlusJakartaSans_400Regular,
    'PlusJakartaSans': PlusJakartaSans_400Regular,
    'PlusJakartaSans-Regular': PlusJakartaSans_400Regular,
    'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
    'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
    'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
    serif: PlayfairDisplay_600SemiBold,
    Georgia: PlayfairDisplay_600SemiBold,
    'sans-serif': PlusJakartaSans_400Regular,
    sans: PlusJakartaSans_400Regular,
    editorial: PlayfairDisplay_600SemiBold,
  });

  useEffect(() => {
    useAuthStore.getState().initializeAuth();
    useSettingsStore.getState().initializeSettings();
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const linkId = 'affordz-google-fonts';
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href =
          'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap';
        document.head.appendChild(link);
      }

      const styleId = 'affordz-font-enforcement';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          html, body, #root {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          }

          [dir="auto"],
          div[dir="auto"],
          span[dir="auto"],
          [class*="css-text-"],
          input,
          textarea,
          button,
          select {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          .font-serif,
          .font-serif *,
          .font-editorial,
          .font-editorial *,
          .font-display,
          .font-display *,
          .font-display-hero,
          .font-display-hero *,
          .font-headline-lg,
          .font-headline-lg *,
          .font-headline-md,
          .font-headline-md *,
          .font-headline-sm,
          .font-headline-sm *,
          .editorial-text,
          .editorial-text *,
          [data-font="serif"],
          [data-font="editorial"],
          [class*="font-serif"],
          [class*="font-editorial"],
          [class*="font-display"],
          [class*="headline-"],
          [class*="display-"],
          [style*="serif"],
          [style*="Georgia"],
          [style*="Playfair"],
          [style*="PlayfairDisplay"],
          [dir="auto"][style*="serif"],
          [dir="auto"][style*="Georgia"],
          [dir="auto"][style*="Playfair"],
          [dir="auto"][style*="PlayfairDisplay"],
          [dir="auto"] [style*="serif"],
          [dir="auto"] [style*="Georgia"],
          [dir="auto"] [style*="Playfair"],
          [dir="auto"] [style*="PlayfairDisplay"],
          [class*="r-fontFamily-serif"],
          [class*="r-fontFamily-Georgia"],
          [class*="r-fontFamily-Playfair"] {
            font-family: 'Playfair Display', Georgia, 'Times New Roman', serif !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={BrandTheme}>
      <View style={styles.outerContainer}>
        <View style={styles.phoneContainer}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              contentStyle: { backgroundColor: '#FDFBF7' },
            }}
          />
          {showSplash && (
            <SplashScreenView
              duration={1800}
              onFinish={() => setShowSplash(false)}
            />
          )}
        </View>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: Platform.OS === 'web' ? '#EDE8E1' : '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneContainer: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : '100%',
    backgroundColor: '#FAF8F5',
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.08)',
          height: '100%',
        }
      : {}),
  },
});
