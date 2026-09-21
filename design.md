# KudiCart Customer App — System Design

> **Purpose:** Define the product-level system design for the Customer Mobile Application.
>
> This document explains how the Customer App's responsibilities, UI flows, client behavior, and integration boundaries fit together. Server-side business logic and data persistence are documented in `kudicart-backend/design.md`.

---

# 1. Design Objectives

The Customer App design must:

1. Provide a smooth, production-quality shopping experience.
2. Delegate all authoritative business rules to the backend.
3. Handle Firebase phone/OTP authentication.
4. Integrate Razorpay payment SDK for checkout.
5. Handle FCM push notifications and in-app feed.
6. Integrate Sentry for error tracking.
7. Support the complete customer journey: browse → cart → checkout → order → track → review → support.
8. Remain within the approved scope (no excluded features).

---

# 2. Customer App Architecture Position

```text
┌─────────────────────────┐
│  KudiCart Customer App   │  ← React Native (this repo)
│  (Presentation Layer)    │
└──────────┬──────────────┘
           │ REST API
           ▼
┌─────────────────────────┐
│  KudiCart Backend        │  ← NestJS (kudicart-backend)
│  (Business Authority)    │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  PostgreSQL (Supabase)   │
│  + External Services     │
└─────────────────────────┘
```

---

# 3. Authentication Design

```text
Customer opens app
      ↓
Enter phone number
      ↓
Firebase sends OTP
      ↓
Customer enters OTP
      ↓
Firebase verifies → Firebase ID Token
      ↓
App sends token to backend
      ↓
Backend verifies token → resolves user/role
      ↓
Customer session established
```

The app stores the Firebase auth state and includes the ID token in API requests.

---

# 4. Screen Flow Design

## 4.1 Catalog Flow

```text
Home / Categories
      ↓
Category Products List
      ↓
Product Detail (images, info, pricing, stock)
      ↓
Add to Cart
```

## 4.2 Cart and Checkout Flow

```text
Cart Screen (items, quantities, subtotal)
      ↓
Address Selection / Add New Address
      ↓
Checkout Summary
      ↓
Payment Method Selection (Razorpay / COD)
      ↓
[If Razorpay] → Razorpay SDK Payment UI
      ↓
Backend creates order → Order Confirmation
```

## 4.3 Order Tracking Flow

```text
Order History List
      ↓
Order Detail
      ↓
Status Timeline:
  PLACED → ACCEPTED → PREPARING → READY_FOR_PICKUP
  → ASSIGNED → PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
```

## 4.4 Review Flow

```text
Delivered Order
      ↓
Submit Rating (stars)
      ↓
Submit Review (text)
      ↓
Confirmation
```

## 4.5 Support Flow

```text
Support / Help
      ↓
Create New Ticket
      ↓
View Ticket Status
      ↓
View Ticket History
```

## 4.6 Notification Flow

```text
Push Notification Received
      ↓
Display in notification tray
      ↓
Tap → Navigate to relevant screen

In-App Notification Feed
      ↓
List of notifications from backend
```

---

# 5. Payment Design (Client-Side)

```text
Customer selects "Pay Online"
      ↓
App calls backend → backend creates Razorpay order
      ↓
App opens Razorpay SDK checkout
      ↓
Customer completes payment in Razorpay
      ↓
Razorpay returns result to app
      ↓
App sends payment details to backend for verification
      ↓
Backend verifies with Razorpay → creates order
      ↓
App shows order confirmation or failure
```

**Critical:** Client-side payment success is NOT authoritative. The backend always verifies.

For **COD:**

```text
Customer selects "Cash on Delivery"
      ↓
App calls backend → backend creates order with COD
      ↓
App shows order confirmation
```

---

# 6. Notification Design (Client-Side)

- **FCM Token:** On app start / login, register the device's FCM token with the backend.
- **Foreground Push:** Display an in-app notification banner.
- **Background Push:** Display system notification; handle tap to navigate.
- **In-App Feed:** Fetch persisted notifications from the backend API.

---

# 7. State Management Design

The Customer App should manage:

| State Type | Examples |
|---|---|
| Auth state | Firebase user, ID token, login status |
| User profile | Customer name, phone, profile data |
| Cart state | Cart items, quantities, subtotals |
| Address state | Saved addresses, selected address |
| Order state | Current orders, order history |
| Notification state | Unread count, notification list |
| UI state | Loading, errors, navigation |

The exact state management library is an open decision.

---

# 8. API Communication Design

```text
App → [Auth Token in Header] → Backend REST API
      ↓
Backend validates token
      ↓
Backend returns response
      ↓
App updates local state / UI
```

All API calls include the Firebase ID token for authentication.

Error responses from the backend should be converted into actionable user feedback.

---

# 9. Error Handling Design

| Error Type | Handling |
|---|---|
| Input/validation errors | Show inline field errors |
| Auth errors | Redirect to login |
| Network errors | Show retry/offline message |
| Payment errors | Show payment failure, allow retry |
| Business rule errors | Show backend error message |
| Unexpected errors | Capture in Sentry, show generic error |

---

# 10. Offline / Loading Design

- Show loading indicators during API calls.
- Handle network failure gracefully with retry options.
- Do not cache stale business data as authoritative.

---

# 11. Scope Protection

The Customer App must NOT implement UI/logic for:

- Coupon entry or application.
- Combo/bundle product display.
- Loyalty points or referral codes.
- Wallet balance or top-up.
- Subscription plans.
- AI product recommendations.
- Delivery zone checks or serviceability.
- Live chat with support agents.
- Multi-language switching.
- Multi-currency display.
- Vendor or admin functionality.

---

# 12. Antigravity Instructions

Before implementing a customer app feature:

1. Read this design and the customer app specification.
2. Identify which requirement the feature satisfies.
3. Confirm the feature is not excluded.
4. Keep business logic on the backend — the app is a presentation layer.
5. Do not invent missing requirements.
6. Do not use the prototype alone to justify adding functionality.
