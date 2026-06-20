#!/usr/bin/env python3
"""PANEL 9 for customer_combo_detail.excalidraw — Live State Objects (dark).
Sourced from _crosspage_dataflow.md §2 (CartItem fields) + types/cart.ts:11-21 +
_be.md (enriched combo model). One concrete combo threaded through all three."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_combo_detail/customer_combo_detail.excalidraw"
ex.reset("p9")
E = []

X, Y = 40, 3100
E += ex.panel_header(X, Y, "PANEL 9 · Live State Objects",
    "the REAL shapes + ONE concrete combo (\"Combo Day Dan\", 42k) threaded through all three",
    color=ex.LIGHT, sub_color=ex.MUTED)

cy = Y + 60
els, h1 = ex.card(X, cy, 540, ex.C_ZUS, "Zustand  CartItem  (types/cart.ts:11-21)",
    "{ id:           'combo_<uuid>',\n  type:         'combo',\n  combo_id:     '<uuid>',\n  name:         'Combo Day Dan',\n  quantity:     2,\n  price:        42000,\n  combo_items:  [\n    { product_id, product_name,\n      quantity, unit_price } ...\n  ],\n  toppings:     [] }")
E += els
els, h2 = ex.card(X + 580, cy, 540, ex.C_TAN, "TanStack cache  (page.tsx:18-28)",
    "['combos']        → rawCombos[]  (5-min staleTime)\n  one entry = { id, name, price,\n    combo_items:[{id,product_id,quantity}] }\n\n['products-all']  → products[]   (5-min staleTime)\n  → productMap: product_id → {name, price}\n\nthe combo memo (page.tsx:30-50) JOINs\nthe two into the enriched combo.")
E += els
els, h3 = ex.card(X + 1160, cy, 540, ex.C_ORD, "BE enriched combo  (svc enrichCombo)",
    "combo row (combos table) +\n  combo_items rows joined →\n{ id, name, price=42000,\n  is_available:1,\n  combo_items:[{id,product_id,quantity}] }\n\nserializer emits ids only\n(product_handler.go:333-354) — names\nresolved client-side, never on the wire.")
E += els

# concrete thread
ty = cy + max(h1, h2, h3) + 20
E.append(ex.rect(X, ty, 1700, 70, bg="#0b1220", stk=ex.C_CYAN, sw=2))
E.append(ex.text(X + 14, ty + 10, "ONE concrete combo threaded:", fs=12, color=ex.C_CYAN))
E.append(ex.text(X + 14, ty + 32,
    "BE row price=42000  →  TanStack rawCombos[i]  →  enriched combo_items[0]={product_id:7f3a.., product_name:'Banh cuon nhan thit', unit_price:25000}",
    fs=10, color=ex.LIGHT, ff=3))
E.append(ex.text(X + 14, ty + 50,
    "  →  Zustand CartItem combo_<id> qty2, combo_items carries each product_id  →  consumed downstream by order-payload.ts",
    fs=10, color=ex.MUTED, ff=3))

ex.append(FP, E)
print(f"PANEL 9: {len(E)} elements")
