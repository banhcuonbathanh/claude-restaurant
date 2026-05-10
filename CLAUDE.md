# CLAUDE.md

> Tầng 1 — Map only, <150 dòng. KHÔNG chứa: spec, schema, color hex, business rules.
> One fact, one home. → `docs/base/LESSONS_LEARNED_v3.md`

---

## Claude Workflow

**Commands:** `/handoff` to close.

**Prefixes:** `💡 SUGGESTION` · `⚠️ FLAG` · `🚨 RISK` · `🔴 STOP` · `❓ CLARIFY` · `🔄 REDIRECT`

**Before every task — procedure check (runs before READ):**
1. Is this task in `docs/TASKS.md`? → proceed to 7 steps.
2. Is there a spec for this domain? → read spec first, then plan.
3. Neither? → **STOP. Ask the user for requirements. Do not read any file yet.**
Full lookup table: [`docs/PROCEDURE_INDEX.md`](docs/PROCEDURE_INDEX.md)

**Every task follows 7 steps — no exceptions:**
```
PROCEDURE CHECK → READ → PLAN → ALIGN → IMPLEMENT → SELF-REVIEW → TEST → DONE
```

**READ step — spec check rule:**
If the task touches a domain that has a spec file → **read that spec before planning. No exceptions.**
Spec files: Auth · Products · Menu/Checkout · Orders · Payment · QR/POS · Staff · Admin Dashboard
Skip spec read only for: infra/DevOps, test setup, refactoring with no new behaviour, tooling.

| File | Purpose |
|---|---|
| `docs/DOC_MAP.md` | **Document map** — which doc to read, when, and why. Start here if lost. |
| `docs/TASKS.md` | **Master task list** — find the next task here. Update status after every task. |
| `docs/PROCEDURE_INDEX.md` | **Procedure index** — task type → required procedure. Check here before every task. |
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
| Phase 8 — Admin Dashboard | ✅ COMPLETE — FE pages + BE staff CRUD + Overview + Marketing (8-1→8-17) | — |

## Document Map (3 Tầng)

**Tầng 2 — Shared facts (đọc khi cần):**

```
docs/core/MASTER_v1.2.md                          ← RBAC §3 · business rules §4 · realtime §5 · JWT §6 · design tokens §2
docs/contract/API_CONTRACT_v1.2.md               ← tất cả endpoints (bảng, không prose)
docs/contract/ERROR_CONTRACT_v1.1.md             ← error codes + respondError pattern
docs/be/DB_SCHEMA_SUMMARY.md                     ← DB schema overview (SINGLE SOURCE field names)
docs/requirements/BanhCuon_Project_Checklist.md  ← AC per task
docs/api/openapi.yaml                             ← OpenAPI 3.0 spec — Swagger UI tại :8090 (docker compose swagger service)
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
docs/spec/Spec_9_Admin_Dashboard_Pages.md  ← Overview page (live floor + Kiểm tra) + Marketing (QR codes)
docs/claude/CLAUDE_BE.md · CLAUDE_FE.md · CLAUDE_DEVOPS.md
docs/fe/wireframes/_TEMPLATE.md           ← wireframe template — copy before drawing any new FE page (Step 0b)
docs/fe/wireframes/product-detail.excalidraw  ← product detail page wireframe (PNG: product_detail.png)
docs/workflow.excalidraw                  ← Claude workflow diagram v1.1 (FE Pre-Task Phase + arrows)
```

## Single Sources (đọc trước khi code)

> Cross-cutting only. Domain-specific refs live in `CLAUDE_BE.md §2` and `CLAUDE_FE.md §2`.

| Loại | File | Who |
|---|---|---|
| Error codes + format | `docs/contract/ERROR_CONTRACT_v1.1.md` | BE + FE |
| Business rules (order, payment, cancel) | `docs/core/MASTER_v1.2.md §4` | BE + FE |
| RBAC roles + hierarchy | `docs/core/MASTER_v1.2.md §3` | BE + FE |
| JWT config + auth rules | `docs/core/MASTER_v1.2.md §6` | BE + FE |
| Realtime (SSE/WS config) | `docs/core/MASTER_v1.2.md §5` + `docs/contract/API_CONTRACT_v1.2.md §10` | BE + FE + DevOps |

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

- **Status:** Phase 5 ✅ · Phase 6 ✅ · Phase 8 ✅ · Phase 10 ✅ · Phase UX ✅ · Phase 7 ⬜ NEXT · Phase 9 ⬜ NEXT.
- **Branch:** test — uncommitted changes. Run `docker compose up -d --build be fe` after any change.
- **Done this session:**
  - **product-detail wireframe** — drew `docs/fe/wireframes/product-detail.excalidraw` (+ PNG export); not yet committed
- **Next (in order):**
  1. **Phase 7-1/7-2/7-3** — BE unit tests (auth/order/payment services)
  2. **Phase 9 (9-2→9-7)** — extract WS hook + components from overview/page.tsx
  3. **Phase 7-7** — Payment sandbox (VNPay + MoMo via ngrok)
