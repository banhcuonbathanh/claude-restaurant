---
tags: [docs]
---

# Docs — Overview (the 3-tier map)

The project's documentation is a deliberate 3-tier system. Entry point when lost: `docs/DOC_MAP.md`.

## Tier 1 — Map only

- `CLAUDE.md` (repo root) — role, workflow, phase status, routing. <150 lines, no specs/schemas.

## Tier 2 — Shared facts

- `docs/core/MASTER_v1.2.md` → [[Docs - Core Rules]]
- `docs/contract/` → [[Docs - Contracts]]
- `docs/be/be_code_summary/DB_SCHEMA_SUMMARY.md` — single source for field names
- `docs/requirements/BanhCuon_Project_Checklist.md` — AC per task
- `docs/api/openapi.yaml` — Swagger UI at :8090

## Tier 3 — Guides & specs

- `docs/system/AGENT_OS_check.md` — agent entry point (task type → READ/SKILL/VERIFY/UPDATE; CLAUDE.md still cites it as `AGENT_OS.md`)
- `docs/be/BE_DOC_INDEX.md` + `BE_SYSTEM_GUIDE.md` · `docs/fe/FE_SYSTEM_GUIDE.md`
- `docs/spec/` → [[Docs - Specs]]
- `docs/system/` handbook → [[Docs - System Handbook]]
- `docs/work_flow/` → [[Docs - Workflows]]
- `docs/tasks/` → [[Docs - Task Management]]

## Principle

**One fact, one home.** Never duplicate a fact across tiers — link to its single source.
