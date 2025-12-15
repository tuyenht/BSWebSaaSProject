# Security & Compliance Guide – SaaS Platform

This document defines all security measures, best practices, and compliance standards applied in the SaaS Website Platform.

---

## 1. Objectives

- Ensure data privacy, integrity, and confidentiality.
- Provide consistent isolation between tenants and sites.
- Protect API endpoints and admin access.
- Comply with modern web security standards (OWASP Top 10, GDPR-ready).

---

## 2. Core Security Principles

1. **Least privilege**: Every role, user, or process only gets the minimum necessary permissions.  
2. **Tenant isolation**: No cross-tenant access to content, assets, or analytics.  
3. **Zero trust**: All inputs and actions are verified and validated.  
4. **Defense in depth**: Multiple layers—auth, CSRF, rate limit, file type enforcement, logging.  
5. **Auditability**: Every admin action is recorded in `AuditEvents`.  

---

## 3. Authentication & Authorization

| Feature | Implementation |
|----------|----------------|
| **Auth system** | Payload Auth (JWT, session, 2FA) |
| **2FA** | Optional on login, mandatory for high-risk actions (export, billing) |
| **Passwordless login** | Optional (via secure email link) |
| **Social login** | Google, Facebook (with rate-limit & validation) |
| **RBAC** | Role-based access (saasOwner → siteViewer hierarchy) |

### Session Management

- JWT stored in `HttpOnly` cookies.  
- Session timeout configurable (default 24h).  
- Token invalidation on password reset or user deactivation.  

---

## 4. API Security

| Layer | Description |
|--------|--------------|
| **Rate limit** | Per-IP & per-user limits for login, export, AI, form submit |
| **CSRF protection** | Enabled globally via Payload middleware |
| **Honeypot** | Applied to all public forms |
| **CORS policy** | Restrictive allow-list per tenant/site |
| **XSS prevention** | Auto-escaping via React + sanitization |
| **SQL Injection** | Prevented by Payload ORM + parameterized queries |
| **Edge middleware** | Next.js `middleware.ts` injects CSP headers + rate limit for `/api/*` |

---

## 5. File Upload Security

- Upload restricted by MIME type and size.  
- Dangerous file extensions blocked (`.php`, `.phar`, `.phtml`, etc.).  
- Uploaded files stored under tenant/site prefix (`uploads/{tenant}/{site}`) to avoid collision.  
- Automatic checksum validation (SHA-256).  
- Optional ClamAV integration (for enterprise plans).  

---

## 6. Data Encryption

| Layer | Encryption |
|--------|-------------|
| **Database** | Disk-level encryption (Postgres managed) |
| **Redis** | TLS enabled connections |
| **S3 / Storage** | AES-256 encryption at rest |
| **Secrets** | `.env` variables not committed to repo |
| **Passwords** | Argon2id hashing algorithm |

---

## 7. Logging & Auditing

- All actions (CRUD, login, export, workflow changes) recorded in `AuditEvents` collection.  
- Structured logs: `{tenantId, siteId, userId, action, status, timestamp}`.  
- Logs can be streamed to external collector (e.g. Loki, Datadog, Elastic).  
- Retention policy: 90 days (configurable).  

---

## 8. Rate Limiting Strategy

| Endpoint | Limit | Notes |
|-----------|--------|------|
| `/api/login` | 5/min per IP | Prevent brute force |
| `/api/assistant` | 10/min per user | AI cost control |
| `/api/forms/submit` | 20/min per IP | Anti-spam |
| `/api/sites/[id]/export` | 1/min per user | Resource heavy |
| `/api/analytics/track` | 60/min per IP | Light event tracking |

All limits stored and enforced via Redis.

---

## 9. Multi-Tenant Isolation

Every record in Payload includes `tenant` and `site` references.  
Isolation enforced at:

- **Database**: All queries scoped by tenant/site.  
- **Storage**: Per-tenant prefix paths.  
- **Cache**: Namespaced Redis keys.  
- **AI Assistant**: Per-site/tenant API keys.  
- **Analytics**: Aggregated by tenant/site only.  

---

## 10. Infrastructure & Network

- Containers run as **non-root users**.  
- Network isolation between frontend, backend, and DB layers.  
- Firewall rules restrict external access to Postgres/Redis.  
- HTTPS enforced at all layers.  
- Auto-renewing SSL (Let's Encrypt / Cloudflare).  

---

## 11. Compliance & Privacy

- GDPR-ready: Users can export/delete data.  
- Cookies use `SameSite=Strict` + `HttpOnly`.  
- Privacy policy available per tenant/site.  
- Audit logs can be anonymized on request.  

---

## 12. Incident Response

| Step | Description |
|-------|--------------|
| 1 | Detect anomaly (monitoring alert or log event) |
| 2 | Triage severity |
| 3 | Isolate tenant/site if needed |
| 4 | Rollback or revoke credentials |
| 5 | Notify affected users (per GDPR) |
| 6 | Patch, retest, and redeploy |

---

## 13. Security Testing

- Static analysis via ESLint, `npm audit`, Dependabot.  
- Dynamic scanning (OWASP ZAP) in CI.  
- Penetration testing on major releases.  
- Security reviews before public deployment.  

---

## 14. Best Practices Summary

✅ Never store plaintext secrets.  
✅ Use environment variables for all credentials.  
✅ Do not expose tenant/site IDs in public URLs.  
✅ Limit roles and permissions.  
✅ Audit sensitive actions.  
✅ Keep dependencies updated (via `pnpm payload:upgrade`).  

---

## 15. Contacts

- **Security Lead:** security@yourdomain.com  
- **Emergency Hotline:** +84 900 000 000
