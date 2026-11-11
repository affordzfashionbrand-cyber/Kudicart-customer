export interface FirebasePhoneConfirmation {
  confirm(verificationCode: string): Promise<{
    user: {
      uid: string;
      phoneNumber: string | null;
      getIdToken(forceRefresh?: boolean): Promise<string>;
    };
  }>;
}

export interface NativePushPayload {
  messageId?: string;
  data?: Record<string, unknown>;
  notification?: {
    title?: string;
    body?: string;
  };
}

export interface NativeFcmListenerHandlers {
  onForegroundMessage?: (message: NativePushPayload) => void;
  onNotificationOpened?: (message: NativePushPayload) => void;
  onTokenRefresh?: (token: string) => void;
}
