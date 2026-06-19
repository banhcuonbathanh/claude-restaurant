#!/usr/bin/env python3
"""PANEL 13 (dark) for admin_task_board.excalidraw — One Field, All Layers.
Traces `priority` tap → render through every layer; contrasts `status` (the dead, hardcoded field).
Sourced from CreateTaskModal.tsx, admin.api.ts, task_service.go, tasks.sql.go, ExpandedTaskList.tsx."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_task_board/admin_task_board.excalidraw"
ex.reset("p13")
E = []

X, Y = 40, 5280
E += ex.panel_header(X, Y, "PANEL 13 · One Field, All Layers — `priority`",
                     "a user-driven field traced tap → render · contrasted with `status` (write-once, FE cannot set)")

cy = Y + 56
steps = [
    ("1 · tap", ex.C_ZUS, "RHF <select> 'Ưu tiên' → \"high\"  (CreateTaskModal)"),
    ("2 · validate", ex.C_AMBER, "Zod schema priority enum (RHF resolver)"),
    ("3 · payload", ex.C_CYAN, "createTask({ priority:\"high\", … }) → POST /admin/tasks"),
    ("4 · service", ex.C_BE, "validate ∈ {high,medium,low} else 400 (task_service.go:176)"),
    ("5 · SQL", ex.C_ORD, "INSERT staff_tasks(priority=?) = 'high'  (tasks.sql.go)"),
    ("6 · read-back", ex.C_TAN, "GetStaffTaskByID → TaskDTO.priority → list ordered high→med→low"),
    ("7 · render", ex.LIGHT, "ExpandedTaskList priority badge 'Cao'  (StaffTaskTable color map)"),
]
ry = cy
for tag, accent, body in steps:
    E.append(ex.rect(X, ry, 900, 44, bg=ex.CARD_BG, stk=accent, sw=2))
    E.append(ex.rect(X, ry, 110, 44, bg=accent, stk=accent))
    E.append(ex.text(X + 10, ry + 14, tag, fs=12, color=ex.DARK))
    E.append(ex.text(X + 122, ry + 14, body, fs=10, color=ex.LIGHT, ff=3))
    if ry > cy:
        E.append(ex.arrow(X + 55, ry - 8, X + 55, ry, stk=ex.C_SLATE, sw=2))
    ry += 52

# contrast card: status
els, h = ex.card(X + 930, cy, 460, ex.C_RED, "Contrast: `status` short-circuits",
    "1 · tap        ✗ no control — FE never\n               sets status\n5 · SQL        INSERT … status='pending'\n               (HARDCODED string literal)\n6 · read-back  always 'pending'\n7 · render     badge always 'Đang chờ'\n\nNo step 2/3 input layer · no UPDATE\npath ⇒ the field can never change.\n→ Bug 1 (Panel 8)")
E += els

ex.append(FP, E)
print("PANEL 13: appended")
