# Cache Strategy & Performance Layer – SaaS Platform

This document describes how caching, revalidation, and content delivery are managed across tenants and sites to ensure speed, scalability, and cost efficiency.

---

## 1. Overview

Caching is a multi-layered system combining:
- **Edge caching** (via CDN / Cloudflare / Vercel Edge)
- **Redis caching** (in-memory, tenant/site scoped)
- **RevalidateTag** system (Next.js 16 feature)
- **SWR hooks** (frontend client caching)
- **Incremental Static Regeneration (ISR)** for hybrid rendering

Goal: Deliver <100ms response times for cached content.

---

## 2. Cache Layers Summary

| Layer | Type | Scope | TTL | Purpose |
|--------|------|--------|-----|----------|
| Browser Cache | Client-side | Per user | Short (5–30 min) | Reduce network roundtrips |
| Edge Cache | CDN / Proxy | Global | 10–60 min | Offload static assets & pages |
| Redis Cache | Server-side | Per tenant/site | 1–24h | Fast data access |
| ISR / Revalidate | Build-time + on-demand | Per page | 1–12h | Hybrid regeneration |
| SWR Cache | Client React hooks | Per component | 5–15 min | UI reactivity |

---

## 3. Redis Caching

### Structure

Redis keys follow convention:
```
cache:{tenant}:{site}:{namespace}:{key}
```

Example:
```
cache:t5g:anvinh:page:home
cache:t5g:anvinh:products:list
```

### Libraries Used
- `ioredis` - Primary Redis client
- `@upstash/redis` (optional, for serverless)

### Configuration

Environment variables:
- `REDIS_URL` - Redis connection string (default: `redis://redis:6379/0` in Docker)
- `REDIS_MAX_MEMORY_MB` - Maximum memory for Redis (default: `512`)
- `PAYLOAD_CACHE_TAGS` - Enable cache tags (default: `true`)
- `CACHE_ADAPTER_PREFIX` - Cache key prefix (default: `payload:cache:`)
- `CACHE_ADAPTER_DEFAULT_TTL` - Default TTL in seconds (default: `300`)

### Cache Adapter

> **Note**: Payload CMS 3.63.0 does not support cache adapter in `buildConfig`.
> The Redis cache adapter (`createRedisCacheAdapter`) is available for app-level caching
> but is not integrated into Payload configuration.
> 
> Current cache strategy uses Next.js cache tags (`revalidateTag`) for cache invalidation.

### Helpers

```ts
import { getRedis } from "@bsweb/shared/cache/redisClient";

const redis = getRedis();
if (redis) {
  const cached = await redis.get("cache:t5g:anvinh:page:home");
  if (!cached) {
    const page = await payload.findByID("pages", id);
    await redis.setex("cache:t5g:anvinh:page:home", 3600, JSON.stringify(page));
  }
}
```

---

## 4. Next.js revalidateTag System

Each content type emits a **cache tag** using the format: `site:{siteId}:{locale}:{collection}:{identifier?}`

| Content | Tag Format | Example |
|----------|------------|---------|
| Site | `site:{siteId}` | `site:abc123` |
| Collection | `site:{siteId}:{locale}:{collection}` | `site:abc123:vi:pages` |
| Page | `site:{siteId}:{locale}:pages:{slug}` | `site:abc123:vi:pages:/home` |
| Post | `site:{siteId}:{locale}:posts:{slug}` | `site:abc123:vi:posts:blog-post` |
| Product | `site:{siteId}:{locale}:products:{slug}` | `site:abc123:vi:products:product-slug` |
| Settings | `site:{siteId}:{locale}:settings` | `site:abc123:vi:settings` |
| Theme | `theme:{themeId}` | `theme:theme-123` |
| i18n | `i18n:{locale}` | `i18n:vi` |

### Usage in Next.js Server Components

Tag cache in Server Components:

```tsx
import { cacheTag } from "next/cache";
import { cacheTags } from "@bsweb/shared/cache/cacheTags";

export default async function SitePage({ params }) {
  const { siteId, locale, pageSlug } = params;

  // Tag collection-level cache
  cacheTag(cacheTags.pages(siteId, locale));
  // Tag item-level cache
  cacheTag(cacheTags.page(siteId, locale, pageSlug));
  // Tag site-level cache
  cacheTag(cacheTags.site(siteId));

  // ... fetch and render page
}
```

### Usage in Payload Hooks

Revalidate cache when content changes:

```ts
import { revalidateDocumentCache } from "@bsweb/cms/src/services/cacheRevalidation";

const handleAfterChange: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== "create" && operation !== "update") {
    return doc;
  }

  await Promise.all([
    // ... other operations
    revalidateDocumentCache({
      payload: req.payload,
      collection: "pages",
      doc,
      operation: operation === "create" ? "create" : "update",
    }),
  ]);

  return doc;
};
```

### Usage via API Route

Revalidate cache via API:

```ts
// POST /api/revalidate
// Authorization: Bearer <REVALIDATE_SECRET>
// Content-Type: application/json
{
  "tags": [
    "site:abc123:vi:pages",
    "site:abc123:vi:pages:/home"
  ]
}
```

This ensures updated content instantly refreshes without full rebuilds.

---

## 5. ISR (Incremental Static Regeneration)

Each static page can be revalidated periodically or manually.

```ts
export const revalidate = 3600; // 1 hour
```

Or via API route:

```
POST /api/revalidate?tag=page:home
```

---

## 6. SWR (Stale-While-Revalidate)

Used in client-side React components for fast UX updates.

```tsx
const { data } = useSWR(`/api/pages/${slug}`, fetcher, {
  revalidateOnFocus: true,
  dedupingInterval: 30000
});
```

Behavior:
- Returns cached data instantly.
- Refreshes in background.
- Updates UI automatically.

---

## 7. CDN Layer

Recommended setup:
- Cloudflare / Vercel Edge caching
- Serve `/public/*` and `/uploads/*` with long-lived headers
- Enable Brotli & HTTP/3
- Cache HTML with “stale-while-revalidate” directive

```nginx
location /uploads/ {
  expires 7d;
  add_header Cache-Control "public, max-age=604800, immutable";
}
```

---

## 8. Cache Invalidation Policy

| Event | Action | Tags Invalidated |
|--------|---------|------------------|
| Page created/updated | `revalidateDocumentCache()` | `site:{siteId}:{locale}:pages`, `site:{siteId}:{locale}:pages:{slug}`, `site:{siteId}` |
| Page deleted | `revalidateDocumentCache({ operation: "delete" })` | `site:{siteId}:{locale}:pages`, `site:{siteId}` |
| Post created/updated | `revalidateDocumentCache()` | `site:{siteId}:{locale}:posts`, `site:{siteId}:{locale}:posts:{slug}`, `site:{siteId}` |
| Product created/updated | `revalidateDocumentCache()` | `site:{siteId}:{locale}:products`, `site:{siteId}:{locale}:products:{slug}`, `site:{siteId}` |
| Theme changed | `revalidateTag("theme:{themeId}")` | `theme:{themeId}`, `site:{siteId}` |
| i18n updated | `revalidateTag("i18n:{locale}")` | `i18n:{locale}`, `site:{siteId}:{locale}:*` |
| Settings updated | `revalidateTag("site:{siteId}:{locale}:settings")` | `site:{siteId}:{locale}:settings`, `site:{siteId}` |
| Global setting change | `revalidateSiteCache()` | `site:{siteId}` (all collections) |

Cache tags are automatically invalidated by Payload hooks when content changes.
Redis keys use TTL to self-expire gracefully.

---

## 9. Advanced Features

- **Cache warm-up**: Prefetch top pages after deploy.  
- **Partial revalidation**: Targeted revalidate by tag.  
- **Edge workers**: Real-time rewrite of cached responses.  
- **Multi-tenant isolation**: Each tenant has its own Redis namespace.  

---

## 10. CLI Utilities

```bash
# Revalidate cache tags via API
curl -X POST http://localhost:3000/api/revalidate \
  -H "Authorization: Bearer ${REVALIDATE_SECRET}" \
  -H "Content-Type: application/json" \
  -d '{"tags": ["site:abc123:vi:pages"]}'

# Revalidate specific page
curl -X POST http://localhost:3000/api/revalidate \
  -H "Authorization: Bearer ${REVALIDATE_SECRET}" \
  -H "Content-Type: application/json" \
  -d '{"tags": ["site:abc123:vi:pages:/home"]}'
```

Note: Cache revalidation is automatically handled by Payload hooks. Manual revalidation is only needed for external changes.

---

## 11. Monitoring & Metrics

Prometheus metrics exposed under `/metrics`:

| Metric | Description |
|---------|-------------|
| `cache_hits_total` | Successful Redis hits |
| `cache_misses_total` | Missed lookups |
| `cache_invalidations_total` | Manual revalidations |
| `cache_latency_seconds` | Average Redis latency |

Grafana dashboard: “SaaS Cache Overview”.

---

## 12. Security & Isolation

- No cross-tenant cache sharing.  
- All cache keys namespaced by tenant.  
- Sensitive data never cached (auth, tokens).  
- Signed URLs used for private assets.  

---

## 13. Performance Targets

| Metric | Target |
|---------|--------|
| Page load (cached) | <100ms |
| Redis latency | <10ms |
| Edge TTL | 60min default |
| Revalidate delay | <5s after mutation |

---

## 14. Future Enhancements

- AI-driven prefetch prediction.  
- L2 caching (Redis → SQLite fallback).  
- Cache compression optimization.  
- Adaptive cache TTL based on popularity.

---

## 15. Contacts

- **Performance Lead:** perf@yourdomain.com  
- **DevOps:** ops@yourdomain.com  
- **Support:** support@yourdomain.com
