# SCHEMA MASTER – SaaS CMS (Next.js 16 + Payload 3.63.0)

> Single source of truth cho toàn bộ **schema business** & **Payload collections**.  
> Mọi thay đổi schema nên được cập nhật ở đây trước, sau đó mới sửa code.

> **Update v6.4**  
> - Version Payload hiện tại: **3.63.0**.  
> - Bổ sung lưu ý về **polymorphic uploads** và **đa locale** theo khả năng mới của Payload.  
> - Không thay đổi shape dữ liệu so với trước – chỉ thêm ghi chú & tùy chọn mở rộng tương lai.

---

## 0. CONVENTIONS

- `id`: UUID / text (Payload default)
- `createdAt`, `updatedAt`: auto (Payload)
- `_status`: `draft` | `pending` | `published` (nếu có workflow)
- `locale`: mã ngôn ngữ (`vi`, `en`, `ja`, `zh`, …)
- `tenant`: relationship → **Tenants**
- `site`: relationship → **Sites**
- `user`: relationship → **Users**

**Field types (business level):**

- `text` – chuỗi ngắn
- `richText` – nội dung dạng rich text
- `number` – số
- `boolean` – true/false
- `select` – enum giá trị
- `date` – ngày/giờ
- `json` – cấu trúc JSON tự do
- `relationship` – tham chiếu tới collection khác
- `upload` – Payload upload field
- `array<T>` – danh sách phần tử T
- `group` – nhóm field con

> **Payload 3.63.0 note – polymorphic uploads**  
> Hiện tại ta vẫn dùng **một collection Media chung**. Trong tương lai nếu cần, có thể chuyển các field như `thumbnail`, `ogImage` sang **polymorphic uploads**.  
> Bản này giữ nguyên model để code & migration đơn giản.

---

## 1. CORE IDENTITY & ACCESS

### 1.1 Users

**Mục đích:** tài khoản người dùng hệ thống (SaaS + per-site).

**Fields:**

- `id: text` (auto)
- `email: text` (required, unique)
- `password: text` (hash, internal)
- `name: text`
- `roles: array<select>`  
  - Giá trị: `saasOwner`, `saasAdmin`, `siteOwner`, `siteAdmin`, `siteEditor`, `siteTranslator`, `siteViewer`
- `tenants: array<relationship Tenants>`  
  - Tenants mà user thuộc về
- `sites: array<relationship Sites>` (optional)  
  - Site user có quyền đặc biệt
- `adminLanguage: select`  
  - `vi`, `en`, `ja`, `zh`, …
- `twoFactorEnabled: boolean`
- `twoFactorVerifiedAt: date`
- `lastLoginAt: date`
- `status: select`  
  - `active`, `suspended`, `invited`

---

### 1.2 Tenants

**Mục đích:** đại diện cho một khách hàng SaaS (tổ chức).

**Fields:**

- `id: text` (auto)
- `name: text` (required)
- `slug: text` (required, unique)
- `owners: array<relationship Users>`  
  - ít nhất 1 `saasOwner`/`saasAdmin`
- `plan: select`  
  - `free`, `pro`, `enterprise`
- `sitesLimit: number`
- `localesLimit: number`
- `storageLimitMb: number`
- `isActive: boolean`
- `metadata: json`  
  - tuỳ biến, ví dụ mã CRM, ghi chú hợp đồng

---

### 1.3 Sites

**Mục đích:** 1 website cụ thể thuộc 1 tenant.

**Fields:**

- `id: text`
- `tenant: relationship Tenants` (required)
- `name: text` (required)
- `slug: text` (required, unique)
- `domains: array<group>`
  - `host: text` (ví dụ: `tenant.example.com`, `acme.com`)
  - `isPrimary: boolean`
  - `isStaging: boolean`
- `locales: array<group>`
  - `code: text` (`vi`, `en`, …)
  - `isDefault: boolean`
  - `licensed: boolean` (theo license)
- `defaultLocale: text`
- `theme: relationship Themes`
- `settings: relationship Settings`
- `status: select`  
  - `active`, `suspended`, `archived`
- `exportEnabled: boolean`
- `notes: text`

---

## 2. THEME & SETTINGS

### 2.1 Themes

**Mục đích:** định nghĩa theme (design + cấu trúc sections) dùng chung.

**Fields:**

