---
description: Mid-session document audit (read-only). Scans TASKS.md, CLAUDE.md, and new files for staleness. Outputs a prioritized fix list without making edits. Accepts an optional task ID to scope the scan (e.g. /doc-check 4.1).
---

Scan the current state of the project docs and flag what is stale or missing.
Do NOT edit any files. Output a checklist only.

The optional argument is: $ARGUMENTS
If an argument was provided (e.g. "4.1"), scope the entire scan to that task domain only.

---

## Scan 1 — TASKS.md vs Reality

Read `docs/TASKS.md`. For every task that is ⬜ but whose files now exist and appear complete:
- Flag: `⚠️ STALE: Task [ID] still shows ⬜ but [file] exists — should it be ✅?`

For every task that is ✅ but whose dependent task is still ⬜:
- Flag: `💡 UNBLOCKED: Task [ID] dependency is now ✅ — ready to start`

## Scan 2 — CLAUDE.md Current Work

Read `CLAUDE.md` → Current Work section. Check against git status and recent file changes.
- Is the "Done" list missing anything completed this session? → `⚠️ STALE: CLAUDE.md Done list`
- Is the "Next" list pointing at something already done? → `⚠️ STALE: CLAUDE.md Next list`
- Is CLAUDE.md over 150 lines? Run `wc -l CLAUDE.md` to check → `🚨 SIZE: CLAUDE.md is [N] lines`

## Scan 3 — New Files Without Pointers

Check `git status` for untracked or newly added files. For each new `.md` doc or code file that adds architecture:
- Does `CLAUDE.md`, `be/CLAUDE.md`, or `fe/CLAUDE.md` point to it?
- If not: `⚠️ ORPHAN: [filename] has no pointer in any CLAUDE.md`

## Scan 4 — Doc Drift Check

For the domain being worked on (use $ARGUMENTS if provided, otherwise infer from git diff):
- Does the active spec still match the current BE/FE code?
- Does `docs/contract/API_CONTRACT_v1.2.md` reflect recently added endpoints?
- If mismatch: `⚠️ DRIFT: [doc] says [X] but code does [Y]`

---

## Output Format

```
DOC CHECK RESULTS
─────────────────
🔴 MUST FIX BEFORE NEXT TASK:
  • [item or "none"]

⚠️ FIX BY END OF SESSION:
  • [item or "none"]

💡 NICE TO HAVE:
  • [item or "none"]

✅ ALL CLEAR — all tracked docs appear current.
   (only print this line if zero issues found)
```
