#!/usr/bin/env python3
"""PANEL 13 (dark) — One Field, All Layers — trace `source`.
Sourced from customer_checkout.md + _be.md + order_service.go enum mapping.
Contrast trace: payment_method dies before DB (Bug 1)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_checkout/customer_checkout.excalidraw"
ex.reset("p13")
E = []
X, Y = 1620, 3820
E.append(ex.rect(X - 20, Y - 20, 1560, 470, bg="#0b1220", stk="#1e293b", sw=2))
E += ex.panel_header(X, Y, "PANEL 13 · One Field, All Layers — `source`", "the field that survives every layer (vs payment_method, which dies)", color=ex.LIGHT, sub_color=ex.MUTED)

steps = [
 (ex.C_ZUS, "1 cart.tableId", "presence decides:\ntableId ? 'qr' : 'online'"),
 (ex.C_CYAN, "2 POST body", "source: 'online'\n(page.tsx:53)"),
 (ex.C_AMBER, "3 binding", "oneof=online qr pos\n(handler:59-66)"),
 (ex.C_ORD, "4 enum map", "→ OrdersSourceOnline\n(service:312-318)"),
 (ex.C_BE, "5 SQL column", "orders.source = 'online'\n(table_id NULL)"),
 (ex.C_VIOLET, "6 read-back", "orderJSON.source\n→ /order list + detail"),
]
cy = Y + 70
for i, (acc, t, b) in enumerate(steps):
    xx = X + i * 250
    c, _ = ex.card(xx, cy, 230, acc, t, b)
    E += c
    if i < len(steps) - 1:
        E.append(ex.arrow(xx + 230, cy + 60, xx + 250, cy + 60, stk=ex.MUTED, sw=2))

ny = cy + 150
E.append(ex.rect(X, ny, 1500, 86, bg="#1a1305", stk=ex.C_RED, sw=2))
E.append(ex.text(X + 12, ny + 8, "Contrast — `payment_method` dies before the DB (Bug 1)", fs=12, color=ex.C_RED))
E.append(ex.text(X + 12, ny + 32,
 "tap radio → RHF field → cart.setPaymentMethod('vnpay')  ✗ NOT in POST body  ✗ no orders column\n→ clearCart() wipes it. Lifecycle: selected → briefly stored → never sent → erased. Cosmetic today.",
 fs=10, color=ex.LIGHT, ff=3))

ex.append(FP, E)
print(f"PANEL 13: appended {len(E)} elements")
