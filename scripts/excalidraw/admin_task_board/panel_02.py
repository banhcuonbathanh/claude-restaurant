#!/usr/bin/env python3
"""PANEL 2 for admin_task_board.excalidraw — Cross-Component Dataflow.
Sourced from admin_task_board_crosscomponent_dataflow.md (§0 whole picture, §2 coordinator state,
§3 step-by-step, §4 three layers). The no-Zustand coordinator + TanStack cache as broadcast bus."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_task_board/admin_task_board.excalidraw"
ex.reset("p2")
E = []

X, Y = 1380, 40
E += ex.panel_header(X, Y, "PANEL 2 · Cross-Component Dataflow",
                     "NO Zustand · page.tsx useState = coordinator · TanStack cache = broadcast bus")

def box(x, y, w, h, accent, title, lines, bg="#ffffff", tfs=12, lfs=10):
    E.append(ex.rect(x, y, w, h, bg=bg, stk=accent, sw=2))
    E.append(ex.rect(x, y, w, 24, bg=accent, stk=accent))
    E.append(ex.text(x + 10, y + 6, title, fs=tfs, color=ex.DARK))
    if lines:
        E.append(ex.text(x + 10, y + 32, lines, fs=lfs, color=ex.L_TEXT, ff=3))

cy = Y + 56
# top row: three widgets
box(X, cy, 400, 70, ex.C_VIOLET, "B BreadcrumbPageHeader",
    "[+ Giao việc] → onAddTask\nsetModalOpen(true)")
box(X + 430, cy, 400, 70, ex.C_CYAN, "C StaffTaskFilterBar",
    "date·role·status·search\nonChange → writes filters up")
box(X + 860, cy, 420, 70, ex.C_ORD, "E StaffTaskTable",
    "Giao việc → onAssign(staffId)\nchevron → onToggleExpand")

# coordinator
coy = cy + 110
E.append(ex.rect(X, coy, 1280, 96, bg=ex.L_INDIGO, stk=ex.C_ZUS, sw=3))
E.append(ex.rect(X, coy, 1280, 24, bg=ex.C_ZUS, stk=ex.C_ZUS))
E.append(ex.text(X + 10, coy + 6, "page.tsx  useState  — THE COORDINATOR  (page.tsx:19-27)", fs=12, color=ex.DARK))
E.append(ex.text(X + 14, coy + 34,
                 "filters {date, role, status, search}   →   drives BOTH query keys\n"
                 "expandedStaffId: string|null   →   gates lazy query        modalOpen: bool   defaultStaffId: string|undefined",
                 fs=10, color=ex.L_TEXT, ff=3))
# arrows widgets→coordinator
for ax in (X + 200, X + 630, X + 1070):
    E.append(ex.arrow(ax, cy + 70, ax, coy, stk=ex.C_SLATE, sw=2))

# two query caches
qy = coy + 130
box(X, qy, 620, 96, ex.C_TAN, "TanStack  ['admin','tasks','stats', date]",
    "queryFn getTaskStats(date) · stale 30s · refetch 60s\n→ statsData.metrics (KPIs) + .staffStats[] (table rows)")
box(X + 660, qy, 620, 96, ex.C_TAN, "TanStack  ['admin','tasks', staffId, date]",
    "enabled !!expandedStaffId · stale 15s (lazy)\n→ Task[] → ExpandedTaskList (props only, no query)")
E.append(ex.arrow(X + 300, coy + 96, X + 300, qy, stk=ex.C_TAN, sw=2))
E.append(ex.arrow(X + 960, coy + 96, X + 960, qy, stk=ex.C_TAN, sw=2))

# modal + invalidation (the KEY)
my = qy + 130
E.append(ex.rect(X, my, 1280, 130, bg="#fff7ed", stk=ex.C_ORD, sw=2))
E.append(ex.rect(X, my, 1280, 24, bg=ex.C_ORD, stk=ex.C_ORD))
E.append(ex.text(X + 10, my + 6, "M1 CreateTaskModal  (conditionally mounted {modalOpen && …}) — RHF + useMutation", fs=12, color=ex.DARK))
E.append(ex.text(X + 14, my + 34,
                 "submit → POST /admin/tasks → onSuccess(task):\n"
                 "  qc.invalidateQueries(['admin','tasks','stats', task.dueDate])   ◀── KEY\n"
                 "  qc.invalidateQueries(['admin','tasks', task.staffId, task.dueDate]) ◀── KEY\n"
                 "  toast.success · onSuccess()=no-op · onClose() → unmount",
                 fs=10, color=ex.L_TEXT, ff=3))
# invalidate arrows back up to caches
E.append(ex.arrow(X + 300, my, X + 300, qy + 96, stk=ex.C_RED, sw=2, style="dashed"))
E.append(ex.arrow(X + 960, my, X + 960, qy + 96, stk=ex.C_RED, sw=2, style="dashed"))
E.append(ex.text(X + 980, my - 20, "invalidate → refetch (no prop passed up)", fs=9, color=ex.C_RED))

E.append(ex.text(X, my + 138,
                 "Rule: 6 widgets, 0 props between peers. Modal never knows about KPIs/table — it only knows cache keys; subscriptions do the rest.",
                 fs=10, color=ex.SUB))

ex.append(FP, E)
print(f"PANEL 2: appended; file now has elements")
