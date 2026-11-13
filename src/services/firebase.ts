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
  if (!webApp) return null;
  const auth = getAuth(webApp);
  // NOTE: Do NOT set appVerificationDisabledForTesting = true here.
  // That flag causes a MALFORMED reCAPTCHA token to be sent to Google,
  // which works only with Firebase test phone numbers. For real phone
  // numbers it breaks OTP delivery with CAPTCHA_CHECK_FAILED.
  return auth;
}

export const FIREBASE_TEST_NUMBERS = [
  '+919840888866',
  '+919876543210',
  '+918124188999',
  '+919845012890',
];

export function isFirebaseTestNumber(phone: string): boolean {
  const normalized = normalizePhoneToE164(phone);
  return FIREBASE_TEST_NUMBERS.includes(normalized);
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

  // Also reset the DOM element so grecaptcha doesn't complain that
  // "reCAPTCHA has already been rendered in this element" on subsequent attempts
  if (typeof document !== 'undefined' && typeof document.getElementById === 'function') {
    const el = document.getElementById('recaptcha-container');
    if (el) {
      try {
        if (el.parentNode && typeof document.createElement === 'function') {
          const fresh = document.createElement('div');
          fresh.id = el.id;
          fresh.className = el.className;
          el.parentNode.replaceChild(fresh, el);
        } else {
          el.innerHTML = '';
        }
      } catch {
        el.innerHTML = '';
      }
    }
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

  let containerEl: any = null;
  if (typeof document !== 'undefined') {
    let existing: any = null;
    if (typeof document.getElementById === 'function') {
      existing = document.getElementById(containerId);
    }
    // If a container exists but has child elements (stale grecaptcha iframe), replace with a clean node
    if (
      existing &&
      existing.childNodes &&
      existing.childNodes.length > 0 &&
      !activeRecaptchaVerifier &&
      typeof document.createElement === 'function'
    ) {
      try {
        const fresh = document.createElement('div');
        fresh.id = containerId;
        fresh.className = existing.className;
        if (existing.parentNode) {
          existing.parentNode.replaceChild(fresh, existing);
          containerEl = fresh;
        } else {
          existing.innerHTML = '';
          containerEl = existing;
        }
      } catch {
        existing.innerHTML = '';
        containerEl = existing;
      }
    } else if (existing) {
      containerEl = existing;
    }

    if (!containerEl && document.body && typeof document.createElement === 'function') {
      containerEl = document.createElement('div');
      containerEl.id = containerId;
      containerEl.style.position = 'fixed';
      containerEl.style.bottom = '0';
      containerEl.style.right = '0';
      containerEl.style.zIndex = '99999';
      document.body.appendChild(containerEl);
    }
  }

  if (!activeRecaptchaVerifier) {
    activeRecaptchaVerifier = new RecaptchaVerifier(webAuth, containerEl || containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        try {
          if (typeof window !== 'undefined' && (window as any).grecaptcha?.reset) {
            (window as any).grecaptcha.reset();
          }
        } catch {}
      },
      'error-callback': (error: any) => {
        console.warn('[Affordz Auth] reCAPTCHA error callback:', error);
      },
    });
  }

  try {
    if (activeRecaptchaVerifier && typeof activeRecaptchaVerifier.render === 'function') {
      await activeRecaptchaVerifier.render();
    }
  } catch (renderErr: any) {
    const msg = String(renderErr?.message || renderErr);
    if (msg.includes('already been rendered')) {
      // Container already has the widget rendered; reset grecaptcha if available and proceed
      try {
        if (typeof window !== 'undefined' && (window as any).grecaptcha?.reset) {
          (window as any).grecaptcha.reset();
        }
      } catch {}
    } else {
      clearRecaptchaVerifier();
      containerEl = document.getElementById(containerId);
      if (!containerEl && document.body) {
        containerEl = document.createElement('div');
        containerEl.id = containerId;
        document.body.appendChild(containerEl);
      }
      activeRecaptchaVerifier = new RecaptchaVerifier(webAuth, containerEl || containerId, {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {},
        'error-callback': () => {},
      });
      try {
        await activeRecaptchaVerifier.render();
      } catch {
        // Continue if render fails due to already-rendered check
      }
    }
  }

  try {
    if (webAuth && (webAuth as any).settings) {
      if (isFirebaseTestNumber(e164Phone)) {
        (webAuth as any).settings.appVerificationDisabledForTesting = true;
      } else {
        (webAuth as any).settings.appVerificationDisabledForTesting = false;
      }
    }

    const confirmationPromise = signInWithPhoneNumber(webAuth, e164Phone, activeRecaptchaVerifier);
    const timeoutPromise = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('reCAPTCHA Timeout. Verification took too long, please try again.'));
      }, 25000);
      confirmationPromise.then(() => clearTimeout(timer), () => clearTimeout(timer));
    });
    return await Promise.race([confirmationPromise, timeoutPromise]);
  } catch (err: any) {
    try {
      if (typeof window !== 'undefined' && (window as any).grecaptcha?.reset) {
        (window as any).grecaptcha.reset();
      }
    } catch {}
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
