# ARCHITECTURE.md (v2.1 – Finalized)

## Purpose
Defines the **final, enforceable architecture** for the BSWeb SaaS platform:
- Runs single-site (An Vinh) immediately
- Scales to multi-tenant SaaS
- Supports AI-first SEO & Runtime Export

---

## Operating Modes

### MODE=saas
- Multi-tenant
- Domain → Site → Tenant resolution
- Central Velzon Admin
- Shared infrastructure

### MODE=standalone
- Single tenant locked by TENANT_ID
- Local uploads directory
- Velzon Admin included
- No SaaS control plane

---

## Core Applications

### apps/web
- Next.js App Router
- SSR / SSG / ISR
- AI-friendly HTML
- Per-domain sitemap & schema

### apps/admin
- Velzon Admin (only customer-facing admin)
- Content, SEO, Export, Audit

### apps/cms
- Payload CMS (engine-only)
- Schema, RBAC, media, hooks, jobs
- Admin UI internal only

---

## Request Lifecycle (High-level)

Request
→ Resolve Domain
→ Resolve Tenant
→ Resolve Site
→ Fetch Content
→ Render (SSR/ISR)
→ Cache by Site
→ Serve SEO + Schema

---

## Data Model Core
Tenant → Site → Domain
Content scoped by tenantId + siteId

---

## Media Strategy
- SaaS: uploads/{tenantId}/uuid.ext
- Standalone: uploads/uuid.ext
- DB stores relative path only

---

## SEO & AI Readiness
- Structured data (Service, FAQ, HowTo)
- AI-first content blocks
- Canonical & sitemap per domain

---

## Export Strategy
- Runtime product export
- Includes web + admin + cms + data
- Excludes SaaS internals

---