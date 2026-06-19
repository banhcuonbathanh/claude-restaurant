#!/usr/bin/env python3
"""PANEL 1 for admin_staff.excalidraw — Page Wireframe — sourced from admin_staff.md (ASCII + Zones table)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_staff/admin_staff.excalidraw"
ex.reset("p1")
E = []

def lrect(x, y, w, h, bg=ex.L_NEUTRAL, stk=ex.L_BORDER, sw=1):
    return ex.rect(x, y, w, h, bg=bg, stk=stk, sw=sw)
def lt(x, y, s, fs=11, color=ex.L_TEXT, ff=2):
    return ex.text(x, y, s, fs=fs, color=color, ff=ff)

X, Y = 40, 40
E += ex.panel_header(X, Y, "PANEL 1 · Page Wireframe", "/admin/staff · desktop table · manager+ · zones A–E + overlays M1/M2 (admin_staff.md)")

fx, fy, fw = 40, 100, 860
E.append(lrect(fx, fy, fw, 720, bg="#ffffff", stk="#334155", sw=2))

# A — header
ay = fy + 16
E.append(lrect(fx+16, ay, fw-32, 56, bg=ex.L_INDIGO))
E.append(lt(fx+30, ay+10, "A   Nhân viên (12)", fs=15))
E.append(lrect(fx+fw-200, ay+12, 170, 32, bg=ex.C_ORD, stk=ex.C_ORD))
E.append(lt(fx+fw-188, ay+19, "+ Thêm nhân viên", fs=12, color="#ffffff"))
E.append(lt(fx+30, ay+62, "StaffPageHeader · total count", fs=9, color=ex.SUB))

# B — stats bar
by = ay + 96
E.append(lt(fx+30, by-16, "StaffStatsBar · derived from full list (client)", fs=9, color=ex.SUB))
stats = [("Tổng", "12"), ("Admin", "1"), ("Cashier", "4"), ("Chef", "5"), ("Inactive", "2")]
sw = (fw-32-4*12) / 5
for i, (lab, val) in enumerate(stats):
    sx = fx+16 + i*(sw+12)
    E.append(lrect(sx, by, sw, 54, bg=ex.L_NEUTRAL))
    E.append(lt(sx+10, by+8, lab, fs=10, color=ex.SUB))
    E.append(lt(sx+10, by+24, val, fs=18))

# C — filter bar
cy = by + 92
E.append(lt(fx+30, cy-16, "StaffFilterBar · local state, client-side filter", fs=9, color=ex.SUB))
E.append(lrect(fx+16, cy, fw-32, 48, bg=ex.L_NEUTRAL))
E.append(lrect(fx+30, cy+10, 360, 28, bg="#ffffff"))
E.append(lt(fx+42, cy+16, "🔍  Tìm tên / username", fs=11, color=ex.SUB))
E.append(lrect(fx+406, cy+10, 150, 28, bg="#ffffff"))
E.append(lt(fx+416, cy+16, "Vai trò  ▾", fs=11, color=ex.SUB))
E.append(lrect(fx+570, cy+10, 150, 28, bg="#ffffff"))
E.append(lt(fx+580, cy+16, "Trạng thái  ▾", fs=11, color=ex.SUB))

# D — table
dy = cy + 84
E.append(lt(fx+30, dy-16, "StaffTable · GET /staff?limit=100  (listStaff, staleTime 0, refetchOnWindowFocus)", fs=9, color=ex.SUB))
E.append(lrect(fx+16, dy, fw-32, 200, bg="#ffffff"))
# header row
E.append(lrect(fx+16, dy, fw-32, 32, bg=ex.L_INDIGO))
cols = [("Họ tên", fx+30), ("Username", fx+230), ("Vai trò", fx+390), ("Trạng thái", fx+520), ("Hành động", fx+680)]
for lab, cx in cols:
    E.append(lt(cx, dy+8, lab, fs=11))
rows = [("Ng. Văn A", "chef01", "chef", "● active", "#16a34a"),
        ("Tr. Thị B", "cash02", "cashier", "○ inactive", "#dc2626")]
for j, (nm, un, rl, st, stc) in enumerate(rows):
    ry = dy + 40 + j*44
    E.append(lt(fx+30, ry, nm, fs=12)); E.append(lt(fx+230, ry, un, fs=12, ff=3))
    E.append(lt(fx+390, ry, rl, fs=12)); E.append(lt(fx+520, ry, st, fs=12, color=stc))
    E.append(lt(fx+680, ry, "👁  ✎  ⏻  🗑", fs=13))
E.append(lt(fx+30, dy+170, "Row actions: 👁 detail drawer · ✎ edit modal · ⏻ status toggle · 🗑 delete (admin-only, canDelete-gated)", fs=9, color=ex.SUB))

# E — pagination
ey = dy + 216
E.append(lrect(fx+16, ey, fw-32, 40, bg=ex.L_NEUTRAL))
E.append(lt(fx+fw/2-70, ey+12, "◀   1   [2]   3   ▶", fs=13))
E.append(lt(fx+30, ey+44, "Pagination (shared) · client-side, 10/page", fs=9, color=ex.SUB))

# overlays note
oy = fy + 690
E.append(lt(fx+30, oy, "Overlays (next/dynamic):  M1 AddEditStaffModal — name·username·password·role  ·  M2 StaffDetailDrawer — full profile + [Sửa]",
            fs=10, color=ex.C_VIOLET))

ex.save(FP, E)
print(f"PANEL 1: {len(E)} elements (save)")
