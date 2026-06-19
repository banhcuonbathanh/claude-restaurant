#!/usr/bin/env python3
"""PANEL 14 — One Field, All Layers (dark) — trace `status`.
The status field threads DB → BE → query → effectiveStatus → badge, AND the dead SSE branch (Flag 1)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_tracking/customer_tracking.excalidraw"
ex.reset("p14")
E = []
X, Y = 1500, 4300
E += ex.panel_header(X, Y, "PANEL 14 · One Field, All Layers — `status`",
                     "the order status field traced through every layer + the SSE branch that SHOULD feed it but never does",
                     color="#0f172a")

# the working READ path
y0 = Y + 64
steps = [
    ("DB", "orders.status = 'preparing'", ex.C_ORD),
    ("BE", "GetOrder → orderJSON → {data:{status}}", ex.C_ORD),
    ("FE query", "order.status (TanStack ['order',id])", ex.C_TAN),
    ("merge", "effectiveStatus = orderStatus ?? order?.status", ex.C_VIOLET),
    ("render", "TableInfoBanner StatusBadge", ex.C_CYAN),
]
x = X
for i, (lane, txt, c) in enumerate(steps):
    w = 270
    E.append(ex.rect(x, y0, w, 80, bg=ex.CARD_BG, stk=c, sw=2))
    E.append(ex.rect(x, y0, w, 22, bg=c, stk=c))
    E.append(ex.text(x + 8, y0 + 4, lane, fs=11, color="#0a0a0a"))
    E.append(ex.text(x + 8, y0 + 30, txt, fs=9, color=ex.LIGHT, ff=3, w=w - 16, wrap=True))
    if i < len(steps) - 1:
        E.append(ex.arrow(x + w, y0 + 40, x + w + 18, y0 + 40, stk=ex.MUTED, sw=2))
    x += w + 18

# the dead SSE branch
dy = y0 + 120
E.append(ex.rect(X, dy, 1410, 110, bg=ex.CARD_BG, stk=ex.C_RED, sw=2))
E.append(ex.rect(X, dy, 1410, 24, bg=ex.C_RED, stk=ex.C_RED))
E.append(ex.text(X + 8, dy + 5, "the branch that SHOULD make status live — but is dead (Flag 1)", fs=11, color="#0a0a0a"))
E.append(ex.text(X + 12, dy + 34,
                 "BE: every transition → publishOrderEvent(type:'order_status_changed', status) on order:<id>", fs=10, color=ex.MUTED, ff=3))
E.append(ex.text(X + 12, dy + 56,
                 "FE: useOrderMonitorSSE switch case 'order.status' → setOrderStatus()   ← string never matches 'order_status_changed'", fs=10, color=ex.LIGHT, ff=3))
E.append(ex.text(X + 12, dy + 78,
                 "result: orderStatus stays null → effectiveStatus = order?.status → badge advances ONLY on items_* refetch", fs=10, color=ex.C_RED, ff=3))

print("PANEL 14:", ex.append(FP, E), "total elements")
