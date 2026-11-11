jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
    __clearMockStore: () => {
      store.clear();
    },
  };
});

jest.mock('expo-notifications', () => ({
  AndroidImportance: { MAX: 5, HIGH: 4, DEFAULT: 3 },
  setNotificationChannelAsync: jest.fn(async () => null),
  getPermissionsAsync: jest.fn(async () => ({ status: 'undetermined' })),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'denied' })),
  getDevicePushTokenAsync: jest.fn(async () => {
    throw new Error('Firebase messaging is not configured in test environment');
  }),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  getLastNotificationResponseAsync: jest.fn(async () => null),
}));

jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(async () => ({ type: 'cancel' })),
  dismissBrowser: jest.fn(async () => ({ type: 'dismiss' })),
}));

jest.mock('expo-linking', () => {
  const parse = (url: string) => {
    try {
      const normalized = url.replace(/^affordz:\/\//, 'https://affordz.app/');
      const parsed = new URL(normalized);
      const queryParams: Record<string, string> = {};
      parsed.searchParams.forEach((v, k) => {
        queryParams[k] = v;
      });
      return {
        scheme: url.startsWith('affordz://') ? 'affordz' : parsed.protocol.replace(':', ''),
        hostname: parsed.hostname,
        path: parsed.pathname.replace(/^\/+/, ''),
        queryParams,
      };
    } catch {
      return { scheme: 'affordz', hostname: '', path: '', queryParams: {} };
    }
  };
  return {
    createURL: jest.fn((path: string) => `affordz://${path.replace(/^\/+/, '')}`),
    parse,
    openURL: jest.fn(async () => true),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    getInitialURL: jest.fn(async () => null),
  };
});

jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  withScope: jest.fn((cb: (scope: any) => void) => cb({ setExtra: jest.fn() })),
}));

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
  RecaptchaVerifier: jest.fn().mockImplementation(() => ({
    render: jest.fn(async () => 0),
    clear: jest.fn(),
  })),
  getIdToken: jest.fn(async () => null),
  onIdTokenChanged: jest.fn(() => () => {}),
  signInWithPhoneNumber: jest.fn(),
  signOut: jest.fn(async () => {}),
}));

jest.mock('firebase/messaging', () => ({
  isSupported: jest.fn(async () => false),
  getMessaging: jest.fn(() => ({})),
  getToken: jest.fn(async () => null),
  onMessage: jest.fn(() => () => {}),
}));

jest.mock('@react-native-firebase/app', () => ({
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({ name: '[DEFAULT]' })),
}));

jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
  signInWithPhoneNumber: jest.fn(),
  onIdTokenChanged: jest.fn(() => () => {}),
  getIdToken: jest.fn(async () => null),
  signOut: jest.fn(async () => {}),
}));

jest.mock('@react-native-firebase/messaging', () => ({
  getMessaging: jest.fn(() => ({})),
  getToken: jest.fn(async () => null),
  deleteToken: jest.fn(async () => {}),
  onMessage: jest.fn(() => () => {}),
  onNotificationOpenedApp: jest.fn(() => () => {}),
  getInitialNotification: jest.fn(async () => null),
  onTokenRefresh: jest.fn(() => () => {}),
  setBackgroundMessageHandler: jest.fn(),
}));

jest.mock('lucide-react-native', () => {
  const IconMock = () => null;
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === '__esModule') return true;
        return IconMock;
      },
    },
  );
});

jest.mock('expo-image', () => ({
  Image: () => null,
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children?: unknown }) => children ?? null,
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  }),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/',
}));
