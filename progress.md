# KudiCart Customer App — Progress Report

> **Purpose:** Durable execution/status record for the Customer App repository.
>
> This file records what has actually been completed, what is in progress, what is blocked, and what remains.
>
> **Important:** Do not mark work complete because code was generated. A phase is complete only when its stated verification has passed.

---

# 1. Status Legend

```text
[ ] Not started
[~] In progress
[x] Complete
[!] Blocked
[-] Deferred
```

---

# 2. Current State

**Overall Status:** WAVE 1 & WAVE 2 COMPLETE (ANDROID RELEASE BUILD PENDING)

**Design System Updates:**
- Minimalist Signal Orange (`#FF5A1F`) Accent System implemented across all app screens, components, and modals.
- Orange is strictly restricted to:
  1. The signature brand dot in `KUDICART.`
  2. Micro live pulse dots (3–6px) for active delivery drops and time-sensitive releases.
  3. Numeric badge counters (cart / notification items).
  4. Active favorited state for wishlist hearts.
- Primary CTAs, banners, search focus rings, category selectors, countdown tiles, and headers converted to ultra-luxury monochrome (`#111111` Ink Black, `#FFFFFF`, `#F7F7F5`, `#F4F1EA`).

**Documentation:**

```text
[x] project_context.md
[x] SPEC.md
[x] decisions.md
[x] design.md
[x] PLAN.md
[x] progress.md
[x] Final architecture artifact (in master Kudicart docs)
```

---

# 3. Implementation Progress

## Phase 1 — Project Foundation

**Status:** [x]

- [x] React Native project initialized.
- [x] TypeScript configured.
- [x] Navigation setup.
- [x] State management setup.
- [x] API client foundation.
- [x] Environment configuration.
- [x] Linting/formatting.

**Evidence:** Expo router, Nativewind, Zustand, and `src/services/api.ts` (401 single-retry refresh, 403 non-logout, real error propagation) verified via TypeScript, ESLint, and `auth-flow.test.tsx`.

---

## Phase 2 — Firebase Authentication

**Status:** [x]

- [x] Firebase SDK setup.
- [x] Phone/OTP login.
- [x] Token management.
- [x] Auth state persistence.

**Evidence:** `src/services/firebase.ts`, `src/services/firebaseNative.native.ts`, `src/services/firebaseNative.ts`, `src/services/firebaseTypes.ts`, `src/store/useAuthStore.ts`, and `src/components/auth-modal.tsx` implement native Android `@react-native-firebase/auth` (`signInWithPhoneNumber`, `onIdTokenChanged`, `getIdToken`, `signOut`) alongside Web `firebase/auth` reCAPTCHA Phone OTP, safe `getApps().length > 0` fallback (`google-services.json` absent in dev -> `__DEV__`-only backend OTP fallback, production `!__DEV__` strict block), 50-min token refresh listener + `GET /api/v1/users/me` session validation + `activeToken` preservation on refresh, SecureStore/localStorage persistence, and full store reset on logout; verified by `src/__tests__/auth-flow.test.tsx` and `src/__tests__/firebase-native.test.tsx`.

---

## Phase 3 — Customer Profile

**Status:** [x]

- [x] Profile screen.
- [x] Profile editing.

**Evidence:** `EditProfileModal` supports updating name/email (`email: null` when cleared) and surfacing real backend errors; `SettingsModal` wires `DELETE /api/v1/users/me` account deletion and cleans non-backend preference toggles; verified in `src/__tests__/auth-flow.test.tsx`.

---

## Phase 4 — Catalog Browsing

**Status:** [x]

- [x] Home/categories (UI + live API)
- [x] Product listing (UI + live API)
- [x] Product detail.

**Evidence:** `catalogApi`, `useCatalogStore`, `ExploreCatalogView`, `/explore`, `/category/[id]`, `/product/[id]`, and `useDarkStore` fetch live catalog/hubs with honest loading/empty/error states (no static mock fallbacks).

---

## Phase 5 — Cart Management

**Status:** [x]

- [x] Add/update/remove cart items (Live backend DB CartItem ID sync + split-bucket totals)
- [x] Cart screen (UI & backend parity implemented)

**Evidence:** `useCartStore` syncs server `CartItem.id` values, clears stale items when backend returns `[]`, computes `splitBuckets` / `splitOrderCount` delivery fees (`₹1,499` threshold), syncs `giftWrap` via `PATCH /api/v1/cart/preferences`, rejects invalid coupons without offline spoofing, and passes `cart-checkout-razorpay.test.ts`.

---

## Phase 6 — Address Management

**Status:** [x]

- [x] Address CRUD.
- [x] Checkout address selection.

