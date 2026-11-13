import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
  authApi,
  AuthUser,
  setAuthToken,
  getAuthToken,
  setOnUnauthorizedCallback,
  setTokenRefresher,
} from '@/services/api';
import {
  getFirebaseIdToken,
  signOutFirebase,
  subscribeFirebaseTokenRefresh,
} from '@/services/firebase';
import { customerNotificationService } from '@/services/notificationService';
import { trackingSocketService } from '@/services/trackingSocket';
import { useSupportStore } from './useSupportStore';

const TOKEN_KEY = 'affordz_token';
const USER_KEY = 'affordz_user';

let firebaseRefreshUnsubscribe: (() => void) | null = null;
let storeResetHandlers: (() => void)[] = [];
let storeLoginHandlers: (() => void)[] = [];

export function registerAuthLogoutReset(resetFn: () => void): () => void {
  storeResetHandlers.push(resetFn);
  return () => {
    storeResetHandlers = storeResetHandlers.filter((fn) => fn !== resetFn);
  };
}

export function registerAuthLoginCallback(callback: () => void): () => void {
  storeLoginHandlers.push(callback);
  return () => {
    storeLoginHandlers = storeLoginHandlers.filter((fn) => fn !== callback);
  };
}

function notifyLoginHandlers() {
  storeLoginHandlers.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.warn('[AuthStore] Login callback error:', e);
    }
  });
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

function attachFirebaseRefreshListener() {
  if (firebaseRefreshUnsubscribe) {
    firebaseRefreshUnsubscribe();
    firebaseRefreshUnsubscribe = null;
  }

  firebaseRefreshUnsubscribe = subscribeFirebaseTokenRefresh(async (freshIdToken) => {
    try {
      const res = await authApi.loginFirebase(freshIdToken);
      if (res?.success && res?.token) {
        await saveSession(res.token, res.user);
        setAuthToken(res.token);
        useAuthStore.setState({
          token: res.token,
          user: res.user,
          isAuthenticated: true,
        });
      }
    } catch {
      // ignore transient token exchange errors; API 401 handler triggers refresh/logout
    }
  });
}

setTokenRefresher(async () => {
  try {
    const freshIdToken = await getFirebaseIdToken(true);
    if (!freshIdToken) return null;
    const res = await authApi.loginFirebase(freshIdToken);
    if (res?.success && res?.token) {
      await saveSession(res.token, res.user);
      setAuthToken(res.token);
      useAuthStore.setState({
        token: res.token,
        user: res.user,
        isAuthenticated: true,
      });
      return res.token;
    }
    return null;
  } catch {
    return null;
  }
});

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
  updateProfile: (data: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    avatar?: string | null;
  }) => Promise<AuthUser>;
  deleteAccount: () => Promise<void>;
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
            const cachedUser: AuthUser = JSON.parse(storedUserStr);
            setAuthToken(storedToken);

            // Verify stored session against live backend /api/v1/users/me
            try {
              const verifiedUser = await authApi.verifyProfileSession();
              if (verifiedUser) {
                const activeToken = getAuthToken() || storedToken;
                await saveSession(activeToken, verifiedUser);
                set({
                  token: activeToken,
                  user: verifiedUser,
                  isAuthenticated: true,
                  isInitialized: true,
                });
                attachFirebaseRefreshListener();
                customerNotificationService.registerDeviceToken().catch(() => {});
                notifyLoginHandlers();
                return;
              }
            } catch (verifyErr: any) {
              const status = verifyErr?.status;
              if (status === 401 || status === 404) {
                await clearSession();
                setAuthToken(null);
                set({
                  isInitialized: true,
                  isAuthenticated: false,
                  token: null,
                  user: null,
                });
                return;
              }
              // Transient network outage during launch: retain cached session until next API check
              set({
                token: storedToken,
                user: cachedUser,
                isAuthenticated: true,
                isInitialized: true,
              });
              attachFirebaseRefreshListener();
              return;
            }
          } catch {
            await clearSession();
            setAuthToken(null);
          }
        } else {
          await clearSession();
          setAuthToken(null);
        }
      } else if (storedUserStr || storedToken) {
        await clearSession();
        setAuthToken(null);
      }
    } catch (e) {
      console.warn('Error reading stored session:', e);
    }
    set({ isInitialized: true, isAuthenticated: false, token: null, user: null });
  },

  sendOtp: async (phone: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.sendOtp(phone);
      set({ isLoading: false });
      const devOtpCode = __DEV__ ? res.devOtp || res.otp : undefined;
      return {
        success: res.success,
        countdownSeconds: res.countdownSeconds,
        ...(devOtpCode ? { devOtp: devOtpCode, otp: devOtpCode } : {}),
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
        notifyLoginHandlers();
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
        attachFirebaseRefreshListener();
        customerNotificationService.registerDeviceToken().catch(() => {});
        notifyLoginHandlers();
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

  updateProfile: async (data) => {
    const token = get().token;
    if (!token) {
      const authErr = new Error('Please sign in to update your profile.');
      set({ isLoading: false, error: authErr.message });
      throw authErr;
    }

    set({ isLoading: true, error: null });
    try {
      const payload = {
        name: data.name !== undefined ? data.name.trim() : undefined,
        email:
          data.email !== undefined
            ? data.email === null
              ? null
              : data.email.trim() || null
            : undefined,
        phone:
          data.phone !== undefined
            ? data.phone === null
              ? null
              : data.phone.trim() || null
            : undefined,
        avatar: data.avatar !== undefined ? data.avatar : undefined,
      };

      const updatedUser = await authApi.updateProfile(payload);
      await saveSession(token, updatedUser);
      set({ user: updatedUser, isLoading: false, error: null });
      return updatedUser;
    } catch (err: any) {
      const msg = err?.message || 'Unable to update profile details.';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  deleteAccount: async () => {
    set({ isLoading: true, error: null });
    try {
      await authApi.deleteAccount();
      await get().logout();
    } catch (err: any) {
      const msg = err?.message || 'Unable to delete account right now.';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  logout: async () => {
    if (firebaseRefreshUnsubscribe) {
      firebaseRefreshUnsubscribe();
      firebaseRefreshUnsubscribe = null;
    }

    const hasActiveSession = !!get().token || !!getAuthToken();
    if (hasActiveSession) {
      await customerNotificationService.unregisterDeviceToken().catch(() => {});
    } else {
      customerNotificationService.clearLocalToken();
    }

    await signOutFirebase();
    trackingSocketService.disconnect();

    await clearSession();
    setAuthToken(null);

    useSupportStore.getState().resetSupport();
    for (const resetFn of storeResetHandlers) {
      try {
        resetFn();
      } catch {
        // ignore store reset errors during logout cleanup
      }
    }

    set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null });
  },
}));
