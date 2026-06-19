#!/usr/bin/env python3
"""PANEL 3 for admin_task_board.excalidraw — BE View.
Sourced from admin_task_board_be.md (Endpoints table, Auth model, Caching, Error behaviour)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_task_board/admin_task_board.excalidraw"
ex.reset("p3")
E = []

X, Y = 2720, 40
E += ex.panel_header(X, Y, "PANEL 3 · BE View",
                     "4 endpoints · ALL manager+ · NO Redis anywhere in the task domain")

cy = Y + 56
# endpoint rows
hdr = ["#", "Endpoint", "Handler → Service → SQL", "Cache"]
cols = [X, X + 40, X + 470, X + 1180]
E.append(ex.rect(X, cy, 1300, 26, bg=ex.C_BE, stk=ex.C_BE))
for i, h in enumerate(hdr):
    E.append(ex.text(cols[i] + 8, cy + 7, h, fs=11, color=ex.DARK))

eps = [
    ("1", "GET /admin/tasks/stats?date=", "GetTaskStats → GetDailyTaskMetrics + GetStaffTaskStats", "none"),
    ("2", "GET /admin/tasks?staffId=&date=", "GetStaffTasks → GetStaffTasksByDate (priority, due_at)", "none"),
    ("3", "POST /admin/tasks", "CreateTask → CreateStaffTask (status='pending') + GetByID", "none"),
    ("4", "GET /staff?limit=100", "staffH.ListStaff (staff domain — modal dropdown)", "none"),
]
ry = cy + 26
for n, ep, chain, cache in eps:
    bg = "#ffffff" if int(n) % 2 else ex.L_NEUTRAL
    E.append(ex.rect(X, ry, 1300, 40, bg=bg, stk=ex.L_BORDER, sw=1))
    E.append(ex.text(cols[0] + 8, ry + 13, n, fs=11, color=ex.L_TEXT))
    E.append(ex.text(cols[1] + 8, ry + 13, ep, fs=10, color=ex.L_TEXT, ff=3))
    E.append(ex.text(cols[2] + 8, ry + 13, chain, fs=9, color=ex.SUB, ff=3))
    E.append(ex.text(cols[3] + 8, ry + 13, cache, fs=10, color=ex.C_RED))
    ry += 40

# auth model card
ay = ry + 16
E.append(ex.rect(X, ay, 640, 130, bg=ex.L_INDIGO, stk=ex.C_VIOLET, sw=2))
E.append(ex.rect(X, ay, 640, 24, bg=ex.C_VIOLET, stk=ex.C_VIOLET))
E.append(ex.text(X + 10, ay + 6, "Auth model", fs=12, color=ex.DARK))
E.append(ex.text(X + 12, ay + 32,
                 "/admin group → authMW + AtLeast(\"manager\")\n"
                 "NO public / guest / cashier / chef access.\n"
                 "NO per-staff ownership scope — any manager\n"
                 "reads ANY staff's tasks. assigned_by = caller\n"
                 "(StaffIDFromContext); assigned_to = body.staffId",
                 fs=10, color=ex.L_TEXT, ff=3))

# caching card
E.append(ex.rect(X + 660, ay, 640, 130, bg="#fff7ed", stk=ex.C_ORD, sw=2))
E.append(ex.rect(X + 660, ay, 640, 24, bg=ex.C_ORD, stk=ex.C_ORD))
E.append(ex.text(X + 670, ay + 6, "Caching & gotchas", fs=12, color=ex.DARK))
E.append(ex.text(X + 672, ay + 32,
                 "NO Redis — every read = sqlc → MySQL.\n"
                 "Client-side only: stats stale 30s/refetch 60s;\n"
                 "expanded stale 15s (lazy).\n"
                 "🔴 status is WRITE-ONCE 'pending' — no UPDATE\n"
                 "query exists → 3/4 KPIs + quality permanently 0.",
                 fs=10, color=ex.L_TEXT, ff=3))

E.append(ex.text(X, ay + 142,
                 "qualityScore is synthetic: completionRate / 20.0 (no stored quality column). See Panel 8.",
                 fs=10, color=ex.SUB))

ex.append(FP, E)
print("PANEL 3: appended")
