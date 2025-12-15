# PROJECT-RULES.md (v2 – AI-First & SaaS Governance)

## Core Rules (Mandatory)

### 1. AI-First Content Rule
All public-facing pages MUST include:
- summary (2–3 sentence definition)
- keyFacts (bullet list)
- Proper heading hierarchy (H1/H2/H3)
- Structured data (schema.org)

Pages without summary MUST NOT be published.

---

### 2. SEO & AI Publish Gate
Before publishing a page:
- SEO title & description required
- Hero image must have ALT text
- Canonical must be auto-generated

Failing checks block publish action.

---

### 3. Multi-Tenant Isolation
- Every record scoped by tenantId
- Public APIs must resolve siteId by domain
- No cross-tenant caching

---

### 4. Media Rules
- Media stored per tenant in SaaS mode
- Relative paths only in DB
- ALT text mandatory for hero & featured images

---

### 5. Admin UI Rule
- Velzon is the only customer-facing Admin
- Payload Admin is internal only

---

### 6. Export Rule (Runtime Product)
Exported products:
- Are single-tenant
- Include Velzon Admin
- Exclude SaaS control plane

---

### 7. Phase Discipline
- Phase 1 must not implement Phase 3–4 features
- No premature optimization

---

### 8. Security Baseline
- OWASP Top 10 respected
- Secrets rotated on export
- Rate limit admin login

---

### 9. Documentation Rule
- Architecture changes require doc update
- Export changes require EXPORT.md update

---

### 10. AI Content Integrity
- No mass AI-generated content
- AI assists structure, humans approve meaning
- Avoid thin or duplicated pages

---