import React from 'react';
import { act, render, fireEvent } from '@testing-library/react-native';

import {
  request,
  setAuthToken,
  getAuthToken,
  setTokenRefresher,
  setOnUnauthorizedCallback,
  ApiError,
  authApi,
} from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useAddressStore } from '@/store/useAddressStore';
import { useSupportStore } from '@/store/useSupportStore';
import { useDarkStore } from '@/store/useDarkStore';
import { trackingSocketService } from '@/services/trackingSocket';
import { customerNotificationService } from '@/services/notificationService';
import { AuthModal } from '@/components/auth-modal';

jest.mock('@/services/firebase', () => ({
  isFirebaseConfigured: false,
  isNativeFirebaseAvailable: jest.fn(() => false),
  canUseNativeFirebasePhoneAuth: jest.fn(() => false),
  canUseWebFirebasePhoneAuth: jest.fn(() => false),
  canUseFirebasePhoneAuth: jest.fn(() => false),
  clearRecaptchaVerifier: jest.fn(),
  startFirebasePhoneSignIn: jest.fn(),
  verifyFirebasePhoneCode: jest.fn(),
  getFirebaseIdToken: jest.fn(async () => 'fresh-firebase-id-token'),
  subscribeFirebaseTokenRefresh: jest.fn(() => () => {}),
  signOutFirebase: jest.fn(async () => {}),
  getWebFirebaseMessaging: jest.fn(async () => null),
  acquireNativeFcmToken: jest.fn(async () => null),
  registerNativeBackgroundMessageHandler: jest.fn(),
  setupNativeFcmListeners: jest.fn(() => () => {}),
}));

