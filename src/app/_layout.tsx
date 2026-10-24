import '../global.css';
import { DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View, StyleSheet, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

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
import { DemoWatermark } from '@/components/common/demo-watermark';

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
    'PlayfairDisplay-Regular': PlayfairDisplay_400Regular,
    'PlayfairDisplay-Medium': PlayfairDisplay_500Medium,
    'PlayfairDisplay-SemiBold': PlayfairDisplay_600SemiBold,
    'PlayfairDisplay-Bold': PlayfairDisplay_700Bold,
    'Plus Jakarta Sans': PlusJakartaSans_400Regular,
    'Plus-Jakarta-Sans': PlusJakartaSans_400Regular,
    'PlusJakartaSans-Regular': PlusJakartaSans_400Regular,
    'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
    'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
    'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
    serif: PlayfairDisplay_600SemiBold,
    Georgia: PlayfairDisplay_600SemiBold,
  });

  useEffect(() => {
    useAuthStore.getState().initializeAuth();
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
          [dir="auto"],
          [dir="auto"] *,
          div[dir="auto"],
          span[dir="auto"],
          [class*="css-text-"],
          body,
          input,
          textarea,
          button,
          select {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
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
          [class*="font-serif"],
          [class*="font-editorial"],
          [class*="font-display"],
          [class*="headline-"],
          [class*="display-"],
          [style*="serif"],
          [style*="Georgia"],
          [style*="Playfair"],
          [dir="auto"][style*="serif"],
          [dir="auto"][style*="Georgia"],
          [dir="auto"][style*="Playfair"],
          [dir="auto"] [style*="serif"],
          [dir="auto"] [style*="Georgia"],
          [dir="auto"] [style*="Playfair"],
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
          <DemoWatermark />
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
    backgroundColor: '#F3EFEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FDFBF7',
    position: 'relative',
    overflow: 'hidden',
  },
});
