#!/usr/bin/env python3
"""PANEL 7 for customer_combo_detail.excalidraw — Scenario Timeline.
Sourced from SCENARIO_COMBO_ADD.md (Linh @ table 4, T0:00→0:11)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_combo_detail/customer_combo_detail.excalidraw"
ex.reset("p7")
E = []

X, Y = 2300, 1140
E += ex.panel_header(X, Y, "PANEL 7 · Scenario — Add a Combo",
    "Linh @ table 4 · read-only-on-BE: 2 cached GETs in, 1 client cart write out · from SCENARIO_COMBO_ADD.md")

cy = Y + 60
# cast
E.append(ex.rect(X, cy, 1000, 56, bg=ex.L_INDIGO, stk=ex.L_BORDER, sw=1))
E.append(ex.text(X + 12, cy + 9,
    "Cast: Linh (guest, table 4, phone) · \"Combo Day Dan\" is_available=1, 42.000d (banh cuon thit + canh moc + tra da)",
    fs=10, color=ex.SUB))
E.append(ex.text(X + 12, cy + 32, "Cart store: Zustand, in-memory items[] (session-only)", fs=10, color=ex.SUB))

# timeline
ty = cy + 72
beats = [
 ("0:00", "Tap combo card", "Navigate /menu/combo/:id. (shop) shell already painted."),
 ("0:00", "Skeleton  (loading)", "Fires GET /combos + GET /products. combos.isLoading → <ComboDetailSkeleton/>."),
 ("0:01", "Combo resolves", "combos warm (combos:list ~instant). rawCombos.find(id) hits; products join fills names/prices. Zones A–E paint."),
 ("0:05", "Read \"Gom co\"", "Zone C: x1 Banh cuon nhan thit · x1 Canh moc · x1 Tra da."),
 ("0:08", "Bump quantity", "[+] → qty=2. CTA total live = combo.price*qty = 84.000d. Pure useState (page.tsx:15)."),
 ("0:10", "Add to cart  (handoff)", "addItem one combo CartItem (combo_<id>, qty2, combo_items[] w/ product_id) → router.back() → /menu."),
 ("0:11", "Back on /menu", "Cart badge reflects combo. Submits whole cart later from /menu (or /checkout)."),
]
yy = ty
for t, title, desc in beats:
    E.append(ex.rect(X, yy, 1000, 50, bg="#ffffff", stk=ex.L_BORDER, sw=1))
    E += ex.badge(X + 8, yy + 9, t, ex.C_VIOLET)
    E.append(ex.text(X + 76, yy + 7, title, fs=11, color=ex.L_TEXT))
    E.append(ex.text(X + 76, yy + 27, desc, fs=9, color=ex.SUB, w=910, wrap=True))
    yy += 56

# mental model
E.append(ex.rect(X, yy + 6, 1000, 50, bg="#f0fdf4", stk=ex.C_TAN, sw=2))
E.append(ex.text(X + 12, yy + 14,
    "Mental model: a read-only catalog leaf — borrows two cached lists, shows one combo;",
    fs=10, color=ex.L_TEXT))
E.append(ex.text(X + 12, yy + 32,
    "its only lasting act is dropping a combo into the (session-only) cart. Real order write happens later, on /menu.",
    fs=10, color=ex.SUB))

ex.append(FP, E)
print(f"PANEL 7: {len(E)} elements")
