# FULL-PROJECT-STRUCTURE.md (Phased & Realistic)

## Principle
Not all modules are built at once.
This structure supports **phased execution**.

---

## Phase 1 – An Vinh (Immediate)

root/
├─ apps/
│  ├─ web/        # Public site (Next.js)
│  ├─ admin/      # Velzon Admin
│  └─ cms/        # Payload engine
│
├─ packages/
│  ├─ shared/     # types, seo helpers, tenant resolver
│  ├─ ui/         # shared UI tokens
│  └─ themes/     # An Vinh theme
│
├─ infra/
│  └─ docker/
│
└─ docs/

> Goal: ship fast, SEO strong, admin usable.

---

## Phase 2 – Multi‑Tenant SaaS

Adds:
- Tenant onboarding
- Domain verification
- Theme switching
- Limits & quotas

---

## Phase 3 – Product / Order

Adds:
- Catalog
- Order (request‑only)
- Admin workflow

---

## Phase 4 – Advanced Platform

Optional:
- Automation
- Billing
- AI assistant
- Analytics

---

## Important Rule
> Phase 1 must NOT implement Phase 4 features.

---