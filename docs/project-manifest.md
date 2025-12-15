# Project Manifest – Multi-tenant SaaS Website Platform

> Dự án: **BSWeb SaaS – Multi-tenant Website SaaS with Next.js + Payload**  
> Checkpoint hiện tại: **v6.3 (extended)**  
> Mục tiêu: Nền tảng SaaS cho phép tạo nhiều website doanh nghiệp (multi-tenant, multi-site, multi-locale) với CMS mạnh, theme linh hoạt, SEO tốt, AI & Automation-ready.

---

## 1. High-level Overview

- **Type**: B2B Website SaaS platform (multi-tenant, white-label).
- **Core idea**:  
  - Mỗi **Tenant** = 1 khách hàng.  
  - Mỗi tenant có nhiều **Site** (website) độc lập: domain riêng, theme riêng, nội dung riêng, ngôn ngữ riêng.  
  - CMS trung tâm dùng **Payload 3.63.0**, frontend dùng **Next.js 16 (App Router)**.  
- **Current Phase**:  
  - **Phase 5–6: Hardening, Performance & DevOps, Automation & AI Preparation**.  
  - Hệ thống đã ~90–95% production-ready cho: SaaS core, CMS, theme, i18n, SEO, export, bảo mật cơ bản, observability.  
- **Dev style**: monorepo, clean architecture, tách rõ:
  - apps (entry Next apps)
  - packages (cms, frontend, shared, i18n, themes)
  - docs (handbook, kiến trúc, performance…)
  - checkpoint (snapshot kiến trúc & tiến độ)

---

## 2. Tech Stack Summary

### 2.1 Runtime / Framework

- **Next.js** 16.0.1:
  - App Router, React Server Components.
  - Partial Pre-Rendering (PPR) + Cache Tags + draftMode.
  - Turbopack / SWC, `output: standalone` cho deploy.
- **React** 19.0.0 (suspense/streaming, server components).  
- **Payload CMS** 3.63.0 (Next-native, KV, Jobs).  
- **Node.js** ≥ 20.x.

### 2.2 Data & Storage

- **Database**: PostgreSQL (multi-tenant friendly – sẽ cấu hình adapter).
- **KV / Cache**: Redis (prod), in-memory (dev).
- **Storage**:
  - Local & S3-compatible.
  - Upload path tách theo `tenantId/siteId` để cô lập dữ liệu.

### 2.3 UI & Theme

- Tailwind CSS, shadcn/ui, Framer Motion.
- Theme system: light/dark, primary color → auto generate 5–7 color tones.
- Page builder với **Sections** (Hero, ServicesGrid, Projects, News, CTA, Form, …).
- Responsive 100%: desktop / tablet / mobile (portrait + landscape).
- Animation presets: fade-in, slide-up, zoom, parallax, scaleIn…

### 2.4 Auth & Security

- Payload Auth + RBAC multi-tenant/multi-site.
- Roles: `saasOwner`, `saasAdmin`, `siteOwner`, `siteAdmin`, `siteEditor`, `siteTranslator`, `siteViewer`.
- 2FA cho login email; social login (Google/Facebook) + 2FA nâng cao (design).
- CSRF, rate limit, honeypot, upload hardening (MIME, path, size), CSP, security headers.

### 2.5 DevOps, Observability & Export

- Monorepo **pnpm + Turborepo**.
- Docker / Docker Compose, multi-stage build, layer cache.
- Healthcheck `/api/healthz`, Prometheus `/metrics` + Grafana dashboard.
- Structured JSON logs (tenantId, siteId, userId, latency, errorType).
- Export **Standalone Site**: bundle code + dữ liệu + seed script.

### 2.6 AI & Automation Layer

- **AiSettings** collection: chọn provider (OpenAI/others), model, per-site or global API key.
- AI hooks: SEO meta, auto translate, auto summary (design).
- **AutomationRules**: trigger/condition/action (onFormSubmit, onLeadCreated, onPublish…).
- Assistant API skeleton: `/api/assistant` (design) để thao tác nội dung & hỗ trợ user.

---

## 3. Monorepo Layout

Tại root (ví dụ: `D:/BSWeb SaaS`):

```text
.
├─ apps/
│  └─ saas/                 # Next.js + Payload embedded (SaaS control plane + sites)
│
├─ packages/
│  ├─ cms/                  # Payload config & collections + services
│  │  ├─ collections/       # Full schema con (Payload)
│  │  └─ src/services/      # searchIndex, audit, export, ...
│  ├─ frontend/             # UI components, SectionRenderer, sections
│  ├─ shared/               # logger, cacheTags, rateLimit, storage, routing helpers
│  └─ i18n/                 # i18n config + JSON locales (admin + site)
│
├─ docs/                    # Architecture, Security, Performance, Testing, ...
├─ checkpoint/              # CHECKPOINT_v6.3, v6.3-extended, SCHEMA-MASTER, ...
├─ package.json             # root scripts (dev, build, payload:upgrade...)
├─ pnpm-workspace.yaml      # workspace config
└─ README*.txt              # high-level notes
```

