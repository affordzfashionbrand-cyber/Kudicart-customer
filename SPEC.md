# KudiCart Customer App — Product Specification

> **Purpose:** Define the approved product requirements and verifiable acceptance criteria for the Customer Mobile Application.
>
> **This document defines WHAT the Customer App must do, not HOW it must be built.**
> Backend API behavior, database design, and server-side business logic are specified in `kudicart-backend/SPEC.md`.

---

# 1. Product Goal (Customer App)

The Customer App is the consumer-facing React Native mobile application for the KudiCart marketplace. It must provide the complete customer shopping experience from product discovery through order placement, tracking, reviews, and support — while delegating all business authority to the backend.

---

# 2. Functional Requirements

## 2.1 Authentication

### R-CUST-01 — Phone/OTP Authentication
Customers shall be able to authenticate using Firebase Authentication with phone/OTP login.

---

## 2.2 Profile

### R-CUST-02 — Profile Management
Customers shall be able to access and manage their applicable profile/account information.

---

## 2.3 Catalog and Product Discovery

### R-CUST-03 — Catalog Browsing
Customers shall be able to browse the available product catalog.

### R-CUST-04 — Category Browsing
Customers shall be able to browse products by category.

### R-CUST-05 — Product Details
Customers shall be able to open a product-detail view containing applicable product information and images.

---

## 2.4 Cart and Address

### R-CUST-06 — Cart
Customers shall be able to add products to a cart, view cart contents, manage cart items, and proceed through the supported checkout flow.

### R-CUST-07 — Address Management
Customers shall be able to add, view, update, and otherwise manage addresses required by the supported order flow.

---

## 2.5 Checkout and Orders

### R-CUST-08 — Checkout and Payment UI
Customers shall be able to complete the supported checkout flow and interact with the application's payment-related UI.

### R-CUST-09 — Order Placement
Customers shall be able to place an order through the supported order flow.

### R-CUST-10 — Order History
Customers shall be able to view their relevant order history and order details.

### R-CUST-11 — Order Status Tracking
Customers shall be able to view the progression of their order through the supported order states:

```text
PLACED → ACCEPTED → PREPARING → READY_FOR_PICKUP
→ ASSIGNED → PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
```

---

## 2.6 Reviews and Ratings

### R-CUST-12 — Reviews and Ratings
Customers shall be able to submit reviews and ratings in the supported review flow.

---

## 2.7 Notifications

### R-CUST-13 — Notifications
Customers shall be able to receive relevant push notifications and view the application's in-app notification feed.

---

## 2.8 Support

### R-CUST-14 — Support Tickets
Customers shall be able to create and manage support-ticket interactions within the supported ticket workflow.

---

# 3. Payment UI Requirements

### R-PAY-UI-01 — Razorpay Integration
The Customer App shall integrate the Razorpay SDK for the approved online payment flow.

### R-PAY-UI-02 — Payment Method Selection
The Customer App shall present the supported payment method selection (Online / COD).

### R-PAY-UI-03 — Payment Status Display
The Customer App shall display payment status outcomes (success / failure) as returned by the backend.

> **Note:** Payment verification is NOT authoritative on the client side. The backend verifies all payments server-side.

---

# 4. Push Notification Requirements

### R-NOTIF-CLIENT-01 — FCM Token Registration
The Customer App shall register the device's FCM token with the backend.

### R-NOTIF-CLIENT-02 — Push Handling
The Customer App shall handle incoming push notifications in foreground and background states.

### R-NOTIF-CLIENT-03 — In-App Feed
The Customer App shall display the in-app notification feed from the backend.

---

# 5. Platform Requirements

### R-PLAT-01 — React Native
The Customer App shall be built with React Native.

### R-PLAT-02 — Android Target
The current distribution target is **Google Play Store only**.

### R-PLAT-03 — Sentry Integration
The Customer App shall integrate Sentry for client-side error tracking.

---

# 6. Quality Requirements

### R-QA-CUST-01 — Functional Testing
Customer-facing functionality shall be functionally tested.

### R-QA-CUST-02 — Authentication Testing
Customer phone/OTP authentication shall be tested.

### R-QA-CUST-03 — Order Flow Testing
The complete customer order flow (browse → cart → checkout → order → tracking) shall be tested.

### R-QA-CUST-04 — Payment UI Testing
The Razorpay payment UI integration shall be tested.

---

# 7. Hard Constraints

1. The Customer App must NOT implement authoritative business rules — all business authority belongs to the backend.
2. Payment success shown by the client UI is NOT authoritative.
3. Client-supplied totals must NOT be trusted without server-side verification.
4. The app must NOT connect directly to PostgreSQL.
5. The app must NOT implement a second authentication system.
6. The app must NOT implement excluded features (coupons, combos, loyalty, wallet, subscriptions, AI recommendations, delivery zones, live chat, multi-language, multi-currency).

---

# 8. Acceptance Criteria (Customer App)

- [ ] AC-01: Customer can authenticate using phone/OTP through Firebase Authentication.
- [ ] AC-02: Customer can browse categories and products and open product details with images.
- [ ] AC-03: Customer can manage a cart, manage addresses, complete checkout, and place an order.
- [ ] AC-04: Customer can view order history and track order status progression.
- [ ] AC-05: Customer can submit reviews and ratings.
- [ ] AC-06: Customer receives push notifications and can view the in-app notification feed.
- [ ] AC-07: Customer can create and manage support tickets.
- [ ] AC-08: Razorpay payment UI works for the supported payment flow.
- [ ] AC-09: COD is selectable as a payment method.
- [ ] AC-10: Sentry captures client-side errors.
- [ ] AC-11: No excluded functionality is implemented.
- [ ] AC-12: The app targets Google Play Store only.

---

# 9. Open Questions (Customer App)

1. Exact customer profile fields.
2. Exact cart rules and whether an order may contain products from multiple vendors.
3. Exact checkout pricing composition (delivery fee, tax, commission presentation).
4. Exact review eligibility rules.
5. Exact support-ticket statuses and categories visible to customer.
6. Exact notification event catalog for customer-facing notifications.
7. Exact product detail fields and image display requirements.

These must be resolved through the project's decision process before the affected functionality is finalized.

---

# 10. Scope Change Rule

Any requirement not represented by this specification or an explicitly approved amendment must be treated as a scope change. Do not silently add features.
