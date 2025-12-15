# Monitoring & Observability – SaaS Platform

This document defines how the platform monitors performance, health, and reliability across all services.

---

## 1. Objectives

- Detect failures and anomalies early.  
- Maintain uptime and SLA guarantees.  
- Provide real-time visibility into system health.  
- Enable fast incident response.

---

## 2. Monitoring Stack

| Component | Role |
|------------|------|
| **Prometheus** | Metrics collection |
| **Grafana** | Dashboard visualization |
| **Loki** | Log aggregation |
| **Alertmanager** | Alert routing (email, Slack, Discord) |
| **Sentry** | Error tracking (frontend + backend) |
| **UptimeRobot / Pingdom** | External uptime checks |

---

## 3. Metrics Overview

| Metric | Description |
|---------|--------------|
| `http_requests_total` | Total requests received |
| `http_request_duration_seconds` | Request latency |
| `payload_db_queries_total` | Database query count |
| `payload_db_query_duration_seconds` | DB query latency |
| `redis_cache_hits_total` | Redis cache hit count |
| `automation_runs_total` | Automation executions |
| `assistant_calls_total` | AI Assistant API calls |
| `export_jobs_total` | Exports triggered |
| `tenant_active_sites_total` | Active sites per tenant |

---

## 4. Metrics Endpoints

| Endpoint | Purpose |
|-----------|----------|
| `/metrics` | Prometheus scrape target |
| `/healthz` | Health check (ready & alive) |
| `/status` | Detailed runtime status |

Example output from `/metrics`:

```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200"} 12093
```

---

## 5. Dashboards (Grafana)

Main dashboards:

1. **System Overview**
   - Request rate, latency, error ratio
   - DB query time
   - Redis hit/miss ratio

2. **Tenant Analytics**
   - Active sites, pageviews, leads, exports
   - AI tokens usage per tenant

3. **Infrastructure Health**
   - CPU / RAM usage
   - Disk I/O
   - Container restart count

4. **AI Layer Dashboard**
   - Assistant request volume
   - Token consumption
   - Error rate per model/provider

---

## 6. Logging & Tracing

| Tool | Role |
|------|------|
| **Loki** | Centralized structured logs |
| **Sentry** | Application-level error tracking |
| **OpenTelemetry (optional)** | Distributed tracing |

Log format (JSON):

```json
{
  "timestamp": "2025-11-10T14:22:03Z",
  "level": "info",
  "tenant": "t5g",
  "site": "123",
  "action": "export.run",
  "durationMs": 1530,
  "status": "success"
}
```

Logs include `tenantId`, `siteId`, `userId`, `action`, and duration.

---

## 7. Alerting

Alerts routed through **Alertmanager** → Slack + Email.

Example rules:

| Condition | Severity | Action |
|------------|-----------|--------|
| `http_error_rate > 5% for 5m` | critical | Notify DevOps |
| `db_connection_failures > 0` | critical | Restart service |
| `cpu_usage > 90% for 10m` | warning | Scale instance |
| `assistant_error_rate > 20%` | warning | Disable AI temporarily |

---

## 8. Sentry Configuration

- Tracks both frontend and backend errors.  
- Environment tags: `local`, `staging`, `production`.  
- Sample rate configurable (default 0.2).  
- PII scrubbing enabled.  
- Linked to Slack for critical errors.

---

## 9. Health Checks

| Endpoint | Description |
|-----------|--------------|
| `/healthz` | Checks DB, Redis, and core uptime |
| `/metrics` | Exposes Prometheus data |
| `/api/analytics/track` | Used for light ping check |

Health check output example:

```json
{
  "status": "ok",
  "uptimeSeconds": 23900,
  "postgres": "connected",
  "redis": "connected"
}
```

---

## 10. Incident Management

1. Alert triggered via Prometheus or Sentry.  
2. Alert routed to Slack + email.  
3. DevOps triages and assigns incident owner.  
4. Root cause analyzed (logs, traces).  
5. Fix deployed, incident closed.  
6. Postmortem documented in `/docs/incidents/YYYY-MM-DD.md`.

---

## 11. Uptime & SLA

| Plan | SLA |
|------|-----|
| Free | 95% uptime |
| Pro | 99% uptime |
| Enterprise | 99.9% uptime |

---

## 12. Backups & Recovery Monitoring

- Daily `pg_dump` verification job.  
- Upload checksum validation.  
- Backup restore test every Sunday.  
- Logs written to `backup-monitor.log`.

---

## 13. Performance Watchdogs

- Alert if build size > threshold.  
- Alert if response > 2s median.  
- Redis latency monitor < 50ms.  
- AI latency SLA per provider logged.

---

## 14. Future Enhancements

- Real-time anomaly detection (ML-based).  
- Tenant-level dashboards.  
- Cost-based autoscaling alerts.  
- AI Ops incident correlation.

---

## 15. Contacts

- **Monitoring Lead:** monitoring@yourdomain.com  
- **On-call:** oncall@yourdomain.com  
- **Slack Channel:** #infra-alerts
