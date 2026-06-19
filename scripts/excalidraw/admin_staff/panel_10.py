#!/usr/bin/env python3
"""PANEL 10 for admin_staff.excalidraw — Object Lifecycle (moving, dark) — from SCENARIO + loading + be (create→deactivate beats)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_staff/admin_staff.excalidraw"
ex.reset("p10")
E = []

X, Y = 1620, 2700
E += ex.panel_header(X, Y, "PANEL 10 · Object Lifecycle (moving)", "same objects from P9, per-beat: Action · cache-after · components · TanStack/BE reaction")

cols = ["Action", "TanStack cache after", "Components reacting", "BE / Redis reaction"]
cx0 = X
cwid = [240, 320, 300, 360]
hy = Y + 50
xs = [cx0]
for w in cwid[:-1]:
    xs.append(xs[-1] + w + 10)
for i, c in enumerate(cols):
    E.append(ex.rect(xs[i], hy, cwid[i], 30, bg=ex.C_CYAN, stk=ex.C_CYAN))
    E.append(ex.text(xs[i]+10, hy+8, c, fs=12, color=ex.DARK))

beats = [
    ("Submit POST Quân", "list NOT yet changed\n(awaiting invalidate)", "M1 'Đang lưu...'\nsubmit disabled", "INSERT is_active=1\n201 {data:StaffJSON}"),
    ("201 settles", "invalidate ['admin','staff']\n→ bg refetch → +Quân row", "modal closes, toast\ntable re-renders +1", "—"),
    ("Toggle Tú pill", "list row optimistic? no —\nwaits for refetch", "StaffTable pill\n(green→pending)", "UPDATE is_active=0\n+ Del auth:staff:<tú>"),
    ("200 settles", "invalidate → refetch\n→ Tú shows 'Vô hiệu'", "pill turns red\ntoast 'Đã cập nhật'", "next Tú req → MISS\n→ DB read=0 → 401"),
    ("Open Quân drawer", "['admin','staff','s-quan']\nfetch (30s)", "M2 'Đang tải...'\n→ avatar + 4 tabs", "GET /staff/:id\nStaffDetailJSON"),
]
ry = hy + 30
rh = 64
for j, row in enumerate(beats):
    yy = ry + j*rh
    bg = ex.CARD_BG if j % 2 == 0 else "#172033"
    for i, cell in enumerate(row):
        E.append(ex.rect(xs[i], yy, cwid[i], rh, bg=bg, stk=ex.CARD_STK))
        col = ex.C_ZUS if i == 0 else (ex.C_TAN if i == 1 else (ex.MUTED if i == 2 else ex.C_ORD))
        E.append(ex.text(xs[i]+10, yy+8, cell, fs=10, color=col, ff=3))

ex.append(FP, E)
print(f"PANEL 10: appended {len(E)} elements")
