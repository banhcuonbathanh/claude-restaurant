---
description: End-of-session document sync. Reads task statuses, edits stale docs (TASKS.md, CLAUDE.md, LESSONS_LEARNED), and prints a handoff summary. Run this at the end of every work session.
---

You are closing a BanhCuon project work session. Execute every step below in order.
Do not skip steps. Perform actual edits — do not just list what should change.

---

## Step 1 — Collect Evidence (read before touching anything)

Run these in parallel:
- Read `docs/TASKS.md` — note every task that changed status this session
- Read `CLAUDE.md` → Current Work section — compare "Done" and "Next" to actual session output
- Run: `git diff --stat HEAD` and `git status` — see which files were modified

From the evidence, identify:
- Which task IDs moved: ⬜→✅, ⬜→🔄, ⬜→🔴?
- Did a full phase complete?
- Was anything discovered that contradicts a spec or revealed a pattern?
- Were any new files created that belong in the doc map?

---

## Step 2 — Apply Update Rules (perform edits, do not just list)

Work through each trigger. If it applies → edit the file right now.

| Trigger | File to Edit | What to Write |
|---|---|---|
| Any task changed status | `docs/TASKS.md` | Change ⬜→✅/🔄/🔴 for that row. Add a note if blocked. **Always do this.** |
| A phase just completed | `docs/TASKS.md` + `CLAUDE.md` Phase Status | Mark the phase row ✅ COMPLETE in both files |
| What's "done" or "next" changed | `CLAUDE.md` → Current Work | Rewrite "Done" and "Next" bullets (max 5 each) to match reality |
| A wrong field name / pattern was caught and fixed | `docs/base/LESSONS_LEARNED_v3.md` | Add to §1 "Pattern Nguy Hiểm" — what went wrong, why, correct approach |
| A non-obvious architectural decision was made | `docs/base/LESSONS_LEARNED_v3.md` | Add to §2 "Quy Tắc Nhà Của Từng Loại Thông Tin" |
| A spec was found ambiguous/wrong and clarified | The spec file itself + `docs/contract/API_CONTRACT_v1.2.md` if it was an endpoint | Update the spec. Do NOT copy clarification into CLAUDE.md |
| A new doc was created this session | `CLAUDE.md` Document Map (Tầng 2 or Tầng 3) | Add one-line pointer to the new file |
| A new follow-up task was discovered | `docs/TASKS.md` | Add new ⬜ row with dependency note |

---

## Step 3 — CLAUDE.md Health Check

After edits, verify:
- [ ] Line count: run `wc -l CLAUDE.md` → must be ≤ 150 lines. If over: extract to LESSONS_LEARNED or a spec.
- [ ] No hex color values (#FF7A1A etc.) in CLAUDE.md
- [ ] No business rules (cancel %, payment timing) in CLAUDE.md — pointer only
- [ ] No DB schema details in CLAUDE.md — pointer only
- [ ] Every new file from this session has a pointer in CLAUDE.md or be/CLAUDE.md or fe/CLAUDE.md

---

## Step 4 — Output Handoff Summary

After all edits are done, print exactly this block (fill in the brackets):

```
─────────────────────────────────────────
SESSION HANDOFF
─────────────────────────────────────────
Done this session:
  • [task ID] — [one-line description]

Docs updated:
  • [filename] — [why it was updated]

Next session starts with:
  Task [ID] — [description] (dependency: [what must be true first])

Flags for next session:
  [⚠️ FLAG / 🚨 RISK / ❓ CLARIFY items, or "none"]
─────────────────────────────────────────
```
