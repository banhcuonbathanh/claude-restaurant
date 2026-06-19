#!/usr/bin/env python3
"""PANEL 8 for admin_staff.excalidraw — Flags / Known Mismatches — from admin_staff_be.md Flags 1-8 + admin_staff_loading.md Flags 1-4."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_staff/admin_staff.excalidraw"
ex.reset("p8")
E = []

def lrect(x, y, w, h, bg=ex.L_NEUTRAL, stk=ex.L_BORDER, sw=1):
    return ex.rect(x, y, w, h, bg=bg, stk=stk, sw=sw)
def lt(x, y, s, fs=11, color=ex.L_TEXT, ff=2, w=None, wrap=False):
    return ex.text(x, y, s, fs=fs, color=color, ff=ff, w=w, wrap=wrap)

X, Y = 40, 1640
E += ex.panel_header(X, Y, "PANEL 8 · Flags / Known Mismatches", "no _BUGS.md — FE/BE agree on every route; only dead code + stubs (be Flags 1-8 · loading Flags 1-4)")

flags = [
    ("BE1 Dead self-service guard", "cosmetic", "GetStaff/UpdateStaff allow id==callerID for non-mgr, but group is mgr+ → branch never fires"),
    ("BE2 List filter params unused", "low", "BE honours role/search/is_active; page sends only ?limit=100, filters client-side"),
    ("BE3 100-row client cap", "low", "listStaff hard-codes ?limit=100 + client paginate; roster >100 silently truncated"),
    ("BE4 No admin minted here", "by-design", "create needs target<caller, update needs new<caller → admin reaches manager at most; form omits 'admin'"),
    ("BE5 Self-status fully blocked", "cosmetic", "SetStaffStatus rejects ANY self-toggle, not just deactivation; FE disables button anyway"),
    ("BE6 Soft-delete keeps tokens", "low", "'revoke sessions' comment unimplemented — only auth:staff Del'd; refresh_tokens rows not purged"),
    ("BE7 Bad FK/DB → 500", "low", "invalid role caught (INVALID_ROLE) but other DB errors → untyped → COMMON_002 500 generic toast"),
    ("BE8 performance_score = 0 stub", "low", "toStaffJSON hardcodes 0 — no such column; table shows 0% bar; real KPIs on /admin/summary"),
    ("LOAD1 Drawer no error branch", "low", "failed GET /staff/:id (404 after remote delete) leaves drawer stuck on 'Đang tải...'"),
    ("LOAD2 loading≠empty≠no-match", "low", "isLoading text vs EmptyState — 'no staff' and 'filter too narrow' look identical"),
    ("LOAD3 StatsBar flashes in", "cosmetic", "Zone B gated on !isLoading while table loads → bar absent then pops in (layout shift)"),
    ("LOAD4 Refetch-on-focus silent", "cosmetic", "refetchOnWindowFocus + staleTime0 refetch with no indicator; stale rows until settle"),
]
sevc = {"cosmetic": ex.SUB, "low": "#b45309", "by-design": "#0e7490"}
cols, cw, ch = 2, 770, 70
for i, (t, sev, body) in enumerate(flags):
    cx = X + (i % cols) * (cw + 30)
    cy = 1710 + (i // cols) * (ch + 12)
    c = sevc.get(sev, ex.SUB)
    E.append(lrect(cx, cy, cw, ch, bg="#ffffff", stk=c))
    E.append(lt(cx+12, cy+8, t, fs=12, color=c))
    E.append(lt(cx+cw-100, cy+8, sev, fs=10, color=c))
    E.append(lt(cx+12, cy+30, body, fs=10, ff=3, color=ex.SUB, w=cw-24, wrap=True))

ex.append(FP, E)
print(f"PANEL 8: appended {len(E)} elements")
