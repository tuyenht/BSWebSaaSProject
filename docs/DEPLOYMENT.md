# Deployment & Infrastructure Guide – SaaS Platform

This guide describes how to deploy, scale, and maintain the SaaS Platform in different environments.

---

## 1. Supported Environments

| Environment | Purpose |
|--------------|----------|
| Local | Development and testing |
| Staging | Internal QA and demo |
| Production | Live tenants and sites |

---

## 2. Prerequisites

- Docker & Docker Compose installed  
- Node.js ≥ 20.x  
- pnpm installed globally  
- PostgreSQL & Redis (local or cloud)  
- S3-compatible storage (AWS, MinIO, or Cloudflare R2)  

---

## 3. Environment Variables

- Sao chép `env/example.env` thành file môi trường tương ứng (ví dụ: `.env.development`, `.env.staging`, `.env.production`) và **đổi toàn bộ mật khẩu trước khi chạy**.
- Docker Compose sẽ đọc `.env` trong thư mục gốc; CI/CD nên nạp biến trực tiếp từ secret manager.

**Biến cốt lõi cho Postgres & Payload**

| Biến | Mô tả |
|------|-------|
| `POSTGRES_USER` | User có quyền sở hữu database (ví dụ `bsweb_owner`) |
| `POSTGRES_PASSWORD` | Mật khẩu mạnh cho user trên |
| `POSTGRES_DB` | Tên database đang dùng cho môi trường |
| `POSTGRES_HOST` / `POSTGRES_PORT` | Host & port khi dùng dịch vụ Postgres bên ngoài |
| `DATABASE_URI` *(tuỳ chọn)* | Override DSN nếu không muốn dùng giá trị suy ra tự động |
| `PAYLOAD_SECRET` | Secret để Payload ký JWT và mã hoá session |

**Biến khác thường dùng**

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-saas.app
REDIS_URL=redis://...
UPLOADS_S3_BUCKET=saas-uploads
UPLOADS_S3_REGION=ap-southeast-1
UPLOADS_S3_ACCESS_KEY_ID=...
UPLOADS_S3_SECRET_ACCESS_KEY=...
OPENAI_API_KEY=sk-...
METRICS_ENABLED=true
```

> Không commit các file `.env`. Mỗi môi trường hãy quản lý secret qua trình quản lý riêng (AWS/GCP Secret Manager, Doppler, 1Password, ...).

---

## 4. Build & Deploy Flow

### 4.1. Build

```bash
pnpm install
pnpm build
docker build -t saas-platform:latest .
```

### 4.2. Run (Docker Compose)

```bash
docker compose up -d
```

### 4.3. Run Migrations

```bash
pnpm payload:migrate
```

> Hiện không có script seed sản phẩm mẫu. Chuẩn bị dữ liệu demo bằng tay trong môi trường staging nếu cần kiểm thử.

---

## 5. Cloud Deployment Options

| Platform | Notes |
|-----------|-------|
| **Google Cloud Run** | Recommended – fully managed, scalable |
| **Vercel** | Great for frontend, not ideal for embedded CMS |
| **Fly.io / Render** | Simple for small scale deployments |
| **AWS ECS / Lambda** | Suitable for enterprise workloads |

---

## 6. Continuous Deployment (CD)

GitHub Actions workflow (`.github/workflows/deploy.yml`):

```yaml
on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install
      - run: pnpm build
      - run: docker build -t gcr.io/myapp/saas-platform:${{ github.sha }} .
      - run: gcloud run deploy saas-platform --image gcr.io/myapp/saas-platform:${{ github.sha }} --region=asia-southeast1
```

---

## 7. Scaling & Performance

| Layer | Scaling Method |
|--------|----------------|
| **Next.js App** | Auto-scale Cloud Run or K8s |
| **PostgreSQL** | Managed (CloudSQL / RDS), read replicas |
| **Redis** | Managed instance (MemoryStore / Elasticache) |
| **Storage** | S3/R2/CDN |
| **Queue Jobs** | Multiple background workers |
| **Analytics** | Aggregated per day (no high-frequency writes) |

---

## 8. Monitoring & Alerts

- **Metrics**: `/metrics` endpoint for Prometheus  
- **Healthcheck**: `/healthz` endpoint  
- **Alerts**: Webhook to Slack/Discord when errors or slowdowns occur  
- **Grafana Dashboards**: visualize response time, memory, request count  

---

## 9. Backup & Disaster Recovery

| Resource | Strategy |
|-----------|-----------|
| **Database** | Daily backup via pg_dump + cloud snapshots |
| **Redis** | Persistence snapshots (RDB/AOF) |
| **Uploads / Exports** | Stored in S3 with versioning |
| **Config / Secrets** | Managed via GCP Secret Manager |

Disaster recovery runbook:

1. Detect outage via metrics/alerts  
2. Restore latest database snapshot  
3. Reattach storage bucket  
4. Validate tenant/site data integrity  
5. Resume app services  

---

## 10. Deployment Checklist

✅ Environment variables set  
✅ Database connected  
✅ Redis reachable  
✅ Storage accessible  
✅ Payload admin working  
✅ Healthcheck passes (`/healthz`)  
✅ Prometheus metrics visible (`/metrics`)  

---

## 11. Post-Deployment Verification

- Login to Admin → Create a new tenant/site  
- Test domain mapping  
- Run an export job  
- Submit a form → Verify lead created  
- Check `/admin/analytics` chart renders  
- Confirm metrics in Prometheus/Grafana  

---

## 12. Rollback Procedure

1. Identify last stable Docker image.  
2. Redeploy with `docker run saas-platform:<stable-tag>`.  
3. Verify `/healthz` returns OK.  
4. Clear CDN cache if required.  

---

## 13. Maintenance Schedule

| Task | Frequency |
|------|------------|
| Dependency updates (`pnpm payload:upgrade`) | Weekly |
| Security patches | ASAP |
| Database backups | Daily |
| Redis flush & compact | Weekly |
| Log retention cleanup | 90 days |
| Certificate renewal | Auto |

---

## 14. Future Deployment Enhancements

- Blue/Green deployment with zero downtime.  
- Canary rollouts per tenant.  
- Horizontal sharding for large tenants.  
- Auto-scaling background workers.  

---

## 15. Contacts

- **DevOps Lead:** devops@yourdomain.com  
- **Infra Support:** infra@yourdomain.com  
- **PagerDuty:** +84 901 000 000
