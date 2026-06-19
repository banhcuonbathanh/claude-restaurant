#!/usr/bin/env python3
"""PANEL 10 (dark) — Object Lifecycle (moving): same objects from Panel 9, per beat.
Source: SCENARIO_ORDER_HISTORY.md + loading + be."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_list/customer_order_list.excalidraw"
ex.reset("p10")
E = []

X, Y = 1660, 4340
E += ex.panel_header(X, Y, "PANEL 10 · Object Lifecycle — the objects MOVING, per beat", color=ex.PANEL_TXT)
E.append(ex.text(X, Y + 26, "ORD-20260613-016 threaded through the overlay's load + cancel beats.", fs=10, color="#475569"))

cols = [("BEAT / ACTION", 280), ("order snapshot after  (← what changed)", 560), ("components reacting", 380), ("BE / Redis", 380)]
y = Y + 60
cx = X
E.append(ex.rect(X, y, sum(c[1] for c in cols), 28, bg="#334155", stk="#475569"))
for name, w in cols:
    E.append(ex.text(cx + 8, y + 7, name, fs=11, color=ex.LIGHT)); cx += w
y += 28

rows = [
    ("tap card → mount", "order = cached JSON (status confirmed, served 1/2)", "instant paint, no spinner", "—"),
    ("instant-paint (Phase A)", "← unchanged (from ▓ order_cache_<id>)", "DishRow + bar from cache", "—"),
    ("REST snapshot (Phase B)", "order ← GET /orders/:id (fresh qty_served)", "bar corrects to true count", "MySQL read (no cache)"),
    ("SSE opens (Phase C)", "← unchanged", "stream live", "subscribe Redis order:<id>"),
    ("item_progress event", "items[i].qty_served++ (one item patched)", "progress memo recompute → bar advances", "publishOrderEvent item_progress → order:<id> + orders:kds"),
    ("cancel item (DELETE)", "← NOT patched live (item stays visible)", "toast only; modal closes", "DeleteOrderItem + RecalcTotal · item_cancelled emitted (FE drops it)"),
    ("'Thêm món' tap", "order untouched; cart store gets tableId+activeOrderId", "sheet unmounts → SSE abort", "—"),
]
for action, snap, comp, be in rows:
    cx = X
    rh = 46
    E.append(ex.rect(X, y, sum(c[1] for c in cols), rh, bg=ex.CARD_BG, stk="#475569"))
    for val, (_, w), accent in zip((action, snap, comp, be), cols,
                                   (ex.C_VIOLET, ex.C_ZUS, ex.C_CYAN, ex.C_BE)):
        E.append(ex.text(cx + 8, y + 8, val, fs=10, color=ex.LIGHT if val != "—" else ex.MUTED,
                         ff=3, w=w - 14, wrap=True))
        cx += w
    # accent tick on left
    E.append(ex.rect(X, y, 4, rh, bg=ex.C_VIOLET, stk=ex.C_VIOLET, round_=False))
    y += rh + 4

E.append(ex.text(X, y + 6,
    "Key: one setOrder() → one useMemo pass → every widget re-renders together (Panel 2). item_cancelled is the gap (Bug 3).",
    fs=10, color="#475569"))

ex.append(FP, E)
print(f"PANEL 10: added {len(E)} elements")
