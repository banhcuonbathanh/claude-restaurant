#!/usr/bin/env python3
"""PANEL 14 for customer_combo_detail.excalidraw — One Field, All Layers (dark).
Traces a single field: combo sub-item product_id, tap → render. Sourced from
_crosspage §2-3 (handoff + order-payload) + _be.md (expansion) + 004/005 migrations."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_combo_detail/customer_combo_detail.excalidraw"
ex.reset("p14")
E = []

X, Y = 40, 4980
E += ex.panel_header(X, Y, "PANEL 14 · One Field, All Layers — combo_items[].product_id",
    "the field that MUST survive: traced from catalog read → cart → payload → BE expand → SQL row",
    color=ex.LIGHT, sub_color=ex.MUTED)

stages = [
 ("1 · DB / wire", ex.C_ORD,
  "combo_items.product_id\n(004_combos.sql, FK→products)\nGET /combos serializes id only\n(product_handler.go:337-341)"),
 ("2 · FE enrich", ex.C_TAN,
  "combo memo joins product_id\nvs productMap → {product_id,\nproduct_name, unit_price}\n(page.tsx:30-50)"),
 ("3 · Zustand", ex.C_ZUS,
  "addItem combo CartItem\ncombo_items:[{product_id,...}]\nproduct_id must survive\n(page.tsx:58-71)"),
 ("4 · Payload", ex.C_CYAN,
  "buildOrderItemsPayload\nnon-canh sub-items → overrides\n{product_id, topping_ids:[]}\n(order-payload.ts:31-44)"),
 ("5 · BE expand", ex.C_BE,
  "POST /orders expands combo:\nheader unit_price=0 +\nsub-item row per product_id\n(BUSINESS_RULES §2.5)"),
 ("6 · SQL row", ex.C_VIOLET,
  "order_items.product_id\n+ filling (thit/moc_nhi/NULL)\n+ combo_ref_id link\n(005_orders.sql, mig 016)"),
]
cy = Y + 60
sx = X
bw = 380
for i, (title, acc, body) in enumerate(stages):
    els, h = ex.card(sx, cy, bw, acc, title, body)
    E += els
    if i < len(stages) - 1:
        E.append(ex.arrow(sx + bw, cy + 60, sx + bw + 18, cy + 60, stk=ex.MUTED))
    sx += bw + 18

# footnote
fy = cy + 150
E.append(ex.rect(X, fy, sx - X - 18, 50, bg="#0b1220", stk=ex.C_CYAN, sw=2))
E.append(ex.text(X + 14, fy + 9,
    "This page only PRODUCES the input (steps 1-3). Steps 4-6 run downstream on /menu —",
    fs=11, color=ex.C_CYAN))
E.append(ex.text(X + 14, fy + 29,
    "product_id is the one field that must reach the BE so the combo can be re-priced server-side (client price never trusted).",
    fs=10, color=ex.MUTED))

ex.append(FP, E)
print(f"PANEL 14: {len(E)} elements")
