#!/usr/bin/env python3
"""PANEL 10 (dark) for admin_task_board.excalidraw — Object Lifecycle (moving).
Sourced from _crosscomponent_dataflow.md §3 (step-by-step) + §7 timeline + _loading.md.
Same objects from Panel 9 MOVING: per-beat lanes Action · coordinator-after · components · TanStack/BE."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_task_board/admin_task_board.excalidraw"
ex.reset("p10")
E = []

X, Y = 1660, 3000
E += ex.panel_header(X, Y, "PANEL 10 · Object Lifecycle (moving)",
                     "the assign action, beat by beat — what changes in the coordinator + cache each step")

cy = Y + 56
# header lanes
lanes = [("Action", 300), ("coordinator state after (← changed)", 380), ("components reacting", 320), ("TanStack / BE", 300)]
lx = X
E.append(ex.rect(X, cy, 1300, 26, bg=ex.C_CYAN, stk=ex.C_CYAN))
for name, w in lanes:
    E.append(ex.text(lx + 8, cy + 7, name, fs=10, color=ex.DARK))
    lx += w

beats = [
    ("click 'Giao việc'", "modalOpen:true · defaultStaffId:'chef01'", "CreateTaskModal mounts (RHF reset)", "GET /staff?limit=100"),
    ("modal pre-selects", "(unchanged)", "<select> = chef01 after list resolves", "['admin','staff'] stale 5m"),
    ("fill + submit", "(unchanged · RHF local only)", "submit btn 'Đang tạo…' disabled", "POST /admin/tasks → 201"),
    ("onSuccess fires", "(unchanged)", "toast.success", "invalidate stats + tasks keys"),
    ("modal closes", "modalOpen:false", "modal UNMOUNTS (form reset)", "both keys refetch in bg"),
    ("page re-renders", "(coordinator idle)", "KPIs total 2→3 · row 2→3 · expanded +1", "fresh statsData + Task[]"),
]
ry = cy + 26
cols = [X, X + 300, X + 680, X + 1000]
ws = [300, 380, 320, 300]
for i, beat in enumerate(beats):
    bg = ex.CARD_BG if i % 2 else "#243042"
    E.append(ex.rect(X, ry, 1300, 50, bg=bg, stk=ex.CARD_STK, sw=1))
    for j, cell in enumerate(beat):
        col = ex.C_AMBER if j == 0 else (ex.C_ZUS if j == 1 else (ex.LIGHT if j == 2 else ex.C_TAN))
        E.append(ex.text(cols[j] + 8, ry + 16, cell, fs=9, color=col, ff=3, w=ws[j] - 12, wrap=True))
    ry += 56

E.append(ex.text(X, ry + 6,
                 "The modal carries nothing back up the tree — the two invalidate() calls are the entire 'message'. Subscribers (KPIs, table, expanded) refetch on their own.",
                 fs=10, color=ex.SUB))

ex.append(FP, E)
print("PANEL 10: appended")
