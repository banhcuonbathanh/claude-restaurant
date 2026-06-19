#!/usr/bin/env python3
"""PANEL 4 for admin_task_board.excalidraw — Object Model FE⇄BE⇄DB.
admin_task_board.md has NO §Object Model section → sourced from traced types/task.ts (Task,
StaffTaskStat, TaskBoardFilters), admin_task_board_be.md (TaskDTO), SCENARIO column table, DB_SCHEMA staff_tasks."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_task_board/admin_task_board.excalidraw"
ex.reset("p4")
E = []

X, Y = 40, 1080
E += ex.panel_header(X, Y, "PANEL 4 · Object Model FE⇄BE⇄DB",
                     "Task / StaffTaskStat / TaskBoardFilters  ↔  TaskDTO  ↔  staff_tasks  (traced — page.md has no §Object Model)")

cy = Y + 56
def col(x, w, accent, title, lines):
    h = 40 + lines.count("\n") * 14 + 24
    E.append(ex.rect(x, cy, w, 230, bg="#ffffff", stk=accent, sw=2))
    E.append(ex.rect(x, cy, w, 24, bg=accent, stk=accent))
    E.append(ex.text(x + 10, cy + 6, title, fs=12, color=ex.DARK))
    E.append(ex.text(x + 10, cy + 32, lines, fs=10, color=ex.L_TEXT, ff=3))

col(X, 400, ex.C_ZUS, "FE — types/task.ts",
    "Task { id, staffId, name,\n  description?, priority,\n  status, dueDate,\n  dueTimeStart?, dueTimeEnd?,\n  notes?, assignedBy? }\n"
    "StaffTaskStat { staffId, staffName,\n  role, assignedCount,\n  completedCount, completionRate,\n  qualityScore, hasOverdue }\n"
    "TaskBoardFilters { date, role,\n  status, search }")

col(X + 430, 420, ex.C_BE, "BE — TaskDTO (task_service.go)",
    "TaskDTO { id, staffId, name,\n  description omitempty,\n  priority, status,\n  dueDate (due_at→YYYY-MM-DD),\n  dueTimeStart, dueTimeEnd,\n  notes, assignedBy }\n"
    "DERIVED (not stored):\n  qualityScore = completionRate/20\n  status = always 'pending'\n  completionRate = 100*done/total")

col(X + 880, 400, ex.C_ORD, "DB — staff_tasks (011/012)",
    "id PK · assigned_to FK · assigned_by\ntitle · description · priority\nstatus  (CHECK enum, only 'pending'\n        ever written)\ndue_at · due_time_start/end\nnotes · created_at · deleted_at\n\nfk_tasks_assigned_to → staff(id)\nNO quality col · NO completed_at write")

# pipelines
py = cy + 250
E.append(ex.rect(X, py, 1280, 70, bg=ex.L_NEUTRAL, stk=ex.L_BORDER, sw=2))
E.append(ex.text(X + 12, py + 8,
                 "READ :  staff_tasks row → sqlc → taskToDTO (due_at sliced to dueDate) → JSON → TanStack → render badge/KPIs",
                 fs=11, color=ex.C_TAN, ff=3))
E.append(ex.text(X + 12, py + 34,
                 "WRITE:  RHF form → createTask payload (dueDateTime=`${dueDate}T${dueTime}:00Z`) → INSERT status='pending' → re-read GetByID → DTO",
                 fs=11, color=ex.C_ORD, ff=3))
E.append(ex.arrow(X + 410, cy + 120, X + 430, cy + 120, stk=ex.C_SLATE, sw=2))
E.append(ex.arrow(X + 860, cy + 120, X + 880, cy + 120, stk=ex.C_SLATE, sw=2))

ex.append(FP, E)
print("PANEL 4: appended")
