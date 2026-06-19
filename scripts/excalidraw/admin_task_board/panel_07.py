#!/usr/bin/env python3
"""PANEL 7 for admin_task_board.excalidraw — Scenario Timeline.
Sourced from SCENARIO_ASSIGN_TASK.md (manager assigns a task at shift start, 07:45→07:47)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_task_board/admin_task_board.excalidraw"
ex.reset("p7")
E = []

X, Y = 40, 2160
E += ex.panel_header(X, Y, "PANEL 7 · Scenario — Manager assigns a task at shift start",
                     "SCENARIO_ASSIGN_TASK.md · manager1 / chef01 · 2026-06-14 07:45→07:47 · honest dead-ends")

cy = Y + 56
beats = [
    ("07:45:00", "Navigate to /admin/staff/task-board", ex.C_SLATE,
     "mount: filters.date=TODAY, expandedStaffId=null. Stats query fires (cold cache). KPIs show '…', table withheld."),
    ("07:45:01", "Stats 200 arrives", ex.C_TAN,
     "metrics{total:2, completed:0, inProgress:0, overdue:0} · staffStats[chef01:2, cashier1:0]. KPIs+table fill. completed/quality=0 (Bug 1/2)."),
    ("07:45:15", "Expand chef row", ex.C_CYAN,
     "handleToggleExpand → expandedStaffId='chef01' → lazy GET /admin/tasks?staffId=chef01 fires. 'Đang tải…' pulse."),
    ("07:45:16", "Chef tasks render", ex.C_ORD,
     "2 tasks, both status:'pending'. ExpandedTaskList sub-table. 'description' invisible (only notes shown — Flag 5)."),
    ("07:45:30", "Click 'Giao việc' on chef row", ex.C_VIOLET,
     "setDefaultStaffId(chef01)+setModalOpen(true). Modal mounts, useForm pre-fills staffId=chef01, GET /staff?limit=100."),
    ("07:46:00", "Fill + submit form", ex.C_ZUS,
     "'Dọn dẹp bếp', priority=Cao, 11:30–12:00. mutate → POST /admin/tasks {dueDateTime:`…T12:00:00Z`}. Button 'Đang tạo…'."),
    ("07:46:01", "BE 201 + onSuccess", ex.C_BE,
     "INSERT status='pending' (hardcoded) → re-read GetByID → 201. invalidate(stats,date)+(tasks,chef01,date). toast. modal unmounts."),
    ("07:46:05", "Board refetches", ex.C_TAN,
     "totalTasks 2→3 · chef 'Được giao' 2→3 · expanded adds 'Dọn dẹp bếp'. completed/qu/overdue STILL 0."),
    ("∞ DEAD-END", "Status never advances", ex.C_RED,
     "No PATCH/PUT status endpoint, no overdue job, no staff self-mark. Completion + quality + overdue permanently decorative (Bug 1)."),
]
ry = cy
for t, title, accent, body in beats:
    E.append(ex.rect(X, ry, 1300, 58, bg="#ffffff", stk=accent, sw=2))
    E.append(ex.rect(X, ry, 96, 58, bg=accent, stk=accent))
    E.append(ex.text(X + 8, ry + 10, t, fs=11, color=ex.DARK))
    E.append(ex.text(X + 8, ry + 32, title[:14], fs=8, color=ex.DARK))
    E.append(ex.text(X + 108, ry + 8, title, fs=12, color=ex.L_TEXT))
    E.append(ex.text(X + 108, ry + 30, body, fs=10, color=ex.SUB, ff=3))
    ry += 66

ex.append(FP, E)
print("PANEL 7: appended")
