# Developer Onboarding Guide – SaaS Platform

Welcome to the project! This guide helps new developers set up, understand the repo, and start contributing confidently.

---

## 1. Setup Checklist

1. **Clone the repository**  
   ```bash
   git clone https://github.com/your-org/saas-platform.git
   cd saas-platform
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start infrastructure**
   ```bash
   docker compose up -d
   ```

4. **Run initial migrations**
```bash
pnpm payload:migrate
```

5. **Start dev server**
   ```bash
   pnpm dev
   ```

6. **Open in browser**
   - Admin: http://localhost:3000/admin  
   - Public site: http://localhost:3000/

---

## 2. Project Overview

- Built with **Next.js 16 + Payload CMS 3.63.0**
- Modular monorepo with multiple packages.
- Fully multi-lingual (Admin + Site).
- Supports multi-tenant (each tenant has many sites).
- Integrated AI (Assistant API) and analytics.

---

## 3. Key Folders

| Path | Purpose |
|------|----------|
| `apps/saas/` | Main app combining Next + Payload |
| `packages/cms/` | Payload config, collections, hooks |
| `packages/frontend/` | Components, sections, UI logic |
| `packages/themes/` | Theme definitions |
| `packages/shared/` | Utilities: cache, rate limit, storage |
| `packages/i18n/` | Translation files & config |
| `docs/` | All developer documentation |

---

## 4. Accounts & Roles

| Role | Description |
|------|--------------|
| `saasOwner` | Platform owner – can do everything |
| `saasAdmin` | Platform admin |
| `siteOwner` | Owns one site |
| `siteAdmin` | Manages a site |
| `siteEditor` | Edits content |
| `siteTranslator` | Manages translations |
| `siteViewer` | Read-only |

Tạo tài khoản `saasOwner` đầu tiên trực tiếp trong Admin khi hệ thống yêu cầu (DB trống). Sau đó tự tạo Tenant/Site/User demo để khám phá.

---

## 5. i18n (Languages)

- Admin interface language = user preference.
- Site language = based on URL or site setting.
- All translations live in `packages/i18n/locales/{lang}/`.
- Copy `vi/` to a new folder to add another language (no code changes needed).

---

## 6. Common Commands

| Command | Description |
|----------|--------------|
| `pnpm dev` | Run development mode |
| `pnpm build` | Build apps |
| `pnpm payload:migrate` | Run Payload migrations |
| `pnpm payload:upgrade` | Upgrade Payload automatically |
| `pnpm test` | Run all tests |
| `pnpm lint` | Check code formatting |

---

## 7. Testing

- Unit: Vitest / Jest
- Integration: API + DB
- E2E: Playwright / Cypress
- Test commands:  
  ```bash
  pnpm test
  pnpm test:e2e
  ```

---

## 8. Contribution Flow

1. Create branch: `feat/...` or `fix/...`  
2. Commit with Conventional Commit style.  
3. Submit pull request (PR).  
4. CI runs lint, test, and build.  
5. Get approval → merge to main.

---

## 9. Local AI Setup

Bạn có thể dùng key chung hoặc riêng cho từng site.

- Sao chép `env/example.env` thành `apps/saas/.env.local` trước khi chạy `pnpm dev`.
- Thêm key AI vào file đó:
  ```bash
  OPENAI_API_KEY=sk-...
  ASSISTANT_MODEL=gpt-4.1-mini
  ```

Each site can override key via **AiSettings** in Admin.

---

## 10. Analytics

Every site automatically tracks:
- Pageviews
- Form submissions
- Leads created
- Exports
- Automation runs

Analytics can be viewed under `Admin > Sites > Analytics`.

---

## 11. Exporting Sites

Go to **Admin → Site → Export** to:
- Create standalone bundle.
- Download `.zip` file.
- Re-run locally in `/apps/standalone/`.

---

## 12. Troubleshooting

| Issue | Solution |
|--------|-----------|
| DB connection error | Check `DATABASE_URI` và trạng thái Docker Postgres |
| Redis error | Check `REDIS_URL` or use in-memory mode |
| No login | Tạo user `saasOwner` mới trong Admin (Payload sẽ hiển thị form tạo user đầu tiên) |
| AI not working | Add `OPENAI_API_KEY` or enable AiSettings |
| Wrong language | Check i18n JSON in `packages/i18n/locales` |

---

## 13. Resources

- `docs/HANDBOOK.md` – full developer reference  
- `docs/ARCHITECTURE.md` – architecture diagram  
- `docs/UPGRADING-PAYLOAD.md` – how to safely update Payload  
- `docs/performance.md` – optimization strategies

---

## 14. Welcome!

You’re now ready to build, test, and deploy.
Remember:
> “Do not hardcode. Everything must scale, localize, and isolate.”

Happy coding 🚀
