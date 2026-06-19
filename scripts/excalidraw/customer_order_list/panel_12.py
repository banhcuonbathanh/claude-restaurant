#!/usr/bin/env python3
"""PANEL 12 (dark) — Realtime Fan-out.
Source: crosspage §7 + SSE code (sse/handler.go, order_service.go publishOrderEvent,
useOrderSSE.ts switch)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_list/customer_order_list.excalidraw"
ex.reset("p12")
E = []

X, Y = 1660, 5980
E += ex.panel_header(X, Y, "PANEL 12 · Realtime Fan-out — one commit → many screens", color=ex.PANEL_TXT)

def node(x, y, w, h, title, body, accent):
    E.append(ex.rect(x, y, w, h, bg=ex.CARD_BG, stk=accent, sw=2))
    E.append(ex.text(x + 12, y + 8, title, fs=12, color=accent))
    E.append(ex.text(x + 12, y + 30, body, fs=10, color=ex.LIGHT, ff=3, w=w - 24, wrap=True))

y = Y + 64
# source
node(X, y, 380, 78, "1 · publishOrderEvent",
     "order_service.go:806-819\nPublish(order:<id>) + Publish(orders:kds)\n(failure logged & swallowed)", ex.C_ORD)
E.append(ex.arrow(X + 380, y + 39, X + 440, y + 39, stk=ex.C_SLATE))
# redis
node(X + 440, y, 360, 78, "2 · Redis pub/sub",
     "channel order:<id>  (per-order)\nchannel orders:kds  (kitchen board)", ex.C_RED)
E.append(ex.arrow(X + 800, y + 39, X + 860, y + 39, stk=ex.C_SLATE))
# SSE handler
node(X + 860, y, 380, 78, "3 · StreamOrder (SSE)",
     "sse/handler.go:21-70\nevent:connected → relay verbatim\n:keep-alive every 15s", ex.C_CYAN)

# FE switch
y2 = y + 110
E.append(ex.rect(X, y2, 1240, 96, bg="#1e293b", stk=ex.C_BE, sw=2))
E.append(ex.text(X + 12, y2 + 8, "4 · useOrderSSE onmessage switch  (useOrderSSE.ts:83-123)", fs=12, color=ex.C_BE))
E.append(ex.text(X + 12, y2 + 32,
    "order_init · order_status_changed · order_cancelled · item_progress · order_completed   → setOrder() + write ▓ cache",
    fs=10, color=ex.LIGHT, ff=3, w=1210, wrap=True))
E.append(ex.text(X + 12, y2 + 70,
    "✗ item_cancelled — EMITTED by BE but NO case in switch → dropped (Bug 3)",
    fs=10, color=ex.C_RED, ff=3))

# screens lit
y3 = y2 + 120
E.append(ex.text(X, y3, "WHICH SCREENS LIGHT UP:", fs=11, color="#475569")); y3 += 24
screens = [
    ("customer overlay", "OrderDetailSheet — bar advances / status modal", ex.C_VIOLET),
    ("KDS board", "orders:kds fan-out — chef sees same progress", ex.C_AMBER),
    ("admin floor", "new_order ping → re-fetches its own copy", ex.C_TAN),
]
sx = X
for title, body, accent in screens:
    E.append(ex.rect(sx, y3, 400, 56, bg=ex.CARD_BG, stk=accent, sw=2))
    E.append(ex.text(sx + 10, y3 + 8, title, fs=11, color=accent))
    E.append(ex.text(sx + 10, y3 + 28, body, fs=10, color=ex.LIGHT, w=380, wrap=True))
    sx += 414

ex.append(FP, E)
print(f"PANEL 12: added {len(E)} elements")
