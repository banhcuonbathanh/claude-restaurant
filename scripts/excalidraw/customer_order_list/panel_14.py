#!/usr/bin/env python3
"""PANEL 14 (dark) — One Field, All Layers: trace qty_served.
Source: SCENARIO §D + be + crosspage §4 (item_progress path)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_list/customer_order_list.excalidraw"
ex.reset("p14")
E = []

X, Y = 1660, 7160
E += ex.panel_header(X, Y, "PANEL 14 · One Field, All Layers — qty_served", color=ex.PANEL_TXT)
E.append(ex.text(X, Y + 26, "Chef serves one portion → the number flows 8 hops to Hoa's progress bar (and back to the cache).", fs=10, color="#475569"))

hops = [
    ("1 · Chef action (KDS)", "staff taps 'Ra 1 phần' on the kitchen board", ex.C_AMBER),
    ("2 · DB write", "order_items.qty_served++  (CHECK 0..quantity)", ex.C_TAN),
    ("3 · publishOrderEvent", "type:item_progress {item_id, qty_served} → order:<id> + orders:kds", ex.C_ORD),
    ("4 · Redis pub/sub", "channel order:<id> carries the payload", ex.C_RED),
    ("5 · StreamOrder relay", "sse/handler.go — event name = payload.type, sent verbatim", ex.C_CYAN),
    ("6 · useOrderSSE case", "case 'item_progress': setOrder → items.map(i=> i.id===item_id ? qty_served : i)", ex.C_BE),
    ("7 · progress memo", "recompute Σ qty_served / Σ quantity over display items", ex.C_VIOLET),
    ("8 · render + write-back", "OrderDetailSheet bar advances · effect writes ▓ order_cache_<id>", ex.C_ZUS),
]
y = Y + 64
w = 1240
for i, (title, body, accent) in enumerate(hops):
    E.append(ex.rect(X, y, w, 54, bg=ex.CARD_BG, stk=accent, sw=2))
    E.append(ex.rect(X, y, 6, 54, bg=accent, stk=accent, round_=False))
    E.append(ex.text(X + 16, y + 8, title, fs=12, color=accent))
    E.append(ex.text(X + 16, y + 30, body, fs=10, color=ex.LIGHT, ff=3, w=w - 32, wrap=True))
    if i < len(hops) - 1:
        E.append(ex.arrow(X + w/2, y + 54, X + w/2, y + 62, stk=ex.C_SLATE, sw=1))
    y += 64

E.append(ex.rect(X, y + 4, w, 40, bg="#1e293b", stk=ex.C_BE))
E.append(ex.text(X + 14, y + 14,
    "One column (qty_served), no full refetch — a surgical SSE patch the list card inherits next mount (via the cache write-back).",
    fs=10, color=ex.LIGHT, w=w - 28, wrap=True))

ex.append(FP, E)
print(f"PANEL 14: added {len(E)} elements")
