# ⚙️ Performance Handbook
> **Phiên bản:** v1.0 – Phase 5 / High-Performance Optimization  
> **Áp dụng cho:** Next.js 16 + Payload CMS 3.63.0+  
> **Phạm vi:** mọi API / RSC route / content fetch / automation job  

---

## 🧭 Mục tiêu
Tài liệu này định nghĩa các quy tắc “chuẩn vàng” về **hiệu năng – caching – truy vấn – render**, đảm bảo toàn hệ thống đạt mức **enterprise-grade DX + speed**.

---

## 1️⃣ Nguyên tắc chung

| Mục | Quy tắc |
|-----|----------|
| ⚡ Performance trước tiên | Mọi route và component phải có **chiến lược cache rõ ràng** (Redis / Tag / TTL). |
| 🧩 Isolation | Mọi dữ liệu phải được phân lập theo `tenantId`, `siteId`, `locale`. |
| 🧠 Predictable Cache | Cache key = deterministic + có TTL hợp lý. |
| 🔁 Safe Invalidation | Chỉ xóa cache qua **tag** (`revalidateTag`) – không xoá bừa. |
| 🧱 1 nguồn Payload duy nhất | Tất cả API server-side đều dùng `localAPI`. |
| 🧮 Query cố định | Không fetch dữ liệu dư (luôn có `limit`, `where`, `depth`). |
| 🚫 Không SSR toàn trang | Ưu tiên **Partial Pre-Rendering (PPR)** hoặc **RSC streaming**. |
| 🧹 Render tối giản | `React.memo()` cho block nặng, dynamic import cho phần hiếm dùng. |

---

## 2️⃣ Cấu trúc cache & TTL

### Redis cache key convention

```ts
page: (siteId, locale, slug) => `page:${siteId}:${locale}:${slug}`,
list: (siteId, locale, collection, hash) => `list:${siteId}:${locale}:${collection}:${hash}`,
settings: (siteId, locale) => `settings:${siteId}:${locale}`,
```

### Redis TTL guideline

| Loại dữ liệu | TTL (giây) | Mục đích |
|---------------|------------|----------|
| Page / Post detail | 300 | Cache ngắn để revalidate nhanh |
| Listing (blog, products) | 300–600 | Giảm tần suất truy vấn Payload |
| Theme / Settings / Navigation | 900 | Hiếm khi đổi |
| Sitemap / SEO / JSON-LD | 3600 | Chỉ invalidate khi publish global |
| Search index | 600 | Làm mới định kỳ job |
| Leads / Forms | Không cache | Dữ liệu realtime |

---

## 3️⃣ Cache Tag convention (Next.js ↔ Payload)

| Collection | Tag format | Khi invalidate |
|-------------|-------------|----------------|
| `pages` | `site:{siteId}:{locale}:pages` | Khi publish/update page |
| `posts` | `site:{siteId}:{locale}:posts` | Khi publish/update post |
| `products` | `site:{siteId}:{locale}:products` | Khi publish/update product |
| `settings` | `site:{siteId}:{locale}:settings` | Khi cập nhật cấu hình site |
| `themes` | `theme:{themeId}` | Khi cập nhật theme base |

---

## 4️⃣ React Server Components + Cache Layer

```tsx
import { cacheTag } from 'next/cache';
import { cache } from '@bsweb/shared/cache';
import { cacheKeys } from '@bsweb/shared/cache/cacheKeys';
import { cacheTags } from '@bsweb/shared/cache/cacheTags';
import { localAPI } from '@bsweb/cms/localApi';

export default async function PublicPage({ params }) {
  const { locale, slug = [] } = params;
  const slugPath = slug.join('/') || 'home';
  const siteId = 'current-site-id';

  // Tag collection-level cache
  cacheTag(cacheTags.pages(siteId, locale));
  // Tag specific page cache
  cacheTag(cacheTags.page(siteId, locale, slugPath));

  const page = await cache({
    key: cacheKeys.page(siteId, locale, slugPath),
    ttlSeconds: 300,
    loader: async () =>
      localAPI.findOne('pages', {
        collection: 'pages',
        where: {
          and: [
            { site: { equals: siteId } },
            { locale: { equals: locale } },
            { slug: { equals: slugPath } },
            { _status: { equals: 'published' } },
          ],
        },
        depth: 2,
      }),
  });

  return <PageRenderer page={page} />;
}
```

---

## 5️⃣ Database optimization (PostgreSQL)

```sql
CREATE INDEX idx_posts_site_locale_slug
  ON posts ("siteId", "locale", "slug");

CREATE INDEX idx_search_site_locale_type
  ON search_index ("siteId", "locale", "type", "publishedAt");

CREATE INDEX idx_leads_site_status_created
  ON leads ("siteId", "status", "createdAt");
```

---

## 6️⃣ Rendering & Frontend Performance

| Kỹ thuật | Ghi chú |
|-----------|----------|
| **Partial Pre-Rendering (PPR)** | Dùng cho page semi-static (home, about, blog). |
| **Streaming + Suspense** | Cho layout dài hoặc có nhiều section async. |
| **Dynamic import** | Chỉ load JS khi cần: slider, modal, animation nặng. |
| **Image pipeline** | `/img/...` → Sharp resize + WebP + lazyload. |
| **React.memo()** | Cho block nặng (list dài, gallery, animation). |
| **Framer Motion** | Giới hạn trong 1–2 section; không wrap toàn page. |

---

## 7️⃣ Lighthouse target

| Chỉ số | Mục tiêu |
|---------|-----------|
| Performance | ≥ 90 |
| SEO | ≥ 95 |
| TTFB | < 600 ms |
| LCP | < 1.5 s |
| CLS | < 0.05 |

---

## 8️⃣ Dev checklist (trước khi merge PR)

- [ ] Đã có TTL + cacheTag hợp lý  
- [ ] Query giới hạn `limit`, `depth`, `where` đầy đủ  
- [ ] Không có `fetch()` client-side thừa  
- [ ] Đã verify Lighthouse ≥ 90  
- [ ] Không commit `.env` hay secret  
- [ ] Chạy `pnpm build && pnpm typecheck` không lỗi  

---

> 🧠 **Tóm tắt “nguyên tắc vàng”**
>
> - Mọi route → có tag.  
> - Mọi query → có TTL.  
> - Mọi publish → gọi revalidate.  
> - Mọi dữ liệu → có site + locale.  
> - Không cache bừa, không query thừa.  
