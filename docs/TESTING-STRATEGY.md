# Testing Strategy – SaaS CMS Monorepo

This document describes **how we test this project**:
- what to test,
- where tests live,
- and how to run them.

The goal is to guarantee **multi-tenant, i18n, billing, automation, export**
work reliably while keeping the test setup simple.

---

## 1. Test layers overview

We use three main layers:

1. **Unit tests**
   - Small, pure functions and helpers.
   - Example targets:
     - i18n resolvers (locale detection).
     - validation layer (`packages/shared/validation.ts`).
     - automation condition evaluation (`packages/cms/automation/evaluate.ts`).
     - template renderer (`packages/cms/automation/template.ts`).
     - cache tags helpers, routing helpers.

2. **Integration tests**
   - Test Payload + Next helpers together (without a browser).
   - Example targets:
     - `localAPI` + multi-tenant queries.
     - Search index pipeline.
     - Export bundle builder (without actually calling external storage).
     - Billing limits (enforce max sites / exports per month).

3. **End-to-end (E2E) tests**
   - Simulate real user flows via browser automation.
   - Example flows:
     - Admin login.
     - Create site + page + publish.
     - Submit contact form → lead created.
     - Export site from Admin → see job and download link.

---

## 2. Test tools and location

### 2.1. Test runner

We recommend **Vitest** (or Jest).  
Assuming Vitest:

- Config: `vitest.config.ts` at repo root.
- Test files:
  - Unit: `**/*.test.ts` inside `packages/**`.
  - Integration: `**/*.int.test.ts` inside `packages/**` or `apps/**`.

Example structure:

```txt
packages/
  shared/
    validation.ts
    __tests__/
      validation.test.ts

  cms/
    automation/
      evaluate.ts
      template.ts
      __tests__/
        evaluate.test.ts
        template.test.ts

apps/
  saas/
    __tests__/
      auth.int.test.ts
      export.int.test.ts
```

---

### 2.2. E2E framework

We recommend **Playwright** (or Cypress).

- Config: `playwright.config.ts` at repo root.
- Tests: `e2e/**/*.spec.ts`.

Example high-value specs:

- `e2e/admin-login.spec.ts`
- `e2e/admin-create-site.spec.ts`
- `e2e/public-contact-form.spec.ts`
- `e2e/export-site.spec.ts`

These tests run against:

- Local dev environment (docker-compose) or
- A dedicated `staging` environment.

---

## 3. Commands

Add to root `package.json`:

```jsonc
{
  "scripts": {
    "test": "vitest run",
    "test:unit": "vitest run --runInBand",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "lint": "next lint && eslint .",
    "ci": "pnpm lint && pnpm test && pnpm test:e2e && pnpm build"
  }
}
```

> Adjust according to your actual tooling (Jest/Cypress/etc.).  
> The important part is a **single `ci` script** that runs everything.

---

## 4. Minimum test coverage (Phase 5 goal)

To consider the system **Phase 5 production-ready**, we aim for:

### 4.1. Unit tests – MUST

- [ ] `packages/shared/validation.ts`
  - Required / email / minLength / maxLength cases.
- [ ] `packages/cms/automation/evaluate.ts`
  - Condition group AND/OR.
  - Comparisons: equals, contains, gt/gte/lt/lte.
- [ ] `packages/cms/automation/template.ts`
  - `{{lead.email}}`, `{{form.name}}` replacements.

Optional but recommended:

- [ ] `packages/shared/rateLimit.ts`
- [ ] `packages/shared/cache/cacheTags.ts`
- [ ] `packages/shared/routing/paths.ts`
- [ ] `packages/shared/routing/resolveSite.ts`

### 4.2. Integration tests – MUST

- [ ] Auth & RBAC:
  - Logging in with email/password.
  - Reject access to admin routes when role is insufficient.
- [ ] Billing limits:
  - Creating more sites than allowed by plan → should be blocked.
  - Exporting more times than `maxExportsPerMonth` → block with proper error.
- [ ] Export:
  - `exportSiteBundle` returns a buffer and a valid manifest.
- [ ] Automation:
  - A rule with event `lead.created` is triggered on new lead and updates lead status.

### 4.3. E2E tests – MUST

- [ ] Admin login flow:
  - Can login as `saasOwner` and reach dashboard.
- [ ] Basic site creation flow:
  - Create Tenant → Site → configure domain.
- [ ] Contact form:
  - Public site: submit form → Lead appears in Admin UI.
- [ ] Export flow:
  - From Site Backup & Export page: click "Export", see job, see download link (even if it's just dummy in dev).

---

## 5. Test data & environments

### 5.1. Seed data

Hiện repository bản tối giản **không cung cấp seed script**. Khi cần dữ liệu test:

- Chạy `pnpm payload:migrate` để đảm bảo schema mới nhất.
- Tạo thủ công các thực thể cần thiết:
  - 1 user `saasOwner` (Payload sẽ yêu cầu khi DB trống).
  - Tenant + Site mẫu (theo flow chuẩn).
  - Các bản ghi bổ sung (Pages, Forms, Products, Plans, ...) phục vụ test.
- Có thể export snapshot (pg_dump) hoặc script nội bộ riêng để tái sử dụng trong team.

### 5.2. Environments

- **local**:
  - Used for development & quick test runs.
- **staging**:
  - Used for E2E and manual QA.
  - Should mirror production config:
    - Same DB schema,
    - Same Payload version,
    - Similar env (Redis, storage, etc.).

---

## 6. CI integration

On CI (GitHub Actions), the recommended job steps:

1. Checkout + install:

   ```bash
   pnpm install
   ```

2. Setup database (Postgres) + run migrations:

   ```bash
   pnpm payload:migrate
   # Nếu cần dữ liệu sample, tự import từ snapshot riêng của team.
   ```

3. Run tests:

   ```bash
   pnpm lint
   pnpm test
   pnpm test:e2e
   ```

4. Build:

   ```bash
   pnpm build
   ```

If all steps pass, the build is considered safe to deploy.

---

## 7. When to add tests

- Any change to:
  - Auth / RBAC / workflow.
  - Billing / limits / subscription.
  - AutomationRules / AutomationRuns / Assistant.
  - Export / Backup.
  - i18n loader & routing.

→ MUST be accompanied by at least one new or updated test in the relevant area.

This keeps the core SaaS platform stable as it evolves.
