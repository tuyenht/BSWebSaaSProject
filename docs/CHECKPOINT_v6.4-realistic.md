# CHECKPOINT_v6.4-realistic.md (v6.5 – Phased & Executable)

## Purpose
This checkpoint document defines **what must be built, when, and why**.
It is mapped directly to the approved architecture and avoids over-engineering.

---

## PHASE 1 — Single Site / Single Tenant (An Vinh)
**Goal:** Launch a production-ready, AI-first website with admin in ≤ 7 days.

### Must Have (Blocking)
- Next.js web (SSR/SSG/ISR)
- Payload CMS (engine-only)
- Velzon Admin
- Tenant = 1, Site = 1
- Pages editable via CMS
- AI-first content schema (summary, keyFacts, FAQ)
- SEO: sitemap, robots, JSON-LD
- Media with ALT enforcement
- Docker deployment

### Acceptance Criteria
- Admin edits content → web updates
- Lighthouse SEO & Performance ≥ 85
- Sitemap & structured data validated
- Ready to export runtime product

---

## PHASE 2 — Multi-Site / Multi-Domain SaaS
**Goal:** One platform, many websites.

### Must Have
- Tenant onboarding
- Domain → site resolver
- Per-domain sitemap & canonical
- Media isolation per tenant
- Theme switching per site

### Nice to Have
- Domain verification UI
- Quotas & limits

---

## PHASE 3 — Catalog + Order
**Goal:** Enable product showcase and request-based orders.

### Must Have
- Product & Category
- Order (request only)
- Admin order management
- SEO product pages

---

## PHASE 4 — Platform Expansion
**Goal:** SaaS business enablement.

### Optional Modules
- Billing
- Automation
- Analytics
- AI Assistant

---

## Explicit Non-Goals
- No payment gateway before Phase 3
- No billing before Phase 4
- No automation before stable SaaS

---