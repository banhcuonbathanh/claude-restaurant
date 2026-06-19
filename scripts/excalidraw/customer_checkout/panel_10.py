#!/usr/bin/env python3
"""PANEL 10 (dark) — DB Row-Level View. Sourced from customer_checkout_be.md §POST /orders
+ docs/system/08_pages/02_spec/object/OBJECT_MODEL_ORDER.md + DB_SCHEMA.md."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_checkout/customer_checkout.excalidraw"
ex.reset("p10")
E = []
X, Y = 40, 3320
E.append(ex.rect(X - 20, Y - 20, 1560, 470, bg="#0b1220", stk="#1e293b", sw=2))
E += ex.panel_header(X, Y, "PANEL 10 · DB Row-Level View — what /checkout writes", "orders + order_items rows for Minh's combo order (₫21,000)", color=ex.LIGHT, sub_color=ex.MUTED)

cy = Y + 60
c1, h1 = ex.card(X, cy, 730, ex.C_ORD, "orders  (one row)",
 "id            <uuid>\norder_number  #A12   (uq_orders_order_number)\nstatus        pending\nsource        online      ← enum (NOT payment_method!)\ntable_id      NULL        (online → no table)\ncreated_by    NULL        (customer role blanked)\ncustomer_name 'Nguyễn Văn Minh'\ncustomer_phone '0912345678'\ntotal_amount  21000       (recalculateTotalAmount)\nnote          NULL    created_at  now()\n⚠ NO payment_method column (DB_SCHEMA:138)")
E += c1
c2, h2 = ex.card(X + 750, cy, 760, ex.C_BE, "order_items  (rows)",
 "# combo HEADER:\n  product_id NULL · combo_id <Giò> · qty 1\n  unit_price 0      ← header carries no price\n  combo_ref_id NULL\n# combo SUB-rows (combo_ref_id → header):\n  Giò    qty1  unit_price 9000\n  BánhCuốn qty3 unit_price 4000  filling thit\n# standalone:\n  Canh   product_id<uuid> qty1 unit_price 0\n\nrow-sum = 0 + 9000 + 4000*3 + 0 = 21000\n(combo price on sub-items → no double-count)")
E += c2
E.append(ex.text(X, cy + max(h1, h2) + 10, "Insert path: tx CreateOrderWithItems with up to 3 retries on uq_orders_order_number unique-violation (service:332-346).", fs=10, color=ex.MUTED, ff=3))

ex.append(FP, E)
print(f"PANEL 10: appended {len(E)} elements")
