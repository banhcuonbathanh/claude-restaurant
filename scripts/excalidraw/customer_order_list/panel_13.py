#!/usr/bin/env python3
"""PANEL 13 (dark) — Failure / Edge Map.
Source: all docs + code (be Flags, loading Flags, crosspage Flags)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_list/customer_order_list.excalidraw"
ex.reset("p13")
E = []

X, Y = 40, 7160
E += ex.panel_header(X, Y, "PANEL 13 · Failure / Edge Map — every unhappy path", color=ex.PANEL_TXT)

edges = [
    ("404 NOT_FOUND", "GET /orders/:id unknown/soft-deleted → setIsNotFound(true), SSE never opens. Sheet never reads isNotFound → 'Đang tải...' FOREVER (Bug 1).", ex.C_RED),
    ("403 FORBIDDEN", "guest reads/cancels another table's order → ErrForbidden (order.table_id ≠ claims.TableID). REST enforces; SSE does NOT (Bug 4).", "#fb923c"),
    ("422 CANCEL_THRESHOLD", "cancel order past 30% served (SumQtyServedAndQuantity ≥ 0.30) OR cancel an already-served item (qty_served ≥ quantity) → sonner toast.", ex.C_AMBER),
    ("non-404 REST error", "GET /orders/:id non-404 → swallowed, falls through to SSE; spinner stays until SSE succeeds or fails (≥3).", "#f59e0b"),
    ("SSE ≥3 reconnect fails", "exponential backoff 1s,2s,4s…cap 30s, max 5 → ConnectionErrorBanner shows ABOVE scroll area, even over valid cached content.", ex.C_VIOLET),
    ("Redis publish fails", "publishOrderEvent error logged & swallowed — the DB write still succeeds; realtime fan-out is best-effort, never blocks the mutation.", ex.C_SLATE),
    ("item_cancelled dropped", "BE emits it (order_service.go:642) but useOrderSSE has no case → cancelled item not removed live; reconciles on next snapshot (Bug 3).", ex.C_RED),
    ("stale list cards", "list reads cache once on mount, never refetches; a card lags real status until its overlay is opened (Bug 2).", "#fb923c"),
]
y = Y + 60
colw = 745
x = X
for i, (title, body, accent) in enumerate(edges):
    cx = X if i % 2 == 0 else X + colw + 10
    if i % 2 == 0 and i > 0:
        y += 84
    E.append(ex.rect(cx, y, colw, 76, bg=ex.CARD_BG, stk=accent, sw=2))
    E.append(ex.rect(cx, y, 5, 76, bg=accent, stk=accent, round_=False))
    E.append(ex.text(cx + 14, y + 8, title, fs=12, color=accent))
    E.append(ex.text(cx + 14, y + 30, body, fs=10, color=ex.LIGHT, w=colw - 28, wrap=True))

ex.append(FP, E)
print(f"PANEL 13: added {len(E)} elements")
