#!/usr/bin/env python3
"""PANEL 3 — Order Write Pipeline (Object Model). Sourced from customer_checkout.md
§Object Model + customer_checkout_be.md §POST /orders. Code: fe/src/lib/order-payload.ts ·
be/internal/service/order_service.go (buildProductRow/expandCombo/recalculateTotalAmount)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_checkout/customer_checkout.excalidraw"
ex.reset("p3")
E = []
X, Y = 620, 720
E += ex.panel_header(X, Y, "PANEL 3 · Order Write Pipeline (FE→BE→DB)",
                     "checkout owns NO persistent model — it consumes cart items, produces an Order (BE-owned)")

bx = X
by = Y + 60
boxes = [
 ("#fbbf24", "cart.items (Zustand)", "id · qty · toppings\n· combo_items · note\n(NO prices)"),
 ("#22d3ee", "buildOrderItemsPayload", "order-payload.ts:27\nids + qty ONLY\nXOR product/combo"),
 ("#0ea5e9", "POST /orders body", "customer_name/phone/\nnote · table_id · source\n· items[]  (NO payment_method)"),
 ("#ff7a1a", "CreateOrder (service)", "snapshots name+unit_price\nserver-side (client\nprices never trusted)"),
 ("#16a34a", "orders + order_items", "header(unit_price=0)\n+ sub-rows(combo_ref_id)\nrecalc total (no dbl-count)"),
]
w = 270
for i, (acc, t, b) in enumerate(boxes):
    col = i % 2
    row = i // 2
    xx = bx + col * 380
    yy = by + row * 130
    E.append(ex.rect(xx, yy, w, 110, bg=ex.L_NEUTRAL, stk=acc, sw=2))
    E.append(ex.text(xx + 10, yy + 8, t, fs=11, color=acc))
    E.append(ex.text(xx + 10, yy + 32, b, fs=9, color=ex.L_TEXT, ff=3))
    if i < len(boxes) - 1:
        if col == 0:
            E.append(ex.arrow(xx + w, yy + 55, xx + 380, yy + 55, stk=ex.SUB, sw=2))
        else:
            E.append(ex.arrow(xx + w // 2, yy + 110, bx + w // 2, yy + 130, stk=ex.SUB, sw=2))

note_y = by + 3 * 130 - 10
E.append(ex.rect(bx, note_y, 650, 56, bg="#fff7ed", stk="#fb923c", sw=2))
E.append(ex.text(bx + 12, note_y + 8, "OC epic — combo no longer double-counts", fs=10, color="#9a3412"))
E.append(ex.text(bx + 12, note_y + 28, "combo header unit_price=0; combo price lives on sub-items → recalculateTotalAmount\nrow-sum is correct (service:398-412). Scenario: ₫21,000 derived for Minh's order.", fs=9, color=ex.L_TEXT, ff=3))

ex.append(FP, E)
print(f"PANEL 3: appended {len(E)} elements")
