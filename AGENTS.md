# KudiCart Customer App — AGENTS.md (Repository Operating Directive)

> **Authority level:** This is the repo-level operating directive for `kudicart-customer-app/`. It **inherits** all rules from the workspace-root `.agents/AGENTS.md` and adds customer-app-specific constraints. If a rule here conflicts with the root directive, the root directive wins.

---

## 1. Repository Identity

| Property | Value |
|---|---|
| Repository | `kudicart-customer-app` |
| Technology | React Native (TypeScript) |
| Role | **Consumer shopping experience** — presentation layer |
| Distribution | Google Play Store only (D-028) |
| Hosting | N/A (mobile binary) |

This is a **presentation layer**. It does NOT own business logic. All authoritative rules live in `kudicart-backend/`.

---

## 2. Repository-Level Document Map

```text
kudicart-customer-app/
├── AGENTS.md                ← THIS FILE
├── project_context.md       ← Customer app context
├── SPEC.md                  ← Customer-specific requirements
├── decisions.md             ← Customer-app locked decisions
├── design.md                ← Customer UX flows and design
├── PLAN.md                  ← Customer app plan (14 phases)
├── progress.md              ← Customer app progress tracker
├── architecture_prompt.md   ← Customer app architecture guidance
└── src/                     ← Application code (gated by §3)
```

### Context Loading Order

```text
1. .agents/AGENTS.md                    → workspace-wide rules
2. kudicart-customer-app/AGENTS.md      → THIS FILE (repo rules)
3. kudicart-customer-app/progress.md    → current phase, blockers
4. kudicart-customer-app/decisions.md   → locked tech + open decisions
5. kudicart-customer-app/PLAN.md        → active work package
6. KudiCart_progress.md                 → master project state
```

---

## 3. Code-Creation Gate (Customer App)

No customer app code may be created until:

1. The master `architecture.md` is approved.
2. The active phase in `kudicart-customer-app/PLAN.md` is bound to concrete file paths.
3. Backend API contracts for the consumed endpoints exist in `kudicart-backend/`.

---

## 4. Customer App Technology Stack (Locked)

| Concern | Technology | Decision ID |
|---|---|---|
| Framework | React Native (TypeScript) | D-012 |
| Authentication | Firebase Auth (Phone/OTP) | D-017 |
| Push Notifications | FCM (client-side) | D-019 |
| Payment UI | Razorpay SDK (client-side) | D-020 |
| Error Tracking | Sentry | D-023 |
| API | REST to kudicart-backend | D-015 |
| Distribution | Google Play Store only | D-028 |

**Do not** introduce alternative libraries that replace locked technologies.

---

## 5. Fundamental Rule: Presentation Layer Only

The customer app is a **thin client**. The following rules are absolute:

### 5.1 No Authoritative Business Logic
- **Never** calculate pricing, taxes, or totals client-side as authoritative.
- **Never** validate order transitions client-side as authoritative.
- **Never** authorize actions client-side only — backend guards are authoritative.
- Client-side validation is permitted for UX feedback but is never trusted by the backend.

### 5.2 No Trusted Payment State
- Client-side Razorpay success/failure is a **UI signal**, not a business fact.
- The app must send payment details to the backend for server-side verification.
- **Never** create an order based solely on client-side payment callback success.

### 5.3 No Direct Database Access
- The app communicates exclusively with `kudicart-backend` via REST API.
- No Supabase client SDK. No direct PostgreSQL connections.

### 5.4 No Second Auth System
- Firebase Phone/OTP is the only auth method.
- No custom token generation. No local username/password.

---

## 6. Customer App Scope

### What This App Does

| Feature | Requirement |
|---|---|
| Phone/OTP login | R-CUST-01 |
| Profile management | R-CUST-02 |
| Catalog/category browsing | R-CUST-03, R-CUST-04 |
| Product detail with images | R-CUST-05 |
| Cart management | R-CUST-06 |
| Address management | R-CUST-07 |
| Checkout + payment UI | R-CUST-08 |
| Order placement | R-CUST-09 |
| Order history + tracking | R-CUST-10, R-CUST-11 |
| Reviews/ratings | R-CUST-12 |
| Push notifications + feed | R-CUST-13 |
| Support tickets | R-CUST-14 |
| Razorpay payment SDK | R-PAY-UI-01 |
| COD selection | R-PAY-UI-02 |
| Sentry error capture | R-PLAT-03 |

