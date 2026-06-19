#!/usr/bin/env python3
"""PANEL 11 (dark) for admin_task_board.excalidraw — DB Row-Level View.
Sourced from _be.md + migrations 011_staff_tasks.sql / 012_staff_tasks_v2.sql + SCENARIO column table.
The actual staff_tasks INSERT, every column + source, + the 4 sqlc queries (none an UPDATE)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_task_board/admin_task_board.excalidraw"
ex.reset("p11")
E = []

X, Y = 40, 4140
E += ex.panel_header(X, Y, "PANEL 11 · DB Row-Level View",
                     "staff_tasks INSERT (the new 'Dọn dẹp bếp' task) · every column + source · migrations 011/012")

cy = Y + 56
# columns table
hdr = [("column", 0), ("value", 230), ("source", 560)]
E.append(ex.rect(X, cy, 900, 26, bg=ex.C_ORD, stk=ex.C_ORD))
for name, dx in hdr:
    E.append(ex.text(X + dx + 8, cy + 7, name, fs=11, color=ex.DARK))
cols_data = [
    ("id", "<uuid t3>", "server-generated UUID"),
    ("assigned_to", "<uuid chef01>", "request body staffId  (FK → staff.id)"),
    ("assigned_by", "<uuid manager1>", "JWT claims (caller, not body)"),
    ("title", "Dọn dẹp bếp sau ca sáng", "FE form 'name'"),
    ("priority", "high", "FE form (∈ high|medium|low)"),
    ("status", "pending", "HARDCODED in SQL — FE cannot set (Bug 1)"),
    ("due_at", "2026-06-14 12:00:00", "parsed from dueDateTime"),
    ("due_time_start", "11:30", "FE form (optional)"),
    ("due_time_end", "12:00", "FE form (optional)"),
    ("notes", "Lau bếp, vệ sinh…", "FE form"),
    ("description", "NULL", "not sent"),
    ("deleted_at", "NULL", "not deleted"),
]
ry = cy + 26
for i, (c, v, s) in enumerate(cols_data):
    bg = ex.CARD_BG if i % 2 else "#243042"
    accent = ex.C_RED if c == "status" else ex.LIGHT
    E.append(ex.rect(X, ry, 900, 26, bg=bg, stk=ex.CARD_STK, sw=1))
    E.append(ex.text(X + 8, ry + 7, c, fs=10, color=accent, ff=3))
    E.append(ex.text(X + 238, ry + 7, v, fs=10, color=ex.LIGHT, ff=3))
    E.append(ex.text(X + 568, ry + 7, s, fs=9, color=ex.MUTED, ff=3))
    ry += 26

# sqlc queries card
els, qh = ex.card(X + 930, cy, 460, ex.C_RED, "sqlc querier — task domain (4 queries)",
    "CreateStaffTask     (INSERT 'pending')\nGetStaffTaskByID    (re-read)\nGetStaffTasksByDate (list)\nGetDailyTaskMetrics + GetStaffTaskStats\n\n✗ NO UpdateStaffTask\n✗ NO DeleteStaffTask\n✗ NO status-transition query\n\nfk_tasks_assigned_to → staff(id)\n  bad staffId ⇒ FK 1452 ⇒ 500 (Bug 3)")
E += els
E.append(ex.text(X + 930, cy + qh + 12,
                 "Once inserted, a row can never be updated, cancelled, or status-changed through the app — only a direct DB op removes it.",
                 fs=10, color=ex.SUB, w=460, wrap=True))

ex.append(FP, E)
print("PANEL 11: appended")
