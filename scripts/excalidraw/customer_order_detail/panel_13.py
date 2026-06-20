#!/usr/bin/env python3
"""PANEL 13 — Failure / Edge Map (dark). From _be.md Error Behaviour + _loading.md flags."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_detail/customer_order_detail.excalidraw"
ex.reset("p13")
E = []
X, Y = 40, 9760
E += ex.panel_header(X, Y, "PANEL 13 · Failure / Edge Map — every unhappy path",
                     "from _be.md Error Behaviour + _loading.md flags · all errors → handleServiceError → sonner toast",
                     color="#0f172a")

y0 = Y + 60
edges = [
    ("404 NOT_FOUND", "GET /orders/:id unknown/soft-deleted", "useOrderSSE setIsNotFound(true) → full-page 404 screen → SSE never opens", ex.C_RED),
    ("403 FORBIDDEN", "guest reads/writes another table's order", "service ownership gate (order.table_id ≠ caller.TableID) on all 5 endpoints", ex.C_RED),
    ("422 CANCEL_THRESHOLD", "cancel past 30% / served item / qty_served>0", "'Không thể huỷ khi đã phục vụ từ 30% trở lên' → toast", ex.C_AMBER),
    ("400 INVALID_INPUT", "PATCH bad {quantity} (binding required,min=1)", "handler bind fail → toast", ex.C_AMBER),
    ("SSE onopen non-2xx", "stream open fails", "exponential backoff → banner after 3 → silent exit at attempt 5 (no recovery prompt)", ex.C_VIOLET),
    ("Stale cache paint", "order_cache_<id> exists but stale", "renders old qty_served/status instantly; REST silently overwrites ~50ms (no diff shown)", ex.C_SLATE),
    ("Redis pub/sub drop", "events stop arriving (no error returned)", "pill still 'LIVE' but view frozen; not caught by HighErrorRate/SlowResponseTime alerts", ex.C_RED),
    ("Dropped write events", "item_updated / item_cancelled / items_added", "no FE case → toast-only success, view unchanged until reload (Bugs 1+2)", ex.C_RED),
]
colw = 625
for i, (code, cause, eff, c) in enumerate(edges):
    col = i % 2
    row = i // 2
    fx = X + col * (colw + 20)
    fy = y0 + row * 78
    E.append(ex.rect(fx, fy, colw, 68, bg=ex.CARD_BG, stk=c, sw=2))
    E.append(ex.rect(fx, fy, 6, 68, bg=c, stk=c))
    E.append(ex.text(fx + 16, fy + 8, code, fs=11, color=c, ff=3))
    E.append(ex.text(fx + 16, fy + 28, "cause: " + cause, fs=9, color=ex.MUTED, w=colw - 28, wrap=True))
    E.append(ex.text(fx + 16, fy + 46, "→ " + eff, fs=9, color=ex.LIGHT, w=colw - 28, wrap=True))

print("PANEL 13:", ex.append(FP, E), "total elements")
