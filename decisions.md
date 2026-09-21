# KudiCart Customer App — Decisions

> **Purpose:** Record decisions that are approved for the Customer App repository and must not be casually changed.
>
> For the full project decision record, see the master `KudiCart_decisions.md` in the root Kudicart directory.

---

# 1. How This File Is Used

These decisions are constraints for development of the Customer App. When a new request conflicts with a locked decision:

1. Do not silently override the decision.
2. Identify the conflicting decision.
3. Explain the impact of changing it.
4. Treat the change as an explicit decision/scope change before implementation.

---

# 2. Decision Status

- `LOCKED` — approved; implementation must follow it.
- `OPEN` — not yet decided; do not invent a permanent rule.
- `SUPERSEDED` — replaced by a newer recorded decision.

---

# 3. Technology Decisions

## D-CUST-01 — Mobile Framework

**Status:** `LOCKED`

The Customer mobile application will be built with **React Native** using **TypeScript**.

---

## D-CUST-02 — Authentication

**Status:** `LOCKED`

Customer authentication uses **Firebase Authentication** with **Phone / OTP** login.

The app must NOT introduce a second independent authentication system.

---

## D-CUST-03 — Push Notifications

**Status:** `LOCKED`

**Firebase Cloud Messaging (FCM)** is the push notification provider.

The Customer App registers device tokens and handles incoming push notifications.

---

## D-CUST-04 — Payment SDK

**Status:** `LOCKED`

**Razorpay** is the single payment gateway. The Customer App integrates the Razorpay client SDK for payment UI.

No second payment provider shall be introduced.

---

## D-CUST-05 — Error Tracking

**Status:** `LOCKED`

**Sentry** is the error-tracking service for the Customer App.

---

## D-CUST-06 — API Communication

**Status:** `LOCKED`

The Customer App communicates with the **common KudiCart NestJS Backend** via REST API.

The app does NOT connect directly to the PostgreSQL database.

---

## D-CUST-07 — Distribution Target

**Status:** `LOCKED`

Current distribution target: **Google Play Store only.**

iOS / Apple App Store is NOT part of the current implementation target.

---

# 4. Scope Decisions

## D-CUST-08 — No Authoritative Business Logic

**Status:** `LOCKED`

The Customer App is a presentation layer. It does NOT own:

- Pricing calculation.
- Payment verification.
- Order-state validation.
- Role authorization.

These are owned by the backend.

---

## D-CUST-09 — Excluded Features

**Status:** `LOCKED`

The Customer App must NOT implement UI or logic for:

- Coupons.
- Combo/bundle products.
- Loyalty programs.
- Referral systems.
- Wallet.
- Subscriptions.
- AI recommendations.
- Delivery zones or serviceability.
- Live chat.
- Multi-language support.
- Multi-currency support.
- Vendor/admin screens.
- Delivery partner screens.

---

## D-CUST-10 — Shared Code with Driver App

**Status:** `LOCKED`

The Customer App and Driver App may share appropriate internal components, types, API-client logic, authentication plumbing, and other genuinely reusable code where that improves maintainability without creating unnecessary coupling.

---

# 5. Account Ownership

## D-CUST-11 — Production Accounts

**Status:** `LOCKED`

Production third-party accounts (Firebase, Razorpay, Sentry, Google Play Console) must be **Client-owned**.

Developers configure using access granted by the Client.

---

# 6. Open Decisions (Customer App)

| ID | Decision still required |
|---|---|
| O-CUST-01 | Exact customer profile fields |
| O-CUST-02 | Multi-vendor cart behavior |
| O-CUST-03 | Checkout pricing composition display |
| O-CUST-04 | Review eligibility rules |
| O-CUST-05 | Support ticket UI model |
| O-CUST-06 | Notification event catalog (customer) |
| O-CUST-07 | Product detail display fields |
| O-CUST-08 | State management library choice |
| O-CUST-09 | Navigation library choice |

---

# 7. Decision Precedence

For the Customer App, use the following precedence:

1. Explicitly approved decision in the master `KudiCart_decisions.md`
2. This file's locked decisions
3. Approved product specification
4. Current design/implementation plan
5. Prototype behavior
6. AI assumptions / industry convention

---

# 8. Change Control

A decision may be changed only when the change is explicit and recorded. Do not silently edit a LOCKED decision.
