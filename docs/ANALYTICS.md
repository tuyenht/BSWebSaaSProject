# Analytics & Insights – SaaS Platform

This document explains how analytics are collected, stored, visualized, and integrated across tenants and sites.

---

## 1. Overview

The **Analytics System** provides insight into how each site performs across traffic, leads, exports, automation runs, and AI usage.

Key goals:
- Unified metrics per tenant/site.
- Lightweight, privacy-friendly tracking.
- Integrated with Prometheus & Grafana.
- API endpoints for internal and public dashboards.

---

## 2. Data Model

Collections in Payload:

| Collection | Description |
|-------------|--------------|
| **AnalyticsEvents** | Raw event logs (pageviews, leads, forms, exports, etc.) |
| **AnalyticsDailyStats** | Aggregated stats (per day / site / tenant) |
| **AnalyticsSettings** | Toggles, tracking IDs, anonymization rules |

Schema example:

```json
{
  "siteId": "abc123",
  "tenantId": "t5g",
  "date": "2025-11-10",
  "pageviews": 1842,
  "uniqueVisitors": 913,
  "leads": 27,
  "forms": 12,
  "exports": 3,
  "automationRuns": 45,
  "aiTokens": 53200
}
```

---

## 3. Data Flow

```
Browser → /api/analytics/track → Redis buffer → Payload job (every 5 min) → PostgreSQL
```

Steps:

1. Client sends minimal JSON event.  
2. API validates + anonymizes (no personal data).  
3. Redis buffers event (batch mode).  
4. Background job aggregates and stores in `AnalyticsDailyStats`.  

---

## 4. Client Tracking

Tracking script: `/public/analytics.js`

Injected automatically for each site.

Minimal example:

```js
window.analytics.track('pageview', {
  path: window.location.pathname,
  siteId: window.SITE_ID,
});
```

Supported events:
- `pageview`
- `lead.created`
- `form.submit`
- `automation.run`
- `ai.usage`
- `export.completed`

---

## 5. Privacy

- IPs anonymized (IPv4 /24, IPv6 /48).  
- No cookies stored.  
- GDPR & privacy-compliant.  
- Users can opt out via `/settings/privacy`.  

---

## 6. API Endpoints

| Method | Endpoint | Description |
|---------|-----------|-------------|
| `POST` | `/api/analytics/track` | Log event |
| `GET` | `/api/analytics/stats?siteId=...` | Fetch daily summary |
| `GET` | `/api/analytics/compare?from=...&to=...` | Compare periods |

Example response:

```json
{
  "pageviews": 1224,
  "uniqueVisitors": 678,
  "conversions": 32,
  "aiTokens": 43000
}
```

---

## 7. Dashboard UI (Admin)

Path: `Admin → Sites → Analytics`

Widgets:

- Traffic (pageviews, visitors)
- Leads / Conversion Rate
- Automation runs / Export jobs
- AI token usage chart
- Top content pages (via referrer)

Supports date range filtering and site comparison.

---

## 8. Metrics & Prometheus Integration

Metrics exposed under `/metrics`:

| Metric | Description |
|---------|-------------|
| `analytics_events_total` | Raw event count |
| `analytics_daily_stats_total` | Aggregated rows |
| `analytics_db_latency_seconds` | DB query latency |
| `analytics_queue_pending` | Redis batch queue length |

Displayed in Grafana dashboard `SaaS - Analytics Overview`.

---

## 9. Aggregation Jobs

Cron job runs every 5 minutes:

```bash
pnpm analytics:aggregate
```

Tasks:
- Pull batched events from Redis.
- Aggregate by site & day.
- Store into Postgres.
- Update cached stats in Redis.

---

## 10. Alerts

Alert rules (Prometheus → Alertmanager → Slack):

| Condition | Severity |
|------------|-----------|
| `analytics_queue_pending > 10000` | warning |
| `analytics_db_latency_seconds > 2` | critical |
| `analytics_events_total = 0 for 1h` | critical |

---

## 11. Data Retention

| Data Type | Retention |
|------------|------------|
| Raw events | 30 days |
| Aggregated stats | 1 year |
| Cached data | 5 minutes |
| Audit logs | 90 days |

---

## 12. Visualization

Integrated with Grafana:

- Dashboard: `SaaS → Analytics Overview`
- Variables: `$tenant`, `$site`
- Panels: Traffic, Conversions, AI Usage, Errors

---

## 13. Example Visualization JSON

```json
{
  "title": "Traffic Overview",
  "type": "graph",
  "targets": [
    {
      "expr": "sum(rate(analytics_events_total[5m])) by (site)"
    }
  ]
}
```

---

## 14. Future Enhancements

- Tenant-level aggregated reports.  
- Real-time analytics API.  
- Heatmap tracking.  
- Predictive trends via AI.  

---

## 15. Contacts

- **Analytics Lead:** analytics@yourdomain.com  
- **Support:** support@yourdomain.com
