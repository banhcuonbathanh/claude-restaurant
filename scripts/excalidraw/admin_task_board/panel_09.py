#!/usr/bin/env python3
"""PANEL 9 (dark) for admin_task_board.excalidraw — Live State Objects.
Sourced from _crosscomponent_dataflow.md §2 (coordinator + cache shapes) + _be.md (TaskDTO) +
SCENARIO concrete values. One example (chef01, 2026-06-14) threaded through all 3 layers.
NOTE: client layer = page.tsx useState (this page has NO Zustand)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_task_board/admin_task_board.excalidraw"
ex.reset("p9")
E = []

X, Y = 40, 3000
E += ex.panel_header(X, Y, "PANEL 9 · Live State Objects",
                     "real shapes, one example threaded (chef01 · 2026-06-14) · client layer = useState, NOT Zustand")

cy = Y + 56
els, h1 = ex.card(X, cy, 400, ex.C_ZUS, "page.tsx useState (coordinator)",
    "filters: {\n  date:  \"2026-06-14\",\n  role:  \"all\",\n  status:\"all\",\n  search:\"\"\n}\nexpandedStaffId: \"chef01\"\nmodalOpen: true\ndefaultStaffId: \"chef01\"")
E += els
els, h2 = ex.card(X + 430, cy, 470, ex.C_TAN, "TanStack ['admin','tasks','stats','2026-06-14']",
    "StaffTaskStatsResponse {\n  metrics: { totalTasks:2,\n    completedTasks:0,   // Bug1\n    inProgressTasks:0,  // Bug1\n    overdueTasks:0 },   // Bug1\n  staffStats: [ {staffId:\"chef01\",\n    assignedCount:2, completedCount:0,\n    completionRate:0, qualityScore:0.0,\n    hasOverdue:false } ] }")
E += els
els, h3 = ex.card(X + 930, cy, 460, ex.C_ORD, "BE TaskDTO (one expanded task)",
    "{ id:\"t1\", staffId:\"chef01\",\n  name:\"Chuẩn bị nguyên liệu\",\n  priority:\"high\",\n  status:\"pending\",   // hardcoded\n  dueDate:\"2026-06-14\",\n  dueTimeStart:\"07:00\",\n  dueTimeEnd:\"08:00\",\n  notes:\"...\", description:null }")
E += els

E.append(ex.text(X, cy + max(h1, h2, h3) + 12,
                 "Same row, three views: useState gates the lazy query (expandedStaffId) · cache holds the aggregate + DTO list · BE re-reads the row post-INSERT.",
                 fs=10, color=ex.SUB))

ex.append(FP, E)
print("PANEL 9: appended")