- `id: text`
- `key: text` (unique, ví dụ: `company-industrial`)
- `name: text`
- `description: text`
- `version: text`
- `config: json`  
  - đọc từ `theme.config.ts`
- `pageBlueprints: json`
- `defaultSections: json`
- `isActive: boolean`

---

### 2.2 ThemeSettings

**Mục đích:** cấu hình theme cấp site (branding, màu sắc…).

**Fields:**

- `id: text`
- `site: relationship Sites` (required)
- `theme: relationship Themes` (required)
- `primaryColor: text`
- `palette: json`  
  - 5–7 màu auto-gen từ primaryColor
- `darkModeEnabled: boolean`
- `typography: json`  
  - font, size, spacing
- `layout: json`  
  - container width, grid, spacing

---

### 2.3 ThemeOverrides

**Mục đích:** override theme mặc định cho từng site/section.

**Fields:**

- `id: text`
- `site: relationship Sites`
- `theme: relationship Themes`
- `target: select`  
  - `section`, `page`, `global`
- `targetKey: text`  
  - ví dụ `hero-default`, `home-page`
- `overrides: json`  
  - màu, spacing, animation, v.v.

---

### 2.4 Settings

**Mục đích:** general settings cấp site.

**Fields:**

- `id: text`
- `site: relationship Sites`
- `seoDefaults: group`
  - `titleTemplate: text`
  - `defaultDescription: text`
  - `defaultImage: relationship Media`
- `contact: group`
  - `phone: text`
  - `email: text`
  - `address: text`
- `socialLinks: array<group>`
  - `label: text`
  - `url: text`
- `advanced: json`  
  - tuỳ biến thêm

---

### 2.5 AiSettings

**Mục đích:** cấu hình AI/Assistant cho site.

**Fields:**

- `id: text`
- `site: relationship Sites`
- `provider: select`  
  - `openai`, `azure`, `other`
- `model: text`  
  - `gpt-4.1-mini`, `gpt-4.1`, …
- `apiKeyMode: select`  
  - `global`, `perSite`
- `siteApiKey: text` (optional, encrypted)
- `maxTokensPerRequest: number`
- `dailyTokenLimit: number`
- `featuresEnabled: group`
  - `seo: boolean`
  - `translate: boolean`
  - `summary: boolean`
  - `assistantChat: boolean`

---

## 3. CONTENT MODEL

### 3.1 Taxonomies

**Mục đích:** ngành nghề, danh mục, thẻ.

**Fields:**

- `id: text`
- `tenant: relationship Tenants`
- `site: relationship Sites`
- `type: select`  
  - `category`, `tag`, `industry`
- `slug: text`
- `title: text`
- `locale: text`
- `parent: relationship Taxonomies` (optional)
- `_status: select` (`draft`, `published`)

---

### 3.2 Posts

**Mục đích:** tin tức / dự án / tuyển dụng / blog / video.

**Fields:**

- `id: text`
- `tenant: relationship Tenants`
- `site: relationship Sites`
- `type: select`  
  - `news`, `project`, `job`, `video`, `blog`
- `locale: text`
- `slug: text`
- `title: text`
- `excerpt: text`
- `content: richText`
- `categories: array<relationship Taxonomies>`
- `tags: array<relationship Taxonomies>`
- `thumbnail: relationship Media`
- `publishAt: date`
- `_status: select` (`draft`, `pending`, `published`)
- `workflowState: select` (`draft`, `inReview`, `approved`, `rejected`)
- `seo: group`
  - `metaTitle: text`
  - `metaDescription: text`
  - `ogImage: relationship Media`
- `translations: array<group>`
  - `locale: text`
  - `linkedPost: relationship Posts`

> **Note – Payload localized fields**  
> Ở code Payload thực tế, một số field (ví dụ `title`, `excerpt`, `content`) có thể dùng `localized: true` thay vì mảng `translations`. Schema master giữ cả 2 hướng để linh hoạt, nhưng **implementation v6.4 ưu tiên `localized: true`** cho các field text chính.

---

### 3.3 Products

**Mục đích:** mô tả sản phẩm/dịch vụ.

**Fields:**

- `id: text`
- `tenant: relationship Tenants`
- `site: relationship Sites`
- `locale: text`
- `slug: text`
- `name: text`
- `sku: text`
- `price: number`
- `currency: text`
- `summary: text`
- `description: richText`
- `categories: array<relationship Taxonomies>`
- `thumbnail: relationship Media`
- `gallery: array<relationship Media>`
- `_status: select`
- `seo: group` (tương tự Posts)
- `attributes: array<group>`
  - `label: text`
  - `value: text`

