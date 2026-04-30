# Onboarding — Tech Lead

> Your job: keep MASTER_v1.2.md accurate, unblock the team within 4h, review all migrations before merge.

---

## Your Entry Points (check in this order each session)

1. **`docs/TASKS.md`** — current phase status + next tasks per role
2. **`docs/MASTER_v1.2.md`** — single source of truth for all architecture decisions
3. **`docs/contract/API_CONTRACT_v1.2.md`** — all endpoints (review before approving BE PRs)
4. **`docs/be/BE_SYSTEM_GUIDE.md`** · **`docs/fe/FE_SYSTEM_GUIDE.md`** · **`docs/devops/DEVOPS_SYSTEM_GUIDE.md`** — epic status per role

## Current Phase Status (as of 2026-04-30)

| Phase | Status | Blocker |
|---|---|---|
| Phase 1 — DB Migrations | 🔄 87% | Migration 008 pending (P1-8) |
| Phase 4 — Backend | 🔄 ~15% | auth_handler.go missing (BE-2) |
| Phase 5 — Frontend | ⬜ | Blocked until BE-2 done |
| Phase 6 — DevOps | 🔄 40% | .env.example + Caddyfile + CI pending |

**Next immediate actions:**
1. Assign BE-2 (auth_handler) — this unblocks Phase 5
2. Assign DO-4 (.env.example + migrate.sh) — this unblocks local dev for everyone
3. Review migration 008 before it runs

## What You Own

| File | Rule |
|---|---|
| `docs/MASTER_v1.2.md` | Only Lead commits directly. All arch decisions live here. |
| `docs/contract/API_CONTRACT_v1.2.md` | BE proposes → Lead confirms before implementation |
| `docs/TASKS.md` | Update after every task completion |
| All migrations (`be/migrations/*.sql`) | Review + approve before any dev runs them |

You do NOT write application code unless it's a pairing session.

## How to Review a PR

| Check | Where |
|---|---|
| Handler layer has no business logic | `be/internal/handler/` |
| Service layer has no gin imports | `be/internal/service/` |
| Error codes match contract | `docs/contract/ERROR_CONTRACT_v1.1.md` |
| DB field names match schema | `docs/task/BanhCuon_DB_SCHEMA_SUMMARY.md` |
| FE state in correct layer | `docs/fe/FE_SYSTEM_GUIDE.md §0` |
| No `.env` committed | `git diff` |
| Migration has rollback | `be/migrations/*.sql` — check for `-- +goose Down` |

## Conflict Resolution

| Situation | Rule |
|---|---|
| Spec vs MASTER.docx conflict | MASTER wins. Notify BA to update spec. |
|TASKS.md vs CLAUDE.md conflict | TASKS.md wins. |
| Decision affecting > 1 role | Lead arbitrates, logs in Decision Log (MASTER §ADR) |
| Blocking gap from dev | Respond within 4h during work hours |

## Key Architecture Decisions (do not re-debate)

| # | Decision | Rationale |
|---|---|---|
| D-001 | sqlc over GORM | Type-safety, no ORM magic — see MASTER §7.1 |
| D-002 | UUID v4 for PKs | No sequence leak, easy cross-env merge |
| D-003 | DECIMAL(10,0) for VND prices | No float rounding issues |
| D-004 | Access token in memory (Zustand) | Prevent XSS via localStorage |
| D-005 | Combo expand at order time | Kitchen sees actual dishes, not combo names |

## Branch + Commit Convention

```
feature/spec-001-auth
fix/auth-refresh-token-null
chore/docker-compose-redis-stack
```
