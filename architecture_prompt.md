# KudiCart Customer App — Architecture Prompt

> **Purpose:** Guide the creation of the Customer App's detailed architecture, derived from the master KudiCart architecture.
>
> This prompt focuses specifically on the React Native Customer Mobile Application.

---

# 1. Context

The Customer App is one of four repositories in the KudiCart ecosystem:

1. **kudicart-customer-app** ← THIS
2. kudicart-driver-app
3. kudicart-admin-vendor-web
4. kudicart-backend

The Customer App is a React Native mobile application that provides the consumer shopping experience. It communicates with the common KudiCart backend via REST API.

---

# 2. Architecture Decisions Required

## React Native Project Structure

- Folder/module organization.
- Screen organization by feature or by type.
- Component organization (shared, feature-specific).
- Navigation structure (stack, tab, drawer).
- Asset organization.

## State Management

- State management library selection.
- Auth state architecture.
- Cart state architecture.
- API response caching strategy.
- Loading/error state patterns.

## API Client

- HTTP client library.
- Base URL configuration.
- Auth token injection.
- Request/response interceptors.
- Error handling and retry strategy.
- Type-safe API contracts.

## Authentication

- Firebase SDK integration.
- Phone/OTP flow implementation.
- Token lifecycle management.
- Auth persistence.
- Protected route handling.

## Payment Integration

- Razorpay React Native SDK setup.
- Payment flow architecture.
- Handling payment callbacks.
- Error/failure handling.

## Push Notifications

- FCM React Native integration.
- Token registration flow.
- Foreground notification handling.
- Background notification handling.
- Deep link / navigation on tap.

## Error Tracking

- Sentry React Native setup.
- Error boundary patterns.
- Environment configuration.

## Shared Code Strategy

- Shared types/interfaces with kudicart-driver-app.
- Shared API client utilities.
- Shared components.
- Package management (monorepo or symlinks or npm packages).

---

# 3. Technology Stack

| Concern | Technology |
|---|---|
| Framework | React Native |
| Language | TypeScript |
| Auth | Firebase Authentication (Phone/OTP) |
| Push | Firebase Cloud Messaging (FCM) |
| Payment | Razorpay SDK |
| Error Tracking | Sentry |
| API | REST (to kudicart-backend) |
| Target | Android / Google Play Store |

---

# 4. Screen Architecture

The Customer App should have screens organized around these flows:

### Auth Flow
- Splash → Login (Phone) → OTP Verification → Home

### Main Flow (Tab Navigation)
- Home / Categories
- Cart
- Orders
- Notifications
- Profile / Account

### Feature Screens
- Product List (by category)
- Product Detail
- Address Management (list, add, edit)
- Checkout Summary
- Payment
- Order Detail / Tracking
- Review Submission
- Support Tickets (list, create, detail)
- Settings

---

# 5. Constraints

1. The app does NOT own business logic — it is a presentation layer.
2. Payment success must be verified by the backend.
3. No direct database access.
4. No excluded feature UI (coupons, combos, loyalty, etc.).
5. Google Play Store only (current round).
6. Firebase phone/OTP is the only auth method.
7. All API calls must include the Firebase ID token.

---

# 6. Quality Requirements

- Production-oriented code quality.
- Consistent error handling.
- Loading state management.
- Offline-graceful behavior.
- Accessible UI patterns.
- Testable component architecture.
- Sentry integration for error visibility.

---

# 7. Architecture Output Expected

The Customer App architecture should define:

1. Complete folder structure with responsibilities.
2. Navigation architecture.
3. State management approach.
4. API client architecture.
5. Authentication flow architecture.
6. Payment integration architecture.
7. Notification architecture.
8. Error handling patterns.
9. Shared code strategy with driver app.
10. Testing strategy.
11. Build/release process.
12. Environment/secrets management.

---

# 8. Explicit Exclusions

Do NOT architect:

- Vendor/admin screens.
- Delivery partner screens.
- Direct database connections.
- Second auth system.
- Coupon/combo/loyalty/wallet/subscription UI.
- AI recommendation engine.
- Delivery zone/serviceability UI.
- Live chat.
- Multi-language/multi-currency.
- iOS build/release infrastructure.