**Evidence:** `useAddressStore` enforces authenticated backend address CRUD, isolates guest preview selection (`previewAddress`) from `addresses`, and gates checkout serviceability against live hubs (`checkAddressServiceability`), verified by `cart-checkout-razorpay.test.ts`.

---

## Phase 7 — Checkout and Payment

**Status:** [x]

- [x] Checkout flow.
- [x] Razorpay integration.
- [x] COD flow.
- [x] Order confirmation.

**Evidence:** `src/app/cart.tsx` and `src/services/razorpay.ts` isolate Buy Now pricing/instructions from bag state, enforce Try & Buy for `DARK_STORE` items only, launch Hosted Razorpay via `checkoutSessionToken`/`checkoutSessionUrl`, parse `affordz://payment-callback`, and verify/poll payment status (`cart-checkout-razorpay.test.ts`).

---

## Phase 8 — Order History and Tracking

**Status:** [x]

- [x] Order history list.
- [x] Order detail.
- [x] Status tracking.

**Evidence:** `OrderDetailView` (live reorder & web-safe cancel modal), `TrackingScreen` (`ORDER_ARRIVED`, `TRY_AND_BUY_UPDATED`), `TryAndBuySelectionCard`, and `TrackingSocketService` (`seq` dedupe, auth close `4001`/`4003` stop-reconnect, disconnect reset) verified via `orders-reviews-tracking.test.tsx`.

---

## Phase 9 — Notifications

**Status:** [x]

- [x] FCM setup.
- [x] Push handling.
- [x] In-app feed.

**Evidence:** `src/services/notificationService.ts` + `src/services/firebaseNative.native.ts` use `@react-native-firebase/messaging` (`getToken`, `onMessage`, `onNotificationOpenedApp`, `getInitialNotification`, `onTokenRefresh` backend sync, `setBackgroundMessageHandler`) alongside `expo-notifications` channel/permissions and Web `firebase/messaging`, returning `null` gracefully when unconfigured (no fake tokens); `_layout.tsx` wires foreground/tap listeners and `affordz://` deep links; Android `google-services` Gradle plugin guarded by `google-services.json` existence (`firebase-native.test.tsx`, `orders-reviews-tracking.test.tsx`).

---

## Phase 10 — Reviews and Ratings

**Status:** [x]

- [x] Review submission.
- [x] Review display.

**Evidence:** `isOrderItemEligibleForReview` (`useOrderStore.ts`), `WriteReviewModal`, `ProductReviewsSection`, and `OrderDetailView` enforce `DCR-014` (`O-010`) eligibility (`DELIVERED` or settled Try & Buy kept item); verified in `orders-reviews-tracking.test.tsx`.

---

## Phase 11 — Support Tickets

**Status:** [x]

- [x] Ticket creation.
- [x] Ticket listing/status.

**Evidence:** `useSupportStore` and `src/app/support.tsx` use canonical categories, `priority`, `description`, real backend error alerts, and `CLOSED`/`resolutionRemarks` rendering (`orders-reviews-tracking.test.tsx`).

---

## Phase 12 — Sentry Integration

**Status:** [x]

- [x] Sentry SDK setup (`src/services/sentry.ts` `initSentry()`, `app.json` `@sentry/react-native/expo` plugin, `.env.production.example` `EXPO_PUBLIC_SENTRY_DSN`).
- [x] Error capture (`initSentry()` boot + `AppErrorBoundary` calling `captureException()` in `src/app/_layout.tsx`).

**Evidence:** Verified after native Android Firebase Auth/FCM (`#35`) updates via `npx tsc --noEmit`, `npm run lint`, `npx expo-doctor`, `npx jest --no-cache`, and `npx expo export --platform web`.

---

## Phase 13 — Integration Testing

**Status:** [x]

- [x] Jest + React Native Testing Library suites covering auth/403/session/deletion/reset, native Android `@react-native-firebase/{app,auth,messaging}` Phone OTP + FCM lifecycle + missing `google-services.json` dev/prod guards, cart buckets/coupons/serviceability/Razorpay, and orders/DCR-014 reviews/TrackingSocket/support/notifications.

**Evidence:** Verified via `npx jest --no-cache` across `auth-flow.test.tsx`, `firebase-native.test.tsx`, `cart-checkout-razorpay.test.ts`, and `orders-reviews-tracking.test.tsx`.

---

## Phase 14 — Build and Release

**Status:** [~]

- [ ] Android release build (Gradle signing/minify/`google-services.json` guard configured; release AAB/APK build pending production signing keystore & `google-services.json`).
- [ ] Play Store configuration.

