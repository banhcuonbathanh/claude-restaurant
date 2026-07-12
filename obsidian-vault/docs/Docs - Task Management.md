---
tags: [docs]
---

# Docs — Task Management (`docs/tasks/`)

How work is planned, sized, and tracked.

## Files

- `docs/tasks/MASTER_TASK.md` — **single source of truth** for all phases/tasks (status, deps, AC). Ends with the Critical Rules table → [[Docs - Core Rules]]
- `docs/tasks/CURRENT_TASK.md` — the active task, read first every session
- `docs/tasks/GUIDE_TASK.md` — format, session sizing, breakdown rules
- `docs/tasks/TEMPLATE_TASK.md` — copy-paste row templates
- `docs/PROCEDURE_INDEX.md` — task type → required procedure
- `docs/IMPLEMENTATION_WORKFLOW.md` — the 7 steps in detail

## The workflow

Every task: `READ → PLAN → ALIGN → IMPLEMENT → SELF-REVIEW → TEST → DONE`, sized to < 100k tokens (≈ 1 session). MASTER row must exist before any code.

## Phase status (July 2026, quick glance)

Phases 0–6, 8, OC, FAV, P-ARCH ✅ · Phase 7 🔄 (P7-5.4 E2E, P7-7 payment sandbox, P7-8 UAT remain) · CHAT 🔄 (blocked on API key) → details in MASTER_TASK.md.

## Related

- `docs/system/AGENT_OS_check.md` routing → [[Docs - System Handbook]]
- `docs/MODEL_SELECTION.md` — when to delegate to a Sonnet sub-agent
