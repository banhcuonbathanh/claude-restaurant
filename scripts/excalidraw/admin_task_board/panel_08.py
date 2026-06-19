#!/usr/bin/env python3
"""PANEL 8 for admin_task_board.excalidraw — Flags / Known Mismatches.
Sourced from TASK_BOARD_BUGS.md (Bugs 1-4) + admin_task_board_be.md Flags 5-6 + crosscomponent §6
(invalidation date mismatch). Code bugs, NOT stale docs."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_task_board/admin_task_board.excalidraw"
ex.reset("p8")
E = []

X, Y = 1380, 2160
E += ex.panel_header(X, Y, "PANEL 8 · Flags / Known Mismatches",
                     "TASK_BOARD_BUGS.md (4 code bugs) + BE Flags 5-6 + crosscomponent §6 — none yet on MASTER_TASK")

cy = Y + 56
flags = [
    ("🔴 Bug 1", "BE", ex.C_RED, "status write-once 'pending'",
     "No UPDATE query / no job / no route advances status. 3/4 KPIs, completion%, quality, overdue PERMANENTLY 0. Also breaks A9 todo-list."),
    ("🟠 Bug 2", "BE", ex.C_AMBER, "qualityScore fabricated",
     "quality = completionRate / 20.0 (task_service.go:131). No stored quality column. 'Chất lượng ★/5.0' = completion rate in disguise."),
    ("🟡 Bug 3", "BE", ex.C_AMBER, "invalid assigned_to → 500",
     "FK reject mapped to ErrInternalError (500), not 4xx. Dead sql.ErrNoRows branch never fires for INSERT. Modal shows generic toast."),
    ("🟡 Bug 4", "FE", ex.C_AMBER, "status filter mostly dead",
     "FilterBar offers pending/in_progress/completed/overdue; page.tsx honours only 'overdue' — which (per Bug 1) is always false. 3 options no-op."),
    ("⚠ Flag 5", "FE", ex.C_SLATE, "description stored, never shown",
     "Modal sends description + notes; ExpandedTaskList renders only notes. description round-trips DTO (omitempty), no page surfaces it."),
    ("⚠ Flag 6", "FE", ex.C_SLATE, "required dueTime not stored",
     "Modal requires dueTime → folded into due_at only. 'Giờ' column reads OPTIONAL dueTimeStart–End → shows '—' though time was mandatory."),
    ("⚠ subtle", "FE", ex.C_SLATE, "invalidate uses task.dueDate",
     "onSuccess invalidates task.dueDate, not filters.date. If manager creates for a different date than the filter, KPIs don't refresh."),
]
ry = cy
for tag, side, accent, title, body in flags:
    E.append(ex.rect(X, ry, 1300, 58, bg="#ffffff", stk=accent, sw=2))
    E.append(ex.rect(X, ry, 92, 58, bg=accent, stk=accent))
    E.append(ex.text(X + 8, ry + 12, tag, fs=11, color=ex.DARK))
    E.append(ex.text(X + 8, ry + 34, side, fs=9, color=ex.DARK))
    E.append(ex.text(X + 104, ry + 8, title, fs=12, color=ex.L_TEXT))
    E.append(ex.text(X + 104, ry + 30, body, fs=10, color=ex.SUB, ff=3))
    ry += 66

ex.append(FP, E)
print("PANEL 8: appended")
