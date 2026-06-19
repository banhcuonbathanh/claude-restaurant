#!/usr/bin/env python3
"""PANEL 13 for admin_staff.excalidraw — Failure / Edge Map (dark) — from admin_staff_be.md Error table + guards + loading flags."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_staff/admin_staff.excalidraw"
ex.reset("p13")
E = []

X, Y = 40, 5700
E += ex.panel_header(X, Y, "PANEL 13 · Failure / Edge Map", "every unhappy path: 4xx guards + Redis fail-open + soft-delete + drawer dead-end")

cols = ["Code", "HTTP", "Raised by", "FE handling on this page"]
xs = [X, X+260, X+360, X+760]
cwid = [240, 80, 380, 440]
hy = Y + 50
for i, c in enumerate(cols):
    E.append(ex.rect(xs[i], hy, cwid[i], 30, bg=ex.C_RED, stk=ex.C_RED))
    E.append(ex.text(xs[i]+10, hy+8, c, fs=12, color=ex.DARK))

rows = [
    ("INVALID_INPUT / INVALID_ROLE", "400", "bind failure / bad role value", "generic 'Có lỗi xảy ra'"),
    ("USERNAME_TAKEN", "409", "duplicate username on create", "'Tên đăng nhập đã tồn tại'"),
    ("INSUFFICIENT_ROLE", "403", "hierarchy guard create/update/status/self-delete", "status/delete → 'Không đủ quyền'"),
    ("SELF_DEACTIVATION_FORBIDDEN", "403", "toggling own status (any direction)", "'Không thể vô hiệu hóa chính mình' (rare — btn disabled)"),
    ("LAST_ADMIN", "409", "delete last active admin (CountAdmins≤1)", "'Không thể xóa admin cuối cùng'"),
    ("STAFF_NOT_FOUND", "404", "missing/soft-deleted id", "generic toast (not mapped)"),
    ("COMMON_002", "500", "untyped err — bad FK / bcrypt / DB", "generic toast (Flag 7)"),
]
ry = hy + 30
rh = 34
for j, row in enumerate(rows):
    yy = ry + j*rh
    bg = ex.CARD_BG if j % 2 == 0 else "#172033"
    for i, cell in enumerate(row):
        E.append(ex.rect(xs[i], yy, cwid[i], rh, bg=bg, stk=ex.CARD_STK))
        col = ex.C_RED if i == 0 else (ex.C_AMBER if i == 1 else ex.MUTED)
        E.append(ex.text(xs[i]+10, yy+9, cell, fs=10, color=col, ff=3))

# edge cards
ey = ry + len(rows)*rh + 16
edges = [
    ("Redis down — fail-open", "IsStaffActive returns true → a just-disabled staff acts until token expiry (availability > strictness, REDIS_CACHE.md:77)"),
    ("Soft-delete ≠ revoke", "deleted_at set but refresh_tokens NOT purged; cache Del makes middleware treat as inactive fast (be Flag 6)"),
    ("Drawer dead-end", "failed GET /staff/:id (404 after remote delete) → stuck on 'Đang tải...', no error branch (load Flag 1)"),
    ("Create tx", "no explicit rollback shown; INSERT failure surfaces as COMMON_002 500"),
]
for i, (t, b) in enumerate(edges):
    cx = X + (i % 2) * 610
    cy = ey + (i // 2) * 86
    E.append(ex.rect(cx, cy, 580, 74, bg=ex.CARD_BG, stk=ex.C_RED, sw=2))
    E.append(ex.text(cx+12, cy+8, t, fs=12, color=ex.C_RED))
    E.append(ex.text(cx+12, cy+30, b, fs=10, color=ex.MUTED, ff=2, w=556, wrap=True))

ex.append(FP, E)
print(f"PANEL 13: appended {len(E)} elements")
