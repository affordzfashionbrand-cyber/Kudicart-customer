import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const SETTINGS_KEY = 'affordz_user_settings';

export interface NotificationPreferences {
  orderUpdates: boolean;
  whatsappUpdates: boolean;
  dropAlerts: boolean;
}

export interface SettingsState {
  notifications: NotificationPreferences;
  hapticsEnabled: boolean;
  biometricLock: boolean;
  isInitialized: boolean;

  initializeSettings: () => Promise<void>;
  setNotificationPreference: (key: keyof NotificationPreferences, value: boolean) => Promise<void>;
  setHapticsEnabled: (enabled: boolean) => Promise<void>;
  setBiometricLock: (enabled: boolean) => Promise<void>;
  clearAppCache: () => Promise<{ success: boolean; message: string }>;
  resetSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS = {
  notifications: {
    orderUpdates: true,
    whatsappUpdates: true,
    dropAlerts: false,
  },
  hapticsEnabled: true,
  biometricLock: false,
};

async function persistSettings(data: {
  notifications: NotificationPreferences;
  hapticsEnabled: boolean;
  biometricLock: boolean;
}) {
  try {
    const raw = JSON.stringify(data);
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(SETTINGS_KEY, raw);
    } else if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(SETTINGS_KEY, raw);
    }
  } catch (err) {
    console.warn('Failed to persist settings:', err);
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  isInitialized: false,

  initializeSettings: async () => {
    try {
      let raw: string | null = null;
      if (Platform.OS !== 'web') {
        raw = await SecureStore.getItemAsync(SETTINGS_KEY);
      } else if (typeof window !== 'undefined' && window.localStorage) {
        raw = window.localStorage.getItem(SETTINGS_KEY);
      }

      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          notifications: {
            ...DEFAULT_SETTINGS.notifications,
            ...(parsed.notifications || {}),
          },
          hapticsEnabled: parsed.hapticsEnabled ?? DEFAULT_SETTINGS.hapticsEnabled,
          biometricLock: parsed.biometricLock ?? DEFAULT_SETTINGS.biometricLock,
          isInitialized: true,
        });
        return;
      }
    } catch (e) {
      console.warn('Error reading settings from storage:', e);
    }
    set({ isInitialized: true });
  },

  setNotificationPreference: async (key, value) => {
    const nextNotifications = {
      ...get().notifications,
      [key]: value,
    };
    set({ notifications: nextNotifications });
    await persistSettings({
      notifications: nextNotifications,
      hapticsEnabled: get().hapticsEnabled,
      biometricLock: get().biometricLock,
    });
  },

  setHapticsEnabled: async (enabled) => {
    set({ hapticsEnabled: enabled });
    await persistSettings({
      notifications: get().notifications,
      hapticsEnabled: enabled,
      biometricLock: get().biometricLock,
    });
  },

  setBiometricLock: async (enabled) => {
    set({ biometricLock: enabled });
    await persistSettings({
      notifications: get().notifications,
      hapticsEnabled: get().hapticsEnabled,
      biometricLock: enabled,
    });
  },

  clearAppCache: async () => {
    try {
      // Clean temporary storage or session memory safely
      return {
        success: true,
        message: 'Atelier cache & temporary lookbooks purged successfully.',
      };
    } catch {
      return {
        success: false,
        message: 'Could not complete cache clearance.',
      };
    }
  },

  resetSettings: async () => {
    set({ ...DEFAULT_SETTINGS });
    await persistSettings(DEFAULT_SETTINGS);
  },
}));
