#!/usr/bin/env python3
"""PANEL 11 for customer_combo_detail.excalidraw — DB Row-Level View (dark).
Sourced from be/migrations/004_combos.sql + _be.md queries (ListCombosAvailable,
ListProductsAvailable). Downstream order_items write shown as 'later, not here'."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_combo_detail/customer_combo_detail.excalidraw"
ex.reset("p11")
E = []

X, Y = 40, 4280
E += ex.panel_header(X, Y, "PANEL 11 · DB Row-Level View",
    "the actual rows this READ-ONLY page touches (004_combos.sql) + the is_available filter (root of Bugs 1 & 2)",
    color=ex.LIGHT, sub_color=ex.MUTED)

cy = Y + 60
els, h1 = ex.card(X, cy, 540, ex.C_ORD, "combos  (READ via GET /combos)",
    "id          CHAR(36) PK\nname        VARCHAR(150)\nprice       DECIMAL(10,0)   42000\nimage_path  VARCHAR(500)\nis_available TINYINT(1)     ← filter\nsort_order  INT\ndeleted_at  DATETIME NULL  ← filter")
E += els
els, h2 = ex.card(X + 580, cy, 540, ex.C_TAN, "combo_items  (static template)",
    "id          CHAR(36) PK\ncombo_id    CHAR(36) FK→combos\nproduct_id  CHAR(36) FK→products\nquantity    INT  CHECK (>0)\n\n-- ids only on the wire; FE joins\n-- product_id → products for name/price")
E += els
els, h3 = ex.card(X + 1160, cy, 540, ex.C_SLATE, "products  (READ via GET /products)",
    "id          CHAR(36) PK\nname        VARCHAR  → display name\nprice       DECIMAL  → unit_price\nis_available TINYINT(1)     ← filter\ndeleted_at  DATETIME NULL  ← filter\n\n-- only id,name,price read here\n-- → productMap (page.tsx:33)")
E += els

# filter callout
fy = cy + max(h1, h2, h3) + 18
E.append(ex.rect(X, fy, 1700, 56, bg="#1a0f0f", stk=ex.C_RED, sw=2))
E.append(ex.text(X + 14, fy + 9,
    "Both queries: WHERE is_available = 1 AND deleted_at IS NULL  (products.sql.go:387 combos · :469 products)",
    fs=11, color=ex.C_RED, ff=3))
E.append(ex.text(X + 14, fy + 32,
    "→ unavailable combo never reaches wire (Bug 1, dead UI) · unavailable sub-product drops from productMap → UUID shown (Bug 2)",
    fs=10, color=ex.MUTED))

# downstream write note
wy = fy + 76
els, hw = ex.card(X, wy, 1700, ex.C_VIOLET, "order_items  —  WRITTEN LATER on /menu, NOT by this page",
    "BE expands the combo at order time (005_orders.sql + migration 016 filling col):\n"
    "  • header line:  combo_ref_id set, product_id=combo_id, unit_price = 0\n"
    "  • sub-item rows: one per combo_item, product_id + priced unit_price + filling (thit/moc_nhi/NULL)\n"
    "Rule: BUSINESS_RULES.md §2.5 Combo Expansion · this page only PRODUCES the cart input, never writes.")
E += els

ex.append(FP, E)
print(f"PANEL 11: {len(E)} elements")
