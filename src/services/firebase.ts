import { Platform } from 'react-native';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  type Auth,
  RecaptchaVerifier,
  getIdToken,
  onIdTokenChanged,
  signInWithPhoneNumber,
  signOut,
} from 'firebase/auth';
import {
  acquireNativeFcmToken,
  getNativeFirebaseIdToken,
  isNativeFirebaseAvailable as isNativeFirebaseSdkAvailable,
  registerNativeBackgroundMessageHandler,
  setupNativeFcmListeners,
  signOutNativeFirebase,
  startNativePhoneSignIn,
  subscribeNativeFirebaseTokenRefresh,
} from './firebaseNative';
import type { FirebasePhoneConfirmation, NativePushPayload } from './firebaseTypes';

export type { FirebasePhoneConfirmation, NativePushPayload };
export {
  acquireNativeFcmToken,
  registerNativeBackgroundMessageHandler,
  setupNativeFcmListeners,
};

// Web Firebase Client Configuration (populated via EXPO_PUBLIC_FIREBASE_* env vars)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let activeRecaptchaVerifier: RecaptchaVerifier | null = null;

function getWebFirebaseApp(): FirebaseApp | null {
  if (Platform.OS !== 'web' || !isFirebaseConfigured) {
    return null;
  }
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
}

function getWebFirebaseAuth(): Auth | null {
  const webApp = getWebFirebaseApp();
  return webApp ? getAuth(webApp) : null;
}

export function normalizePhoneToE164(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '').trim();
  if (!cleaned) return '';
  if (cleaned.startsWith('+')) return cleaned;
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return `+${digits}`;
}

export function isNativeFirebaseAvailable(): boolean {
  return Platform.OS !== 'web' && isNativeFirebaseSdkAvailable();
}

export function canUseNativeFirebasePhoneAuth(): boolean {
  return isNativeFirebaseAvailable();
}

export function canUseWebFirebasePhoneAuth(): boolean {
  return Boolean(
    isFirebaseConfigured &&
      Platform.OS === 'web' &&
      typeof window !== 'undefined' &&
      typeof document !== 'undefined' &&
      getWebFirebaseAuth(),
  );
}

export function canUseFirebasePhoneAuth(): boolean {
  return canUseWebFirebasePhoneAuth() || canUseNativeFirebasePhoneAuth();
}

export function clearRecaptchaVerifier(): void {
  if (activeRecaptchaVerifier) {
    try {
      activeRecaptchaVerifier.clear();
    } catch {
      // ignore cleanup error if already cleared
    }
    activeRecaptchaVerifier = null;
  }
}

export async function startFirebasePhoneSignIn(
  phoneNumber: string,
  containerId = 'recaptcha-container',
): Promise<FirebasePhoneConfirmation> {
  const e164Phone = normalizePhoneToE164(phoneNumber);
  if (!/^\+[1-9]\d{7,14}$/.test(e164Phone)) {
    throw new Error('Please enter a valid mobile number.');
  }

  if (Platform.OS !== 'web') {
    if (!canUseNativeFirebasePhoneAuth()) {
      throw new Error(
        'Firebase Android SDK is not initialized for this build (missing google-services.json).',
      );
    }
    return await startNativePhoneSignIn(e164Phone);
  }

  const webAuth = getWebFirebaseAuth();
  if (!isFirebaseConfigured || !webAuth) {
    throw new Error('Firebase Auth is not configured in this environment.');
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Firebase Web Phone Auth requires a browser DOM environment.');
  }

  clearRecaptchaVerifier();
  activeRecaptchaVerifier = new RecaptchaVerifier(webAuth, containerId, {
    size: 'invisible',
  });

  try {
    await activeRecaptchaVerifier.render();
    return await signInWithPhoneNumber(webAuth, e164Phone, activeRecaptchaVerifier);
  } catch (err) {
    clearRecaptchaVerifier();
    throw err;
  }
}

export async function verifyFirebasePhoneCode(
  confirmationResult: FirebasePhoneConfirmation,
  otpCode: string,
): Promise<{ idToken: string; uid: string; phoneNumber: string | null }> {
  const trimmedOtp = otpCode.trim();
  if (!trimmedOtp) {
    throw new Error('Please enter the verification code.');
  }
  const credential = await confirmationResult.confirm(trimmedOtp);
  const idToken = await credential.user.getIdToken(true);
  return {
    idToken,
    uid: credential.user.uid,
    phoneNumber: credential.user.phoneNumber,
  };
}

export async function getFirebaseIdToken(forceRefresh = false): Promise<string | null> {
  if (Platform.OS !== 'web') {
    return await getNativeFirebaseIdToken(forceRefresh);
  }

  const webAuth = getWebFirebaseAuth();
  if (!webAuth?.currentUser) return null;
  try {
    return await getIdToken(webAuth.currentUser, forceRefresh);
  } catch {
    return null;
  }
}

const FIFTY_MINUTES_MS = 50 * 60 * 1000;

export function subscribeFirebaseTokenRefresh(
  onIdToken: (idToken: string) => void | Promise<void>,
): () => void {
  if (Platform.OS !== 'web') {
    return subscribeNativeFirebaseTokenRefresh(onIdToken);
  }

  const webAuth = getWebFirebaseAuth();
  if (!webAuth) return () => {};

  let lastNotifiedToken: string | null = null;

  const unsubscribe = onIdTokenChanged(webAuth, async (user) => {
    if (!user) {
      lastNotifiedToken = null;
      return;
    }
    try {
      const token = await user.getIdToken();
      if (token && token !== lastNotifiedToken) {
        lastNotifiedToken = token;
        await onIdToken(token);
      }
    } catch {
      // ignore transient token listener failures
    }
  });

  const intervalId = setInterval(async () => {
    if (!webAuth.currentUser) return;
    try {
      const refreshed = await getIdToken(webAuth.currentUser, true);
      if (refreshed && refreshed !== lastNotifiedToken) {
        lastNotifiedToken = refreshed;
        await onIdToken(refreshed);
      }
    } catch {
      // ignore background refresh error; 401 handler covers stale session
    }
  }, FIFTY_MINUTES_MS);

  return () => {
    unsubscribe();
    clearInterval(intervalId);
  };
}

export async function signOutFirebase(): Promise<void> {
  clearRecaptchaVerifier();
  if (Platform.OS !== 'web') {
    await signOutNativeFirebase();
    return;
  }

  const webAuth = getWebFirebaseAuth();
  if (!webAuth) return;
  try {
    await signOut(webAuth);
  } catch {
    // ignore Firebase signOut errors during local logout
  }
}

export async function getWebFirebaseMessaging(): Promise<{
  messaging: any;
  getToken: typeof import('firebase/messaging').getToken;
  onMessage: typeof import('firebase/messaging').onMessage;
} | null> {
  const webApp = getWebFirebaseApp();
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !isFirebaseConfigured || !webApp) {
    return null;
  }

  try {
    const messagingMod = await import('firebase/messaging');
    const supported = await messagingMod.isSupported();
    if (!supported) return null;
    return {
      messaging: messagingMod.getMessaging(webApp),
      getToken: messagingMod.getToken,
      onMessage: messagingMod.onMessage,
    };
  } catch {
    return null;
  }
}