> Sau này có thể thêm `apps/standalone/` cho app standalone export.

---

## 4. Payload CMS Schema (Collections)

Toàn bộ schema chi tiết nằm trong `SCHEMA-MASTER.md` + các file `.ts` trong `packages/cms/collections` (đã được sinh từ AI).  

### 4.1 Collections chính

- **Core / SaaS**
  - `Users` – user auth + roles + adminLanguage.
  - `Tenants` – tenant (khách hàng) + plan, limits, owners.
  - `Sites` – site thuộc tenant: domains, locales, status, theme, settings, export flags.
- **Theme & Settings**
  - `Themes` – theme registry (`company-industrial`, v.v.), config, pageBlueprints, default sections.
  - `ThemeSettings` – mapping site ↔ theme, primaryColor, palette, layout, typography.
  - `ThemeOverrides` – override từng section/page/global.
  - `Settings` – site settings: SEO default, contact info, social links, advanced JSON.
  - `AiSettings` – AI provider config, token limits, enabled features.
- **Content**
  - `Industries` – ngành nghề.
  - `Taxonomies` – category, tag, industry taxonomy (multi-locale).
  - `Posts` – news/project/job/video/blog, workflow & SEO.
  - `Products` – sản phẩm, thuộc tính, gallery.
  - `Pages` – page builder: sections, layout, visibility, animation, SEO.
  - `Media` – upload media (image/PDF), alt text, tenant/site isolation.
  - `ContentAttributes` – schema cho flags/attributes tùy biến.
- **Forms & Leads**
  - `Forms` – form builder (fields, validation keys, submitHandler).
  - `Leads` – dữ liệu gửi form, status pipeline, assignedTo, aiReply (plan).
- **Search & Analytics**
  - `SearchIndex` – index gọn cho posts/products/pages theo site/locale.
  - `AnalyticsDailyStats` – pageviews, visitors, leads, automationRuns, exports, aiTokens.
- **Audit, Automation, Extensions**
  - `AuditEvents` – login, CRUD, publish, export, permissionChange.
  - `AutomationRules` – trigger/condition/action.
  - `AutomationRuns` – log kết quả chạy rule.
  - `AssistantRuns` – log call AI assistant.
  - `Extensions` – extension registry (block/theme/integration).
  - `SiteExtensions` – site enable extension + config + license.
- **Demo**
  - `DemoContentSets` – bộ dữ liệu demo per theme/industry để seed nhanh.

> Các file TypeScript tương ứng nằm trong: `packages/cms/collections/*.ts` + `index.ts` export `collections: CollectionConfig[]`.

---

## 5. Frontend & UX

### 5.1 Site Rendering

- Entry: `apps/saas/app/(site)/[siteSlug]/page.tsx`
  - Nhận `siteSlug`, sau này sẽ:
    - Resolve site từ Payload (domain → site).
    - Lấy page chính (home) theo locale & slug.
  - Hiện đang dùng **mock page** + `SectionRenderer`.

### 5.2 Section Renderer

- `packages/frontend/components/SectionRenderer.tsx`
  - Nhận `sections` từ CMS (Page.sections).
  - Map `section.key` → component tương ứng (HeroSection, ServicesGrid, ProjectsCarousel, …).
  - Có chỗ để gắn:
    - visibility per device,
    - layoutType (row/grid/slider),
    - animation preset.

- `packages/frontend/components/sections/HeroSection.tsx`
  - Demo Hero; placeholder để sau này lấy text từ i18n key (`site-landing:hero.title`, v.v.).

### 5.3 i18n (Admin & Site)

- Gói dùng chung: `packages/i18n` (thiết kế):
  - `config/locales.ts` – danh sách locale + default.
  - `config/i18n-config.ts` – config chung cho app.
  - `locales/{lang}/{namespace}.json`:
    - `common.json`, `validation.json`, `date-time.json`
    - `admin-core.json`, `admin-users.json`, `admin-billing.json`
    - `site-core.json`, `site-landing.json`
    - `theme-*.json`
- Quy tắc:
  - Không hard-code text dạng `"Email"`, `"Message"` trong component; thay bằng key i18n.
  - Admin: ngôn ngữ hiển thị theo `user.adminLanguage`.
  - Site: ngôn ngữ theo locale trong URL / cấu hình site.

---

## 6. DevOps, Performance & Security Playbooks

### 6.1 Performance & Cache

- Bật **PPR + cache tags** cho từng site/locale/collection.
- Redis cache TTL 5–10 phút cho:
  - Settings, ThemeSettings, Site config, route map.
