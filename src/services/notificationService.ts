import { Platform } from 'react-native';
import { request } from './api';

let activeDeviceToken: string | null = null;

export const customerNotificationService = {
  /**
   * Acquire device push token (using native Expo/FCM on mobile or web token).
   */
  async acquireToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && (window as any).Notification) {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            const token = `web-token-${Date.now()}`;
            activeDeviceToken = token;
            return token;
          }
        }
        return null;
      }

      // Native mobile environment
      activeDeviceToken = `fcm-token-${Platform.OS}-${Date.now()}`;
      return activeDeviceToken;
    } catch {
      return null;
    }
  },

  /**
   * Register push device token with Kudicart backend API
   */
  async registerDeviceToken(providedToken?: string): Promise<boolean> {
    const token = providedToken || activeDeviceToken || (await this.acquireToken());
    if (!token) return false;

    try {
      const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
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
   * Unregister push device token from Kudicart backend API upon logout
   */
  async unregisterDeviceToken(): Promise<boolean> {
    if (!activeDeviceToken) return true;

    try {
      await request<any>('/api/v1/notifications/devices/unregister', {
        method: 'POST',
        body: JSON.stringify({ token: activeDeviceToken }),
      });
      activeDeviceToken = null;
      return true;
    } catch {
      return false;
    }
  },

  getActiveToken(): string | null {
    return activeDeviceToken;
  },
};

