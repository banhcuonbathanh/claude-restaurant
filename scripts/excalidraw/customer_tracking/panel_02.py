#!/usr/bin/env python3
"""PANEL 2 — Cross-Component Dataflow (orchestrator-first fan-out).
From customer_tracking_crosscomponent_dataflow.md §0–§2.2."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_tracking/customer_tracking.excalidraw"
ex.reset("p2")
E = []
X, Y = 740, 40
E += ex.panel_header(X, Y, "PANEL 2 · Cross-Component Dataflow — orchestrator-first",
                     "from _crosscomponent_dataflow.md · one SSE hook fans out to N widgets via page.tsx · no widget→widget arrows")

L = "#1e293b"
def box(x, y, w, h, accent, title, lines, bg=ex.L_NEUTRAL, fs=10):
    E.append(ex.rect(x, y, w, h, bg=bg, stk=accent, sw=2))
    E.append(ex.text(x + 12, y + 8, title, fs=12, color=L))
    if lines:
        E.append(ex.text(x + 12, y + 28, lines, fs=fs, color="#475569"))

# pivot
box(X, Y + 60, 300, 50, ex.C_ZUS, "useCartStore (Zustand · persisted)",
    "activeOrderId: string|null   ← the pivot")
E.append(ex.arrow(X + 150, Y + 110, X + 150, Y + 150, stk=ex.C_ZUS, sw=2))

# orchestrator
ox, oy, ow, oh = X, Y + 150, 900, 230
E.append(ex.rect(ox, oy, ow, oh, bg="#eef2ff", stk=ex.L_BORDER, sw=2))
E.append(ex.text(ox + 12, oy + 8, "page.tsx — the orchestrator (the only hub)", fs=13, color=L))
box(ox + 16, oy + 38, 410, 120, ex.C_CYAN, "useOrderMonitorSSE(orderId)",
    "orderStatus  ─→ effectiveStatus (L44)\nqueueData    ─→ TableInfoBanner · FloorList\nsseConnected ─→ TopBar · ErrorBanner\nisUnauthorized ─→ full-page guard (L90)\nitemsChangedAt ─→ refetch() (L41)")
box(ox + 450, oy + 38, 430, 70, ex.C_ORD, "useQuery(['order', orderId])",
    "order: Order|undefined ─→ OrderDetailCard\nisLoading / isError ─→ branch guards (L69,111)")
box(ox + 450, oy + 116, 430, 42, ex.C_SLATE, "useState(showTable)",
    "toggle Ẩn/Hiện bàn — local, never a prop")
E.append(ex.text(ox + 16, oy + 168, "derived:  effectiveStatus = orderStatus ?? order?.status   ·   tableLabel = order?.table_name ?? table_id ?? '?'",
                 fs=10, color="#7c2d12"))
E.append(ex.text(ox + 16, oy + 188, "(the ONLY merging logic — everything else is a straight prop pass-down)", fs=9, color="#94a3b8"))

# widgets row
wy = oy + oh + 40
widgets = [("MonitoringTopBar", "sseConnected"), ("TableInfoBanner", "label·status·queue·ETA"),
           ("OrderDetailCard", "order"), ("WholeFloorPrepList", "queue·currentOrderId")]
wx = X
for i, (n, p) in enumerate(widgets):
    cx = wx + i * 228
    E.append(ex.arrow(ox + 120 + i * 200, oy + oh, cx + 100, wy, stk=ex.MUTED, sw=1))
    box(cx, wy, 210, 56, ex.C_TAN, n, p, bg="#ecfdf5")
E.append(ex.text(X, wy + 70, "5th widget: ConnectionErrorBanner — shown/hidden by !sseConnected in page (no props).  Read arrows DOWN only.",
                 fs=10, color="#475569"))

print("PANEL 2:", ex.append(FP, E), "total elements")