**Evidence:** Android build configs updated; release artifact compilation not run on local environment without production keystore/`google-services.json`.

---

# 4. Current Blockers

| ID | Blocker | Affected Phase | Status |
|---|---|---|---|
| B-CUST-01 | Final architecture not yet created | All phases | RESOLVED |
| B-CUST-02 | Exact customer profile fields | Phase 3 | OPEN |
| B-CUST-03 | Multi-vendor cart behavior | Phase 5/7 | OPEN |
| B-CUST-04 | Checkout pricing composition | Phase 7 | OPEN |
| B-CUST-05 | Review eligibility rules | Phase 10 | RESOLVED (DCR-014 / O-010) |
| B-CUST-06 | Notification event catalog | Phase 9 | OPEN |

---

# 5. Scope-Change Register

No scope changes recorded.

| ID | Date | Change | Impact | Decision | Status |
|---|---|---|---|---|---|
| — | — | — | — | — | — |

---

# 6. Next Action

**2026-11-12 Wave 2 Follow-up (`#35` — Native Android Firebase Phone Auth & FCM Parity):**
- **Native Firebase Auth & FCM Bridge:** Added `@react-native-firebase/app@^26.4.2`, `@react-native-firebase/auth@^26.4.2`, and `@react-native-firebase/messaging@^26.4.2` (`package.json`, corrected `react-native-safe-area-context` to `~5.7.0`), split native vs web bundling cleanly (`src/services/firebaseTypes.ts`, `src/services/firebaseNative.native.ts`, `src/services/firebaseNative.ts`), and wired unified Phone OTP + token refresh (`onIdTokenChanged`, 50-min refresh, `getIdToken`, `signOut`) in `src/services/firebase.ts` and `src/components/auth-modal.tsx`.
- **Resilient Dev vs Production Behavior (`D-035`):** `AuthModal` uses native `@react-native-firebase/auth` whenever `google-services.json` initializes Firebase on Android (`getApps().length > 0`) and Web `firebase/auth` reCAPTCHA on web; when unconfigured (`google-services.json` absent), dev (`__DEV__`) falls back cleanly to backend dev OTP while production (`!__DEV__`) blocks login cleanly without calling backend `/auth/phone/send-otp`. Fixed stale-token overwrite edge case in `useAuthStore.initializeAuth()` (`activeToken = getAuthToken() || storedToken`).
- **Native Android FCM (`notificationService.ts`):** Acquires real FCM tokens via `@react-native-firebase/messaging` `getToken`, configures `affordz_orders` Android channel + `expo-notifications` permissions, registers `setBackgroundMessageHandler`, wires foreground `onMessage`, background/cold-start `onNotificationOpenedApp`/`getInitialNotification` deep-linking, and `onTokenRefresh` -> backend `/api/v1/notifications/devices/register` re-sync, while retaining Web FCM and `if (file('google-services.json').exists())` Gradle guard.
- **Jest Coverage:** Updated `jest.config.js`, `jest.setup.ts`, `src/__tests__/auth-flow.test.tsx`, and added `src/__tests__/firebase-native.test.tsx`. Pending local Android Gradle APK/AAB compile until client supplies production `google-services.json` and upload keystore (`D-035`).

**2026-11-12 Wave 2 Completion (Auth, Razorpay, Live API Parity, FCM, Jest Suite):**
- **Auth & Account:** Wired Web Firebase Phone OTP (`src/services/firebase.ts`, `AuthModal` with `__DEV__`-only backend OTP fallback & Resend button), 50-min/401 single-retry Firebase ID token refresh and non-logout `403` handling (`src/services/api.ts`), startup session verification against `GET /api/v1/users/me`, logout reset hooks across cart/order/address/darkStore/support/trackingSocket/notifications (`src/store/useAuthStore.ts`), `EditProfileModal` `email: null` support + real error propagation, and `SettingsModal` `DELETE /api/v1/users/me` account deletion.
- **Hosted Razorpay & Deep Links:** Implemented `buildHostedCheckoutUrl`, `parsePaymentCallbackUrl` (`affordz://payment-callback`), `launchRazorpayCheckout` (`src/services/razorpay.ts`), and deep-link handling in `src/app/_layout.tsx`.
- **Live API Parity & DCR-014 Reviews / Tracking / Support:** Removed remaining `api.ts`/`useCartStore`/`useSupportStore`/`useAddressStore` mock fallbacks; added DB `CartItem.id` sync, `splitBuckets` delivery fee calculation, `giftWrap` `PATCH /api/v1/cart/preferences` persistence, and guest `previewAddress` separation; enforced `DCR-014` (`O-010`) review eligibility (`isOrderItemEligibleForReview` in `useOrderStore.ts`, `WriteReviewModal`, `ProductReviewsSection`, `OrderDetailView`); updated `TrackingSocketService` (`seq` dedupe, `ORDER_ARRIVED`, `TRY_AND_BUY_UPDATED`, `4001`/`4003` auth close stop, `disconnect` reset) and `TryAndBuySelectionCard`; aligned `support.tsx` & `useSupportStore.ts` to canonical backend categories/priorities/resolution fields.
- **Notifications & Android Build Guard:** Wired `expo-notifications` + Web FCM in `src/services/notificationService.ts` returning `null` cleanly when unconfigured, added `"expo-notifications"` to `app.json`, and guarded `com.google.gms.google-services` in `android/build.gradle` & `android/app/build.gradle` with `file('google-services.json').exists()` (`D-035`).
- **Verification (post-final-edit):** `npx tsc --noEmit` (exit 0), `npm run lint` (exit 0; 0 errors, 46 warnings), `npx expo-doctor` (exit 0; 21/21 checks passed), `npx jest --no-cache` (exit 0; 3 suites, 15/15 tests passed across `auth-flow.test.tsx`, `cart-checkout-razorpay.test.ts`, `orders-reviews-tracking.test.tsx`), and `npx expo export --platform web` (exit 0; 3527 server / 3495 web modules, 12 static routes). Android release APK/AAB build pending production signing keystore & `google-services.json`.

