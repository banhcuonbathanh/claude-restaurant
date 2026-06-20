#!/usr/bin/env python3
"""PANEL 12 — Realtime Fan-out (dark). From crosspage §6/§8 + be/internal/sse/handler.go
+ order_service.go publishOrderEvent. One write → Redis → channels → hooks → screens."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_detail/customer_order_detail.excalidraw"
ex.reset("p12")
E = []
X, Y = 40, 8780
E += ex.panel_header(X, Y, "PANEL 12 · Realtime Fan-out — one write → Redis → which screens light up",
                     "from crosspage §6/§8 + sse/handler.go · publishOrderEvent fans every event to order:<id> AND orders:kds",
                     color="#0f172a")

y0 = Y + 60
# source
c1, _ = ex.card(X, y0, 320, ex.C_ORD, "BE write (order_service.go)",
                'CancelOrder      → order_cancelled\n'
                'CancelOrderItem  → item_cancelled\n'
                'UpdateItemQty    → item_updated\n'
                'UpdateStatus     → order_status_changed\n'
                'publishItemEvent → item_progress')
E += c1
# redis
E.append(ex.rect(X + 380, y0, 230, 130, bg=ex.CARD_BG, stk=ex.C_RED, sw=2))
E.append(ex.text(X + 392, y0 + 10, "Redis pub/sub", fs=12, color=ex.C_RED))
E.append(ex.text(X + 392, y0 + 34, "order:<id>\norders:kds\norders:admin\n\npublish fails →\nlogged+swallowed", fs=10, color=ex.MUTED, ff=3))
E.append(ex.arrow(X + 320, y0 + 60, X + 380, y0 + 60, stk=ex.C_RED, sw=2))

# SSE relay
E.append(ex.rect(X + 650, y0, 270, 130, bg=ex.CARD_BG, stk=ex.C_CYAN, sw=2))
E.append(ex.text(X + 662, y0 + 10, "StreamOrder (sse/handler.go)", fs=11, color=ex.C_CYAN))
E.append(ex.text(X + 662, y0 + 34, "subscribe order:<id>\nevent: connected\nrelay payload verbatim\n: keep-alive 15s\nNO DB read · NO ownership", fs=10, color=ex.MUTED, ff=3))
E.append(ex.arrow(X + 610, y0 + 60, X + 650, y0 + 60, stk=ex.C_CYAN, sw=2))

# useOrderSSE consumption — handled vs dropped
y1 = y0 + 160
E.append(ex.text(X, y1, "useOrderSSE switch — what reaches this page:", fs=12, color=ex.LIGHT))
handled = [("order_status_changed", True), ("item_progress", True), ("order_cancelled", True), ("order_completed", True),
           ("item_updated", False), ("item_cancelled", False), ("items_added", False)]
for i, (ev, ok) in enumerate(handled):
    col = i % 4
    row = i // 4
    bx = X + col * 320
    by = y1 + 26 + row * 38
    c = ex.C_BE if ok else ex.C_RED
    E.append(ex.rect(bx, by, 300, 30, bg=ex.CARD_BG, stk=c, sw=2))
    E.append(ex.text(bx + 10, by + 8, ("✓ " if ok else "✗ ") + ev, fs=11, color=c, ff=3))

# multi-device note
my = y1 + 26 + 2*38 + 12
E.append(ex.rect(X, my, 1270, 56, bg=ex.CARD_BG, stk=ex.C_VIOLET, sw=2))
E.append(ex.text(X + 12, my + 8, "Multi-device (2 phones on same order:<id>)", fs=11, color=ex.C_VIOLET))
E.append(ex.text(X + 12, my + 28,
                 "item_progress → BOTH phones move in lockstep.   qty edit / item cancel → NEITHER phone updates (item_updated + item_cancelled dropped on both); corrected only on reload.",
                 fs=10, color=ex.MUTED, ff=2))

print("PANEL 12:", ex.append(FP, E), "total elements")
