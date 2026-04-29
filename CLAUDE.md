# CLAUDE.md

> Tầng 1 — Map only, <150 dòng. KHÔNG chứa: spec, schema, color hex, business rules.
> One fact, one home. → `docs/base/LESSONS_LEARNED_v3.md`

---

## Claude Workflow

**Commands:** `/start [feature]` · `/handoff` to close.

**Prefixes:** `💡 SUGGESTION` · `⚠️ FLAG` · `🚨 RISK` · `🔴 STOP` · `❓ CLARIFY` · `🔄 REDIRECT`

**Every task follows 7 steps — no exceptions:**
```
READ → PLAN → ALIGN → IMPLEMENT → SELF-REVIEW → TEST → DONE
```

| File | Purpose |
|---|---|
| `docs/TASKS.md` | **Master task list** — find the next task here. Update status after every task. |
| `docs/IMPLEMENTATION_WORKFLOW.md` | **Quality process** — full detail on each of the 7 steps. Read before starting any task. |
| `docs/base/LESSONS_LEARNED_v3.md` | Session workflow guide + prefix system detail |

**Session start protocol:**
1. Read `CLAUDE.md` → Current Work (what's done, what's next)
2. Open `docs/TASKS.md` → find next ⬜ task with all dependencies ✅
3. Follow `docs/IMPLEMENTATION_WORKFLOW.md` for that task

---

## Project Overview

**Hệ Thống Quản Lý Quán Bánh Cuốn** — QR ordering + POS + kitchen display.

- **Backend:** Go 1.25, Gin, sqlc, MySQL 8.0, Redis Stack, Goose
- **Frontend:** Next.js 14 App Router, TypeScript strict, Tailwind v3, Zustand v4, TanStack Query v5, RHF + Zod
- **Infra:** Docker Compose, Caddy, GitHub Actions

## Phase Status (April 2026)

> Full task breakdown: [docs/TASKS.md](docs/TASKS.md)

| Phase | Status | Blocking |
|---|---|---|
| Phase 0 — Architecture & Docs | ✅ COMPLETE | — |
| Phase 1 — DB Migrations (001–007) | ✅ COMPLETE | — |
| Phase 2 — Feature Specs | 🔄 71% — Spec 6 (QR/POS) + Spec 7 (Staff) missing | Blocks 4.6, 5.2-10 |
| Phase 3 — sqlc + Project Setup | 🔄 80% — scaffold + queries done, `sqlc generate` pending | 🔴 Blocks ALL of Phase 4 |
| Phase 4 — Backend | ⬜ NOT STARTED | Needs P3 done first |
| Phase 5 — Frontend | ⬜ NOT STARTED | Needs P4.1 auth done first |
| Phase 6 — DevOps | 🔄 40% — Dockerfiles + compose done; Caddy + CI + .env.example pending | Can run parallel with P4 |
| Phase 7 — Testing + Go-Live | ⬜ NOT STARTED | Needs P4+P5 |

## Document Map (3 Tầng)

**Tầng 2 — Shared facts (đọc khi cần):**

```
docs/MASTER_v1.2.md                          ← RBAC §3 · business rules §4 · realtime §5 · JWT §6 · design tokens §2
docs/contract/API_CONTRACT_v1.2.md           ← tất cả endpoints (bảng, không prose)
docs/contract/ERROR_CONTRACT_v1.1.md         ← error codes + respondError pattern
docs/task/BanhCuon_DB_SCHEMA_SUMMARY.md      ← DB schema overview (SINGLE SOURCE field names)
docs/qui_trinh/BanhCuon_Project_Checklist.md ← AC per task
```

**Tầng 3 — Domain specs (chỉ đọc khi làm domain đó):**

```
docs/spec/Spec1_Auth_Updated_v2.md
docs/spec/Spec_2_Products_API_v2_CORRECTED.md
docs/spec/Spec_3_Menu_Checkout_UI_v2.md
docs/spec/Spec_4_Orders_API.md
docs/spec/Spec_5_Payment_Webhooks.md
docs/claude/CLAUDE_BE.md · CLAUDE_FE.md · CLAUDE_DEVOPS.md
```

## Single Sources (đọc trước khi code)

| Loại | File |
|---|---|
| DB field names | `docs/task/BanhCuon_DB_SCHEMA_SUMMARY.md` |
| Error codes + format | `docs/contract/ERROR_CONTRACT_v1.1.md` |
| Business rules (order, payment, cancel) | `docs/MASTER_v1.2.md §4` |
| RBAC roles + hierarchy | `docs/MASTER_v1.2.md §3` |
| Design tokens (màu, font) | `docs/MASTER_v1.2.md §2` |
| JWT config + auth rules | `docs/MASTER_v1.2.md §6` |
| Realtime (SSE/WS config) | `docs/MASTER_v1.2.md §5` + `docs/contract/API_CONTRACT_v1.2.md §10` |

## Commands

```bash
cd be && sqlc generate && cd .. && go build ./...
go test ./be/internal/service/... -run TestLogin
goose -dir be/migrations mysql "$DB_DSN" up
cd fe && npm run dev                          # :3000
docker compose up -d                          # full stack
docker compose up -d --build be|fe            # after code changes
docker compose logs -f be
docker compose down [-v]
```

Ports: **BE=8080 · FE=3000 · MySQL=3306 · Redis=6379 · RedisInsight=8001**

## Architecture

BE layers (strict): `handler` → `service` → `repository` → `db` (sqlc generated)

FE state (strict): server → TanStack Query · client → Zustand · forms → RHF+Zod · API → `lib/api-client.ts`

## Branch Naming

`feature/spec-001-auth` · `fix/auth-refresh-token-null` · `chore/docker-compose-redis-stack`

## Current Work

- **Status:** Phase 3 scaffold complete (2026-04-29). Task tracker + workflow docs created.
- **Branch:** main
- **Done:** go.mod fixed · Dockerfiles fixed · BE scaffold (main.go, middleware stubs, pkg/jwt, pkg/bcrypt, pkg/redis/client) · FE scaffold (all page routes, 5 UI components, utils.ts) · All query/*.sql written · sqlc.yaml configured · Issues #5 + #7 resolved in MASTER v1.2
- **Next (in order):**
  1. **P3-1** — Run `sqlc generate` (install sqlc CLI first) → verify generated `be/internal/db/`
  2. **P3-2** — Verify generated field names match schema
  3. **4.1-1 through 4.1-6** — Auth backend (unblocks everything)
  4. **P2-1 + P2-2** — Write Spec 6 + Spec 7 (can do in parallel with 4.1)
- **How to pick the next task:** Open `docs/TASKS.md`, find first ⬜ with all dependencies ✅, follow `docs/IMPLEMENTATION_WORKFLOW.md`
