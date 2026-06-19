#!/usr/bin/env python3
"""PANEL 1 for admin_task_board.excalidraw — Page Wireframe.
Sourced from docs/system/08_pages/admin/admin_task_board/admin_task_board.md (ASCII wireframe + Zones table).
FIRST panel → ex.save (creates the doc)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_task_board/admin_task_board.excalidraw"
ex.reset("p1")
E = []

X, Y = 40, 40
E += ex.panel_header(X, Y, "PANEL 1 · Page Wireframe",
                     "/admin/staff/task-board · manager+ · per-staff task dashboard (desktop admin shell)")

# device frame
fx, fy, fw = X, Y + 60, 1180
E.append(ex.rect(fx, fy, fw, 840, bg=ex.L_NEUTRAL, stk=ex.L_BORDER, sw=2))

def zone(y, h, accent, tag, title, source):
    E.append(ex.rect(fx + 16, y, fw - 32, h, bg="#ffffff", stk=accent, sw=2))
    E.extend(ex.badge(fx + 28, y + 10, tag, accent))
    E.append(ex.text(fx + 70, y + 13, title, fs=13, color=ex.L_TEXT))
    if source:
        E.append(ex.text(fx + 70, y + 32, source, fs=10, color=ex.SUB))

# Zone B — header
zone(fy + 16, 56, ex.C_VIOLET, "B", "Nhân viên / Bảng công việc        [ + Giao việc ]",
     "BreadcrumbPageHeader — CTA → CreateTaskModal (defaultStaffId=undefined)")
# Zone C — filter bar
zone(fy + 84, 52, ex.C_CYAN, "C", "[ 📅 12/06/2026 ▾ ]   (date filter · role · status · search)",
     "StaffTaskFilterBar → writes filters back to page.tsx useState (local)")
# Zone D — KPI row
dy = fy + 148
E.append(ex.rect(fx + 16, dy, fw - 32, 96, bg="#ffffff", stk=ex.C_TAN, sw=2))
E += ex.badge(fx + 28, dy + 10, "D", ex.C_TAN)
E.append(ex.text(fx + 70, dy + 13, "KPI row — 4× KPICard", fs=13, color=ex.L_TEXT))
E.append(ex.text(fx + 70, dy + 32, "getTaskStats  key ['admin','tasks','stats', date]  ·  stale 30s · refetch 60s",
                 fs=10, color=ex.SUB))
kpis = [("Tổng việc", "18"), ("Chờ làm", "5"), ("Đang làm", "4"), ("Hoàn thành", "9")]
kw = (fw - 64) // 4
for i, (lbl, val) in enumerate(kpis):
    kx = fx + 28 + i * kw
    E.append(ex.rect(kx, dy + 52, kw - 14, 34, bg=ex.L_INDIGO, stk=ex.L_BORDER, sw=1))
    E.append(ex.text(kx + 8, dy + 56, lbl, fs=9, color=ex.SUB))
    E.append(ex.text(kx + 8, dy + 68, val, fs=13, color=ex.L_TEXT))

# Zone E — staff table
ey = fy + 256
E.append(ex.rect(fx + 16, ey, fw - 32, 300, bg="#ffffff", stk=ex.C_ORD, sw=2))
E += ex.badge(fx + 28, ey + 10, "E", ex.C_ORD)
E.append(ex.text(fx + 70, ey + 13, "StaffTaskTable — staff rows (client-filtered from statsData.staffStats)", fs=13, color=ex.L_TEXT))
E.append(ex.text(fx + 70, ey + 32, "expand row → lazy getStaffTasks  key ['admin','tasks', staffId, date] (stale 15s)", fs=10, color=ex.SUB))
rows = [
    ("▸ chef01      Đầu bếp    5 việc    2 hoàn thành    0%   ★0.0", ex.L_NEUTRAL),
    ("▾ cashier02   Thu ngân   4 việc    3 hoàn thành    0%   ★0.0", "#fff7ed"),
    ("     · Kiểm kê nguyên liệu     [đang chờ]     21:00", "#ffffff"),
    ("     · Lau quầy thu ngân       [đang chờ]     18:00      ← ExpandedTaskList (props only)", "#ffffff"),
    ("▸ manager     Quản lý    2 việc    1 hoàn thành    0%   ★0.0", ex.L_NEUTRAL),
]
ry = ey + 58
for txt, bg in rows:
    E.append(ex.rect(fx + 28, ry, fw - 56, 30, bg=bg, stk=ex.L_BORDER, sw=1))
    E.append(ex.text(fx + 40, ry + 8, txt, fs=10, color=ex.L_TEXT, ff=3))
    ry += 34

# Zone G — empty state
gy = fy + 572
E.append(ex.rect(fx + 16, gy, fw - 32, 56, bg="#ffffff", stk=ex.C_SLATE, sw=2, style="dashed"))
E += ex.badge(fx + 28, gy + 10, "G", ex.C_SLATE)
E.append(ex.text(fx + 70, gy + 16, "EmptyState  📋  \"Không tìm thấy kết quả — thử đổi bộ lọc hoặc thêm công việc mới\"  (when filteredStaff.length === 0)",
                 fs=11, color=ex.SUB))

# note
E.append(ex.text(fx + 16, gy + 70,
                 "page.tsx = single coordinator (useState) · NO Zustand · TanStack cache = freshness bus.  Every read hits MySQL (no Redis).",
                 fs=10, color=ex.SUB))

ex.save(FP, E)
print(f"PANEL 1: {len(E)} elements (save)")
