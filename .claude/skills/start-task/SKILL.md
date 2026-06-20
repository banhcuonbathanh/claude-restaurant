---
name: start-task
description: Open a task the Agent-OS way — Classify it against the AGENT_OS routing table, read ONLY the docs that row names, register it in MASTER_TASK if missing, take a checkpoint commit, and produce a scope contract (exact files + why) for owner ALIGN before any code is written. Use at the START of any task. Usage: /start-task <short task description>. Pairs with /finish-task.
---

You are opening a work task on the BanhCuon project using the Agent OS loop. The routing table and
loop live in `docs/system/AGENT_OS.md` — that is your source of truth. Execute every step in order.
Do not write a single line of application code in this skill — its job ends at ALIGN.

The argument is: $ARGUMENTS — a short description of the task the owner wants to start.

---

## Step 1 — CLASSIFY (read the router first)

1. Read `docs/system/AGENT_OS.md` — the routing table.
2. Read `docs/tasks/CURRENT_TASK.md` — is a task already in progress? If yes, surface it and confirm
   the owner wants to switch before continuing.
3. Match `$ARGUMENTS` to exactly one **task type row** in the routing table.
   - If no row matches, also check `docs/PROCEDURE_INDEX.md`.
   - If neither matches → follow `AGENT_OS.md` § "No Route Exists": prefix `❓ CLARIFY`, ask the
     owner the requirement questions, and **stop here** until they answer.
4. State the matched task type back to the owner in one line.

## Step 2 — READ (only what the row names)

Open **only** the docs listed in that row's **READ** column — not the whole handbook. If the task
touches orders/payment/cancel, the `order-flow` rules are mandatory before anything else. Note the
acceptance criteria you find (from the spec / wireframe / page doc-set).

## Step 3 — REGISTER (MASTER first, no exceptions)

1. Check `docs/tasks/MASTER_TASK.md` — does a row for this task exist?
2. If NO → draft a row using `docs/tasks/TEMPLATE_TASK.md` format and show it to the owner.
3. Apply the `< 100k token` sizing rule: if the task spans **3+ files OR 3+ distinct scenarios**,
   break it into sub-tasks and draft a row for each. When in doubt, split.

## Step 4 — CHECKPOINT (one-command rollback)

Run a checkpoint commit so any unwanted change can be reverted with one command:

```bash
git add -A && git commit -m "checkpoint: before <task>"
```

If commits are blocked in this environment, say so explicitly and hand the owner the exact command
to run themselves — do not silently skip the checkpoint.

## Step 5 — SCOPE CONTRACT + ALIGN (stop here)

Present to the owner and **wait for explicit confirmation**:

- **Task type** (the matched routing row) and the **skill** that row says to run.
- **Exact files I will change and why** — I touch only these. If mid-task I must change a file not on
  this list → STOP and ask before editing it.
- **Acceptance criteria** for each (sub-)task.
- **Execution order** and dependencies.
- The **VERIFY gate** and **UPDATE-on-done** target from the routing row (so DONE is defined up front).

Do not proceed to IMPLEMENT until the owner confirms. After confirmation, run the skill named in the
routing row, then close with `/finish-task`.
