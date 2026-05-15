# Hệ Thống Quản Lý Quán Bánh Cuốn

QR ordering · Kitchen Display (KDS) · POS · Payment webhooks

---

## Stack

| Layer | Tech |
|---|---|
| Backend | Go 1.25 · Gin · sqlc · MySQL 8.0 · Redis Stack 7 · Goose |
| Frontend | Next.js 14 App Router · TypeScript · Tailwind v3 · Zustand · TanStack Query v5 |
| Infra | Docker Compose · Caddy (auto TLS) · GitHub Actions |

**Ports (local):** BE=8080 · FE=3000 · MySQL=3306 · Redis=6379 · RedisInsight=8001

---

## Quick Start (local dev)

```bash
# 1. Copy env template and fill in required secrets
cp .env.example .env

# 2. Generate JWT secret
openssl rand -hex 32   # paste into JWT_SECRET in .env

# 3. Start all services
docker compose up -d

# 4. Verify everything is running
docker compose ps
curl http://localhost:8080/health
```

The BE runs DB migrations automatically on startup via goose.

---

## Environment Variables

All variables are documented in [.env.example](.env.example).

| Variable | Required | Description |
|---|---|---|
| `MYSQL_ROOT_PASSWORD` | ✅ | MySQL root password (docker-compose only) |
| `MYSQL_PASSWORD` | ✅ | MySQL app user password |
| `DB_DSN` | ✅ | Full MySQL DSN — must match `MYSQL_PASSWORD` |
| `REDIS_ADDR` | — | Redis host:port (default: `redis:6379`) |
| `JWT_SECRET` | ✅ | 256-bit hex — generate with `openssl rand -hex 32` |
| `JWT_ACCESS_TTL` | — | Access token TTL in seconds (default: 86400) |
| `JWT_REFRESH_TTL` | — | Refresh token TTL in seconds (default: 2592000) |
| `STORAGE_BASE_URL` | — | Public URL prefix for uploaded files |
| `STORAGE_BASE_PATH` | — | Filesystem path for uploads (default: /var/www/uploads) |
| `VNPAY_*` | — | VNPay payment gateway credentials |
| `MOMO_*` | — | MoMo payment gateway credentials |
| `ZALOPAY_*` | — | ZaloPay payment gateway credentials |
| `WEBHOOK_BASE_URL` | — | Public base URL for payment webhooks (use ngrok locally) |
| `NEXT_PUBLIC_API_URL` | — | API URL baked into the FE at build time |

---

## Common Commands

```bash
# Backend
go build ./...
go test ./be/internal/service/... -run TestLogin
goose -dir be/migrations mysql "$DB_DSN" up

# Frontend
cd fe && npm run dev           # :3000
cd fe && npm run build

# Docker
docker compose up -d                    # start full stack
docker compose up -d --build be fe     # rebuild after code changes
docker compose logs -f be              # tail BE logs
docker compose down                    # stop (keeps volumes)
docker compose down -v                 # stop + delete volumes (⚠️ loses data)

# sqlc (after editing .sql query files)
cd be && sqlc generate
```

---

## Migration Commands

```bash
# Run all pending migrations
goose -dir be/migrations mysql "$DB_DSN" up

# Check migration status
goose -dir be/migrations mysql "$DB_DSN" status

# Roll back last migration
goose -dir be/migrations mysql "$DB_DSN" down
```

---

## Project Status

| Phase | Status |
|---|---|
| Phase 0 — Architecture & Docs | ✅ Complete |
| Phase 1 — DB Migrations | ✅ Complete |
| Phase 2 — Feature Specs | ✅ Complete |
| Phase 3 — sqlc + Project Setup | ✅ Complete |
| Phase 4 — Backend | ✅ Complete |
| Phase 5 — Frontend | ✅ Complete |
| Phase 6 — DevOps | ✅ Complete |
| Phase 7 — Testing & Go-Live | ⬜ Not started |

Full task list → [`docs/TASKS.md`](docs/TASKS.md)

---

## Documentation

| Doc | Purpose |
|---|---|
| [`docs/core/MASTER_v1.2.md`](docs/core/MASTER_v1.2.md) | RBAC · business rules · JWT · realtime · design tokens |
| [`docs/contract/API_CONTRACT_v1.2.md`](docs/contract/API_CONTRACT_v1.2.md) | All API endpoints |
| [`docs/contract/ERROR_CONTRACT_v1.1.md`](docs/contract/ERROR_CONTRACT_v1.1.md) | Error codes + format |
| [`docs/be/BE_SYSTEM_GUIDE.md`](docs/be/BE_SYSTEM_GUIDE.md) | Backend developer guide |
| [`docs/fe/FE_SYSTEM_GUIDE.md`](docs/fe/FE_SYSTEM_GUIDE.md) | Frontend developer guide |
| [`docs/TASKS.md`](docs/TASKS.md) | Master task list |


 npx playwright show-report