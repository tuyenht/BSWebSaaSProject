# Billing & Resource Management – SaaS Platform

This document explains how billing, usage limits, and resource management work across tenants and sites.

---

## 1. Overview

Billing in the SaaS Platform is modular and extensible:

- Supports **tenant-level billing** (one account = multiple sites).
- Tracks **usage-based metrics** (AI tokens, exports, analytics, automations).
- Integrates with **Stripe** (or other providers) for subscriptions.
- Allows free-tier and custom plans.
- Enforces limits gracefully (soft warning → hard limit).

---

## 2. Billing Model

| Type | Description |
|-------|--------------|
| **Subscription-based** | Recurring billing via Stripe or Paddle |
| **Usage-based** | Measured per metric (e.g., AI tokens, exports) |
| **Hybrid** | Base subscription + overage charge |

Each tenant has a `BillingPlan` document containing:

```json
{
  "planId": "pro",
  "tier": "Pro",
  "price": 49,
  "currency": "USD",
  "limits": {
    "sites": 10,
    "exportsPerMonth": 30,
    "automationRuns": 500,
    "aiTokens": 200000
  },
  "features": ["analytics", "aiAssistant", "automation", "customDomain"]
}
```

---

## 3. Billing Entities

| Collection | Purpose |
|-------------|----------|
| **BillingPlans** | Definition of plans and limits |
| **TenantSubscriptions** | Links tenant → plan & payment method |
| **UsageRecords** | Daily counters (per tenant/site) |
| **Invoices** | Generated monthly or on-demand |

---

## 4. Usage Tracking

Tracked metrics (stored in `UsageRecords`):

| Metric | Description |
|---------|-------------|
| `aiTokens` | Tokens consumed by Assistant API |
| `automationRuns` | Automation executions |
| `exports` | Site export jobs |
| `formSubmits` | Public form submissions |
| `analyticsEvents` | Tracked events (pageviews, leads, etc.) |

**Mechanism:**  
Each event calls `incrementUsage(tenantId, metric, delta)` in the background.  
Usage is aggregated daily and billed monthly.

---

## 5. Enforcement

### Soft Limits (warning)

- Displayed in Admin dashboard.  
- Email alert to `tenantOwner`.  
- Example: “You have used 85% of your AI token quota.”

### Hard Limits (enforced)

- Blocking new AI calls / exports.  
- Grace period: 48 hours.  
- Resume after plan upgrade or new billing cycle.

---

## 6. Billing Flow

```
1. Tenant subscribes to a plan
2. Stripe Webhook → create TenantSubscription
3. System provisions limits + features
4. Usage tracked continuously
5. At end of cycle:
     - Generate invoice
     - Email summary
     - Reset counters
```

---

## 7. Stripe Integration

Webhook endpoints:

- `/api/billing/webhooks/stripe` – Handles:
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

Admin UI:

- Tab: **Billing → Subscription**
- Shows:
  - Plan details
  - Usage progress bars
  - “Upgrade / Cancel” buttons

---

## 8. Free Tier & Trials

- Free tier = limited AI usage, exports, automations.
- Trial accounts expire after X days.
- Background job checks trial expirations nightly.
- Auto-email notification 3 days before expiry.

---

## 9. Quota API

```http
GET /api/billing/usage?tenantId=...
Response:
{
  "limits": {...},
  "usage": {...},
  "remaining": {...}
}
```

Used by Admin dashboard for progress bars.

---

## 10. Overages

- When usage exceeds plan limit:
  - Overage billed automatically on next invoice.
  - Email sent with breakdown.
- Example:
  - Plan: 200,000 AI tokens.
  - Actual: 230,000 → Over 30,000 × $0.002/token = $60 billed.

---

## 11. Upgrading & Downgrading

| Scenario | Action |
|-----------|--------|
| Upgrade | Immediate access to higher limits |
| Downgrade | Changes effective next cycle |
| Cancel | Access remains until billing end date |

---

## 12. Custom Plans

- Admin can define new plans via Payload CMS (`BillingPlans`).
- Each plan has flexible limits and features.
- Supports enterprise plans with dedicated resources.

---

## 13. Notifications

| Type | Trigger | Channel |
|------|----------|----------|
| Usage 80% | Usage check job | Email |
| Hard limit | Enforcement rule | Email + in-app |
| Payment failed | Stripe webhook | Email |
| Plan upgrade | Admin action | Email + log |

---

## 14. Data Retention

| Data | Retention |
|------|------------|
| Usage records | 12 months |
| Invoices | 7 years |
| Payment methods | Managed by Stripe |
| Audit logs | 90 days |

---

## 15. Future Extensions

- Pay-per-use APIs (à la carte billing).  
- Multi-currency billing.  
- Tenant-specific invoice branding.  
- Self-hosted billing provider support.

---

## 16. Contacts

- **Billing Lead:** billing@yourdomain.com  
- **Support:** support@yourdomain.com  
- **Finance:** finance@yourdomain.com
