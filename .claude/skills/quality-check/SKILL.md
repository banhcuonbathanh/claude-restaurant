---
description: Audit the quality of recent sessions — code correctness, spec compliance, skipped steps, commit hygiene, and CSS safety. Pass a number to control how many sessions to review (default: 5). Example: /quality-check 3
---

You are auditing the quality of recent work on the BanhCuon project.
Argument (number of sessions to review, default 5): $ARGUMENTS

Execute every step below in order. Read before you judge — do not rely on memory alone.

---

## Step 1 — Collect Evidence

Run these in parallel:

- `git log --oneline -$ARGUMENTS` — get the last N commits
- `git log --oneline -$ARGUMENTS --stat` — which files changed per commit
- Read `docs/tasks/CURRENT_TASK.md` — session history table + active task state
- Read `docs/tasks/MASTER_TASK.md` — check status of tasks that appear in session history

From this, build a session list:

| # | Commit | Date | Task ID | Files changed |
|---|---|---|---|---|

---

## Step 2 — Check 1: Commit Message Hygiene

For each commit in the list, classify the message:

| Grade | Criteria |
|---|---|
| ✅ Good | Describes what and why. Example: `feat: P-PD-4 zone D+E qty stepper and sticky CTA` |
| ⚠️ Weak | Too vague but readable. Example: `fix product detail page` |
| ❌ Bad | Meaningless. Example: `dfg`, `sdag`, `fix`, `wip`, `asd`, single letters |

Output a table with one row per commit. Count total ❌ Bad and flag if > 0.

---

## Step 3 — Check 2: Task Tracking Consistency

For each task ID in the session history:

1. Does it exist in `docs/tasks/MASTER_TASK.md`?
2. Is the status in MASTER_TASK correct (✅ if done, 🔄 if in progress)?
3. Does CURRENT_TASK show a clear "Stopped at" or ✅ DONE note?

Flag any task that:
- Is marked ✅ in session history but still ⬜ in MASTER_TASK
- Has no "Stopped at" note despite being mid-session

---

## Step 4 — Check 3: Skipped Mandatory Steps

For each task, check whether the CLAUDE.md 7-step workflow was followed.

The most commonly skipped steps — check explicitly:

**For FE tasks (pages, components):**
- Was a browser golden-path test done? Look for a P-X-N "browser test" sub-task in MASTER_TASK.
  If the browser test sub-task is ⬜ but the parent task is ✅ → flag as skipped.

**For BE tasks (handlers, services):**
- Was a spec read noted in CURRENT_TASK notes or session history? If not → flag.

**For any task touching a domain with a spec:**
- Check CURRENT_TASK notes for mention of spec read. Missing → flag.

---

## Step 5 — Check 4: Code Rules Compliance

Read the changed FE/BE files from Step 1 (only files under `fe/src/` or `be/`).

For each changed file, check the Critical Rules from `docs/tasks/MASTER_TASK.md §Critical Rules`:

| Rule | How to check |
|---|---|
| No hardcoded hex colors | `grep -n "#[0-9A-Fa-f]\{3,6\}"` in changed files |
| No hardcoded env vars | `grep -n "localhost\|8080\|3000\|mysql://" ` in changed files (not in comments) |
| UUID as string not number | `grep -n "id.*number\|:.*int"` in TS files for ID fields |
| formatVND() for all prices | Grep for bare number rendering near "₫" or "đ" without formatVND |
| No localStorage for tokens | `grep -n "localStorage.*token\|token.*localStorage"` in FE files |
| Correct field names | Spot-check: `image_path` not `image_url` · `price` not `base_price` · `gateway_data` not `webhook_payload` |

For CSS/Tailwind only:
- Extract all `pb-[word]-[N]` and `pt-[word]-[N]` custom classes from changed files
- Grep tailwind.config.ts for each — if missing, flag as ⚠️ undefined class (will silently do nothing)

Report: list each violation found, file + line number.

---

## Step 6 — Check 5: Skeleton/Loading State Coverage

For any new FE page added this session (files matching `page.tsx` under `fe/src/app/`):

1. Does it have an `isLoading` branch?
2. Does it have an `isError` branch?
3. Does it have a Skeleton component that covers ALL visible zones (not just some)?

To check skeleton coverage: count the zone comments (e.g. `{/* Zone A */}`) in the main render and compare to zones in the skeleton. Missing zone = flag.

---

## Step 7 — Produce Report

Output the report in this exact format:

```
─────────────────────────────────────────
QUALITY REVIEW — Last [N] Sessions
Reviewed: [date]
─────────────────────────────────────────

## Commit Hygiene
[table: commit | message | grade]
Score: [X/N] good messages
[❌ BAD: list the bad ones]

## Task Tracking
[table: task ID | session status | MASTER status | match?]
[flags if any]

## Skipped Steps
[list of tasks where mandatory steps were skipped, or "None found"]

## Code Rules Violations
[list: rule | file:line | detail — or "None found"]

## CSS Safety
[list: class | file:line | status — or "None found"]

## Skeleton Coverage
[list: file | missing zones — or "All pages have full skeleton coverage"]

─────────────────────────────────────────
OVERALL GRADE
─────────────────────────────────────────
🟢 Good   — 0 ❌ issues
🟡 Fair   — 1–3 ❌ issues
🔴 Needs work — 4+ ❌ issues

Grade: [🟢/🟡/🔴]

Top priority fix:
> [single most important thing to fix, with file:line]
─────────────────────────────────────────
```

Do not summarize or editorialize outside this block. The report is the output.