### What This App Must NEVER Implement

| Excluded | Decision |
|---|---|
| Coupon entry/application UI | D-003 |
| Combo/bundle product UI | D-004 |
| Loyalty/referral/wallet UI | D-009 |
| Subscription plans UI | D-009 |
| AI product recommendations | D-008 |
| Delivery zone/serviceability checks | D-005 |
| Live chat | D-010 |
| Multi-language switching | D-011 |
| Multi-currency display | D-011 |
| Vendor/admin screens | Out of scope |
| Delivery partner screens | Out of scope |
| Direct database queries | D-015, D-016 |

---

## 7. Customer App Open Decisions

Stop and ask the user — do NOT invent resolutions:

| ID | Decision | Impact |
|---|---|---|
| O-CUST-01 | Exact customer profile fields | Profile screen |
| O-CUST-02 | Multi-vendor cart behavior | Cart logic |
| O-CUST-03 | Checkout pricing composition display | Checkout screen |
| O-CUST-04 | Review eligibility rules | Review UI |
| O-CUST-05 | Support ticket UI model | Support screens |
| O-CUST-06 | Notification event catalog (customer) | Notification feed |
| O-CUST-07 | Product detail display fields | Product screen |
| O-CUST-08 | State management library | Architecture |
| O-CUST-09 | Navigation library | Architecture |

---

## 8. API Dependency Rule

The customer app consumes backend APIs. Before implementing any screen:

1. **Verify** the backend endpoint exists (or is defined in the API contract).
2. **Match** the response shape — do not invent response structures.
3. **Include** Firebase ID token in every authenticated request.
4. If the endpoint does not exist yet → **STOP**. The backend must be built first.

---

## 9. Shared Code with Driver App

The customer app and `kudicart-driver-app` may share:

- Common TypeScript types / interfaces
- API client utilities
- Firebase auth plumbing
- FCM notification handling utilities
- Sentry configuration patterns

Sharing must improve maintainability without creating tight coupling. Shared code location is TBD by architecture.

---

## 10. Environment & Secrets

Required configuration:
- Firebase config (`google-services.json`)
- Backend API base URL
- Razorpay public key (client key only)
- Sentry DSN
- FCM sender ID

**Rules:**
- No production secrets in source control.
- No Razorpay secret key on client side.
- No Firebase service account on client side.
- Environment configs must be separated: dev / staging / production.

---

## 11. Testing Requirements

| Test Type | Required |
|---|---|
| Component tests | Screen rendering, user interactions |
| Navigation tests | Flow correctness |
| Auth flow tests | Login, OTP, token handling |
| API integration tests | Mock API responses, error handling |
| Payment UI tests | Razorpay SDK launch, callback handling |

Evidence must be recorded in `kudicart-customer-app/progress.md`.

---

## 12. Sync Rules

After completing any customer app work unit, update:

| File | What |
|---|---|
| `kudicart-customer-app/progress.md` | Phase status, checklist, evidence |
| `KudiCart_progress.md` | Master progress (if phase-level change) |
| `KudiCart_PLAN.md` | Phase status (if phase-level change) |

---

## 13. Self-Check (Customer App)

Before completing any turn:

- [ ] Did I implement authoritative business logic on the client? → Move to backend.
- [ ] Did I trust client-side payment success as final? → Fix: send to backend for verification.
- [ ] Did I add direct database access? → Remove immediately.
- [ ] Did I create UI for an excluded feature (coupons, combos, loyalty, etc.)? → Delete it.
- [ ] Did I add vendor/admin/driver screens? → Wrong repo, remove.
- [ ] Did I consume a backend endpoint that doesn't exist yet? → Stop, flag dependency.
- [ ] Did I add a second auth mechanism? → Remove, Firebase phone/OTP only.
- [ ] Did I create iOS-specific build infrastructure? → Remove (Play Store only).
- [ ] Did I silently decide an OPEN item? → Surface to user.
- [ ] Did I update progress.md with evidence? → Do it now.
