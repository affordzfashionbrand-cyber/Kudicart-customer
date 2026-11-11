import '../global.css';
import React, { useEffect, useState } from 'react';
import { DefaultTheme, ThemeProvider, Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import { View, Text, Pressable, StyleSheet, Platform, LogBox } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useOrderStore } from '@/store/useOrderStore';
import { SplashScreenView } from '@/components/splash-screen';
import { initSentry, captureException } from '@/services/sentry';
import { customerNotificationService } from '@/services/notificationService';
import { parsePaymentCallbackUrl } from '@/services/razorpay';

initSentry();

LogBox.ignoreLogs([
  '"shadow*" style props are deprecated',
  '"textShadow*" style props are deprecated',
  'props.pointerEvents is deprecated',
  'Image: style.resizeMode is deprecated',
]);

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message?: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    captureException(error, { componentStack: info?.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorBody}>
            {this.state.message || 'An unexpected error occurred. Please try again.'}
          </Text>
          <Pressable
            onPress={() => this.setState({ hasError: false, message: undefined })}
            style={styles.errorButton}
          >
            <Text style={styles.errorButtonText}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 15_000,
    },
  },
});

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
  const router = useRouter();
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

    const unsubNotifs = customerNotificationService.setupNotificationListeners(
      (pathname, params) => {
        router.push({ pathname, params } as any);
      },
      (data) => {
        if (data?.orderId) {
          void useOrderStore.getState().fetchTracking(String(data.orderId)).catch(() => {});
        }
      },
    );

    const handleDeepLink = (url?: string | null) => {
      if (!url) return;
      if (url.includes('payment-callback')) {
        const parsedPayment = parsePaymentCallbackUrl(url);
        if (parsedPayment?.orderId) {
          void useOrderStore
            .getState()
            .confirmPaymentStatus(parsedPayment.orderId)
            .catch(() => {});
        }
        return;
      }
      const parsed = Linking.parse(url);
      const targetPath = (parsed.path || parsed.hostname || '').replace(/^\/+/, '');
      if (targetPath === 'tracking' && parsed.queryParams?.orderId) {
        router.push({
          pathname: '/tracking',
          params: { orderId: String(parsed.queryParams.orderId) },
        } as any);
      } else if (targetPath === 'orders') {
        router.push('/orders' as any);
      }
    };

    const linkSub = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });
    Linking.getInitialURL()
      .then((initialUrl) => {
        handleDeepLink(initialUrl);
      })
      .catch(() => {});

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
    }

    return () => {
      unsubNotifs();
      linkSub.remove();
    };
  }, [router]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDFBF7',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },
  errorBody: {
    fontSize: 13,
    color: '#6B6667',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorButton: {
    backgroundColor: '#111111',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
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
