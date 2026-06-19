#!/usr/bin/env python3
"""PANEL 11 for admin_staff.excalidraw — DB Row-Level View (dark) — from admin_staff_be.md + DB_SCHEMA staff. Absorbs skipped Panel 4 field mapping."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_staff/admin_staff.excalidraw"
ex.reset("p11")
E = []

X, Y = 40, 4100
E += ex.panel_header(X, Y, "PANEL 11 · DB Row-Level View", "the `staff` row this page writes/reads — every column + FE field mapping (absorbs Object Model)")

cols = ["column", "type", "FE field (StaffJSON)", "rule / note"]
xs = [X, X+220, X+360, X+640]
cwid = [200, 130, 270, 540]
hy = Y + 50
for i, c in enumerate(cols):
    E.append(ex.rect(xs[i], hy, cwid[i], 30, bg=ex.C_ORD, stk=ex.C_ORD))
    E.append(ex.text(xs[i]+10, hy+8, c, fs=12, color=ex.DARK))

rows = [
    ("id", "PK", "id", "stable identifier"),
    ("username", "varchar", "username", "UNIQUE (GetStaffByUsername) → 409 USERNAME_TAKEN"),
    ("password_hash", "varchar", "— (never sent)", "bcrypt on POST; write-only, absent from all reads"),
    ("full_name", "varchar", "full_name", "min2/max100"),
    ("role", "enum", "role", "chef/cashier/staff/manager/admin · lvl gate target<caller"),
    ("job_title", "varchar", "job_title", "optional"),
    ("shifts", "json/NULL", "shifts[]", "marshalShifts; '' → SQL NULL on update"),
    ("responsibilities", "text", "responsibilities", "optional"),
    ("phone / email", "varchar", "phone / email", "optional; email '' common"),
    ("is_active", "tinyint", "is_active", "auth gate · Del auth:staff:<id> on flip"),
    ("created_at", "datetime", "created_at", "NOW() on INSERT · ORDER BY created_at DESC"),
    ("updated_at", "datetime", "updated_at (detail)", "only in StaffDetailJSON"),
    ("deleted_at", "datetime/NULL", "— (filtered)", "SOFT DELETE — every query WHERE deleted_at IS NULL"),
]
ry = hy + 30
rh = 30
for j, row in enumerate(rows):
    yy = ry + j*rh
    bg = ex.CARD_BG if j % 2 == 0 else "#172033"
    accent = ex.C_RED if "deleted_at" in row[0] or "password" in row[0] else ex.LIGHT
    for i, cell in enumerate(row):
        E.append(ex.rect(xs[i], yy, cwid[i], rh, bg=bg, stk=ex.CARD_STK))
        col = ex.C_TAN if i == 2 else (accent if i in (0, 3) else ex.MUTED)
        E.append(ex.text(xs[i]+10, yy+8, cell, fs=10, color=col, ff=3))

ny = ry + len(rows)*rh + 12
E.append(ex.rect(X, ny, 1180, 36, bg=ex.CARD_BG, stk=ex.C_VIOLET, sw=2))
E.append(ex.text(X+12, ny+10, "No performance_score column exists — toStaffJSON returns a hardcoded 0 (be Flag 8). Soft-delete does NOT cascade to refresh_tokens (be Flag 6).", fs=10, color=ex.LIGHT))

ex.append(FP, E)
print(f"PANEL 11: appended {len(E)} elements")