describe('Auth, API Token Refresh, Session Check, Deletion & Logout Resets', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    setAuthToken(null);
    setTokenRefresher(null);
    setOnUnauthorizedCallback(() => {});
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('retries 401 once with refreshed token and never logs out on 403', async () => {
    const onUnauthorized = jest.fn();
    setOnUnauthorizedCallback(onUnauthorized);
    setAuthToken('expired-token');

    setTokenRefresher(async () => 'fresh-token-123');

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Token expired' }),
        text: async () => JSON.stringify({ message: 'Token expired' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: 'usr-1', name: 'Aarav', phone: '9876543210', email: null }),
        text: async () => JSON.stringify({ id: 'usr-1', name: 'Aarav', phone: '9876543210', email: null }),
      });

    globalThis.fetch = fetchMock as any;

    const user = await request<any>('/api/v1/users/me');
    expect(user.id).toBe('usr-1');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getAuthToken()).toBe('fresh-token-123');
    expect(onUnauthorized).not.toHaveBeenCalled();

    // Verify 403 does NOT trigger logout/onUnauthorized
    globalThis.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ message: 'Forbidden resource' }),
    }) as any;

    await expect(request('/api/v1/orders/other-user')).rejects.toMatchObject<Partial<ApiError>>({
      status: 403,
      message: 'Forbidden resource',
    });
    expect(onUnauthorized).not.toHaveBeenCalled();

    // Double 401 triggers onUnauthorized
    setTokenRefresher(async () => null);
    globalThis.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    }) as any;

    await expect(request('/api/v1/users/me')).rejects.toMatchObject<Partial<ApiError>>({
      status: 401,
    });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);

    // Auth exchange endpoint 401 (e.g. invalid OTP) must NOT trigger global logout callback
    globalThis.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Invalid OTP code. Please check the code and try again.' }),
    }) as any;

    await expect(
      request('/api/v1/auth/phone/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: '+91 9876543210', otp: '123456' }),
      }),
    ).rejects.toMatchObject<Partial<ApiError>>({
      status: 401,
      message: 'Invalid OTP code. Please check the code and try again.',
    });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('verifies stored session against GET /api/v1/users/me and clears invalid sessions', async () => {
    const SecureStore = require('expo-secure-store');
    await SecureStore.setItemAsync('affordz_token', 'stored-jwt-token-12345');
    await SecureStore.setItemAsync(
      'affordz_user',
      JSON.stringify({ id: 'usr-1', name: 'Old', phone: '9876543210' }),
    );

    const verifySpy = jest
      .spyOn(authApi, 'verifyProfileSession')
      .mockRejectedValueOnce(Object.assign(new Error('Unauthorized'), { status: 401 }) as ApiError);

    await useAuthStore.getState().initializeAuth();

    expect(verifySpy).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('retains verified session and propagates real errors on updateProfile including email: null', async () => {
    const SecureStore = require('expo-secure-store');
    await SecureStore.setItemAsync('affordz_token', 'valid-jwt-token-12345');
    await SecureStore.setItemAsync(
      'affordz_user',
      JSON.stringify({ id: 'usr-1', name: 'Meera', phone: '9876543210' }),
    );

    const liveUser = {
      id: 'usr-1',
      name: 'Meera Rao',
      phone: '9876543210',
      email: 'meera@affordz.in',
      avatar: null,
      role: 'CUSTOMER' as const,
    };
    jest.spyOn(authApi, 'verifyProfileSession').mockResolvedValueOnce(liveUser);

    await useAuthStore.getState().initializeAuth();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.name).toBe('Meera Rao');

    const updateSpy = jest
      .spyOn(authApi, 'updateProfile')
      .mockResolvedValueOnce({ ...liveUser, email: null })
      .mockRejectedValueOnce(
        Object.assign(new Error('Invalid phone format'), { status: 400 }) as ApiError,
      );

    const updated = await useAuthStore.getState().updateProfile({ email: null });
    expect(updateSpy).toHaveBeenCalledWith({ email: null });
    expect(updated?.email).toBeNull();

    await expect(useAuthStore.getState().updateProfile({ phone: '12' })).rejects.toThrow(
      'Invalid phone format',
    );
    expect(useAuthStore.getState().user?.name).toBe('Meera Rao');
  });

  it('clears all stores, tracking socket, and notifications on logout and deleteAccount', async () => {
    useCartStore.setState({
      items: [
        {
          id: 'ci-1',
          productId: 'prod-1',
          title: 'Silk Kurta',
          brand: 'Affordz',
          price: 1200,
          originalPrice: 1500,
          size: 'M',
          quantity: 1,
          image: 'https://example.com/1.jpg',
        },
      ],
      wishlist: ['prod-1'],
      count: 1,
    });
    useOrderStore.setState({
      orders: [
        {
          id: 'ord-1',
          orderNumber: 'AF-101',
          customerId: 'usr-1',
          status: 'PLACED',
          paymentMethod: 'COD',
          paymentStatus: 'PENDING',
          itemTotal: 1200,
          deliveryFee: 40,
          taxes: 60,
          grandTotal: 1300,
          etaMinutes: 18,
          createdAt: new Date().toISOString(),
          items: [],
        },
      ],
    });
    useAddressStore.setState({
      addresses: [
        {
          id: 'addr-1',
          userId: 'usr-1',
          label: 'Home',
          line1: '100ft Rd',
          locality: 'Indiranagar',
          city: 'Bengaluru',
          pincode: '560038',
          isDefault: true,
        },
      ],
      selectedAddressId: 'addr-1',
      hasLocationConfirmed: true,
    });
    useSupportStore.setState({
      tickets: [
        {
          id: 'tck-1',
          userId: 'usr-1',
          title: 'Fit question',
          category: 'TRY_AND_BUY',
          status: 'OPEN',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });
    useDarkStore.setState({
      isDarkStoreModalOpen: true,
      selectedDarkStore: {
        id: 'hub-1',
        name: 'Indiranagar Hub',
        shortName: 'Indiranagar',
        code: 'HUB-01',
        locality: 'Indiranagar',
        distanceKm: 2,
        deliveryMinutes: 18,
        stockCount: 10,
        isOpen: true,
        prepTimeMinutes: 3,
        address: '100ft Rd',
        features: [],
      },
    });

    const disconnectSpy = jest.spyOn(trackingSocketService, 'disconnect');
    const unregisterSpy = jest
      .spyOn(customerNotificationService, 'unregisterDeviceToken')
      .mockResolvedValue(true);

    useAuthStore.setState({
      user: { id: 'usr-1', name: 'Meera', phone: '9876543210', email: null, avatar: null, role: 'CUSTOMER' },
      token: 'jwt-abc',
      isAuthenticated: true,
    });

    await useAuthStore.getState().logout();

    expect(unregisterSpy).toHaveBeenCalledTimes(1);
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().wishlist).toHaveLength(0);
    expect(useOrderStore.getState().orders).toHaveLength(0);
    expect(useAddressStore.getState().addresses).toHaveLength(0);
    expect(useSupportStore.getState().tickets).toHaveLength(0);
    expect(useDarkStore.getState().isDarkStoreModalOpen).toBe(false);
    expect(useDarkStore.getState().selectedDarkStore).toBeNull();

    const deleteSpy = jest
      .spyOn(authApi, 'deleteAccount')
      .mockResolvedValueOnce({ success: true });
    useAuthStore.setState({
      user: { id: 'usr-1', name: 'Meera', phone: '9876543210', email: null, avatar: null, role: 'CUSTOMER' },
      token: 'jwt-abc',
      isAuthenticated: true,
    });
    setAuthToken('jwt-abc');

    await useAuthStore.getState().deleteAccount();
    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('blocks OTP step outside __DEV__ when Firebase is unconfigured and displays clear error', async () => {
    const prevDev = (globalThis as any).__DEV__;
    (globalThis as any).__DEV__ = false;

    try {
      const screen = await render(
        <AuthModal visible={true} onClose={jest.fn()} onSuccess={jest.fn()} />,
      );
      const phoneInput = screen.getByPlaceholderText('Enter mobile number');
      await fireEvent.changeText(phoneInput, '9876543210');
      await fireEvent.press(screen.getByText('GET OTP'));

      expect(
        await screen.findByText(/Authentication service is not configured for this build/i),
      ).toBeTruthy();
    } finally {
      (globalThis as any).__DEV__ = prevDev;
    }
  });

  it('completes __DEV__ backend devOtp round-trip when Firebase throws web config/billing error', async () => {
    const rn = require('react-native');
    const prevPlatformOs = rn.Platform.OS;
    rn.Platform.OS = 'web';

    const firebaseMock = require('@/services/firebase');
    firebaseMock.canUseFirebasePhoneAuth.mockReturnValue(true);
    firebaseMock.startFirebasePhoneSignIn.mockRejectedValueOnce(
      Object.assign(new Error('Firebase billing not enabled'), { code: 'auth/billing-not-enabled' }),
    );

    const sendOtpSpy = jest.spyOn(authApi, 'sendOtp').mockResolvedValueOnce({
      success: true,
      message: 'OTP sent',
      countdownSeconds: 30,
      devOtp: '482910',
    });
    const verifyOtpSpy = jest.spyOn(authApi, 'verifyOtp').mockResolvedValueOnce({
      success: true,
      token: 'dev-otp-jwt-123456',
      role: 'CUSTOMER',
      user: {
        id: 'usr-dev-1',
        phone: '+919876543210',
        name: 'Affordz Customer',
        email: null,
        avatar: null,
        role: 'CUSTOMER',
      },
    });

    try {
      const screen = await render(
        <AuthModal visible={true} onClose={jest.fn()} onSuccess={jest.fn()} />,
      );
      await fireEvent.changeText(screen.getByPlaceholderText('Enter mobile number'), '9876543210');
      await fireEvent.press(screen.getByText('GET OTP'));

      expect(await screen.findByText(/Dev OTP:/i)).toBeTruthy();
      expect(sendOtpSpy).toHaveBeenCalledWith('+91 9876543210');

      await fireEvent.press(screen.getByText('VERIFY & PROCEED'));
      expect(await screen.findByText(/WELCOME BACK/i)).toBeTruthy();
      expect(verifyOtpSpy).toHaveBeenCalledWith('+91 9876543210', '482910');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      await screen.unmount();
    } finally {
      rn.Platform.OS = prevPlatformOs;
      firebaseMock.canUseFirebasePhoneAuth.mockReturnValue(false);
    }
  });

  it('completes Firebase OTP sign-in and refreshes backend JWT via subscribeFirebaseTokenRefresh', async () => {
    const firebaseMock = require('@/services/firebase');
    firebaseMock.canUseFirebasePhoneAuth.mockReturnValue(true);
    const mockConfirmation = { confirm: jest.fn() };
    firebaseMock.startFirebasePhoneSignIn.mockResolvedValueOnce(mockConfirmation);
    firebaseMock.verifyFirebasePhoneCode.mockResolvedValueOnce({
      idToken: 'firebase-id-token-1',
      uid: 'fb-uid-1',
      phoneNumber: '+919876543210',
    });

    let refreshCallback: ((token: string) => Promise<void>) | null = null;
    firebaseMock.subscribeFirebaseTokenRefresh.mockImplementation((cb: any) => {
      refreshCallback = cb;
      return jest.fn();
    });

    const loginFirebaseSpy = jest
      .spyOn(authApi, 'loginFirebase')
      .mockResolvedValueOnce({
        success: true,
        token: 'backend-jwt-initial-12345',
        role: 'CUSTOMER',
        user: {
          id: 'usr-fb-1',
          phone: '9876543210',
          name: 'Kavya',
          email: null,
          avatar: null,
          role: 'CUSTOMER',
        },
      })
      .mockResolvedValueOnce({
        success: true,
        token: 'backend-jwt-refreshed-67890',
        role: 'CUSTOMER',
        user: {
          id: 'usr-fb-1',
          phone: '9876543210',
          name: 'Kavya',
          email: null,
          avatar: null,
          role: 'CUSTOMER',
        },
      });

    const onSuccess = jest.fn();
    const screen = await render(
      <AuthModal visible={true} onClose={jest.fn()} onSuccess={onSuccess} />,
    );

    await fireEvent.changeText(screen.getByPlaceholderText('Enter mobile number'), '9876543210');
    await fireEvent.press(screen.getByText('GET OTP'));

    expect(await screen.findByText(/VERIFY OTP/i)).toBeTruthy();
    expect(firebaseMock.startFirebasePhoneSignIn).toHaveBeenCalledWith(
      '+91 9876543210',
      'recaptcha-container',
    );

    const otpInputs = screen.getAllByLabelText(/OTP digit/i);
    expect(otpInputs).toHaveLength(6);

    const digits = ['1', '2', '3', '4', '5', '6'];
    for (let i = 0; i < digits.length; i += 1) {
      await fireEvent.changeText(otpInputs[i], digits[i]);
    }
    await fireEvent.press(screen.getByText('VERIFY & PROCEED'));

    expect(await screen.findByText(/WELCOME BACK/i)).toBeTruthy();
    expect(loginFirebaseSpy).toHaveBeenCalledWith('firebase-id-token-1');
    expect(useAuthStore.getState().token).toBe('backend-jwt-initial-12345');

    // Trigger Firebase ID token rotation -> verifies JWT seamlessly swaps for FirebaseAuthGuard
    expect(refreshCallback).toBeTruthy();
    await act(async () => {
      await refreshCallback!('firebase-id-token-rotated-2');
    });
    expect(loginFirebaseSpy).toHaveBeenCalledWith('firebase-id-token-rotated-2');
    expect(useAuthStore.getState().token).toBe('backend-jwt-refreshed-67890');
    expect(getAuthToken()).toBe('backend-jwt-refreshed-67890');
    await screen.unmount();
  });
});
