#!/usr/bin/env python3
"""PANEL 4 for customer_combo_detail.excalidraw — Object Model FE⇄BE⇄DB.
Sourced from customer_combo_detail_be.md (serializer/join) + customer_menu.md §4
(combo two shapes raw wire ⇄ enriched) · page.tsx:30-50."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_combo_detail/customer_combo_detail.excalidraw"
ex.reset("p4")
E = []

X, Y = 1900, 40
E += ex.panel_header(X, Y, "PANEL 4 · Object Model  FE ⇄ BE ⇄ DB",
    "combo: raw wire (ids only) → enriched FE (joined names/prices) · from _be.md + customer_menu.md §4")

def card(x, y, w, h, accent, title, lines):
    E.append(ex.rect(x, y, w, h, bg="#ffffff", stk=accent, sw=2))
    E.append(ex.rect(x, y, w, 28, bg=accent, stk=accent))
    E.append(ex.text(x + 12, y + 7, title, fs=12, color="#0a0a0a"))
    E.append(ex.text(x + 12, y + 40, lines, fs=10, color=ex.SUB, ff=3))

cy = Y + 64
# raw wire
card(X, cy, 560, 220, ex.C_SLATE, "RAW WIRE — GET /combos (ids only)",
    "{ id, name, price, description,\n  image_path, is_available,\n  combo_items: [\n    { id, product_id, quantity }   ← ids only\n  ] }\n\nserializer product_handler.go:333-354\n— NO product name/price on the wire.")
# enriched
card(X + 640, cy, 600, 220, ex.C_TAN, "ENRICHED FE — combo memo (page.tsx:30-50)",
    "{ ...combo,\n  combo_items: [\n    { product_id,\n      product_name: map.get(pid)?.name\n                    ?? product_id,   ← UUID fallback\n      unit_price:   map.get(pid)?.price,\n      quantity } ] }\n\nproductMap built from GET /products (page.tsx:33)")

# pipeline arrows
py = cy + 250
E.append(ex.text(X, py, "READ pipeline", fs=12, color=ex.L_TEXT))
steps = [
 ("MySQL combos + combo_items", ex.C_ORD),
 ("svc ListCombos → enrichCombo (+GetComboItems)", ex.C_BE),
 ("handler serializer (ids only)", ex.C_SLATE),
 ("FE join vs productMap (GET /products)", ex.C_TAN),
 ("render Zone C \"Gom co\"", ex.C_CYAN),
]
sx = X
sy = py + 28
for i, (label, acc) in enumerate(steps):
    w = 230
    E.append(ex.rect(sx, sy, w, 50, bg="#ffffff", stk=acc, sw=2))
    E.append(ex.text(sx + 10, sy + 16, label, fs=9, color=ex.SUB, ff=2, w=w - 20, wrap=True))
    if i < len(steps) - 1:
        E.append(ex.arrow(sx + w, sy + 25, sx + w + 18, sy + 25, stk=ex.MUTED))
    sx += w + 18

ex.append(FP, E)
print(f"PANEL 4: {len(E)} elements")
