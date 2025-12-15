# EXPORT.md (v2.1 – Runtime Product Export)

## Goal
Export a **single-tenant runtime product** that runs independently
while preserving SEO, admin UX, and content integrity.

---

## Export Modes
- Docker Images
- Source Code Bundle

---

## Exported Bundle

customer-runtime/
├─ apps/
│  ├─ web
│  ├─ admin
│  └─ cms
├─ uploads/
├─ db/seed.sql
├─ docker-compose.yml
└─ README_DEPLOY.md

---

## Runtime Characteristics

| Mode | Multi-tenant | Billing | Velzon Admin |
|------|--------------|---------|--------------|
| SaaS | Yes | Yes | Yes |
| Export | No | No | Yes |

---

## Media Handling
- Flatten uploads into /uploads
- Rewrite DB paths
- Regenerate URLs at runtime

---

## Security Checklist
- Rotate all secrets
- New admin owner
- Remove SaaS credentials

---

## SEO Preservation
- Canonical intact
- Sitemap regenerated
- Schema unchanged

---