// Sentry Crash Tracking Service for Affordz (Decision D-023 / D-CUST-05)

let isSentryInitialized = false;

export const initSentry = () => {
  if (isSentryInitialized) return;
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    // Sentry ready in development / production with DSN
    return;
  }
  try {
    const Sentry = require('@sentry/react-native');
    Sentry.init({
      dsn,
      debug: false,
      environment: process.env.NODE_ENV || 'production',
      tracesSampleRate: 1.0,
    });
    isSentryInitialized = true;
  } catch (err) {
    console.warn('[Sentry] Initialization notice:', err);
  }
};

export const captureException = (error: any, context?: any) => {
  try {
    const Sentry = require('@sentry/react-native');
    Sentry.captureException(error, { extra: context });
  } catch {
    console.error('[Error Tracker]', error, context);
  }
};
