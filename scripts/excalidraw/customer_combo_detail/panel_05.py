#!/usr/bin/env python3
"""PANEL 5 for customer_combo_detail.excalidraw — Cross-Page Dataflow.
Sourced from customer_combo_detail_crosspage_dataflow.md · code: page.tsx:58-71,
cart.ts (partialize:153), storage-keys.ts:6, order-payload.ts:27-58."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_combo_detail/customer_combo_detail.excalidraw"
ex.reset("p5")
E = []

X, Y = 40, 1140
E += ex.panel_header(X, Y, "PANEL 5 · Cross-Page Dataflow",
    "only handoff = ONE combo cart item (session-only) → cart→order pipeline · from _crosspage_dataflow.md")

cy = Y + 60
# this page
E.append(ex.rect(X, cy, 360, 160, bg="#ffffff", stk=ex.C_VIOLET, sw=2))
E.append(ex.text(X + 12, cy + 10, "/menu/combo/:id  (this page)", fs=12, color=ex.L_TEXT))
E.append(ex.text(X + 12, cy + 38,
    "handleAddToCart() (page.tsx:58-71)\n └ useCartStore.addItem({\n     id: combo_<id>, type:'combo',\n     combo_id, qty, price,\n     combo_items:[{product_id,\n       product_name, qty, unit_price}] })\n └ router.back() → /menu",
    fs=9, color=ex.SUB, ff=3))
E.append(ex.text(X + 12, cy + 168, "(no BE write on this page)", fs=10, color=ex.C_RED))

# browser hub
hx = X + 460
E.append(ex.rect(hx, cy, 420, 200, bg=ex.L_INDIGO, stk=ex.C_ZUS, sw=2))
E.append(ex.text(hx + 12, cy + 10, "BROWSER HUB — cart store (Zustand)", fs=12, color=ex.L_TEXT))
E.append(ex.text(hx + 12, cy + 38,
    "items[]      ← session-only (NOT persisted)\n             dies on F5\n\norderNote }\nactiveOrderId } ─persist→ localStorage\n               'cart-config-v3'\n               (partialize cart.ts:153)",
    fs=10, color=ex.SUB, ff=3))
E.append(ex.arrow(X + 360, cy + 80, hx, cy + 80, stk=ex.C_ZUS))

# downstream
dx = hx + 520
E.append(ex.rect(dx, cy, 520, 130, bg="#ffffff", stk=ex.C_ORD, sw=2))
E.append(ex.text(dx + 12, cy + 10, "DOWNSTREAM (not on this page) → SERVER", fs=12, color=ex.L_TEXT))
E.append(ex.text(dx + 12, cy + 38,
    "/menu CartDrawer ─ buildOrderItemsPayload()\n  (order-payload.ts:27-58)  ─▶ POST /orders ─▶ MySQL\n/checkout (online) ───── same builder ──▶ POST /orders\nBE expands combo: header unit_price=0 + sub-item rows",
    fs=9, color=ex.SUB, ff=3))
E.append(ex.arrow(hx + 420, cy + 90, dx, cy + 60, stk=ex.MUTED))

# durability matrix
my = cy + 230
E.append(ex.text(X, my, "Durability matrix", fs=12, color=ex.L_TEXT))
hdr = "Data                          nav→/menu   F5    tab close"
E.append(ex.rect(X, my + 24, 920, 26, bg=ex.L_ORANGE, stk=ex.L_BORDER, sw=1))
E.append(ex.text(X + 12, my + 31, hdr, fs=10, color=ex.L_TEXT, ff=3))
mrows = [
 "Combo cart item (combo_<id>) memory   ✅          ❌     ❌",
 "orderNote / activeOrderId  localStorage ✅         ✅     ✅",
 "Combo catalog (TanStack cache)         ✅       re-fetch  ❌",
]
for i, r in enumerate(mrows):
    yy = my + 50 + i * 26
    E.append(ex.rect(X, yy, 920, 26, bg="#ffffff", stk=ex.L_BORDER, sw=1))
    E.append(ex.text(X + 12, yy + 7, r, fs=10, color=ex.SUB, ff=3))

# drift note
dyy = my + 50 + len(mrows) * 26 + 12
E.append(ex.rect(X, dyy, 920, 44, bg="#fffbeb", stk=ex.C_AMBER, sw=2))
E.append(ex.text(X + 12, dyy + 8,
    "⚠ Drift: storage key literal 'cart-config-v3' (storage-keys.ts:6) vs persist version:5 (cart.ts:129)",
    fs=10, color=ex.L_TEXT))
E.append(ex.text(X + 12, dyy + 26, "— harmless but mismatched; 'v3' is now a frozen literal, not the live schema version.",
    fs=9, color=ex.SUB))

ex.append(FP, E)
print(f"PANEL 5: {len(E)} elements")
