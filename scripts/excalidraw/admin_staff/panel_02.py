#!/usr/bin/env python3
"""PANEL 2 for admin_staff.excalidraw — Cross-Component Dataflow.
NOTE: this page has NO dedicated _crosscomponent_dataflow.md (no shared Zustand store).
Traced from admin_staff.md Zones + SCENARIO_STAFF_MANAGE.md §Under-the-hood-A + page.tsx refs."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_staff/admin_staff.excalidraw"
ex.reset("p2")
E = []

def lrect(x, y, w, h, bg=ex.L_NEUTRAL, stk=ex.L_BORDER, sw=1):
    return ex.rect(x, y, w, h, bg=bg, stk=stk, sw=sw)
def lt(x, y, s, fs=11, color=ex.L_TEXT, ff=2):
    return ex.text(x, y, s, fs=fs, color=color, ff=ff)

X, Y = 1000, 40
E += ex.panel_header(X, Y, "PANEL 2 · Cross-Component Dataflow", "page.tsx IS the hub — no Zustand, no _crosscomponent doc (SCENARIO §A)")

# HUB — page.tsx
hx, hy, hw = X, 110, 380
E.append(lrect(hx, hy, hw, 210, bg=ex.L_ORANGE, stk=ex.C_ORD, sw=2))
E.append(lt(hx+14, hy+10, "StaffPage  (page.tsx)  — the hub", fs=13, color=ex.C_ORD))
E.append(lt(hx+14, hy+38,
    "useQuery ['admin','staff']  (staleTime 0,\n  refetchOnWindowFocus) → roster\n\n"
    "useState:  search · role · status · page\n           modalOpen · detailId\n\n"
    "filtered = client memo (search/role/status)\n→ slice 10/page  (page.tsx:51-64)",
    fs=10, ff=3))

# children (prop-drilled)
kids = [
    ("StaffStatsBar", "counts derived\nfrom full list"),
    ("StaffFilterBar", "search/role/status\n→ setState (no fetch)"),
    ("StaffTable", "current 10-row slice\n+ row action callbacks"),
    ("M1 AddEditStaffModal", "createMut / editMut"),
    ("M2 StaffDetailDrawer", "own query\n['admin','staff',id]"),
]
ky = 110
kx = hx + hw + 90
for i, (nm, body) in enumerate(kids):
    yy = ky + i*86
    E.append(lrect(kx, yy, 320, 72, bg=ex.L_NEUTRAL))
    E.append(lt(kx+12, yy+8, nm, fs=12, color=ex.C_VIOLET))
    E.append(lt(kx+12, yy+28, body, fs=9, ff=3, color=ex.SUB))
    E.append(ex.arrow(hx+hw, hy+40+i*30, kx, yy+30, stk=ex.C_ORD, sw=1))

# rule note
E.append(lrect(hx, hy+230, hw, 90, bg=ex.L_INDIGO, stk=ex.C_CYAN))
E.append(lt(hx+14, hy+238, "Rules", fs=12, color="#0e7490"))
E.append(lt(hx+14, hy+260,
    "• All data flows hub → child (prop-drill).\n"
    "• NO zone→zone arrows — children never\n  talk to each other.\n"
    "• Mutations → invalidate ['admin','staff'].",
    fs=10, ff=3, color=ex.L_TEXT))

ex.append(FP, E)
print(f"PANEL 2: appended {len(E)} elements")