---

### 3.4 Pages

**Mục đích:** trang tĩnh & landing (dùng page builder).

**Fields:**

- `id: text`
- `tenant: relationship Tenants`
- `site: relationship Sites`
- `locale: text`
- `slug: text` (home = `/`)
- `title: text`
- `description: text`
- `template: select`  
  - `default`, `landing`, `blog-index`, …
- `sections: array<group>`
  - `key: text` (section type: `hero`, `servicesGrid`, …)
  - `data: json` (config)
  - `visibility: group`
    - `desktop: boolean`
    - `tablet: boolean`
    - `mobile: boolean`
  - `layout: group`
    - `type: select` (`row`, `grid`, `slider`)
    - `columns: number`
  - `animation: group`
    - `preset: select` (`fadeIn`, `slideUp`, `zoom`, `parallax`)
    - `delayMs: number`
- `_status: select`
- `seo: group`

---

### 3.5 Media

**Mục đích:** upload file / ảnh / tài liệu.

**Fields:**

- `id: text`
- `tenant: relationship Tenants`
- `site: relationship Sites`
- `file: upload`
- `filename: text`
- `mimeType: text`
- `size: number`
- `alt: text`
- `folder: text`
- `width: number`
- `height: number`

> **Payload 3.63.0 – polymorphic upload strategy (optional)**  
> - Hiện dùng 1 collection `Media` cho tất cả uploads.  
> - Nếu sau này muốn phân loại (ví dụ `mediaImages`, `mediaDocs`) có thể:
>   - Giữ schema business này, nhưng trong code Payload tách nhiều upload collections.  
>   - Hoặc dùng khả năng **polymorphic uploads** để một field tham chiếu nhiều upload collections.  
> - Bản hiện tại chưa bật polymorphic để tránh phức tạp hóa migration.

---

### 3.6 ContentAttributes

**Mục đích:** attribute/flag nội dung dùng chung.

**Fields:**

- `id: text`
- `key: text` (unique)
- `label: text`
- `description: text`
- `type: select`  
  - `boolean`, `string`, `number`
- `defaultValue: text/number/boolean`

---

## 4. FORMS & LEADS

### 4.1 Forms

**Mục đích:** cấu hình form frontend.

**Fields:**

- `id: text`
- `tenant: relationship Tenants`
- `site: relationship Sites`
- `key: text` (unique per site, ví dụ: `contact`, `quote`)
- `title: text`
- `description: text`
- `fields: array<group>`
  - `name: text` (internal field name)
  - `type: select` (`text`, `textarea`, `email`, `phone`, `select`, `checkbox`, `radio`, `file`)
  - `labelKey: text`  
    - ví dụ: `site-forms:contact.email.label`
  - `placeholderKey: text`
  - `required: boolean`
  - `options: array<group>` (nếu type là select/radio)
    - `value: text`
    - `labelKey: text`
- `submitHandler: select`  
  - `lead`, `webhook`, `email`
- `successMessageKey: text`
- `errorMessageKey: text`
- `active: boolean`

---

### 4.2 Leads

**Mục đích:** lưu lead từ form.

**Fields:**

- `id: text`
- `tenant: relationship Tenants`
- `site: relationship Sites`
- `form: relationship Forms`
- `locale: text`
- `data: json`  
  - (map fieldName → value)
- `status: select`  
  - `new`, `inProgress`, `won`, `lost`
- `assignedTo: relationship Users`
- `source: text` (URL)
- `summary: text` (AI-generated)
- `aiReply: text` (AI suggestion)
- `createdAt: date`

---

## 5. SEARCH & ANALYTICS

### 5.1 SearchIndex

**Mục đích:** index nhẹ cho search nhanh.

**Fields:**

- `id: text`
- `tenant: relationship Tenants`
- `site: relationship Sites`
- `collection: select`  
  - `posts`, `products`, `pages`
- `docId: text`
- `locale: text`
- `slug: text`
- `title: text`
- `excerpt: text`
- `path: text`
- `tags: array<text>`
- `publishedAt: date`

---

### 5.2 AnalyticsDailyStats

**Mục đích:** aggregate analytics theo ngày, per site.

