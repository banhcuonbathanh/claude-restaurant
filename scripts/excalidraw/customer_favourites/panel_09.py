#!/usr/bin/env python3
"""PANEL 9 — Live State Objects (real shapes + one concrete example threaded through).
Sourced from _crosscomponent_dataflow.md §2 + favourites.ts:7-28 + cart.ts."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_favourites/customer_favourites.excalidraw"
ex.reset("p9")
E = []

X, Y = 40, 4500
# dark backing panel
E.append(ex.rect(20, Y - 20, 1760, 1140, bg="#0b1220", stk="#0b1220"))
E += ex.panel_header(X, Y, "PANEL 9 · Live State Objects",
                     "the REAL shapes + ONE example (product-A qty2 + combo-B) threaded: store → resolve → cart",
                     color=ex.LIGHT, sub_color=ex.MUTED)

cy = Y + 60
els, h1 = ex.card(40, cy, 820, ex.C_ZUS, "useFavouritesStore  (persisted 'favourites')",
    "FavouriteItem  (favourites.ts:7-12)\n"
    "  { id, type:'product'|'combo', qty(min1), toppingIds:[] }\n"
    "FavouriteSet   (favourites.ts:14-19)\n"
    "  { id:UUID, name, createdAt:ISO, items: FavouriteItem[] }\n"
    "\n"
    "EXAMPLE items[]:\n"
    "  { id:'A', type:'product', qty:2, toppingIds:['t1'] }\n"
    "  { id:'B', type:'combo',   qty:1, toppingIds:[]      }\n"
    "sets[]: [{ id:'s1', name:'Bữa sáng', items:[…] }]")
E += els

els, h2 = ex.card(900, cy, 860, ex.C_TAN, "TanStack cache  (the resolve bridge)",
    "['products-all'] = Product[]   ['combos'] = Combo[]\n"
    "  Product { id, name, basePrice, imageUrl, toppings[] }\n"
    "  Combo   { id, name, basePrice, combo_items:[{id,product_id,qty}] }\n"
    "\n"
    "resolve (page.tsx:52-85) → FavouriteItemResolved (favourites.ts:21-28)\n"
    "  product: name,imageUrl,basePrice,selectedToppings(by toppingIds),\n"
    "           subtotalPerPortion = basePrice + Σ topping.price\n"
    "  combo:   name,imageUrl,basePrice,comboItems(names via product lookup),\n"
    "           subtotalPerPortion = basePrice  (selectedToppings:[])")
E += els

cy2 = cy + max(h1, h2) + 30
els, h3 = ex.card(40, cy2, 820, ex.C_AMBER, "useCartStore  (session — write target)",
    "CartItem (built inline at page.tsx:99-119)\n"
    "  product: id:'product_A_t1', type:'product', product_id:'A',\n"
    "           name, quantity:2, price:subtotalPerPortion,\n"
    "           toppings:[{id,name,price,is_available:true}]\n"
    "  combo:   id:'combo_B', type:'combo', combo_id:'B',\n"
    "           name, quantity:1, price:basePrice, toppings:[]\n"
    "itemCount() → Σ quantity = 3   ·   items[] NOT persisted")
E += els

els, h4 = ex.card(900, cy2, 860, ex.C_SLATE, "Three state layers — what belongs where",
    "saved IDs/qty/toppingIds  → client persisted  useFavouritesStore\n"
    "named sets (snapshots)     → client persisted  useFavouritesStore.sets\n"
    "active filter tab          → local useState     page.tsx\n"
    "SetCard rename in-progress → local useState     SetCard.tsx\n"
    "catalog (product/combo)    → server  TanStack ['products-all']/['combos']\n"
    "cart lines                 → client session     useCartStore.items[]")
E += els

ex.append(FP, E)
print(f"PANEL 9: {len(E)} elements")
