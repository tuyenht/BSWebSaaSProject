# UPGRADING-PAYLOAD.md (v2 – Engine-only Strategy)

## Purpose
This document defines how Payload CMS is used and upgraded safely
within the BSWeb SaaS platform **without impacting Admin UX (Velzon)**
or tenant stability.

---

## Core Principle
Payload is used strictly as a **CMS ENGINE**, not as an end-user admin UI.

Payload responsibilities:
- Content schema & validation
- Access control & RBAC
- Media storage & hooks
- Draft / publish workflow
- Jobs (revalidation, export)

Payload Admin UI:
- Internal / developer use only
- Disabled or protected in production SaaS
- Never exposed to customers

---

## Upgrade Policy

### Safe to upgrade (minor/patch)
- Bug fixes
- Performance improvements
- Security patches

### Caution required (major)
- Schema changes
- Auth/RBAC changes
- Media adapter changes

Major upgrades MUST:
1. Be tested on staging
2. Run migration scripts
3. Validate Velzon integration
4. Validate export pipeline

---

## Version Locking
- Payload version is pinned in package.json
- No floating versions in production
- Upgrade window scheduled per quarter

---

## Backward Compatibility Rules
- Do not break existing content APIs
- Maintain collection field names
- Keep media path strategy stable

---

## Media Handling During Upgrade
- DB stores relative media path only
- No hardcoded domain URLs
- Verify upload adapters after upgrade

---

## Rollback Strategy
- DB snapshot before upgrade
- Container image rollback
- Feature flags for new Payload features

---

## Forbidden Actions
- Replacing Velzon with Payload Admin
- Letting customers access Payload Admin
- Auto-upgrading Payload in production

---