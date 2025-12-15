# SaaS Website Platform – Developer Handbook

This document is the **single entry point** for developers working on this monorepo.

It explains:

- How the system is structured (multi-tenant, multi-locale, AI, export, analytics).
- How to run it locally.
- Where to change things (i18n, themes, assistant, automation, export, analytics).
- How to test, upgrade Payload, and ship changes safely.

> If you only read one doc before coding, read this one.

---

## 1. Architecture Overview

This project is a **multi-tenant SaaS CMS & site builder**:

- **Next.js 16** (App Router, React Server Components, PPR).
- **Payload CMS 3.63.0** embedded inside Next (admin + API).
- **PostgreSQL** for core data (tenants, sites, content, forms, leads, analytics).
- **Redis** for cache / rate limit / KV.
- **Storage**: Local or S3-compatible per tenant/site prefix.
- **i18n**: Admin & Site fully multi-lingual, not hardcoded to any specific language.
- **AI Layer**: Assistant API for SEO, content, translate, lead reply.
- **Automation**: Rules engine (trigger/condition/action) integrated with Assistant.
- **Export**: Standalone bundle generator per site (data + Docker skeleton).
- **Analytics**: Daily aggregated metrics per site (pageviews, leads, forms, exports, automationRuns).
- **Observability**: `/metrics` (Prometheus), logs, healthcheck.

---

## 2. Monorepo Layout

```txt
apps/
  saas/          # Main Next + Payload app (SaaS + Admin)
  standalone/    # Template / runner for exported independent site

packages/
  cms/           # Payload config (collections, globals, hooks, export, analytics)
  frontend/      # UI components, section renderer, admin panels, charts
  themes/        # Theme packages (e.g. company-industrial)
  shared/        # Shared utils: cache, storage, logger, routing, assistant, etc.
  i18n/          # i18n config & JSON dictionaries for Admin & Site

docs/
  HANDBOOK.md          # (this file)
  UPGRADING-PAYLOAD.md # How to upgrade Payload safely
  TESTING-STRATEGY.md  # Test layers & commands
  performance.md       # Performance playbook
```

Key apps:

- `apps/saas/` – the only app you usually run in dev (`pnpm dev`).
- `apps/standalone/` – used as target for exported site bundles.

---

## 3. Tech Stack & Core Dependencies

- **Next.js**: 16.x (App Router, RSC, PPR, Turbopack).
- **React**: 19.x.
- **Payload**: 3.63.0 (`payload`, `@payloadcms/next`, `@payloadcms/db-postgres`).
- **DB**: PostgreSQL, optional pgBouncer for pooling.
- **Cache/KV**: Redis (production), in-memory for dev.
- **UI**: Tailwind CSS, shadcn/ui, Framer Motion.
- **Charts**: Recharts (for analytics dashboard).
- **Jobs / Workers**: using Payload + Node runtime, job abstraction for export & automation.

---

## 4. Environments & Configuration

### 4.1. Environment files

Chuẩn sử dụng:

1. Template chung: `env/example.env` (giữ nguyên, không commit secret thật).
2. Local Docker: sao chép thành `.env` ở thư mục gốc để Docker Compose tự nạp.
3. Local dev không Docker: sao chép thành `apps/saas/.env.local` rồi chạy `pnpm dev`.
4. CI/CD & môi trường deploy: tạo các biến thể `env/.env.staging`, `env/.env.production` (hoặc dùng secret manager) và inject vào container/app.

Key env variables:

```bash
# Core
NODE_ENV=development
DATABASE_URI=postgresql://...
REDIS_URL=redis://...
PAYLOAD_SECRET=super-secret-string

# Next / Payload
NEXT_PUBLIC_APP_URL=http://localhost:3000
PAYLOAD_CONFIG_PATH=packages/cms/payload.config.ts

# Storage
UPLOADS_S3_BUCKET=...
UPLOADS_S3_REGION=...
UPLOADS_S3_ACCESS_KEY_ID=...
UPLOADS_S3_SECRET_ACCESS_KEY=...

# AI / Assistant
ASSISTANT_PROVIDER=openai         # or 'none'
OPENAI_API_KEY=sk-...             # platform-level key (optional but recommended)
ASSISTANT_MODEL=gpt-4.1-mini      # default model

# Analytics / Metrics
METRICS_ENABLED=true
```

> **Note:** The system does not hardcode language anywhere. Language behavior is driven by i18n config and JSON files, not env vars.

---

## 5. Running Locally

### 5.1. Using Docker (recommended)

```bash
# 1. Install dependencies
pnpm install

# 2. Start Postgres + Redis + any other infra
docker compose up -d

# 3. Run DB migrations
pnpm payload:migrate

# 4. (Tuỳ chọn) tạo dữ liệu mẫu
#   - Hiện chưa có script seed. Tạo Tenant/Site/User trực tiếp trong Admin khi cần.

# 5. Start dev server
pnpm dev
```

