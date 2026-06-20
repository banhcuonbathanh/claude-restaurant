---
name: finish-task
description: Close a task the Agent-OS way — run the Definition of Done gate from AGENT_OS.md. Confirms acceptance criteria are met and demonstrated, the VERIFY gate ran, only scoped files changed, code-vs-doc drift was logged, and the UPDATE-on-done target + MASTER_TASK row were written. Refuses to declare DONE until every box is checked. Use at the END of a single task (not a whole session — that is /handoff). Usage: /finish-task [task-id or description].
---

You are closing a single work task on the BanhCuon project using the Agent OS loop. The gate you are
enforcing is the **Definition of Done** in `docs/system/AGENT_OS.md`. This is a gate, not a summary:
if any check fails, the task is **NOT done** — fix it or report the blocker, do not paper over it.

This skill closes ONE task. To close an entire work session, use `/handoff` instead.

The argument is: $ARGUMENTS — the task id or description being closed (optional).

---

## Step 1 — Re-establish the routing row

1. Read `docs/system/AGENT_OS.md` and identify the **task type row** this task belongs to (the same
   row `/start-task` matched). From it, note the row's **VERIFY gate** and **UPDATE-on-done** target.
2. Read `git status` and `git diff --stat HEAD` (or against the checkpoint commit) to see exactly
   what changed this task.

## Step 2 — Run the Definition of Done checklist

Check each box. For every box, state the **evidence** (a command output, a file path + line, a
screenshot). "Looks done" is not evidence.

- [ ] **Acceptance criteria met and demonstrated** — list each AC and how it was shown to pass.
- [ ] **VERIFY gate ran and passed** — run the gate from the routing row now (e.g. `go build ./...`
      + service test · `/dev-page` Phase 4 · `/verify` on the live app) and paste the result.
- [ ] **Scope honored** — every changed file was on the `/start-task` scope contract. If an
      unplanned file changed, call it out explicitly and explain why.
- [ ] **UPDATE-on-done written** — the row's target doc (spec / page doc-set / `02_spec/*`) reflects
      the new reality. Make the edit now if it is missing.
- [ ] **Drift logged (Rule #8)** — if code disagreed with any doc, the doc was fixed AND a ⚠️ DRIFT
      entry was added to `docs/system/07_business_logic/LOGIC_INDEX.md` § Decision Log. Add it now if
      behaviour changed and it is missing.
- [ ] **MASTER_TASK updated** — the row in `docs/tasks/MASTER_TASK.md` has its status set
      (✅ / 🔄 / 🔴). Update it now.

## Step 3 — Verdict

- If **all boxes pass** → declare **DONE** and print a one-line summary: task type · files changed ·
  verify result · docs updated.
- If **any box fails** → declare **NOT DONE**, list the failing box(es) as a short blocker list, and
  state the single next action to close each. Do not mark MASTER_TASK ✅ in this case.

## Step 4 — Offer the commit (do not commit unless asked)

Show a suggested commit message in proper format (not `dfg`-style) and hand it to the owner. Commit
only if the owner asks or has durably authorized it this session.