- CDN + image optimization (`/img/[...path]`, `sharp` + WebP + lazyload).
- React streaming + `Suspense` cho các block nặng; `React.memo` cho block tĩnh.
- Mục tiêu Lighthouse:
  - Performance > 90
  - SEO > 95
  - TTFB < 600ms.

### 6.2 Security

- 2FA bắt buộc cho login email (token ngắn hạn, auto logout sau 8h).
- Social login + 2FA nâng cao cho action nhạy cảm.
- Upload hardening: MIME check, extension filter, path prefix theo tenant/site.
- Rate limit:
  - Login: theo IP + account.
  - Forms: per IP, có honeypot + invisible captcha.
- AuditEvents đầy đủ cho hành vi quan trọng.
- WAF light rules: chặn spam / brute-force cơ bản.

### 6.3 Monitoring & Recovery

- `/api/healthz` – health check.
- `/metrics` – Prometheus (site_total, leads_today, error counts…).
- Alert webhook (Slack/Discord) khi error > X% hoặc healthcheck fail.
- Auto container restart (Docker healthcheck) + retry jobs (Payload Jobs 3x).

### 6.4 Testing

- Unit test: utils, services (searchIndex, audit, export…).
- Integration: API endpoints (forms submit, assistant, export).
- E2E: flow tạo tenant → site → page → deploy → export.

---

## 7. Key Docs & Handbooks (dự kiến trong docs/)

- `HANDBOOK.txt` – Developer & Operator Handbook.
- `ARCHITECTURE.md` – kiến trúc tổng thể.
- `ONBOARDING.md` – hướng dẫn setup & chạy project.
- `SECURITY.md` – chính sách bảo mật.
- `PERFORMANCE.md` / `performance.md` – tối ưu hiệu năng.
- `CACHE-STRATEGY.md` – chiến lược cache & invalidation.
- `TESTING-STRATEGY.md` – chiến lược test.
- `UPGRADING-PAYLOAD.md` – quy trình `pnpm payload:upgrade`.
- `BILLING.md` – skeleton billing (phase sau).
- `MONITORING.md` – quan trắc & alert.
- `AUTOMATION.md` – thiết kế Automation Rules.
- `AI-ASSISTANT.md` – thiết kế API assistant & model usage.
- `ANALYTICS.md` – analytics dashboard.
- `EXPORT.md` – export standalone site.
- `THEME-SYSTEM.md` – theme & tokens.
- `I18N.md` – quy ước i18n.
- `WORKFLOW.md` – workflow engine.
- `FORMS.md` – form builder & lead pipeline.

---

## 8. Scripts & Commands Quan Trọng

Tại root:

```bash
# Dev app SaaS (Next + Payload embed)
pnpm dev

# Build
pnpm build

# (Gợi ý scripts)
"scripts": {
  "dev": "pnpm --filter saas-app dev",
  "build": "pnpm --filter saas-app build",
  "payload:migrate": "payload migrate --config apps/saas/payload.config.ts",
  "payload:upgrade": "payload update --config apps/saas/payload.config.ts"
}
```

Biến môi trường (ví dụ production):

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://app.example.com

PAYLOAD_SECRET=...long-random...

DATABASE_URI=postgres://user:pass@host:5432/dbname
REDIS_URL=redis://user:pass@host:6379

PAYLOAD_CACHE_TAGS=true
```

---

## 9. Trạng thái & Roadmap

### 9.1 Gần production

- Kiến trúc monorepo & module split.
- Multi-tenant model (Tenants / Sites / Domains / Locales).
- Content model (Posts / Products / Pages / Forms / Leads / Media / SearchIndex).
- Theme system & page builder concept.
- I18n strategy (admin + site).
- Export standalone & extension registry (schema & docs).
- Performance & security playbook.
- Quy trình upgrade Payload bằng `pnpm payload:upgrade`.

### 9.2 Skeleton / cần hoàn thiện

- Next-native Payload handler (`/api/payload/[...route]` + `/admin`).
- Hooks: SearchIndex, Audit, Automation.
- AI integration (OpenAI / provider khác) dựa trên AiSettings.
- Analytics Dashboard UI.
- Automation Rules UI + Assistant UI.

### 9.3 Phase sau

- Billing / Subscription thực tế.
- Marketplace UI cho Extensions.
- Conversational AI assistant full cho admin & end-user.

---

## 10. Cách dùng Manifest

- Dùng như **“bản đồ hệ thống”** để:
  - Onboard dev mới.
  - Tra cứu nhanh module & docs.
  - Làm gốc cho các checkpoint sau (v7, v8…).

- Khi có thay đổi lớn:
  - Cập nhật SCHEMA-MASTER + docs.
  - Sinh lại `project-manifest.md` phiên bản mới (v6.4, v7.0…).

