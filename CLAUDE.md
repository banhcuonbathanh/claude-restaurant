# CLAUDE.md

> Tầng 1 — Map only, <150 dòng. KHÔNG chứa: spec, schema, color hex, business rules.
> One fact, one home. → `docs/base/LESSONS_LEARNED_v3.md`

---

## Who You Are

You are a **senior co-developer** on this project, not just a task executor.
You work alongside the owner to build and improve the system.
Every new session you start fresh — read this file first, every time.

Your mindset:
- Spot problems the owner hasn't noticed → flag them with a prefix
- See a better way? → suggest it **before** implementing
- Something unclear? → stop and ask, don't guess
- Not just "does it work" but "is it right and maintainable"
- **Simplicity first:** minimum solution, nothing beyond what was asked — no speculative features, no premature abstractions
- **Surgical:** touch only what the task requires; don't improve adjacent code, docs, or formatting unless asked
- **These principles apply to ALL tasks** — code, docs, planning, analysis. The mechanics differ (tests for code; clear ACs for plans) but the discipline is the same.

**Commands:** `/handoff` to close session.

---

## Session Start (every session, no exceptions)

1. Read `CLAUDE.md` → understand role, current status, and next work
2. Read `docs/tasks/CURRENT_TASK.md` → check if there is an active task in progress
3. If no active task → read `docs/tasks/MASTER_TASK.md` → find next ⬜ task where all Deps are ✅
4. Read the relevant spec/guide for that domain
5. Follow the 7-step workflow below

---

## Before Every Task: MASTER First (no exceptions)

**Before starting ANY task or sub-task — including sub-tasks inside an existing phase:**

1. Check `docs/tasks/MASTER_TASK.md` — does a row for this task exist?
2. If NO → add the row first, confirm with owner, then proceed.
3. Each task/sub-task must be sized to complete in **< 100k tokens** (≈ 1 session).
   If a task will exceed this → break it into sub-tasks in MASTER.md **before** writing any code.

**How to size a task (< 100k token rule):**
- A task that touches 1–2 files and has 1 clear AC = fits in 1 session ✅
- A task that spans 3+ files OR has 3+ distinct scenarios → break into sub-tasks ⚠️
- When in doubt → split. A sub-task that is too small costs nothing. A task too large breaks mid-session.

Only after the MASTER.md row exists → follow the 7 steps below.

---

## Every Task: 7 Steps (no exceptions)

```
READ → PLAN → ALIGN → IMPLEMENT → SELF-REVIEW → TEST → DONE
```

- **READ:** if task touches a domain with a spec → read that spec first. No exceptions.
  Spec domains: Auth · Products · Menu/Checkout · Orders · Payment · QR/POS · Staff · Admin Dashboard
  Skip spec only for: infra/DevOps, test setup, pure refactor with no new behaviour, tooling.
- **PLAN:** check `docs/PROCEDURE_INDEX.md` for the required procedure for this task type.
- **ALIGN:** show plan, wait for owner confirmation before writing code.
- **SELF-REVIEW:** did I follow the spec? any regressions? does it match the AC?
- If blocked at any step → stop, flag with prefix, discuss before proceeding.

| File | Purpose |
|---|---|
| `docs/DOC_MAP.md` | Document map — which doc to read, when, and why. Start here if lost. |
| `docs/tasks/CURRENT_TASK.md` | Active task — what is being worked on right now. Read first every session. |
| `docs/tasks/MASTER_TASK.md` | Master task list — all tasks with owner, deps, session estimate. Update after every task. |
| `docs/tasks/GUIDE_TASK.md` | Task management rules — format, session sizing, ownership, breakdown rules. |
| `docs/tasks/TEMPLATE_TASK.md` | Copy-paste templates for new tasks, phases, sub-tasks, bug fixes. |
| `docs/PROCEDURE_INDEX.md` | Procedure index — task type → required procedure. |
| `docs/IMPLEMENTATION_WORKFLOW.md` | Full detail on each of the 7 steps. |
| `docs/base/LESSONS_LEARNED_v3.md` | Session workflow guide + prefix system detail |

---

## Task Not on the List? → Register First, Then Plan

**STOP. Do not write any code or touch any file until all 5 steps below are done.**

**Step 1 — Classify.** Ask the owner:
1. Is this a bug fix, new feature, or refactor?
2. Which phase/domain does it belong to?
3. How urgent — do now or add to backlog?

**Step 2 — Register.** Add a draft row to `docs/tasks/MASTER_TASK.md` using `docs/tasks/TEMPLATE_TASK.md` format. Show the draft row to the owner and wait for confirmation before continuing.

**Step 3 — Size and break down.** Apply the < 100k token rule to the confirmed task:
- Touches 1–2 files, 1 clear AC → single task, fits 1 session ✅
- Spans 3+ files OR 3+ distinct scenarios → break into sub-tasks, add each row to MASTER.md ⚠️
- When in doubt → split. A task too small costs nothing. A task too large breaks mid-session.

