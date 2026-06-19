#!/usr/bin/env python3
"""PANEL 5 for admin_staff.excalidraw — Cross-Page Dataflow — sourced from admin_staff_crosspage_dataflow.md."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_staff/admin_staff.excalidraw"
ex.reset("p5")
E = []

def lrect(x, y, w, h, bg=ex.L_NEUTRAL, stk=ex.L_BORDER, sw=1):
    return ex.rect(x, y, w, h, bg=bg, stk=stk, sw=sw)
def lt(x, y, s, fs=11, color=ex.L_TEXT, ff=2):
    return ex.text(x, y, s, fs=fs, color=color, ff=ff)

X, Y = 40, 880
E += ex.panel_header(X, Y, "PANEL 5 · Cross-Page Dataflow", "two server hubs · NO SSE/WS — pull-only (REST + TanStack refetch)")

# browser side
bx, by = X, 950
E.append(lrect(bx, by, 320, 150, bg=ex.L_ORANGE, stk=ex.C_ZUS, sw=2))
E.append(lt(bx+12, by+8, "BROWSER (manager tab)", fs=12, color="#b45309"))
E.append(lt(bx+12, by+30,
    "TanStack ['admin','staff'] list\n['admin','staff',id] detail\nauth store: current user (memory)\n\nNOT in localStorage · NOT Zustand\nF5 = full re-fetch", fs=10, ff=3))

# server hubs
sx = bx + 480
E.append(lrect(sx, by, 360, 70, bg=ex.L_NEUTRAL, stk=ex.C_ORD, sw=2))
E.append(lt(sx+12, by+8, "staff MySQL row  ◀ single source", fs=12, color=ex.C_ORD))
E.append(lt(sx+12, by+30, "soft-delete: deleted_at IS NULL filters all reads", fs=10, ff=3, color=ex.SUB))
E.append(lrect(sx, by+90, 360, 70, bg=ex.L_NEUTRAL, stk="#16a34a", sw=2))
E.append(lt(sx+12, by+98, "auth:staff:<id>  Redis cache", fs=12, color="#16a34a"))
E.append(lt(sx+12, by+120, "'active'/'disabled' 5-min · Del'd on status/delete", fs=10, ff=3, color=ex.SUB))
E.append(ex.arrow(bx+320, by+40, sx, by+35, stk=ex.C_ORD, sw=2))
E.append(lt(bx+330, by+8, "POST/PATCH/DELETE\n→ {data}/{message}\n← refetch on focus", fs=9, ff=3, color=ex.SUB))

# two rippling fields
fy = by + 180
E.append(lrect(X, fy, 820, 56, bg=ex.L_INDIGO, stk=ex.C_CYAN))
E.append(lt(X+12, fy+8, "Two fields that ripple outward", fs=12, color="#0e7490"))
E.append(lt(X+12, fy+30, "is_active → auth gate (the only near-live downstream)   ·   deleted_at → vanishes from EVERY list at once (no FK cascade)", fs=10, ff=3))

# 4 downstream surfaces
dy = fy + 80
E.append(lt(X, dy-18, "4 downstream surfaces (all pull-only except the target's own lockout):", fs=10, color=ex.SUB))
surf = [
    ("Auth middleware", "every authed request → IsStaffActive\nDel forces MySQL re-read → 401 (no TTL lag)", "#16a34a"),
    ("Login / refresh", "GetStaffByUsername + is_active\ndisabled → ErrAccountDisabled", ex.C_ORD),
    ("Assignee dropdowns", "todo-list + task-board GET /staff\ndeactivated still listed (Flag1)", ex.C_VIOLET),
    ("A2 staff-performance", "GET /admin/staff-performance aggregates\nby created_by (different endpoint)", "#0e7490"),
]
for i, (nm, body, c) in enumerate(surf):
    cx = X + (i % 2) * 420
    cy = dy + (i // 2) * 92
    E.append(lrect(cx, cy, 390, 78, bg="#ffffff", stk=c))
    E.append(lt(cx+12, cy+8, nm, fs=12, color=c))
    E.append(lt(cx+12, cy+30, body, fs=10, ff=3, color=ex.SUB))

# durability
duy = dy + 200
E.append(lrect(X, duy, 820, 96, bg=ex.L_NEUTRAL, stk=ex.L_BORDER))
E.append(lt(X+12, duy+8, "Durability matrix", fs=12))
E.append(lt(X+12, duy+30,
    "staff list (['admin','staff'])  F5 ❌ refetched   logout ❌   home: TanStack cache (memory)\n"
    "staff row                       F5 ✅              logout ✅   home: MySQL (single source)\n"
    "auth:staff:<id>                 F5 ✅ until TTL/Del logout ✅   home: Redis (derived)\n"
    "current user identity           F5 ❌ (memory)     logout ❌   home: auth store",
    fs=10, ff=3, color=ex.L_TEXT))

ex.append(FP, E)
print(f"PANEL 5: appended {len(E)} elements")
