import { useRouter } from 'expo-router';

export type AppRouter = ReturnType<typeof useRouter>;

/**
 * Safely navigates back if there is a screen in the history stack,
 * otherwise replaces the current route with the fallback route (defaults to '/').
 * Prevents React Navigation warning: "The action 'GO_BACK' was not handled by any navigator."
 */
export function safeBack(router: AppRouter, fallback: string = '/') {
  if (router && typeof router.canGoBack === 'function' && router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback as any);
  }
}