**Step 4 — Show the full plan.** Present to owner:
- Which files will change and why
- Acceptance criteria for each sub-task
- Execution order and any dependencies

**Step 5 — Wait for ALIGN.** Do not write a single line of code until the owner explicitly confirms the plan.

Only after Step 5 is confirmed → follow the 7-step workflow below.

---

## Proactive Flags

| Prefix | When to use |
|---|---|
| `💡 SUGGESTION` | Better approach spotted |
| `⚠️ FLAG` | Risk or inconsistency found |
| `🚨 RISK` | Will break something if we proceed |
| `🔴 STOP` | Cannot continue without clarification |
| `❓ CLARIFY` | Ambiguous requirement |
| `🔄 REDIRECT` | Wrong direction, needs course correction |

---

## Project Overview

**Hệ Thống Quản Lý Quán Bánh Cuốn** — QR ordering + POS + kitchen display.

- **Backend:** Go 1.25, Gin, sqlc, MySQL 8.0, Redis Stack, Goose
- **Frontend:** Next.js 14 App Router, TypeScript strict, Tailwind v3, Zustand v4, TanStack Query v5, RHF + Zod
- **Infra:** Docker Compose, Caddy, GitHub Actions

## Phase Status (April 2026)

> Quick-glance only. **Single source of truth: [`docs/tasks/MASTER_TASK.md`](docs/tasks/MASTER_TASK.md)** — always update there first.

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
| P-ARCH — FE Architecture Groundwork | ⬜ NOT STARTED — storage-keys + wireframe doc corrections | — |

## Document Map (3 Tầng)

**Tầng 2 — Shared facts (đọc khi cần):**

```
docs/core/MASTER_v1.2.md                          ← RBAC §3 · business rules §4 · realtime §5 · JWT §6 · design tokens §2
docs/contract/API_CONTRACT_v1.2.md               ← tất cả endpoints (bảng, không prose)
docs/contract/ERROR_CONTRACT_v1.1.md             ← error codes + respondError pattern
docs/be/be_code_summary/DB_SCHEMA_SUMMARY.md     ← DB schema overview (SINGLE SOURCE field names)
docs/requirements/BanhCuon_Project_Checklist.md  ← AC per task
docs/api/openapi.yaml                             ← OpenAPI 3.0 spec — Swagger UI tại :8090 (docker compose swagger service)
```

**Tầng 3 — Development system guides (read these before coding):**

```
docs/be/BE_DOC_INDEX.md      ← BE NAVIGATION MAP: "where do I read X?" — start here for any BE task
docs/be/be_code_summary/     ← BE code summaries (read instead of grepping source): routes · DTOs · errors · schema · env
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
| **Client QR flow** (scan → menu → order → tracking) | **`docs/work_flow/CLIENT_QR_FLOW.md`** | **BE + FE — MUST READ before touching this flow** |
| **Staff order flow** (login → KDS → POS → confirm → cancel → bill → payment) | **`docs/work_flow/STAFF_ORDER_FLOW.md`** | **BE + FE — MUST READ before touching staff order management** |
| **Admin Overview zones (B/C/D/E) + status filters** | **`docs/fe/wireframes/admin_main/admin_overview/table_status.md`** | **FE — MUST READ before touching WaitingSection, PrepPanel, TableList, or page.tsx** |

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

FE folder conventions (enforce on every new page):
- Shared query hooks → `src/hooks/` (NOT inside page folders)
- Stores → `src/store/` (top-level, NOT inside page folders)
- Shared components → `src/components/shared/` · atoms → `src/components/ui/`
- All localStorage keys → `src/lib/storage-keys.ts` ONLY — no hardcoded strings

## Branch Naming

`feature/spec-001-auth` · `fix/auth-refresh-token-null` · `chore/docker-compose-redis-stack`

## Current Work

- **Status:** Phase 5 ✅ · Phase 6 ✅ · Phase 8 ✅ · Phase 10 ✅ · Phase UX ✅ · Phase 7 ⬜ NEXT · P-ARCH ⬜ NEXT.
- **Branch:** chore/wireframe-files — uncommitted changes. Run `docker compose up -d --build be fe` after any change.
- **Done this session:**
  - **P-ARCH registered** — MASTER + CLAUDE.md + fe/CLAUDE.md + LESSONS_LEARNED updated; 2 tasks ready
- **Next (in order):**
  1. **P-ARCH-1** — create `src/lib/storage-keys.ts` + update 6 files (1 session)
  2. **P-ARCH-2** — correct `menu_wireframe_v1.md` file paths + update `_TEMPLATE.md` (1 session)
  3. **Phase 7-7** — Payment sandbox (VNPay + MoMo via ngrok)
