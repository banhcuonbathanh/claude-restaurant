#!/usr/bin/env python3
"""PANEL 3 for admin_staff.excalidraw — BE View — sourced from admin_staff_be.md (endpoint table + auth + caching)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_staff/admin_staff.excalidraw"
ex.reset("p3")
E = []

def lrect(x, y, w, h, bg=ex.L_NEUTRAL, stk=ex.L_BORDER, sw=1):
    return ex.rect(x, y, w, h, bg=bg, stk=stk, sw=sw)
def lt(x, y, s, fs=11, color=ex.L_TEXT, ff=2):
    return ex.text(x, y, s, fs=fs, color=color, ff=ff)

X, Y = 2300, 40
E += ex.panel_header(X, Y, "PANEL 3 · BE View", "6 endpoints · authMW + AtLeast(manager) · raw-SQL repo (not sqlc) · main.go:280-291")

tx, ty, tw = X, 110, 1240
hdr = [("#", tx+8, 28), ("Endpoint", tx+44, 230), ("Auth", tx+280, 90),
       ("handler→service→repo→SQL", tx+378, 560), ("Redis", tx+948, 290)]
E.append(lrect(tx, ty, tw, 34, bg=ex.L_INDIGO))
for lab, cx, _ in hdr:
    E.append(lt(cx, ty+9, lab, fs=11))
rows = [
    ("1", "GET /staff", "mgr+", "ListStaff → svc:61 → staffRepo.ListStaff:70 (COUNT+paged SELECT)", "none — hits MySQL"),
    ("2", "GET /staff/:id", "mgr+", "GetStaff → svc:78 → GetStaffByID:132", "none"),
    ("3", "POST /staff", "mgr+", "CreateStaff → svc:103 → GetByUsername + INSERT:146,160", "none"),
    ("4", "PATCH /staff/:id", "mgr+", "UpdateStaff → svc:160 → GetByID + dyn UPDATE:172", "none"),
    ("5", "PATCH /staff/:id/status", "mgr+", "SetStaffStatus → svc:203 → SetActiveByID:227", "Del auth:staff:<id>"),
    ("6", "DELETE /staff/:id", "ADMIN", "DeleteStaff → svc:236 → CountAdmins + SoftDelete:240,253", "Del auth:staff:<id>"),
]
for j, (n, ep, au, chain, rd) in enumerate(rows):
    ry = ty + 34 + j*42
    bg = "#ffffff" if j % 2 == 0 else ex.L_NEUTRAL
    E.append(lrect(tx, ry, tw, 42, bg=bg))
    E.append(lt(tx+8, ry+13, n, fs=11))
    E.append(lt(tx+44, ry+13, ep, fs=11, ff=3))
    auc = ex.C_RED if au == "ADMIN" else ex.SUB
    E.append(lt(tx+280, ry+13, au, fs=11, color=auc))
    E.append(lt(tx+378, ry+13, chain, fs=10, ff=3, color=ex.SUB))
    rdc = "#b45309" if rd.startswith("Del") else ex.SUB
    E.append(lt(tx+948, ry+13, rd, fs=10, ff=3, color=rdc))

# notes band
ny = ty + 34 + 6*42 + 16
E.append(lrect(tx, ny, tw, 86, bg=ex.L_ORANGE, stk=ex.C_ORD))
E.append(lt(tx+12, ny+8, "Service guards (staff_service.go)", fs=12, color=ex.C_ORD))
E.append(lt(tx+12, ny+30,
    "hierarchy: targetLevel < callerLevel (lvls customer1·chef/cashier2·staff3·manager4·admin5)  ·  username-unique (409)\n"
    "self-deactivation block (svc:204)  ·  last-admin guard CountAdmins≤1 (409)   |   No read-cache anywhere; only Redis touch is a WRITE Del.",
    fs=10, ff=3))

ex.append(FP, E)
print(f"PANEL 3: appended {len(E)} elements")
