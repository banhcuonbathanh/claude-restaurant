#!/usr/bin/env python3
"""PANEL 2 — Cross-Component Dataflow — admin_overview_crosscomponent_dataflow.md.
The ['orders','live'] hub; page.tsx owns 3 useQuery, derives + props-down, writes-up."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_overview/admin_overview.excalidraw"
ex.reset("p2")
E = []
T = ex.L_TEXT
B = ex.L_BORDER

X, Y = 1360, 40
E += ex.panel_header(X, Y, "PANEL 2 · Cross-Component Dataflow",
                     "one hub: TanStack ['orders','live'] · page.tsx owns useQuery → derives → props DOWN · onAction UP → setQueryData · NO Zustand")

# page.tsx bridge box (center)
px, py, pw = X + 360, Y + 70, 460
E.append(ex.rect(px, py, pw, 90, bg=ex.L_INDIGO, stk="#6366f1", sw=2))
E.append(ex.text(px + 16, py + 10, "page.tsx — the only bridge", fs=13, color="#3730a3"))
E.append(ex.text(px + 16, py + 34, "owns 3 useQuery · derives orders / tableOrders /", fs=10, color="#4338ca", ff=3))
E.append(ex.text(px + 16, py + 50, "filtered* / tableMap · handleAction → setQueryData", fs=10, color="#4338ca", ff=3))

# the 3 cache entries (hub)
hy = py + 130
caches = [("['orders','live']", "Order[] · the ONE shared hub\nGET /orders/live + WS/SSE · stale 15s", "#34D399"),
          ("['tables']", "Table[] · room metadata\nstale 60s", "#22D3EE"),
          ("['orders','history']", "Order[] · LAZY enabled:open\nPaidLog / CancelLog · stale 30s", "#A78BFA")]
chw = (pw - 2 * 10) / 3
for i, (k, body, c) in enumerate(caches):
    cx = px + i * (chw + 10)
    E.append(ex.rect(cx, hy, chw, 78, bg="#ffffff", stk=c, sw=2))
    E.append(ex.rect(cx, hy, chw, 22, bg=c, stk=c))
    E.append(ex.text(cx + 8, hy + 5, k, fs=9, color="#0a0a0a", ff=3))
    E.append(ex.text(cx + 8, hy + 28, body, fs=8, color=T, ff=3))
E.append(ex.text(px, hy - 18, "TanStack Query cache", fs=11, color="#0f766e"))
E.append(ex.arrow(px + pw/2, py + 90, px + pw/2, hy, stk="#6366f1", sw=2))

# WRITERS (left)
wx, wy = X, py + 40
E.append(ex.rect(wx, wy, 330, 200, bg="#fff7ed", stk="#fb923c", sw=1.5))
E.append(ex.text(wx + 14, wy + 10, "4 WRITERS → setQueryData(['orders','live'])", fs=11, color="#9a3412"))
for i, w in enumerate(["① handleAction — optimistic status patch (page.tsx:179)",
                       "② useOverviewWS — WS reconcile / drop (ts:51-64)",
                       "③ useAdminSSE / handleNewOrder — prepend new_order",
                       "④ onPaymentDone — filter out paid order (page.tsx:371)"]):
    E.append(ex.text(wx + 14, wy + 36 + i * 38, w, fs=9, color="#7c2d12", ff=3, w=300, wrap=True))
E.append(ex.arrow(wx + 330, wy + 100, px, py + 45, stk="#fb923c", sw=2))

# READERS (right) — widgets read via props
rx, ry = X + 900, py - 10
E.append(ex.rect(rx, ry, 280, 320, bg=ex.L_NEUTRAL, stk=B, sw=1.5))
E.append(ex.text(rx + 14, ry + 10, "READERS (props down)", fs=11, color="#0f172a"))
widgets = ["A StatCards — occupied/urgent/pending counts",
           "B WaitingSection — pending-only queue",
           "C PrepPanel — kiemTraIds ∩ pending",
           "D TableList / TableGrid — toggle",
           "—  search filters B + D",
           "E PaidLog *  · F CancelLog *",
           "* self-contained islands: own",
           "   useQuery(['orders','history'])"]
for i, w in enumerate(widgets):
    E.append(ex.text(rx + 14, ry + 38 + i * 32, w, fs=9, color=T, ff=3, w=255, wrap=True))
E.append(ex.arrow(px + pw, py + 45, rx, ry + 90, stk="#6366f1", sw=2))
E.append(ex.text(px + pw + 6, py + 6, "props ▼", fs=9, color="#6366f1"))

# the rule
E.append(ex.rect(X + 360, hy + 100, 460, 70, bg="#fef9c3", stk="#eab308", sw=1.5))
E.append(ex.text(X + 374, hy + 110, "THE RULE — zero props pass between peer widgets.", fs=11, color="#854d0e"))
E.append(ex.text(X + 374, hy + 134, "Writes flow UP (onAction) → handleAction → one setQueryData →\nfan-out re-render to every mounted child. No prop-drilling.", fs=9, color="#a16207", ff=3))

n = ex.append(FP, E)
print(f"PANEL 2: {len(E)} elements added (total {n})")
