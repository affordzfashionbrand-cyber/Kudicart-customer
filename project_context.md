# KudiCart Customer App — Project Context

> **Purpose:** Durable project context for the KudiCart Customer Mobile Application.
>
> This file records the business/product context, known scope, current technology decisions, important constraints, and boundaries for the Customer App repository. It is intended to prevent context loss and accidental scope drift across development sessions.
>
> **Important:** This file covers only the **Customer Mobile Application**. For backend API, database, and server-side business logic, see `kudicart-backend/`. For admin/vendor web, see `kudicart-admin-vendor-web/`. For delivery partner mobile, see `kudicart-driver-app/`.

---

# 1. Repository Overview

This repository contains the **KudiCart Customer Mobile Application** — a React Native application targeting Android (Google Play Store only for the current round).

The Customer App is the primary consumer-facing surface of the KudiCart marketplace. It provides the shopping experience: product discovery, cart management, checkout, order tracking, reviews, notifications, and support tickets.

All business logic, data persistence, payment verification, and authorization are handled by the **common KudiCart backend** (`kudicart-backend`). This application is a **presentation/client layer** — it does not own authoritative business rules.

---

# 2. System Position

```text
kudicart-customer-app   ← THIS REPOSITORY
kudicart-driver-app
kudicart-admin-vendor-web
        ↓
  Common KudiCart Backend (kudicart-backend)
        ↓
  Supabase PostgreSQL
```

The Customer App communicates exclusively with the KudiCart Backend via REST API. It does not connect directly to the database.

---

# 3. Prototype Reference

Current prototype reference:

`https://prototypedemo-mocha.vercel.app/`

The prototype informs UI/UX direction for the customer-facing screens. Visual elements must not be interpreted as authorization to add functionality outside the approved scope.

---

# 4. Actor — Customer

The Customer is the end user who:

- Discovers products and browses the catalog.
- Manages a shopping cart.
- Manages delivery addresses.
- Completes checkout and places orders.
- Selects or uses applicable payment methods (Razorpay / COD).
- Tracks order progress through the canonical lifecycle.
- Submits reviews and ratings.
- Receives push notifications and views the in-app notification feed.
- Creates and manages support tickets.

### Customer Does NOT:

- Perform vendor administration.
- Manage global catalog or categories.
- Assign delivery partners.
- Access marketplace-wide financial data.
- Access other customers' data.
- Own authoritative pricing, payment verification, or order-state validation.

---

# 5. Core Customer Flows

## Shopping Flow

```text
Browse Categories / Products
      ↓
Product Detail (images, info, pricing)
      ↓
Add to Cart
      ↓
Cart Review
      ↓
Address Selection / Management
      ↓
Checkout
      ↓
Payment Method (Razorpay / COD)
      ↓
Payment Processing (where applicable)
      ↓
Order Placed
```

## Order Tracking Flow

```text
Order History
      ↓
Order Detail
      ↓
Status Progression:
  PLACED → ACCEPTED → PREPARING → READY_FOR_PICKUP
  → ASSIGNED → PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
```

## Post-Order Flow

```text
Delivered
      ↓
Submit Review / Rating
      ↓
Create Support Ticket (if needed)
```

---

# 6. Authentication

- **Method:** Firebase Authentication with **Phone / OTP**.
- The app handles Firebase phone authentication flow.
- Firebase ID tokens are sent to the backend for verification.
- The backend resolves the application user, role, and profile.
- The app does NOT implement a second custom authentication system.

---

# 7. Technology Stack (Customer App)

| Concern | Technology |
|---|---|
| Framework | React Native |
| Language | TypeScript |
| Authentication | Firebase Authentication (Phone/OTP) |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Payment UI | Razorpay SDK |
| Error Tracking | Sentry |
| API Communication | REST API to kudicart-backend |
| Distribution Target | Google Play Store only (current round) |

---

# 8. Third-Party Integrations (Client-Side)

| Service | Customer App Responsibility |
|---|---|
| Firebase Auth | Phone/OTP login flow, token management |
| FCM | Notification token registration, push handling, foreground/background |
| Razorpay | Payment UI SDK integration, payment initiation |
| Sentry | Error capture and reporting |

All server-side integrations (Razorpay verification, FCM server dispatch, Cloudinary, Google Maps) are handled by `kudicart-backend`.

---

# 9. Customer App Owns

- Shopping UX (browsing, product details, images).
- Cart UX (add, update, remove items, review).
- Checkout UX (address selection, payment method).
- Order visibility and tracking UX.
- Customer account/profile UX.
- Notification presentation (in-app feed + push).
- Review/rating submission UX.
- Support ticket interaction UX.
- Firebase phone/OTP authentication flow.
- FCM token registration and push handling.
- Razorpay payment UI initiation.
- Sentry client-side error capture.

---

# 10. Customer App Does NOT Own (Authoritative)

- Pricing calculation.
- Payment verification/processing.
- Order-state validation or transitions.
- Role authorization.
- Vendor data access.
- Business rule enforcement.
- Database access.
- Media storage/processing (Cloudinary is backend-managed).

These are owned by `kudicart-backend`.

---

# 11. Shared Code Opportunity

The Customer App and Driver App (`kudicart-driver-app`) are both React Native applications. They may share:

- Common types and API client logic.
- Authentication plumbing (Firebase phone/OTP).
- FCM notification handling utilities.
- Sentry configuration patterns.
- Common UI components where genuinely reusable.

Sharing must improve maintainability without creating unnecessary coupling.

---

# 12. Hard Scope Exclusions (Customer App)

The Customer App must NOT implement:

- Coupon UI or logic.
- Combo/bundle product UI.
- Loyalty/referral/wallet UI.
- Subscription UI.
- AI recommendations.
- Delivery zone/serviceability UI.
- Live chat.
- Multi-language support.
- Multi-currency support.
- Vendor administration screens.
- Admin screens.
- Delivery partner screens.
- Direct database access.

---

# 13. Mobile Distribution

**Current target:** Google Play Store only.

iOS / Apple App Store is NOT part of the current implementation target. Do not add Apple-specific build/release infrastructure unless explicitly approved.

---

# 14. Production Account Ownership

Production third-party accounts (Firebase, Razorpay, Sentry, Google Play Console) are **Client-owned**.

Developers configure and integrate using access supplied by the Client.

---

# 15. Environment Configuration

The Customer App requires:

- Firebase configuration (google-services.json / equivalent).
- Backend API base URL.
- Razorpay key (public/client key only).
- Sentry DSN.
- FCM configuration.

**No production secrets should be committed to source control.**

---

# 16. Cross-Repository References

| Need | Repository |
|---|---|
| Backend API contracts | `kudicart-backend` |
| Shared types/API client | Shared package (TBD by architecture) |
| Admin/Vendor web | `kudicart-admin-vendor-web` |
| Driver app | `kudicart-driver-app` |

---

# 17. Antigravity Instruction

Read this document before beginning work in a new Customer App session.

Use it to recover the customer app's durable context, but do not infer unrecorded requirements from it.

When a request appears to expand scope, change a foundational technology choice, or contradict a documented decision, stop and surface the discrepancy instead of silently implementing.
