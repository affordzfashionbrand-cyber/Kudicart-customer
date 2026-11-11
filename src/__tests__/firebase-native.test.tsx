import React from 'react';
import { Platform } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import { getApp, getApps } from '@react-native-firebase/app';
import {
  getAuth,
  getIdToken,
  onIdTokenChanged,
  signInWithPhoneNumber as nativeSignInWithPhoneNumber,
  signOut as nativeSignOut,
} from '@react-native-firebase/auth';
import {
  getInitialNotification,
  getMessaging,
  getToken as nativeGetFcmToken,
  onMessage as nativeOnMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';

import {
  canUseFirebasePhoneAuth,
  canUseNativeFirebasePhoneAuth,
  getFirebaseIdToken,
  isNativeFirebaseAvailable,
  signOutFirebase,
  startFirebasePhoneSignIn,
  subscribeFirebaseTokenRefresh,
} from '@/services/firebase';
import { customerNotificationService } from '@/services/notificationService';
import { AuthModal } from '@/components/auth-modal';
import { authApi, setAuthToken } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';

describe('Native Android Firebase Phone Auth & FCM Integration', () => {
  const originalPlatformOs = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    (Platform as any).OS = 'android';
    setAuthToken(null);
    customerNotificationService.clearLocalToken();
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    (Platform as any).OS = originalPlatformOs;
  });

  it('handles missing google-services.json gracefully in dev and blocks production login', async () => {
    (getApps as jest.Mock).mockReturnValue([]);

    expect(isNativeFirebaseAvailable()).toBe(false);
    expect(canUseNativeFirebasePhoneAuth()).toBe(false);
    expect(canUseFirebasePhoneAuth()).toBe(false);

    await expect(startFirebasePhoneSignIn('9876543210')).rejects.toThrow(/missing google-services\.json/i);
    expect(await customerNotificationService.acquireToken()).toBeNull();

    // Production (!__DEV__) must block login without touching /auth/phone/send-otp
    const sendOtpSpy = jest.spyOn(authApi, 'sendOtp');
    const prevDev = (globalThis as any).__DEV__;
    (globalThis as any).__DEV__ = false;

    try {
      const prodScreen = await render(
        <AuthModal visible={true} onClose={jest.fn()} onSuccess={jest.fn()} />,
      );
      await fireEvent.changeText(prodScreen.getByPlaceholderText('Enter mobile number'), '9876543210');
      await fireEvent.press(prodScreen.getByText('GET OTP'));

      expect(
        await prodScreen.findByText(/Authentication service is not configured for this build/i),
      ).toBeTruthy();
      expect(sendOtpSpy).not.toHaveBeenCalled();
    } finally {
      (globalThis as any).__DEV__ = prevDev;
    }

    // __DEV__ build without google-services.json safely falls back to dev backend OTP
    sendOtpSpy.mockResolvedValueOnce({
      success: true,
      message: 'OTP sent',
      countdownSeconds: 30,
      devOtp: '112233',
    });
    const devScreen = await render(
      <AuthModal visible={true} onClose={jest.fn()} onSuccess={jest.fn()} />,
    );
    await fireEvent.changeText(devScreen.getByPlaceholderText('Enter mobile number'), '9876543210');
    await fireEvent.press(devScreen.getByText('GET OTP'));

    expect(await devScreen.findByText(/VERIFY OTP/i)).toBeTruthy();
    expect(sendOtpSpy).toHaveBeenCalledWith('+91 9876543210');
  });

  it('completes native Android Firebase Phone OTP sign-in and exchanges ID token with backend', async () => {
    const fakeApp = { name: '[DEFAULT]' };
    const fakeUser = {
      uid: 'android-fb-uid-1',
      phoneNumber: '+919876543210',
      getIdToken: jest.fn(async () => 'android-firebase-id-token-xyz'),
    };
    const fakeAuth = { currentUser: fakeUser };
    const confirmMock = jest.fn(async () => ({ user: fakeUser }));

    (getApps as jest.Mock).mockReturnValue([fakeApp]);
    (getApp as jest.Mock).mockReturnValue(fakeApp);
    (getAuth as jest.Mock).mockReturnValue(fakeAuth);
    (nativeSignInWithPhoneNumber as jest.Mock).mockResolvedValueOnce({ confirm: confirmMock });
    (getIdToken as jest.Mock).mockResolvedValue('android-refreshed-id-token');

    const loginFirebaseSpy = jest
      .spyOn(authApi, 'loginFirebase')
      .mockResolvedValueOnce({
        success: true,
        token: 'affordz-backend-jwt-android-1',
        role: 'CUSTOMER',
        user: {
          id: 'usr-android-1',
          phone: '9876543210',
          name: 'Rohan',
          email: null,
          avatar: null,
          role: 'CUSTOMER',
        },
      });

    expect(isNativeFirebaseAvailable()).toBe(true);
    expect(canUseNativeFirebasePhoneAuth()).toBe(true);
    expect(canUseFirebasePhoneAuth()).toBe(true);

    const prevDev = (globalThis as any).__DEV__;
    (globalThis as any).__DEV__ = false;

    try {
      const screen = await render(
        <AuthModal visible={true} onClose={jest.fn()} onSuccess={jest.fn()} />,
      );
      await fireEvent.changeText(screen.getByPlaceholderText('Enter mobile number'), '9876543210');
      await fireEvent.press(screen.getByText('GET OTP'));

      expect(await screen.findByText(/VERIFY OTP/i)).toBeTruthy();
      expect(nativeSignInWithPhoneNumber).toHaveBeenCalledWith(fakeAuth, '+919876543210');

      const otpInputs = screen.getAllByLabelText(/OTP digit/i);
      expect(otpInputs).toHaveLength(6);

      const otpDigits = ['6', '5', '4', '3', '2', '1'];
      for (let i = 0; i < otpDigits.length; i += 1) {
        await fireEvent.changeText(otpInputs[i], otpDigits[i]);
      }
      await fireEvent.press(screen.getByText('VERIFY & PROCEED'));

      expect(await screen.findByText(/WELCOME BACK/i)).toBeTruthy();
      expect(confirmMock).toHaveBeenCalledWith('654321');
      expect(loginFirebaseSpy).toHaveBeenCalledWith('android-firebase-id-token-xyz');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().token).toBe('affordz-backend-jwt-android-1');

      const directIdToken = await getFirebaseIdToken(true);
      expect(directIdToken).toBe('android-refreshed-id-token');
      expect(getIdToken).toHaveBeenCalledWith(fakeUser, true);

      // Verify native token refresh subscription notifies on ID token change
      let listenerFn: ((u: any) => Promise<void>) | undefined;
      (onIdTokenChanged as jest.Mock).mockImplementationOnce((_auth, cb) => {
        listenerFn = cb;
        return jest.fn();
      });
      const onToken = jest.fn();
      const unsubRefresh = subscribeFirebaseTokenRefresh(onToken);
      await listenerFn?.(fakeUser);
      expect(onToken).toHaveBeenCalledWith('android-refreshed-id-token');
      unsubRefresh();

      // Verify native signOut
      await signOutFirebase();
      expect(nativeSignOut).toHaveBeenCalledWith(fakeAuth);
      await screen.unmount();
    } finally {
      (globalThis as any).__DEV__ = prevDev;
    }
  });

  it('verifies Web reCAPTCHA phone auth path still works cleanly on Platform.OS === web', async () => {
    const prevEnv = {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    };
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY = 'web-test-key';
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID = 'affordz-test';
    const prevWindow = (globalThis as any).window;
    const prevDocument = (globalThis as any).document;
    (globalThis as any).window = {};
    (globalThis as any).document = {};

    try {
      await jest.isolateModulesAsync(async () => {
        const rn = require('react-native');
        rn.Platform.OS = 'web';
        const webAppMod = require('firebase/app');
        const webAuthMod = require('firebase/auth');
        webAppMod.getApps.mockReturnValue([]);
        webAppMod.initializeApp.mockReturnValue({ name: 'web-app' });
        webAuthMod.getAuth.mockReturnValue({ currentUser: null });
        const fakeConfirm = {
          confirm: jest.fn(async () => ({
            user: {
              uid: 'web-uid-1',
              phoneNumber: '+919876543210',
              getIdToken: jest.fn(async () => 'web-id-token-1'),
            },
          })),
        };
        webAuthMod.signInWithPhoneNumber.mockResolvedValueOnce(fakeConfirm);

        const fb = require('@/services/firebase');
        expect(fb.canUseWebFirebasePhoneAuth()).toBe(true);
        const confirmation = await fb.startFirebasePhoneSignIn('9876543210', 'recaptcha-container');
        expect(webAuthMod.signInWithPhoneNumber).toHaveBeenCalled();
        const verified = await fb.verifyFirebasePhoneCode(confirmation, '123456');
        expect(verified.idToken).toBe('web-id-token-1');
      });
    } finally {
      (globalThis as any).window = prevWindow;
      (globalThis as any).document = prevDocument;
      process.env.EXPO_PUBLIC_FIREBASE_API_KEY = prevEnv.apiKey;
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID = prevEnv.projectId;
    }
  });

  it('acquires real native FCM token, sets up listeners, and syncs onTokenRefresh with backend', async () => {
    const fakeApp = { name: '[DEFAULT]' };
    const fakeMessaging = { app: fakeApp };

    (getApps as jest.Mock).mockReturnValue([fakeApp]);
    (getApp as jest.Mock).mockReturnValue(fakeApp);
    (getMessaging as jest.Mock).mockReturnValue(fakeMessaging);
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'granted' });
    (nativeGetFcmToken as jest.Mock).mockResolvedValueOnce('fcm-android-real-token-999');

    const acquired = await customerNotificationService.acquireToken();
    expect(acquired).toBe('fcm-android-real-token-999');
    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
      'affordz_orders',
      expect.any(Object),
    );

    let foregroundCb: ((msg: any) => void) | undefined;
    let openedCb: ((msg: any) => void) | undefined;
    let tokenRefreshCb: ((token: string) => void) | undefined;

    (nativeOnMessage as jest.Mock).mockImplementationOnce((_m, cb) => {
      foregroundCb = cb;
      return jest.fn();
    });
    (onNotificationOpenedApp as jest.Mock).mockImplementationOnce((_m, cb) => {
      openedCb = cb;
      return jest.fn();
    });
    (onTokenRefresh as jest.Mock).mockImplementationOnce((_m, cb) => {
      tokenRefreshCb = cb;
      return jest.fn();
    });
    (getInitialNotification as jest.Mock).mockResolvedValueOnce({
      data: { orderId: 'ord-cold-1' },
    });

    const onNavigate = jest.fn();
    const onForegroundData = jest.fn();
    setAuthToken('jwt-active-123');
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: true }),
    });
    const prevFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as any;

    try {
      const cleanup = customerNotificationService.setupNotificationListeners(
        onNavigate,
        onForegroundData,
      );

      expect(setBackgroundMessageHandler).toHaveBeenCalled();

      await waitFor(() => {
        expect(onNavigate).toHaveBeenCalledWith('/tracking', { orderId: 'ord-cold-1' });
      });

      foregroundCb?.({ data: { orderId: 'ord-fg-2' } });
      expect(onForegroundData).toHaveBeenCalledWith({ orderId: 'ord-fg-2' });

      openedCb?.({ data: { screen: 'orders' } });
      expect(onNavigate).toHaveBeenCalledWith('/orders');

      tokenRefreshCb?.('fcm-android-refreshed-token-777');
      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/notifications/devices/register'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              token: 'fcm-android-refreshed-token-777',
              platform: 'android',
            }),
          }),
        );
      });

      cleanup();
    } finally {
      globalThis.fetch = prevFetch;
    }
  });
});
