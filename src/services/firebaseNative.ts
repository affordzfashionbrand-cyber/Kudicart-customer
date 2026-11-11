import type { FirebasePhoneConfirmation, NativeFcmListenerHandlers } from './firebaseTypes';

/**
 * Web / non-native fallback stub so Metro Web & SSR builds do not bundle
 * Android-only @react-native-firebase TurboModules.
 * Android builds automatically resolve firebaseNative.native.ts.
 */
export function isNativeFirebaseAvailable(): boolean {
  return false;
}

export async function startNativePhoneSignIn(_e164Phone: string): Promise<FirebasePhoneConfirmation> {
  throw new Error('Native Firebase Phone Auth is only available on native mobile builds.');
}

export async function getNativeFirebaseIdToken(_forceRefresh = false): Promise<string | null> {
  return null;
}

export function subscribeNativeFirebaseTokenRefresh(
  _onIdToken: (idToken: string) => void | Promise<void>,
): () => void {
  return () => {};
}

export async function signOutNativeFirebase(): Promise<void> {
  // no-op on non-native platforms
}

export async function acquireNativeFcmToken(): Promise<string | null> {
  return null;
}

export function registerNativeBackgroundMessageHandler(): void {
  // no-op on non-native platforms
}

export function setupNativeFcmListeners(_handlers: NativeFcmListenerHandlers): () => void {
  return () => {};
}
