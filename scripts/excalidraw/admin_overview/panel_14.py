#!/usr/bin/env python3
"""PANEL 14 — One Field, All Layers (dark) — trace order.status end to end.
tap → setQueryData → PATCH body → service validTransitions → SQL column → WS echo → render."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_overview/admin_overview.excalidraw"
ex.reset("p14")
E = []

X, Y = 1900, 5290
E += ex.panel_header(X, Y, "PANEL 14 · One Field, All Layers — order.status",
                     "a single field traced tap → cache → payload → service → SQL → echo → render",
                     color=ex.LIGHT, sub_color=ex.MUTED)
E.append(ex.rect(X - 20, Y - 20, 1740, 420, bg="#0b1220", stk=ex.CARD_STK, sw=1))

steps = [
    ("1 · TAP", ex.C_ZUS, "WaitingSection\nonAction(BC-42,\n 'confirmed')\n+ loadingIds.add\n(useState, not\n Zustand)"),
    ("2 · CACHE", ex.C_TAN, "setQueryData(\n ['orders','live'],\n map o.id →\n {...o, status:\n 'confirmed'})\noptimistic"),
    ("3 · PAYLOAD", ex.C_CYAN, "PATCH\n/orders/:id/status\nbody:\n{ status:\n 'confirmed' }\n(admin.api.ts:178)"),
    ("4 · SERVICE", ex.C_BE, "UpdateOrderStatus\nvalidTransitions\npending→confirmed\n✅ else 409\n(order_service\n .go:533-555)"),
    ("5 · SQL", ex.C_ORD, "UPDATE orders\nSET status=?,\n updated_at=NOW()\nWHERE id=?\n(orders.sql.go\n :434-443)"),
    ("6 · ECHO", ex.C_VIOLET, "publish\norder_status_\nchanged →\norders:kds →\nuseOverviewWS\nsetQueryData\n(idempotent)"),
    ("7 · RENDER", ex.C_AMBER, "WaitingSection\nfilter drops row\n(not pending)\nTableList badge\n→ \"Đã xác nhận\"\nStatCards recompute"),
]
sx = X
sw = 232
oy = Y + 64
for i, (title, c, body) in enumerate(steps):
    x = sx + i * (sw + 8)
    E.append(ex.rect(x, oy, sw, 250, bg="#13203a", stk=c, sw=2))
    E.append(ex.rect(x, oy, sw, 28, bg=c, stk=c))
    E.append(ex.text(x + 10, oy + 7, title, fs=11, color=ex.DARK))
    E.append(ex.text(x + 10, oy + 40, body, fs=10, color=ex.LIGHT, ff=3, w=sw - 20, wrap=True))
    if i < len(steps) - 1:
        E.append(ex.arrow(x + sw, oy + 130, x + sw + 8, oy + 130, stk=c, sw=2))

# value ribbon
ry = oy + 270
E.append(ex.rect(X, ry, 1660, 40, bg="#101a30", stk=ex.C_TAN, sw=1.5))
E.append(ex.text(X + 14, ry + 11,
    "value of order.status:   'pending'  ──(tap)──►  'confirmed' (optimistic)  ──(PATCH+SQL)──►  'confirmed' (durable)  ──(WS echo)──►  'confirmed' (reconciled)",
    fs=10, color=ex.C_TAN, ff=3))

n = ex.append(FP, E)
print(f"PANEL 14: {len(E)} elements added (total {n})")
