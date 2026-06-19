#!/usr/bin/env python3
"""PANEL 12 for admin_staff.excalidraw — Write Fan-out (dark) — RE-THEMED 'realtime' panel: staff has NO SSE/WS.
Sourced from admin_staff_crosspage_dataflow.md + auth.go:55 / auth_service.go:315-383."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_staff/admin_staff.excalidraw"
ex.reset("p12")
E = []

X, Y = 1300, 4100
E += ex.panel_header(X, Y, "PANEL 12 · Write Fan-out (pull-only · NO SSE)", "one write → MySQL row + Del(auth:staff:<id>) → who notices, and how")

# source write
sx, sy = X, Y + 60
E.append(ex.rect(sx, sy, 300, 64, bg=ex.C_ORD, stk=ex.C_ORD))
E.append(ex.text(sx+12, sy+8, "PATCH /staff/:id/status", fs=12, color=ex.DARK))
E.append(ex.text(sx+12, sy+30, "UPDATE is_active=0\n+ Del auth:staff:<id>", fs=10, color=ex.DARK, ff=3))

targets = [
    ("Auth middleware", "next req → IsStaffActive MISS\n→ DB read=0 → 401  (LIVE for target)", ex.C_RED, True),
    ("Login / refresh", "is_active=0 → ErrAccountDisabled", ex.C_AMBER, False),
    ("Assignee dropdowns", "GET /staff — deactivated STILL listed\n(filters deleted_at only, not is_active)", ex.C_VIOLET, False),
    ("A2 staff-performance", "aggregates by created_by — unaffected\nby status, reads same rows", ex.C_TAN, False),
    ("Other manager's tab", "NO push — reconciles only on\nwindow-focus refetch (staleTime 0)", ex.MUTED, False),
]
tx = sx + 460
for i, (nm, body, c, live) in enumerate(targets):
    yy = sy + i*78
    E.append(ex.rect(tx, yy, 460, 66, bg=ex.CARD_BG, stk=c, sw=2))
    E.append(ex.text(tx+12, yy+8, nm + ("   ⚡ near-live" if live else "   ⟳ pull"), fs=12, color=c))
    E.append(ex.text(tx+12, yy+30, body, fs=10, color=ex.MUTED, ff=3))
    E.append(ex.arrow(sx+300, sy+32, tx, yy+33, stk=c, sw=1))

ny = sy + 5*78 + 8
E.append(ex.rect(X, ny, 920, 40, bg=ex.CARD_BG, stk=ex.C_CYAN, sw=2))
E.append(ex.text(X+12, ny+11, "Contrast: the TARGET is cut off on their next click (auth cache Del'd, no TTL lag); admin VIEWS are pull-only — no SSE/WS exists for staff.", fs=10, color=ex.LIGHT))

ex.append(FP, E)
print(f"PANEL 12: appended {len(E)} elements")
