# architecture.md — Universal Architecture Instructions

> System-level decisions: how all parts connect, communicate, scale, and fail.

---

## 1. Architecture Philosophy

- **Boring is good.** Choose proven patterns over trendy ones.
- **Design for failure.** Every external call can fail. Every service can go down.
- **Optimize for change.** Code you write today will be changed tomorrow. Make that easy.
- **Explicit over implicit.** Data flow, dependencies, and side effects should be obvious.

---

## 2. System Topology (Default Full-Stack Web App)

```
                        ┌─────────────────────────────────┐
                        │           CDN / Edge             │
                        │  (Cloudflare / Vercel Edge)      │
                        └──────────────┬──────────────────┘
                                       │
               ┌───────────────────────▼──────────────────────┐
               │              Load Balancer / Reverse Proxy    │
               │                    (Nginx / Caddy)            │
               └───────────┬───────────────────┬──────────────┘
                           │                   │
              ┌────────────▼──────┐   ┌────────▼───────────┐
              │   Frontend App    │   │    Backend API      │
              │  (React/Next.js)  │   │  (Node/Python)      │
              │  Static / SSR     │   │  REST or GraphQL    │
              └───────────────────┘   └────────┬───────────┘
                                               │
                        ┌──────────────────────┼──────────────────────┐
                        │                      │                       │
               ┌────────▼──────┐    ┌──────────▼───────┐   ┌─────────▼──────┐
               │  Primary DB   │    │   Cache Layer     │   │  Object Storage │
               │ (PostgreSQL)  │    │   (Redis)         │   │  (S3 / R2)      │
               └───────────────┘    └──────────────────┘   └─────────────────┘
                                               │
                                    ┌──────────▼───────┐
                                    │  Message Queue    │
                                    │ (BullMQ / RabbitMQ│
                                    │  / SQS)           │
                                    └──────────────────┘
                                               │
                                    ┌──────────▼───────┐
                                    │  Worker / Jobs    │
                                    │  (background      │
                                    │   processing)     │
                                    └──────────────────┘
```

---

## 3. Environments

Every project must have these environments, fully isolated:

| Environment | Purpose | Database | Notes |
|---|---|---|---|
| `development` | Local dev | Local Docker DB | Feature flags all on |
| `test` | Automated tests | In-memory or test DB | Seed on startup, clean on teardown |
| `staging` | Pre-prod validation | Separate cloud DB | Mirror of prod config |
| `production` | Live users | Production DB | No debug endpoints |

**Rules:**
- Config (URLs, keys) is **100% environment-specific** — never reused across envs.
- Staging DB is never seeded from production data (privacy).
- Feature flags control new features; staging always has them enabled.

---

## 4. Service Communication

### Synchronous (REST / GraphQL)
Use for: user-facing requests that need an immediate response.

```
Client → API Gateway → Service → Response
```

- Timeout every outbound HTTP call (default: 5s, long ops: 30s).
- Retry with exponential backoff + jitter for transient errors (502, 503, 504).
- Circuit-break after N consecutive failures to prevent cascade.

### Asynchronous (Queue / Events)
Use for: emails, notifications, heavy processing, cross-service updates.

```
Service A → Queue → Worker → Service B
           (publishes)      (consumes)
```

- Events are immutable facts: `user.created`, `order.placed`, `payment.failed`.
- Workers are idempotent — processing the same message twice has no side effects.
- Dead-letter queue (DLQ) catches messages that fail after max retries.

---

## 5. Database Architecture

### Choosing a Database

| Need | Choice |
|---|---|
| Relational, ACID, complex queries | PostgreSQL |
| Simple key-value cache | Redis |
| Full-text search | PostgreSQL FTS or Meilisearch |
| File/blob storage | S3-compatible (Cloudflare R2, AWS S3) |
| Time-series data | TimescaleDB or InfluxDB |

### Schema Design Rules
- UUIDs or CUIDs as primary keys (never auto-increment integers for user-facing IDs).
- All tables: `id`, `created_at`, `updated_at`, `deleted_at` (nullable for soft delete).
- Foreign keys always indexed.
- Junction/join tables have composite unique constraints.
- Never store computed values — compute on read, or use a materialized view.

### Migration Rules
- All schema changes via migration files, committed to git.
- Migrations are forward-only; no rollback scripts in production.
- Zero-downtime migrations: add column → deploy → backfill → make required.
- Never drop a column in the same deploy that removes code using it.

---

## 6. Caching Strategy