**Fields:**

- `id: text`
- `tenant: relationship Tenants`
- `site: relationship Sites`
- `date: date` (YYYY-MM-DD)
- `pageviews: number`
- `uniqueVisitors: number`
- `leads: number`
- `forms: number`
- `automationRuns: number`
- `exports: number`
- `aiTokens: number`

---

## 6. AUDIT, AUTOMATION & AI

### 6.1 AuditEvents

**Mục đích:** log hành động quan trọng.

**Fields:**

- `id: text`
- `tenant: relationship Tenants`
- `site: relationship Sites`
- `user: relationship Users` (optional)
- `type: select`
  - `login`, `logout`, `loginFailed`,  
    `create`, `update`, `delete`,  
    `publish`, `export`, `permissionChange`
- `collection: text`
- `docId: text`
- `meta: json`
- `createdAt: date`

---

### 6.2 AutomationRules

**Mục đích:** định nghĩa rule automation.

**Fields:**

- `id: text`
- `tenant: relationship Tenants`
- `site: relationship Sites`
- `name: text`
- `description: text`
- `enabled: boolean`
- `trigger: select`
  - `form.submit`, `lead.created`, `post.published`, `export.completed`
- `conditions: json`  
  - (DSL đơn giản: field/op/value)
- `actions: array<group>`
  - `type: select`
    - `email`, `webhook`, `ai.reply`, `ai.summary`, `ai.seo`, `ai.translate`, `log`
  - `config: json`
- `runAs: relationship Users` (optional)

---

### 6.3 AutomationRuns

**Mục đích:** log mỗi lần rule chạy.

**Fields:**

- `id: text`
- `rule: relationship AutomationRules`
- `tenant: relationship Tenants`
- `site: relationship Sites`
- `triggeredAt: date`
- `status: select`  
  - `success`, `failed`, `skipped`
- `error: text`
- `input: json`
- `output: json`
- `latencyMs: number`

---

### 6.4 AssistantRuns

**Mục đích:** log tương tác với Assistant.

**Fields:**

- `id: text`
- `tenant: relationship Tenants`
- `site: relationship Sites`
- `user: relationship Users` (optional)
- `type: select`  
  - `seo`, `translate`, `summary`, `chat`
- `model: text`
- `tokensPrompt: number`
- `tokensCompletion: number`
- `tokensTotal: number`
- `request: json`
- `response: json`
- `createdAt: date`

---

## 7. EXTENSIONS & MARKETPLACE

### 7.1 Extensions

**Mục đích:** registry extension toàn hệ thống.

**Fields:**

- `id: text`
- `key: text` (unique, ví dụ `ext:form:hubspot`)
- `name: text`
- `description: text`
- `type: select`
  - `block`, `integration`, `theme`
- `configSchema: json`
- `version: text`
- `isActive: boolean`

---

### 7.2 SiteExtensions

**Mục đích:** cấu hình extension cho từng site.

**Fields:**

- `id: text`
- `site: relationship Sites`
- `extension: relationship Extensions`
- `enabled: boolean`
- `config: json`
- `license: select`
  - `free`, `paid`, `trial`

---

## 8. SYSTEM / MISC

### 8.1 DemoContentSets

**Mục đích:** bộ nội dung demo để seed site.

**Fields:**

- `id: text`
- `key: text` (unique)
- `name: text`
- `description: text`
- `theme: relationship Themes`
- `data: json`  
  - nội dung pages/posts/products demo

---

### 8.2 Industries

**Mục đích:** ngành nghề cho site/theme/demo.

**Fields:**

- `id: text`
- `key: text` (unique, `cnc`, `logistics`, …)
- `name: text`
- `description: text`
- `icon: text` (tên icon)

---

## 9. GLOBAL FIELDS / PATTERNS

Áp dụng cho hầu hết các collection:

- `createdAt: date`
- `updatedAt: date`
- `_status: select` (`draft`, `pending`, `published`) – nếu có workflow
- `tenant: relationship Tenants`
- `site: relationship Sites` – cho content liên quan site
- `locale: text` – cho content đa ngôn ngữ

---

> 🔐 Quy trình thay đổi schema:
> 1. Cập nhật ở đây (**SCHEMA-MASTER.md**).  
> 2. Sync sang code Payload (`packages/cms/collections/*.ts`).  
> 3. Chạy migration / seed lại nếu cần.
