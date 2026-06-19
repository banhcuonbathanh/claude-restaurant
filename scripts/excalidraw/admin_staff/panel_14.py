#!/usr/bin/env python3
"""PANEL 14 for admin_staff.excalidraw — One Field, All Layers (dark) — trace `is_active` tap → SQL → middleware → render.
Sourced from admin_staff_be.md §5 + admin_staff_crosspage_dataflow.md §3."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_staff/admin_staff.excalidraw"
ex.reset("p14")
E = []

X, Y = 1480, 5700
E += ex.panel_header(X, Y, "PANEL 14 · One Field, All Layers — `is_active`", "tap green pill → … → target locked out on next click")

steps = [
    ("1 · FE tap", ex.C_ZUS, "StaffTable ⏻ on Tú's 'Đang HĐ' pill\n→ setStaffStatus(id,{is_active:false})\n   (self-toggle button disabled for own row)"),
    ("2 · Payload", ex.C_CYAN, "PATCH /staff/:id/status\nbody: { is_active: false }"),
    ("3 · Service guard", ex.C_ORD, "callerID==targetID? → 403 SELF_DEACTIVATION\ntargetLevel>=callerLevel? → 403 INSUFFICIENT_ROLE"),
    ("4 · SQL write", ex.C_BE, "SetStaffActiveByID → UPDATE staff\nSET is_active=0 WHERE id=? AND deleted_at IS NULL"),
    ("5 · Cache Del", ex.C_RED, "rdb.Del(auth:staff:<id>)  (staffActiveKey)\n→ next read MUST hit MySQL"),
    ("6 · Read-back", ex.C_TAN, "thin resp {data:{id,is_active,updated_at}}\nlist invalidate → refetch → row='Vô hiệu'"),
    ("7 · Enforcement", ex.C_VIOLET, "Tú's next API call → auth.go:55 IsStaffActive\n→ MISS → DB=0 → 401  (locked out in seconds)"),
]
y0 = Y + 56
sh = 70
for i, (t, c, body) in enumerate(steps):
    yy = y0 + i*sh
    E.append(ex.rect(X, yy, 1000, sh-8, bg=ex.CARD_BG, stk=c, sw=2))
    E.append(ex.rect(X, yy, 150, sh-8, bg=c, stk=c))
    E.append(ex.text(X+10, yy+20, t, fs=12, color=ex.DARK))
    E.append(ex.text(X+164, yy+10, body, fs=10, color=ex.LIGHT, ff=3))
    if i < len(steps)-1:
        E.append(ex.arrow(X+500, yy+sh-8, X+500, yy+sh, stk=ex.MUTED, sw=2))

ex.append(FP, E)
print(f"PANEL 14: appended {len(E)} elements")