- Admin should then be available at `http://localhost:3000/admin`.
- Public site at `http://localhost:3000/` (depends on default demo domain mapping).

### 5.2. Useful scripts

At repo root:

```bash
pnpm dev                # Dev server
pnpm build              # Build apps
pnpm lint               # ESLint & Next lint
pnpm test               # Unit/integration tests (Vitest/Jest)
pnpm test:e2e           # E2E (Playwright/Cypress)
pnpm payload:migrate    # Run Payload migrations
pnpm payload:upgrade    # Upgrade Payload (+ regenerate types)
```

> Details for tests & upgrade: see `TESTING-STRATEGY.md` & `UPGRADING-PAYLOAD.md`.

---

## 6. Multi-tenant Model

Core collections (simplified):

- `Tenants` – represents a customer (company/account).
- `Sites` – one tenant can have multiple sites.
- `Users` – belongs to a tenant, with roles like:
  - `saasOwner`, `saasAdmin`
  - `siteOwner`, `siteAdmin`, `siteEditor`, `siteTranslator`, `siteViewer`
- `Domains` (inside Sites or separate model) – maps hostname/subdomain → site.

Important concepts:

- Every important document (Page, Post, Product, Form, Lead, etc.) is associated with a **site** (and thus a **tenant**).
- APIs always resolve **current site** from request:
  - Domain routing.
  - Or explicit `siteId` in Admin.

When adding new collections or endpoints, ensure:

- They are scoped by `tenant`/`site` where it makes sense.
- Access control filters on `tenant` based on `req.user`.

---

## 7. Internationalization (i18n)

### 7.1. Shared i18n package

Structure:

```txt
packages/i18n/
  config/
    locales.ts        # AVAILABLE_LOCALES list
    i18n-config.ts    # i18n wiring for Admin & Site
  locales/
    vi/
      common.json
      validation.json
      date-time.json
      admin-core.json
      admin-users.json
      admin-billing.json
      admin-export.json
      admin-analytics.json
      site-core.json
      site-landing.json
      theme-default.json
      theme-dark.json
    en/
      ... same structure ...
    ja/
      ... etc ...
  lib/
    loadNamespaces.ts
    types.ts
  index.ts
```

**Rules:**

- **Admin UI** uses namespaces `admin-*`.
- **Site UI** uses `site-*` + `theme-*`.
- **Common** namespaces (`common`, `validation`, `date-time`) used everywhere.
- Locale is always `string` (e.g. `vi`, `en`, `ja`, `fr`…), not hardcoded in logic.

### 7.2. Adding a new language

1. Copy the `vi` folder:

   ```bash
   cp -r packages/i18n/locales/vi packages/i18n/locales/fr
   ```

2. Translate the JSON files inside `fr/`.  
3. Add `'fr'` to `AVAILABLE_LOCALES` in `packages/i18n/config/locales.ts`.  
4. Deploy.

No code changes are needed inside components (they consume i18n via keys + locale strings).

---

## 8. AI Assistant & OpenAI Keys

### 8.1. Overview

- Assistant is abstracted in `packages/shared/assistant/**`.
- Modes supported:
  - `seoMeta` – generate SEO title/description/keywords.
  - `contentGenerate` – structured content (heading + sections).
  - `translate` – translate between locales.
  - `leadReply` – draft a reply email to a lead.
  - `summarize` – summarize content.

### 8.2. Key resolution (hybrid)

The system resolves the AI config in this order:

1. **Site-level AiSettings** (if exists).
2. **Tenant-level AiSettings**.
3. **Platform env** (`OPENAI_API_KEY`, `ASSISTANT_MODEL`).
4. If none → Assistant is **disabled**.

`AiSettings` collection includes:

- `providerMode`:
  - `disabled`
  - `platform` (use platform key)
  - `openai-tenant` (use tenant’s own OpenAI key)
- `openai.apiKey`, `openai.model`, `openai.maxTokensPerMonth`.

### 8.3. Public API

Assistant HTTP endpoint:

```txt
POST /api/assistant?locale=<adminLocale>
Body:
{
  "mode": "seoMeta" | "contentGenerate" | "translate" | "leadReply" | "summarize",
  "siteId": "<optional>",
  "payload": { ... mode-specific payload ... }
}
```

All AI calls should go through this endpoint or the internal `AssistantProvider`.

---

## 9. Automation Rules

Location:

- Config & types: `packages/cms/automation/**`

Core pieces:

- `AutomationRules` collection – defines rules:
  - `trigger`: e.g. `lead.created`, `form.submitted`, `page.published`.
  - `conditions`: simple field comparisons (equals, contains, gt/gte/lt/lte).
  - `actions`: `sendEmail`, `httpWebhook`, `updateRecord`, `assistant.generateReply`, etc.
- `automation/actions.ts` – executes actions.
- `automation/template.ts` – simple templating for messages (`{{lead.email}}`, etc).

Example high-level flow:

