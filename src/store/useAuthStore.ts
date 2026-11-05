import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { authApi, AuthUser, setAuthToken, getAuthToken, setOnUnauthorizedCallback } from '@/services/api';
import { customerNotificationService } from '@/services/notificationService';

const TOKEN_KEY = 'affordz_token';
const USER_KEY = 'affordz_user';
const GUEST_PROFILE_KEY = 'affordz_guest_profile';

async function saveGuestProfile(user: AuthUser) {
  try {
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(GUEST_PROFILE_KEY, JSON.stringify(user));
    } else if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(user));
    }
  } catch (e) {
    console.warn('Failed to save guest profile', e);
  }
}

async function loadGuestProfile(): Promise<AuthUser | null> {
  try {
    let str: string | null = null;
    if (Platform.OS !== 'web') {
      str = await SecureStore.getItemAsync(GUEST_PROFILE_KEY);
    } else if (typeof window !== 'undefined' && window.localStorage) {
      str = window.localStorage.getItem(GUEST_PROFILE_KEY);
    }
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
}

async function saveSession(token: string, user: AuthUser) {
  try {
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } else if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(TOKEN_KEY, token);
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } catch (e) {
    console.warn('Failed to save session to secure store', e);
  }
}

async function clearSession() {
  try {
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } else if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    }
  } catch (e) {
    console.warn('Failed to clear session from secure store', e);
  }
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  initializeAuth: () => Promise<void>;
  sendOtp: (phone: string) => Promise<{ success: boolean; countdownSeconds: number; devOtp?: string; otp?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  loginWithFirebase: (idToken: string) => Promise<boolean>;
  loadProfile: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  logout: () => Promise<void>;
}

setOnUnauthorizedCallback(() => {
  useAuthStore.getState().logout().catch(() => {});
});

export const useAuthStore = create<AuthState>((set, get) => ({
  // Guest Browsing Mode: Default to unauthenticated
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  error: null,

  initializeAuth: async () => {
    try {
      let storedToken: string | null = null;
      let storedUserStr: string | null = null;

      if (Platform.OS !== 'web') {
        storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        storedUserStr = await SecureStore.getItemAsync(USER_KEY);
      } else if (typeof window !== 'undefined' && window.localStorage) {
        storedToken = window.localStorage.getItem(TOKEN_KEY);
        storedUserStr = window.localStorage.getItem(USER_KEY);
      }

      if (storedToken && storedUserStr) {
        if (
          typeof storedToken === 'string' &&
          storedToken.trim().length >= 15 &&
          !storedToken.startsWith('mock-') &&
          storedToken !== 'null' &&
          storedToken !== 'undefined'
        ) {
          try {
            const user: AuthUser = JSON.parse(storedUserStr);
            setAuthToken(storedToken);
            set({
              token: storedToken,
              user,
              isAuthenticated: true,
              isInitialized: true,
            });
            customerNotificationService.registerDeviceToken().catch(() => {});
            return;
          } catch {
            await clearSession();
            setAuthToken(null);
          }
        } else {
          await clearSession();
          setAuthToken(null);
        }
      } else if (storedUserStr || storedToken) {
        // Clear invalid partial session
        await clearSession();
        setAuthToken(null);
      }
    } catch (e) {
      console.warn('Error reading stored session:', e);
    }
    const guestUser = await loadGuestProfile();
    set({ isInitialized: true, isAuthenticated: false, token: null, user: guestUser });
  },

  sendOtp: async (phone: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.sendOtp(phone);
      set({ isLoading: false });
      return {
        success: res.success,
        countdownSeconds: res.countdownSeconds,
        devOtp: res.devOtp || res.otp,
        otp: res.devOtp || res.otp,
      };
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Failed to send OTP' });
      return { success: false, countdownSeconds: 0 };
    }
  },

  verifyOtp: async (phone: string, otp: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.verifyOtp(phone, otp);
      if (res && res.success) {
        await saveSession(res.token, res.user);
        setAuthToken(res.token);
        set({
          user: res.user,
          token: res.token,
          isAuthenticated: true,
          isLoading: false,
        });
        customerNotificationService.registerDeviceToken().catch(() => {});
        return true;
      }
      set({ isLoading: false, error: 'Verification failed' });
      return false;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Invalid verification code' });
      return false;
    }
  },

  loginWithFirebase: async (idToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.loginFirebase(idToken);
      if (res && res.success) {
        await saveSession(res.token, res.user);
        setAuthToken(res.token);
        set({
          user: res.user,
          token: res.token,
          isAuthenticated: true,
          isLoading: false,
        });
        customerNotificationService.registerDeviceToken().catch(() => {});
        return true;
      }
      set({ isLoading: false, error: 'Firebase authentication failed' });
      return false;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Firebase authentication failed' });
      return false;
    }
  },

  loadProfile: async () => {
    try {
      const user = await authApi.getProfile();
      if (user) {
        set({ user });
        if (get().token) {
          await saveSession(get().token!, user);
        }
      }
    } catch (err) {
      console.warn('Could not load profile from backend:', err);
    }
  },

  updateProfile: async (data: Partial<AuthUser>) => {
    set({ isLoading: true, error: null });
    try {
      const serverUser = await authApi.updateProfile({
        name: data.name !== undefined ? data.name.trim() : undefined,
        email: data.email !== undefined ? (data.email.trim() || undefined) : undefined,
        phone: data.phone !== undefined ? data.phone.trim() : undefined,
        avatar: data.avatar || undefined,
      });

      const currentUser = get().user;
      const updatedUser: AuthUser = serverUser || {
        id: currentUser?.id || 'guest',
        name: data.name !== undefined ? data.name.trim() : (currentUser?.name || 'Affordz Customer'),
        email: data.email !== undefined ? data.email.trim() : (currentUser?.email || ''),
        phone: data.phone !== undefined ? data.phone.trim() : (currentUser?.phone || ''),
        avatar: data.avatar !== undefined ? data.avatar : (currentUser?.avatar || null),
        role: currentUser?.role || 'CUSTOMER',
      };

      const token = get().token;
      if (token) {
        await saveSession(token, updatedUser);
      } else {
        await saveGuestProfile(updatedUser);
      }

      set({ user: updatedUser, isLoading: false, error: null });
    } catch (err: any) {
      const currentUser = get().user;
      const fallbackUser: AuthUser = {
        id: currentUser?.id || 'guest',
        name: data.name !== undefined ? data.name.trim() : (currentUser?.name || 'Affordz Customer'),
        email: data.email !== undefined ? data.email.trim() : (currentUser?.email || ''),
        phone: data.phone !== undefined ? data.phone.trim() : (currentUser?.phone || ''),
        avatar: data.avatar !== undefined ? data.avatar : (currentUser?.avatar || null),
        role: currentUser?.role || 'CUSTOMER',
      };
      if (get().token) {
        await saveSession(get().token!, fallbackUser);
      } else {
        await saveGuestProfile(fallbackUser);
      }
      set({ user: fallbackUser, isLoading: false, error: null });
    }
  },

  logout: async () => {
    const hasActiveSession = !!get().token || !!getAuthToken();
    if (hasActiveSession) {
      await customerNotificationService.unregisterDeviceToken().catch(() => {});
    } else {
      customerNotificationService.clearLocalToken();
    }
    await clearSession();
    setAuthToken(null);
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
