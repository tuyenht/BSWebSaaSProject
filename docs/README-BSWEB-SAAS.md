# BSWeb SaaS Platform — Master README

## Overview
BSWeb is a **Next.js-based, AI-first, multi-tenant SaaS platform**
for building high-performance, SEO-optimized websites that can also
be exported as standalone products.

Initial implementation targets **An Vinh Mechanical Engineering**,
with future expansion to multiple clients and domains.

---

## Core Principles
- AI-first content & SEO
- Performance by default (SSR/SSG)
- Clean separation of concerns
- Exportable runtime products
- No lock-in

---

## Tech Stack
- Next.js (App Router)
- Payload CMS (engine-only)
- Velzon Admin
- PostgreSQL
- Docker + Nginx

---

## Repository Structure
apps/
- web     → public websites
- admin   → Velzon admin
- cms     → Payload engine

packages/
- shared  → types, tenant resolver, SEO helpers
- ui      → shared UI
- themes  → site themes

docs/
- architecture & rules

---

## Operating Modes

### SaaS Mode
- Multi-tenant
- Central admin
- Shared infrastructure

### Standalone Mode (Export)
- Single tenant
- Local uploads
- Velzon admin included
- No SaaS internals

---

## Content Rules (Critical)
Every public page MUST have:
- Summary (AI definition)
- Key facts
- Proper headings
- Structured data

Publishing is blocked if missing.

---

## Deployment
- Docker Compose for dev & prod
- Nginx reverse proxy
- SSL via Let's Encrypt

---

## Export Workflow
1. Select site
2. Export runtime bundle
3. Rotate secrets
4. Deploy on customer VPS

---

## Who This Is For
- Internal dev team
- External contractors
- Future maintainers

This README is the **single source of truth** for onboarding.

---