```
L1: In-process cache (LRU map)  → sub-millisecond, process-local
L2: Redis                       → 1-5ms, shared across instances
L3: CDN cache                   → 10-100ms, global edge
L4: Database                    → 5-50ms, source of truth
```

**What to cache:**
- Session tokens and auth context (Redis, short TTL)
- Expensive computed results (Redis, medium TTL)
- Static API responses (CDN, long TTL + cache-busting)
- User preferences (Redis, long TTL)

**Cache invalidation:**
- Time-based TTL as baseline.
- Event-driven invalidation on mutations (preferred): `on user.updated → delete cache:user:{id}`.
- Never cache data that must be real-time accurate (payment status, inventory).

---

## 7. Authentication Flow

```
1. User submits credentials
2. Backend verifies → issues Access Token (JWT, 15min) + Refresh Token (opaque, 7d)
3. Refresh Token stored: DB (hashed) + httpOnly cookie
4. Client stores Access Token: memory only (never localStorage)
5. Every API request: Authorization: Bearer <access_token>
6. On 401: client uses Refresh Token cookie to silently get new Access Token
7. On logout: Refresh Token deleted from DB + cookie cleared
```

---

## 8. File Storage

- **Never** store files in the database (no base64 BLOBs).
- **Never** store files on the application server's disk (not scalable).
- Use **S3-compatible object storage** (AWS S3, Cloudflare R2, MinIO for self-hosted).
- Upload flow: client → presigned URL (direct-to-S3) → notify backend with key.
- Files served via CDN, not directly from API.
- File metadata (name, size, mime, owner, url) stored in DB.

---

## 9. Background Jobs

```ts
// Categorize jobs by urgency:
Critical  (< 5s)  : email OTP, payment webhook processing
Standard  (< 1min): welcome email, notification, report generation  
Batch     (hours) : data export, bulk operations, analytics aggregation
```

**Rules:**
- Every job is idempotent (can safely run multiple times).
- Jobs log start, success, failure with duration.
- Failed jobs retry with exponential backoff (3–5 retries max), then go to DLQ.
- No jobs run inside the request/response cycle if they take > 200ms.

---

## 10. Observability

Every production system needs three pillars:

### Logs
- Structured JSON logs (Pino / structlog).
- Minimum fields: `timestamp`, `level`, `message`, `requestId`, `userId`, `service`.
- Aggregated to: Grafana Loki / Datadog / CloudWatch.

### Metrics
- Request rate, error rate, latency (p50/p95/p99) per endpoint.
- DB query count and duration.
- Queue depth and job processing time.
- Exposed via `/metrics` endpoint (Prometheus format).

### Traces
- Distributed tracing across services (OpenTelemetry).
- Trace every request from entry to DB query.
- Sampled: 100% errors, 5-10% successful requests.

### Alerting Rules
| Signal | Alert |
|---|---|
| Error rate > 1% | Page on-call |
| p99 latency > 2s | Warn |
| DB connections > 80% pool | Warn |
| Queue depth > 1000 for 5min | Page on-call |
| Disk usage > 85% | Warn |

---

## 11. Scaling Strategy

**Vertical scaling:** Increase server resources. Easy, has limits. Do this first.

**Horizontal scaling (stateless API):**
- Run multiple instances behind a load balancer.
- Session/auth state in Redis, not in-memory.
- Sticky sessions only as last resort.

**Database scaling:**
- Read replicas for heavy read workloads.
- Connection pooling via **PgBouncer** (never raw DB connections from multiple instances).
- Partition large tables by time (logs, events) or tenant.

**Caching:** Reduce DB load before adding DB hardware.

**Queue workers:** Scale independently from the API.

---

## 12. Disaster Recovery

| Metric | Target |
|---|---|
| RTO (Recovery Time Objective) | < 1 hour |
| RPO (Recovery Point Objective) | < 5 minutes |
| DB Backups | Daily full + continuous WAL (point-in-time recovery) |
| Backup retention | 30 days minimum |
| Backup verification | Restore tested monthly |

**Runbooks** must exist for:
- Database restore procedure
- Rollback a bad deployment
- Rotate compromised secrets
- Respond to DDoS

---

## 13. What NOT to Do

- ❌ No single points of failure without a documented fallback
- ❌ No direct database access from the frontend
- ❌ No shared databases between different applications
- ❌ No synchronous calls to slow external services inside request handlers
- ❌ No deploys on Friday afternoon
- ❌ No production configuration in git (env vars only)
- ❌ No `SELECT *` on large tables
- ❌ No migrations that lock tables in production without a maintenance window plan
