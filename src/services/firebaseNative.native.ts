import { getApp, getApps, type ReactNativeFirebase } from '@react-native-firebase/app';
import {
  getAuth,
  getIdToken,
  onIdTokenChanged,
  signInWithPhoneNumber,
  signOut,
} from '@react-native-firebase/auth';
import {
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import type {
  FirebasePhoneConfirmation,
  NativeFcmListenerHandlers,
  NativePushPayload,
} from './firebaseTypes';

const FIFTY_MINUTES_MS = 50 * 60 * 1000;
let backgroundHandlerRegistered = false;

function getDefaultNativeApp(): ReactNativeFirebase.FirebaseApp | null {
  try {
    const apps = getApps();
    if (!apps || apps.length === 0) {
      return null;
    }
    return getApp();
  } catch {
    return null;
  }
}

export function isNativeFirebaseAvailable(): boolean {
  return Boolean(getDefaultNativeApp());
}

export async function startNativePhoneSignIn(e164Phone: string): Promise<FirebasePhoneConfirmation> {
  const nativeApp = getDefaultNativeApp();
  if (!nativeApp) {
    throw new Error(
      'Firebase Android SDK is not initialized for this build (missing google-services.json).',
    );
  }
  const nativeAuth = getAuth(nativeApp);
  return await signInWithPhoneNumber(nativeAuth, e164Phone);
}

export async function getNativeFirebaseIdToken(forceRefresh = false): Promise<string | null> {
  const nativeApp = getDefaultNativeApp();
  if (!nativeApp) return null;

  try {
    const nativeAuth = getAuth(nativeApp);
    if (!nativeAuth.currentUser) return null;
    return await getIdToken(nativeAuth.currentUser, forceRefresh);
  } catch {
    return null;
  }
}

export function subscribeNativeFirebaseTokenRefresh(
  onIdToken: (idToken: string) => void | Promise<void>,
): () => void {
  const nativeApp = getDefaultNativeApp();
  if (!nativeApp) return () => {};

  try {
    const nativeAuth = getAuth(nativeApp);
    let lastNotifiedToken: string | null = null;

    const unsubscribe = onIdTokenChanged(nativeAuth, async (user) => {
      if (!user) {
        lastNotifiedToken = null;
        return;
      }
      try {
        const token = await getIdToken(user);
        if (token && token !== lastNotifiedToken) {
          lastNotifiedToken = token;
          await onIdToken(token);
        }
      } catch {
        // ignore transient token listener failures
      }
    });

    const intervalId = setInterval(async () => {
      if (!nativeAuth.currentUser) return;
      try {
        const refreshed = await getIdToken(nativeAuth.currentUser, true);
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
  } catch {
    return () => {};
  }
}

export async function signOutNativeFirebase(): Promise<void> {
  const nativeApp = getDefaultNativeApp();
  if (!nativeApp) return;

  try {
    const nativeAuth = getAuth(nativeApp);
    if (nativeAuth.currentUser) {
      await signOut(nativeAuth);
    }
  } catch {
    // ignore native Firebase signOut errors during local logout
  }
}

export async function acquireNativeFcmToken(): Promise<string | null> {
  const nativeApp = getDefaultNativeApp();
  if (!nativeApp) return null;

  try {
    const messaging = getMessaging(nativeApp);
    const token = await getToken(messaging);
    return token || null;
  } catch {
    return null;
  }
}

export function registerNativeBackgroundMessageHandler(): void {
  if (backgroundHandlerRegistered) return;
  const nativeApp = getDefaultNativeApp();
  if (!nativeApp) return;

  try {
    const messaging = getMessaging(nativeApp);
    setBackgroundMessageHandler(messaging, async () => {});
    backgroundHandlerRegistered = true;
  } catch {
    // ignore if native messaging module is unavailable in test/dev container
  }
}

export function setupNativeFcmListeners(handlers: NativeFcmListenerHandlers): () => void {
  const nativeApp = getDefaultNativeApp();
  if (!nativeApp) return () => {};

  try {
    const messaging = getMessaging(nativeApp);

    const unsubForeground = onMessage(messaging, (remoteMessage) => {
      handlers.onForegroundMessage?.(remoteMessage as NativePushPayload);
    });

    const unsubOpened = onNotificationOpenedApp(messaging, (remoteMessage) => {
      handlers.onNotificationOpened?.(remoteMessage as NativePushPayload);
    });

    const unsubTokenRefresh = onTokenRefresh(messaging, (refreshedToken) => {
      if (refreshedToken) {
        handlers.onTokenRefresh?.(refreshedToken);
      }
    });

    getInitialNotification(messaging)
      .then((initialMessage) => {
        if (initialMessage) {
          handlers.onNotificationOpened?.(initialMessage as NativePushPayload);
        }
      })
      .catch(() => {});

    return () => {
      unsubForeground();
      unsubOpened();
      unsubTokenRefresh();
    };
  } catch {
    return () => {};
  }
}
