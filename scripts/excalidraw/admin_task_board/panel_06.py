#!/usr/bin/env python3
"""PANEL 6 for admin_task_board.excalidraw — Loading States.
Sourced from admin_task_board_loading.md (Loading layers, Main content branch, Interaction gating)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_task_board/admin_task_board.excalidraw"
ex.reset("p6")
E = []

X, Y = 2720, 1080
E += ex.panel_header(X, Y, "PANEL 6 · Loading States",
                     "shared admin spinner (no task-board loading.tsx) · no Suspense · per-query placeholders")

cy = Y + 56
layers = [
    (ex.C_SLATE, "1 · Route navigation → /admin/**",
     "AdminLoading: centered orange ring (admin/loading.tsx)\nNOT task-board-specific · no segment loading.tsx"),
    (ex.C_AMBER, "2 · No Suspense boundary",
     "StaffTaskBoardPage has no <Suspense>; CreateTaskModal\nnext/dynamic but conditionally mounted, no loading: fallback"),
    (ex.C_TAN, "3a · Stats query ['admin','tasks','stats',date]",
     "statsLoading → each KPICard value = literal '…' (text, not skeleton)\nstaff table region WITHHELD (!statsLoading guard)"),
    (ex.C_CYAN, "3b · Expanded-row ['admin','tasks',staffId,date]",
     "enabled !!expandedStaffId → ExpandedTaskList shows\n\"Đang tải công việc…\" animate-pulse text (no skeleton rows)"),
    (ex.C_VIOLET, "3c · Modal staff ['admin','staff']",
     "enabled open · <select> silent until resolved (only\nplaceholder 'Chọn nhân viên…') — no isLoading flag exposed"),
]
ry = cy
for accent, title, body in layers:
    E.append(ex.rect(X, ry, 1300, 70, bg="#ffffff", stk=accent, sw=2))
    E.append(ex.rect(X, ry, 6, 70, bg=accent, stk=accent))
    E.append(ex.text(X + 16, ry + 8, title, fs=12, color=ex.L_TEXT))
    E.append(ex.text(X + 16, ry + 30, body, fs=10, color=ex.SUB, ff=3))
    ry += 80

# Zone E 3-state branch
by = ry + 8
E.append(ex.rect(X, by, 1300, 120, bg=ex.L_NEUTRAL, stk=ex.L_BORDER, sw=2))
E.append(ex.text(X + 12, by + 8, "Zone E / G branch (evaluation order):", fs=12, color=ex.L_TEXT))
E.append(ex.text(X + 12, by + 32,
                 "1. statsLoading            → neither table nor empty-state (blank below KPIs)\n"
                 "2. !loading & 0 rows       → EmptyState 📋 (same msg for 'no tasks' AND 'filter→0')\n"
                 "3. !loading & rows>0       → StaffTaskTable\n"
                 "ExpandedTaskList: isLoading→pulse · isError→\"Không thể tải…\" (NO retry) · 0→\"Không có công việc\" · else sub-table",
                 fs=10, color=ex.L_TEXT, ff=3))
E.append(ex.text(X + 12, by + 104,
                 "Gating: date change → re-keys both queries (fetch). role/status/search → client useMemo, NO fetch. Modal submit → button 'Đang tạo…' disabled.",
                 fs=9, color=ex.SUB))

ex.append(FP, E)
print("PANEL 6: appended")
