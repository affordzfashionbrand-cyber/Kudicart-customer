import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { request, getAuthToken } from './api';
import {
  acquireNativeFcmToken,
  getWebFirebaseMessaging,
  registerNativeBackgroundMessageHandler,
  setupNativeFcmListeners,
} from './firebase';

let activeDeviceToken: string | null = null;
let notificationHandlerConfigured = false;

export const customerNotificationService = {
  /**
   * Acquire real device push token (FCM on Android via Expo Notifications, or Web Push when configured).
   * Returns null gracefully when Firebase / permissions / VAPID key are unconfigured (never fakes tokens).
   */
  async acquireToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window === 'undefined' || !('Notification' in window)) {
          return null;
        }
        const perm =
          Notification.permission === 'granted'
            ? 'granted'
            : await Notification.requestPermission();
        if (perm !== 'granted') {
          return null;
        }

        const fbMessaging = await getWebFirebaseMessaging();
        const vapidKey = process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY;
        if (
          !fbMessaging ||
          !vapidKey ||
          typeof navigator === 'undefined' ||
          !('serviceWorker' in navigator)
        ) {
          return null;
        }

        const swReg = await navigator.serviceWorker.getRegistration().catch(() => undefined);
        const token = await fbMessaging.getToken(fbMessaging.messaging, {
          vapidKey,
          ...(swReg ? { serviceWorkerRegistration: swReg } : {}),
        });
        if (!token) {
          return null;
        }
        activeDeviceToken = token;
        return token;
      }

      if (Platform.OS === 'android') {
        await Promise.all([
          Notifications.setNotificationChannelAsync('affordz_critical_alerts', {
            name: 'Urgent Alerts & Order Delivery',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF5A1F',
            sound: 'default',
            enableVibrate: true,
            showBadge: true,
          }),
          Notifications.setNotificationChannelAsync('affordz_orders', {
            name: 'Order Updates & Try & Buy Alerts',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF5A1F',
            sound: 'default',
            enableVibrate: true,
            showBadge: true,
          }),
        ]).catch(() => {});
      }

      const existingPerm = await Notifications.getPermissionsAsync();
      let status = existingPerm.status;
      if (status !== 'granted') {
        const requested = await Notifications.requestPermissionsAsync();
        status = requested.status;
      }
      if (status !== 'granted') {
        return null;
      }

      let fcmToken = await acquireNativeFcmToken();
      if (!fcmToken && Platform.OS === 'android') {
        try {
          const deviceToken = await Notifications.getDevicePushTokenAsync();
          if (deviceToken && deviceToken.data) {
            fcmToken = deviceToken.data;
          }
        } catch {
          // ignore fallback retrieval error
        }
      }

      if (!fcmToken) {
        return null;
      }
      activeDeviceToken = fcmToken;
      return fcmToken;
    } catch {
      return null;
    }
  },

  /**
   * Configure foreground behavior and subscribe to tap / notification listeners.
   */
  setupNotificationListeners(
    onNavigate?: (pathname: string, params?: Record<string, string>) => void,
    onForegroundData?: (data: Record<string, any>) => void,
  ): () => void {
    if (Platform.OS === 'web') {
      return () => {};
    }

    if (!notificationHandlerConfigured) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      notificationHandlerConfigured = true;
    }

    registerNativeBackgroundMessageHandler();

    const dispatchTapNavigation = (data?: Record<string, any> | null) => {
      if (!data || !onNavigate) return;
      if (data.orderId) {
        onNavigate('/tracking', { orderId: String(data.orderId) });
        return;
      }
      if (typeof data.route === 'string' && data.route.startsWith('/')) {
        onNavigate(data.route);
        return;
      }
      if (data.screen === 'orders') {
        onNavigate('/orders');
      }
    };

    const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification?.request?.content?.data as Record<string, any> | undefined;
      if (data && onForegroundData) {
        onForegroundData(data);
      }
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response?.notification?.request?.content?.data as
        | Record<string, any>
        | undefined;
      dispatchTapNavigation(data);
    });

    const unsubNativeFcm = setupNativeFcmListeners({
      onForegroundMessage: (remoteMessage) => {
        if (remoteMessage?.data && onForegroundData) {
          onForegroundData(remoteMessage.data as Record<string, any>);
        }
      },
      onNotificationOpened: (remoteMessage) => {
        dispatchTapNavigation(remoteMessage?.data as Record<string, any> | undefined);
      },
      onTokenRefresh: (refreshedToken) => {
        if (!refreshedToken) return;
        activeDeviceToken = refreshedToken;
        if (getAuthToken()) {
          void customerNotificationService.registerDeviceToken(refreshedToken);
        }
      },
    });

    Notifications.getLastNotificationResponseAsync?.()
      .then((last) => {
        if (last) {
          dispatchTapNavigation(
            last?.notification?.request?.content?.data as Record<string, any> | undefined,
          );
        }
      })
      .catch(() => {});

    return () => {
      receivedSub.remove();
      responseSub.remove();
      unsubNativeFcm();
    };
  },

  clearLocalToken(): void {
    activeDeviceToken = null;
  },

  /**
   * Register push device token with Affordz backend API
   */
  async registerDeviceToken(providedToken?: string): Promise<boolean> {
    if (!getAuthToken()) {
      return false;
    }
    const token = providedToken || activeDeviceToken || (await this.acquireToken());
    if (!token) return false;

    try {
      const platform = Platform.OS === 'web' ? 'web' : 'android';
      const res = await request<any>('/api/v1/notifications/devices/register', {
        method: 'POST',
        body: JSON.stringify({ token, platform }),
      });
      return !!(res && (res.success || res.token));
    } catch {
      return false;
    }
  },

  /**
   * Unregister push device token from Affordz backend API upon logout
   */
  async unregisterDeviceToken(): Promise<boolean> {
    const token = activeDeviceToken;
    activeDeviceToken = null;
    if (!token || !getAuthToken()) {
      return true;
    }

    try {
      await request<any>('/api/v1/notifications/devices/unregister', {
        method: 'POST',
        body: JSON.stringify({
          token,
          platform: Platform.OS === 'web' ? 'web' : 'android',
        }),
      });
      return true;
    } catch {
      return false;
    }
  },

  getActiveToken(): string | null {
    return activeDeviceToken;
  },
};

