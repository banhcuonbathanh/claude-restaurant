#!/usr/bin/env python3
"""PANEL 5 for admin_task_board.excalidraw — Cross-Page Dataflow.
Sourced from admin_task_board_crosspage_dataflow.md (§0 diagram, §1 frozen status, §4 downstream
todo-list, §Gap, Durability matrix). Folds in the SKIPPED Realtime panel: NO SSE/WS/localStorage."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_task_board/admin_task_board.excalidraw"
ex.reset("p5")
E = []

X, Y = 1380, 1080
E += ex.panel_header(X, Y, "PANEL 5 · Cross-Page Dataflow",
                     "Only durable output = one staff_tasks MySQL row · NO SSE · NO WS · NO localStorage — pages POLL")

cy = Y + 56
# browser A
E.append(ex.rect(X, cy, 1300, 70, bg="#fff7ed", stk=ex.C_VIOLET, sw=2))
E.append(ex.text(X + 10, cy + 8, "BROWSER A (manager)  /admin/staff/task-board", fs=12, color=ex.L_TEXT))
E.append(ex.text(X + 10, cy + 30,
                 "CreateTaskModal submit → POST /admin/tasks → on 201: qc.invalidate(stats,date) + qc.invalidate(tasks,staffId,date)  (same TanStack client only)",
                 fs=10, color=ex.SUB, ff=3))

# the wire → MySQL row hub
hy = cy + 96
E.append(ex.rect(X + 380, hy, 540, 96, bg=ex.L_INDIGO, stk=ex.C_ORD, sw=3))
E.append(ex.rect(X + 380, hy, 540, 24, bg=ex.C_ORD, stk=ex.C_ORD))
E.append(ex.text(X + 390, hy + 6, "staff_tasks row — MySQL (durable, no Redis)", fs=12, color=ex.DARK))
E.append(ex.text(X + 390, hy + 32,
                 "id · assigned_to · title · priority\nstatus = 'pending' (WRITE-ONCE) · due_at\nassigned_by · created_at · deleted_at",
                 fs=10, color=ex.L_TEXT, ff=3))
E.append(ex.arrow(X + 650, cy + 70, X + 650, hy, stk=ex.C_ORD, sw=2))

# frozen status machine
E.append(ex.rect(X, hy, 360, 96, bg="#ffffff", stk=ex.C_RED, sw=2))
E.append(ex.rect(X, hy, 360, 24, bg=ex.C_RED, stk=ex.C_RED))
E.append(ex.text(X + 10, hy + 6, "Status machine — FROZEN", fs=12, color=ex.DARK))
E.append(ex.text(X + 10, hy + 32,
                 "pending ──┐ (no transition path)\n  in_progress ✗ completed ✗ overdue ✗\n  no UPDATE query · no job · pending∞",
                 fs=10, color=ex.L_TEXT, ff=3))

# downstream readers
dy = hy + 120
E.append(ex.rect(X, dy, 630, 96, bg="#ffffff", stk=ex.C_TAN, sw=2))
E.append(ex.rect(X, dy, 630, 24, bg=ex.C_TAN, stk=ex.C_TAN))
E.append(ex.text(X + 10, dy + 6, "This page (later visit / other manager)", fs=12, color=ex.DARK))
E.append(ex.text(X + 10, dy + 32,
                 "same 2 endpoints · sees new row only on own poll\nmax staleness ~60s (stats refetchInterval)\nexpanded list: stale until collapse/re-expand",
                 fs=10, color=ex.L_TEXT, ff=3))

E.append(ex.rect(X + 670, dy, 630, 96, bg="#ffffff", stk=ex.C_TAN, sw=2))
E.append(ex.rect(X + 670, dy, 630, 24, bg=ex.C_TAN, stk=ex.C_TAN))
E.append(ex.text(X + 680, dy + 6, "/admin/todo-list (A9) — same staff_tasks", fs=12, color=ex.DARK))
E.append(ex.text(X + 680, dy + 32,
                 "useTodoTasks / useTaskStats (same endpoints)\n⚠ 'edit' mode calls createTask → DUPLICATE row\n   (no PATCH endpoint exists)",
                 fs=10, color=ex.L_TEXT, ff=3))
E.append(ex.arrow(X + 650, hy + 96, X + 315, dy, stk=ex.C_SLATE, sw=2))
E.append(ex.arrow(X + 650, hy + 96, X + 985, dy, stk=ex.C_SLATE, sw=2))

# gap + durability
gy = dy + 116
E.append(ex.rect(X, gy, 1300, 70, bg=ex.L_NEUTRAL, stk=ex.C_RED, sw=2, style="dashed"))
E.append(ex.text(X + 12, gy + 8,
                 "GAP: assigned_to records the recipient, but NO FE route lets that staff (kds/cashier/pos) view their own tasks. Both readers are manager+ only.",
                 fs=10, color=ex.C_RED))
E.append(ex.text(X + 12, gy + 32,
                 "Durability: staff_tasks row → survives F5 / new tab / device ✅   ·   filters + expandedStaffId + TanStack cache → memory-only, lost on F5 ✗",
                 fs=10, color=ex.SUB))

ex.append(FP, E)
print("PANEL 5: appended")
