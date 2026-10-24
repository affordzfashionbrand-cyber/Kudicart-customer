import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { authApi, AuthUser, setAuthToken } from '@/services/api';

const TOKEN_KEY = 'affordz_token';
const USER_KEY = 'affordz_user';

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
  sendOtp: (phone: string) => Promise<{ success: boolean; countdownSeconds: number }>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  loginWithFirebase: (idToken: string) => Promise<boolean>;
  loadProfile: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
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
        const user: AuthUser = JSON.parse(storedUserStr);
        setAuthToken(storedToken);
        set({
          token: storedToken,
          user,
          isAuthenticated: true,
          isInitialized: true,
        });
        return;
      }
    } catch (e) {
      console.warn('Error reading stored session:', e);
    }
    set({ isInitialized: true });
  },

  sendOtp: async (phone: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.sendOtp(phone);
      set({ isLoading: false });
      return { success: res.success, countdownSeconds: res.countdownSeconds };
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
      set({ user });
    } catch (err) {
      console.warn('Could not load profile from backend:', err);
    }
  },

  updateProfile: async (data: Partial<AuthUser>) => {
    set({ isLoading: true });
    try {
      const updated = await authApi.updateProfile(data);
      set({ user: updated, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Failed to update profile' });
    }
  },

  logout: async () => {
    await clearSession();
    setAuthToken(null);
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
