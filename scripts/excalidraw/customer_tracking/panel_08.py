#!/usr/bin/env python3
"""PANEL 8 — Flags / Known Mismatches. From customer_tracking_be.md Flags 1-6 + TRACKING_BUGS.md."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_tracking/customer_tracking.excalidraw"
ex.reset("p8")
E = []
X, Y = 1820, 920
E += ex.panel_header(X, Y, "PANEL 8 · Flags / Known Mismatches (live code bugs)",
                     "from _be.md Flags 1–6 + TRACKING_BUGS.md · not stale docs — code mismatches · none fixed")
L = "#1e293b"

bugs = [
    ("🔴 Bug 1 · HIGH — status badge dead", ex.C_RED,
     "BE publishes type:'order_status_changed' on order:<id>; hook switches on case 'order.status' — never matches.",
     "orderStatus stays null → effectiveStatus falls back to last GET snapshot. Badge advances ONLY on items_* refetch. Fix: 1-line FE case."),
    ("🟠 Bug 2 · MED — item_progress not consumed", ex.C_AMBER,
     "publishItemEvent emits type:'item_progress' per qty-served; hook has no item_progress case.",
     "Per-dish 'ra 1/2' progress not live; only refreshes on whole-item refetch."),
    ("🟡 Bug 3 · LOW — position/ETA FE-computed", ex.C_AMBER,
     "buildMonitorPayloads sends position:0, estimatedMinutes:0 on the wire.",
     "FE recomputes position=idx+1, eta=idx*3. Misleading contract; works today."),
    ("🟡 Bug 4 · LOW — dead outputs", ex.C_SLATE,
     "tableStatuses (returned, never destructured) · reconnect() (no retry button) · RECONNECT.showBannerAfter=3 (unused).",
     "Floor table-grid the BE pushes is invisible; banner shows immediately, not after 3 attempts."),
]
yy = Y + 60
for title, c, root, eff in bugs:
    E.append(ex.rect(X, yy, 1080, 84, bg=ex.L_NEUTRAL, stk=c, sw=2))
    E.append(ex.rect(X, yy, 1080, 24, bg=c, stk=c))
    E.append(ex.text(X + 10, yy + 5, title, fs=12, color="#0a0a0a"))
    E.append(ex.text(X + 10, yy + 32, "root: " + root, fs=9, color="#475569", w=1060, wrap=True))
    E.append(ex.text(X + 10, yy + 60, "→ " + eff, fs=9, color="#7c2d12", w=1060, wrap=True))
    yy += 96

E.append(ex.text(X, yy + 4, "Same broken listener is reused by the admin floor monitor (same /sse/order-monitor/:id route).",
                 fs=10, color="#94a3b8"))

print("PANEL 8:", ex.append(FP, E), "total elements")
