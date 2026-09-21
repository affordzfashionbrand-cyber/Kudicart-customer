# KudiCart Customer App — Implementation Plan

> **Purpose:** Bounded execution plan for the Customer App repository.
>
> This plan covers only the Customer Mobile Application. Backend API, database, and server-side logic are planned in `kudicart-backend/PLAN.md`.

---

# 1. Plan Status

**Status:** PRE-ARCHITECTURE PLAN

This plan must not be interpreted as authorization to invent architecture. After the final architecture artifact is approved, this plan may be amended to bind work packages to exact project structure.

---

# 2. Dependency Order

```text
Final Architecture Approved
        ↓
Project / Dev Foundation Setup
        ↓
Firebase Auth Integration (Phone/OTP)
        ↓
Customer Profile Screens
        ↓
Catalog Browsing (Categories + Products)
        ↓
Product Detail Screen
        ↓
Cart Management
        ↓
Address Management
        ↓
Checkout Flow
        ↓
Razorpay Payment UI Integration
        ↓
Order Placement + Confirmation
        ↓
Order History + Order Tracking
        ↓
FCM Push Notification Integration
        ↓
In-App Notification Feed
        ↓
Reviews + Ratings UI
        ↓
Support Tickets UI
        ↓
Sentry Integration
        ↓
Cross-Flow Integration Testing
        ↓
Build / Release Validation (APK / Play Store)
```

---

# 3. Phase 1 — Project Foundation

**Status:** [ ] Not started

### Scope

- [ ] React Native project initialization (TypeScript).
- [ ] Package/dependency setup.
- [ ] Navigation framework setup.
- [ ] State management setup.
- [ ] API client foundation (base URL, auth headers, error handling).
- [ ] Environment variable configuration.
- [ ] Linting / formatting configuration.
- [ ] Basic app startup and splash screen.

### Verification

- [ ] App builds and runs on Android emulator.
- [ ] Development commands documented.
- [ ] No excluded feature modules created.

---

# 4. Phase 2 — Firebase Authentication

**Status:** [ ] Not started

### Scope

- [ ] Firebase SDK setup.
- [ ] Phone/OTP login screen.
- [ ] OTP verification screen.
- [ ] Firebase ID token retrieval.
- [ ] Token attachment to API calls.
- [ ] Auth state persistence.
- [ ] Logout flow.

### Verification

- [ ] Customer can login with phone/OTP.
- [ ] ID token is sent to backend.
- [ ] Auth state persists across app restarts.
- [ ] Logout clears auth state.

---

# 5. Phase 3 — Customer Profile

**Status:** [ ] Not started

### Scope

- [ ] Profile screen.
- [ ] Profile edit functionality.
- [ ] Profile data from backend API.

### Verification

- [ ] Customer sees their profile.
- [ ] Profile updates reflect correctly.

---

# 6. Phase 4 — Catalog Browsing

**Status:** [ ] Not started

### Scope

- [ ] Home screen with categories.
- [ ] Category listing screen.
- [ ] Product listing by category.
- [ ] Product search (if specified).
- [ ] Product detail screen with images, pricing, stock.

### Verification

- [ ] Categories display from backend.
- [ ] Products display by category.
- [ ] Product detail shows correct info and images.

---

# 7. Phase 5 — Cart Management

**Status:** [ ] Not started

### Scope

- [ ] Add to cart from product detail.
- [ ] Cart screen with items list.
- [ ] Update item quantity.
- [ ] Remove items.
- [ ] Cart subtotal display.

### Verification

- [ ] Cart operations work correctly.
- [ ] Only the customer's cart is accessible.

---

# 8. Phase 6 — Address Management

**Status:** [ ] Not started

### Scope

- [ ] Address list screen.
- [ ] Add new address form.
- [ ] Edit existing address.
- [ ] Delete address.
- [ ] Select address during checkout.

### Verification

- [ ] CRUD operations work.
- [ ] Address selection available during checkout.

---

# 9. Phase 7 — Checkout and Payment

**Status:** [ ] Not started

### Scope

- [ ] Checkout summary screen.
- [ ] Payment method selection (Razorpay / COD).
- [ ] Razorpay SDK integration.
- [ ] Payment initiation flow.
- [ ] Payment success/failure handling.
- [ ] COD flow.
- [ ] Order confirmation screen.

### Verification

- [ ] Razorpay payment UI opens correctly.
- [ ] Payment success creates an order.
- [ ] Payment failure shows appropriate error.
- [ ] COD order creation works.

---

# 10. Phase 8 — Order History and Tracking

**Status:** [ ] Not started

### Scope

- [ ] Order history list screen.
- [ ] Order detail screen.
- [ ] Order status timeline/progression.
- [ ] Real-time or polling status updates.

### Verification

- [ ] Customer sees their orders only.
- [ ] Order status progression displays correctly.
- [ ] Order details are accurate.

---

# 11. Phase 9 — Notifications

**Status:** [ ] Not started

### Scope

- [ ] FCM SDK setup.
- [ ] Device token registration with backend.
- [ ] Push notification handling (foreground + background).
- [ ] In-app notification feed screen.
- [ ] Notification tap navigation.

### Verification

- [ ] Push notifications are received.
- [ ] In-app feed displays correctly.
- [ ] Tapping a notification navigates to the relevant screen.

---

# 12. Phase 10 — Reviews and Ratings

**Status:** [ ] Not started

### Scope

- [ ] Review submission screen (for delivered orders).
- [ ] Star rating input.
- [ ] Review text input.
- [ ] Review display on product detail.

### Verification

- [ ] Customer can submit a review for an eligible order.
- [ ] Reviews display correctly.

---

# 13. Phase 11 — Support Tickets

**Status:** [ ] Not started

### Scope

- [ ] Create ticket screen.
- [ ] Ticket list / history screen.
- [ ] Ticket detail / status screen.

### Verification

- [ ] Customer can create tickets.
- [ ] Customer can view ticket status.

---

# 14. Phase 12 — Sentry Integration

**Status:** [ ] Not started

### Scope

- [ ] Sentry SDK setup.
- [ ] Error capture configuration.
- [ ] Environment-aware reporting.

### Verification

- [ ] Test errors are captured in Sentry.
- [ ] Sensitive data is not exposed.

---

# 15. Phase 13 — Integration Testing and Polish

**Status:** [ ] Not started

### Scope

- [ ] End-to-end customer flow testing.
- [ ] Browse → Cart → Checkout → Order → Track.
- [ ] Payment flow testing.
- [ ] Notification flow testing.
- [ ] Error handling review.
- [ ] UI polish and responsive layout.

---

# 16. Phase 14 — Build and Release

**Status:** [ ] Not started

### Scope

- [ ] Android release build (APK/AAB).
- [ ] Google Play Store configuration.
- [ ] App signing.
- [ ] Production environment variables.

### Verification

- [ ] Release build installs and runs correctly.
- [ ] Production API endpoints work.
- [ ] Firebase production config is used.

---

# 17. Implementation Gate

Before implementing any phase:

1. Confirm the final architecture is approved.
2. Identify requirements being implemented.
3. Identify locked decisions that apply.
4. Implement only the bounded unit.
5. Verify before marking complete.