1. New lead created (hook `afterChange` on `Leads`).
2. `fireAutomation('lead.created', context)` is called.
3. Matching rules are evaluated.
4. Actions run:
   - Possibly call Assistant (`leadReply`).
   - Save auto reply into `lead.autoReply` or send email/webhook.

When adding new triggers/actions:

- Define them in the Automation schema/types.
- Implement the execution logic in `automation/actions.ts`.
- Consider analytics counters (`automationRuns` metric).

---

## 10. Export & Backup

Export is **job-based**, not a direct API download:

- `ExportJobs` collection:
  - `tenant`, `site`, `status`, `requestedBy`, `downloadUrl`, `log`, timestamps.
- Export helper:
  - `packages/cms/export/exportSiteBundle.ts` – builds a bundle (zip or structured buffer).
  - `packages/cms/export/uploadExportBundle.ts` – uploads bundle to Media/S3 with per-tenant/site prefix.
- Export API:
  - `POST /api/sites/[id]/export/start?locale=...`
    - Checks auth, billing limits, rate limit.
    - Creates `ExportJob`, runs `runExportJob`.
  - `GET /api/sites/[id]/export/status?jobId=...`

Admin UI:

- Backup/Export page per site.
- Buttons:
  - Start export.
  - View status & download link.
- All labels are i18n’d (`admin-export.json`).

---

## 11. Analytics

### 11.1. Model

Collection: `AnalyticsDailyStats`:

- `tenant`, `site`
- `date` (YYYY-MM-DD, UTC)
- `metric`: one of
  - `pageviews`
  - `formSubmits`
  - `leadsCreated`
  - `exports`
  - `automationRuns`
- `locale` (string, optional)
- `path` (optional)
- `value` (number)

Helper: `incrementAnalyticsStat(payload, { tenantId, siteId, metric, locale, path, delta })`.

### 11.2. Tracking

- Frontend:
  - `packages/frontend/site/analytics.ts`:
    - `trackPageview({ tenantId, siteId, locale, path })`
    - Sends to `/api/analytics/track` using `sendBeacon` when possible.
- Backend:
  - Hooks & services call `incrementAnalyticsStat` directly for:
    - Leads created.
    - Form submissions.
    - Exports.
    - Automation runs.

### 11.3. Admin Dashboard

Page: `/sites/[id]/analytics`:

- Fetches last 30 days of stats for that site.
- Shows:
  - Line chart (pageviews, leads, forms, exports, automationRuns).
  - Locale filter (site locales).
- Uses Recharts in `SiteAnalyticsDashboard` component.

---

## 12. Performance & Observability

See `docs/performance.md` for details.

Summary:

- **Caching**:
  - Redis KV for expensive queries.
  - Next.js PPR + cache tags (`site:{id}:{locale}:{collection}`).

- **Images**:
  - Optimized via `/img/[...path]` + sharp.

- **Security & Rate limiting**:
  - Rate limit login, forms, export, AI calls.
  - CSRF protection, CSP headers, upload hardening, MIME validation.

- **Observability**:
  - `/healthz` – basic healthcheck.
  - `/metrics` – Prometheus-compatible.
  - Alert webhooks to Discord/Slack.

---

## 13. Testing & Upgrading Payload

- **Testing strategy** – see `docs/TESTING-STRATEGY.md`:
  - Unit tests for shared utils, validation, automation evaluators.
  - Integration tests for auth/RBAC, export, billing limits.
  - E2E flows: login, create site, submit form, export site.

- **Upgrading Payload** – see `docs/UPGRADING-PAYLOAD.md`:
  - Use `pnpm payload:upgrade`.
  - Regenerate types.
  - Run tests & smoke test Admin & core flows before merging.

---

## 14. Git Workflow & Conventions

Suggested:

- Branches:
  - `feat/...` – new feature.
  - `fix/...` – bugfix.
  - `chore/...` – maintenance, upgrades.

- Commits (Conventional Commit style):
  - `feat: ...`
  - `fix: ...`
  - `chore: ...`
  - `docs: ...`

- PR checklist:
  - Tests & build pass (CI or local).
  - No hardcoded locale or tenant-specific logic unless absolutely required.
  - Any changes touching:
    - Auth/RBAC,
    - Billing/limits,
    - Automation,
    - Export,
    - i18n loader,
    → should come with tests.

---

## 15. Where to Start (for new devs)

1. Read this `HANDBOOK.md`.
2. Run locally:
   - `pnpm install`
   - `docker compose up -d`
   - `pnpm payload:migrate`
   - `pnpm dev`
3. Login to Admin:
   - Tạo tài khoản saasOwner đầu tiên bằng `/admin` (Payload sẽ yêu cầu tạo user khi DB trống).
4. Tạo nhanh Tenant & Site mẫu rồi explore:
   - Tenants & Sites.
   - Page builder & theme.
   - Forms & Leads.
   - Analytics & Export.
   - Assistant (SEO & Translate) if AI is configured.

Once you’re comfortable with this flow, you can safely start working on features.
