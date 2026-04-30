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

> Quick-glance only. **Single source of truth: [`docs/TASKS.md`](docs/TASKS.md)** — always update there first.
> Rule: when CLAUDE.md and TASKS.md disagree, TASKS.md wins.

| Phase | Status | Blocking |
|---|---|---|
| Phase 0 — Architecture & Docs | ✅ COMPLETE | — |
| Phase 1 — DB Migrations | 🔄 87% — migration 008 pending | — |
| Phase 2 — Feature Specs | ✅ COMPLETE (7/7) | — |
| Phase 3 — sqlc + Project Setup | ✅ COMPLETE — generated + verified | — |
| Phase 4 — Backend | 🔄 ~15% — auth infra done; handler + all other domains pending | 4.1-6 auth_handler is next |
| Phase 5 — Frontend | ⬜ NOT STARTED (scaffold stubs only) | Needs P4.1 fully done first |
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

**Tầng 3 — Development system guides (read these before coding):**

```
docs/be/BE_SYSTEM_GUIDE.md   ← PRIMARY BE guide: epics · rules · patterns · code · what to read per domain
docs/fe/FE_SYSTEM_GUIDE.md   ← PRIMARY FE guide: epics · rules · patterns · code · what to read per domain
```

**Tầng 3 — Domain specs (chỉ đọc khi làm domain đó — listed inside system guides):**

```
docs/spec/Spec1_Auth_Updated_v2.md
docs/spec/Spec_2_Products_API_v2_CORRECTED.md
docs/spec/Spec_3_Menu_Checkout_UI_v2.md
docs/spec/Spec_4_Orders_API.md
docs/spec/Spec_5_Payment_Webhooks.md
docs/spec/Spec_6_QR_POS.md
docs/spec/Spec_7_Staff_Management.md
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

- **Status:** Phase 3 ✅ complete. Docs restructured (2026-04-30) — BE_SYSTEM_GUIDE + FE_SYSTEM_GUIDE created. Phase 4 auth infra done — handler is the last blocker.
- **Branch:** main
- **Done:** go.mod fixed · Dockerfiles fixed · sqlc generated (`be/internal/db/` ✅) · `pkg/redis/pubsub.go` + `bloom.go` · `repository/auth_repo.go` · `service/auth_service.go` · `middleware/auth.go` · FE scaffold stubs · **`docs/be/BE_SYSTEM_GUIDE.md`** ✅ · **`docs/fe/FE_SYSTEM_GUIDE.md`** ✅
- **Next (in order):**
  1. **BE-1** — Run migration `008_order_groups.sql` + `.env.example` + scripts/migrate.sh (see BE_SYSTEM_GUIDE §10 Epic BE-1)
  2. **BE-2** — `be/internal/handler/auth_handler.go` — 5 handlers (see BE_SYSTEM_GUIDE §10 Epic BE-2)
  3. **BE-2 AC** — Verify all Spec1 acceptance criteria
  4. **FE-1** — api-client + Zustand stores + guards (see FE_SYSTEM_GUIDE §10 Epic FE-1) — can start once BE-2 done
- **How to pick the next task:** Open `docs/be/BE_SYSTEM_GUIDE.md` or `docs/fe/FE_SYSTEM_GUIDE.md` → find your epic → read only the listed docs → implement.