**2026-11-11 Wave 1 Completion (Phases A, E, G) — Standing By for Wave 2 Backend Sync:**
- **Phase A:** Removed hardcoded Google Maps fallback (`app.config.js`), gitignored `.env.production` (`.gitignore`), updated `.env.production.example`, standardized `affordz://` & removed `ios` scripts/targets (`package.json`, `app.json`, `src/services/razorpay.ts`, `src/app/cart.tsx` `concierge@affordz.in`), configured Android release signing/minify/Maps meta-data (`android/gradle.properties`, `android/app/build.gradle`, `AndroidManifest.xml`), and aligned Expo/Maps deps via `npx expo install --fix`.
- **Phase E:** Removed `BagView` (`src/components/views/bag-view.tsx`, `src/components/bag/*`), `VAULT_EXCLUSIVE_DEALS`, and `TodayLookSection`/`visual-search-modal.tsx`/BOGO/`DEFAULT_PRODUCTS` mock fallbacks across screens; enforced `addressServiceability.isServiceable` checkout guards; isolated Buy Now (`activeDeliveryFee`/`activeTaxes`, `selectedInstruction`, `isBuyNow` verify payload, no `clearCart()`) & mixed-cart Try & Buy (`DARK_STORE` items only); fixed `OrderDetailView`, `TrackingScreen`, `SupportScreen`, `HomeHeader` -> `NotificationModal`, `ExploreCatalogView` query handoff, `AccountView`, `Footer`, and live hub sync (`useDarkStore`/`useAddressStore`).
- **Phase G:** Wired `initSentry()` + `AppErrorBoundary` `captureException()`, fixed all 16 ESLint errors, replaced `useNativeDriver: true` with `Platform.OS !== 'web'`, removed CSS `!important` font masks & `console.warn` suppression, improved `Icon`/`SplashScreen`/`LazyImage`/`AnimatedPriceTicker`/`HeroBannerSection`/`BottomNavBar`/`AnimatedPressable`/`SelectDarkStoreModal` + `Fonts`, and removed confirmed dead files/assets while keeping `firebase.ts`, `sentry.ts`, `notification-modal.tsx`, `explore-catalog-view.tsx`, `common/typography.tsx`, and `home/bottom-nav-bar.tsx`.
- **Checks (post-final-edit & `npx expo install --fix`):** `npx tsc --noEmit` (exit 0), `npm run lint` (0 errors, 58 warnings), `npx expo-doctor` (21/21 checks passed), `npx expo export --platform web` (exit 0, 3447 server + 3415 web modules, 12 static routes). Android Gradle build not run yet.
- **Wave 2 Pending:** Firebase Phone Auth cutover, Hosted Razorpay `affordz://payment-callback`, removing remaining `api.ts`/`useCartStore`/`useSupportStore` offline fallbacks, `403`, `DELETE /users/me`, `O-010` reviews, native FCM SDK, and Jest suite after `@backend` contract sync.

**2026-11-11 Order Management Cutover Verification:**
- Synced shared contracts into `src/contracts/order-contracts.ts` via `kudicart-backend/scripts/sync-contracts.js`.
- Verified `npx tsc --noEmit` exits with code 0 after Order Management checkout/split-order/Try & Buy/WS tracking integration updates.
