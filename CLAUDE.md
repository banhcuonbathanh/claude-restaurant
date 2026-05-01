# CLAUDE.md

> Tầng 1 — Map only, <150 dòng. KHÔNG chứa: spec, schema, color hex, business rules.
> One fact, one home. → `docs/base/LESSONS_LEARNED_v3.md`

---

## Claude Workflow

**Commands:** `/handoff` to close.

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
| Phase 1 — DB Migrations | ✅ COMPLETE | — |
| Phase 2 — Feature Specs | ✅ COMPLETE (7/7) | — |
| Phase 3 — sqlc + Project Setup | ✅ COMPLETE — generated + verified | — |
| Phase 4 — Backend | ✅ COMPLETE — all domains coded + all AC verified and fixed | — |
| Phase 5 — Frontend | ✅ COMPLETE — 5.1 auth + 5.2 menu/cart + 5.3 checkout/SSE + 5.4 KDS + 5.5 POS/Payment ✅ | — |
| Phase 6 — DevOps | ✅ COMPLETE — .env.example + migrate.sh + Caddyfile + Caddy in compose + CI/CD + README | — |
| Phase 7 — Testing + Go-Live | ⬜ NOT STARTED | Needs P4+P5 |
| Phase 8 — Admin Dashboard | 🔄 IN PROGRESS — FE pages built (products/categories/toppings/staff), BE staff endpoints need verify | — |

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

> Cross-cutting only. Domain-specific refs live in `CLAUDE_BE.md §2` and `CLAUDE_FE.md §2`.

| Loại | File | Who |
|---|---|---|
| Error codes + format | `docs/contract/ERROR_CONTRACT_v1.1.md` | BE + FE |
| Business rules (order, payment, cancel) | `docs/MASTER_v1.2.md §4` | BE + FE |
| RBAC roles + hierarchy | `docs/MASTER_v1.2.md §3` | BE + FE |
| JWT config + auth rules | `docs/MASTER_v1.2.md §6` | BE + FE |
| Realtime (SSE/WS config) | `docs/MASTER_v1.2.md §5` + `docs/contract/API_CONTRACT_v1.2.md §10` | BE + FE + DevOps |

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

- **Status:** Phase 5 ✅ · Phase 6 ✅ · Phase 8 FE 🔄 IN PROGRESS.
- **Branch:** test (admin dashboard work in progress)
- **Done:** 5.1–5.5 frontend · 6-1–6-6 DevOps · 8-1–8-8 Admin FE pages (products/categories/toppings/staff)
- **Next (in order):**
  1. **Verify/implement** BE staff endpoints (8-9 through 8-13) — see `docs/TASKS.md §Phase 8`
  2. **Test** admin pages against live BE (run `docker compose up -d`)
  3. **Commit** all work + open PR → merge to main
  4. **Phase 7** — testing + go-live (see `docs/TASKS.md §Phase 7`)
- **Admin page URL:** `/admin` (redirects to `/admin/products`) — requires Manager+ role
- **How to pick the next task:** Open `docs/TASKS.md` → find next ⬜ task with all dependencies ✅.
