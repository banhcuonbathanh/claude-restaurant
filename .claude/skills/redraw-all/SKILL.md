---
description: Loop through all 9 wireframe pages that have recommend.md files and redraw each as a v2 .excalidraw. Processes one page at a time — waits for "continue" between pages. Usage: /redraw-all (no arguments needed). Resumes from where it left off by reading the progress tracker.
---

You are running a batch redraw loop across all 9 wireframe pages.

Progress tracker: `docs/fe/wireframes/shared/_INDEX_REDRAW_PROGRESS.md`

The full queue (fixed order):
```
1.  client_menu_page
2.  admin_main/admin_main_categories
3.  admin_main/admin_main_combos
4.  admin_main/admin_main_marketing
5.  admin_main/admin_main_product
6.  admin_main/admin_main_staff
7.  admin_main/admin_main_staff_task_boad
8.  admin_main/admin_main_storage
9.  admin_main/admin_main_training
```

---

## Step 1 — Find the current position

Read `docs/fe/wireframes/shared/_INDEX_REDRAW_PROGRESS.md`.

- Find the first row where Status = `⬜` (not started).
- If all 9 rows are `✅` → print:
  ```
  🎉 All 9 pages redrawn. Nothing left to do.
  Check: docs/fe/wireframes/shared/_INDEX_REDRAW_PROGRESS.md
  ```
  Then stop.
- Otherwise, note the page folder for that row. This is the **current page**.

Print:

```
📋 REDRAW-ALL — Page N/9
Current: <page-folder>
Remaining: <list of ⬜ pages below this one>
Already done: <list of ✅ pages>
```

---

## Step 2 — Run /redraw for the current page

Execute the full `/redraw` skill for the current page. This means:

### Phase 1 — Audit & Change Plan

Follow the exact same steps as the `/redraw` skill SKILL.md for the current page folder:

1. Find the existing `.excalidraw` file in `docs/fe/wireframes/<current-page>/` (top-level only).
2. Read `docs/fe/wireframes/<current-page>/recomment/recommend.md` fully.
3. Optionally read the wireframe spec if present.
4. Extract the change list (Must apply vs Skip).
5. Print the full change list and layout plan.

Then print:

> **Page N/9 — Waiting for approval.** Reply "ok" to draw this page, "skip" to skip it, or "stop" to end the batch.

Wait for the user's reply before proceeding.

- `"ok"` or `"continue"` or `"yes"` → proceed to Phase 2 for this page
- `"skip"` → mark this page as `✅ skipped` in the tracker, move to next page (re-run Step 1)
- `"stop"` → stop the batch, print summary of what was done

### Phase 2 — Draw v2

Follow the exact same drawing rules as the `/redraw` SKILL.md Phase 2.

After writing the .excalidraw file:
1. Update `docs/fe/wireframes/shared/_INDEX_REDRAW_PROGRESS.md` — mark this page `✅`, fill in the date and filenames.
2. Print:

```
✅ Page N/9 done: docs/fe/wireframes/<current-page>/recomment/<name>_ver2.excalidraw
   Changes applied: N of M recommendations

──────────────────────────────────────
Reply "continue" to draw the next page, or "stop" to end the batch.
Next up: <next-page-folder> (page N+1/9)
──────────────────────────────────────
```

Wait for the user's reply.

- `"continue"` or `"next"` or `"ok"` → go back to Step 1 (it will auto-advance to the next ⬜ page)
- `"stop"` → stop, print the final summary below

---

## Final summary (print when batch stops or completes)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REDRAW-ALL SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Done this run:
  ✅ [page] → recomment/<name>_ver2.excalidraw
  ...

Remaining (⬜):
  [page] — not yet started
  ...

Progress tracker: docs/fe/wireframes/shared/_INDEX_REDRAW_PROGRESS.md
Type /redraw-all again to resume from where you stopped.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
