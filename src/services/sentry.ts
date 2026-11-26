// Error Tracking Service (Sentry descoped per DCR-016)

export const initSentry = () => {
  // No-op: Sentry descoped per DCR-016
};

export const captureException = (error: any, context?: any) => {
  console.error('[Error Tracker]', error, context);
};
