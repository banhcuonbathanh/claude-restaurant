#!/usr/bin/env python3
"""PANEL 14 — One Field, All Layers: trace `qty`.
Sourced from favourites.ts:57-60 (updateQty), page.tsx:97-122 (CartItem), order-payload.ts, order_items SQL.
Note: the field crosses the local→BE boundary only at checkout (a different page)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_favourites/customer_favourites.excalidraw"
ex.reset("p14")
E = []

X, Y = 40, 7000
E.append(ex.rect(20, Y - 20, 3400, 900, bg="#0b1220", stk="#0b1220"))
E += ex.panel_header(X, Y, "PANEL 14 · One Field, All Layers — `qty`",
                     "a favourite's quantity, tap → store → resolve → cart line → (checkout) payload → SQL column → read-back",
                     color=ex.LIGHT, sub_color=ex.MUTED)

stages = [
    ("1 · TAP (stepper)", ex.C_CYAN,
     "FavouriteItemCard\nQuantityStepper min=1\nonQtyChange(id, n)"),
    ("2 · Zustand write", ex.C_ZUS,
     "updateQty(id, qty)\nMath.max(1, qty)\nfavourites.ts:57-60\nitems[].qty = 2\n(persisted)"),
    ("3 · resolve", ex.C_TAN,
     "resolvedItems[]\nqty via ...item spread\npage.tsx:59/76\nFavouriteItemResolved.qty"),
    ("4 · CartItem", ex.C_AMBER,
     "handleAddAllToCart\nquantity: item.qty\nid product_A_t1\naddToCart → dedup\nbump (cart.ts:50-59)"),
    ("5 · payload (checkout)", ex.C_VIOLET,
     "lib/order-payload.ts\nat POST /orders submit\nquantity → order item\n(menu/checkout page,\nNOT this suite)"),
    ("6 · SQL column", ex.C_ORD,
     "order_items.quantity\nsnapshot at create\n(BE write — see\ncustomer_menu_be.md)"),
    ("7 · read-back", ex.C_BE,
     "GET /orders/:id\nitem.quantity = 2\nrenders on /order/:id\n(tracking page)"),
]

cy = Y + 70
w = 450
gap = 18
x = 40
for i, (title, accent, body) in enumerate(stages):
    h = 150
    E.append(ex.rect(x, cy, w, h, bg=ex.CARD_BG, stk=accent, sw=2))
    E.append(ex.rect(x, cy, w, 28, bg=accent, stk=accent))
    E.append(ex.text(x + 12, cy + 7, title, fs=12, color=ex.DARK))
    E.append(ex.text(x + 12, cy + 38, body, fs=10, color=ex.LIGHT, ff=3))
    if i < len(stages) - 1:
        E.append(ex.arrow(x + w, cy + h // 2, x + w + gap, cy + h // 2, accent, sw=2))
    x += w + gap

# boundary note
by = cy + 170
E.append(ex.rect(40, by, 3360, 60, bg=ex.CARD_BG, stk=ex.C_RED, sw=2))
E.append(ex.text(54, by + 10, "LOCAL → BE BOUNDARY:  stages 1-4 are 100% client (localStorage + session cart) on the favourites suite.", fs=11, color=ex.C_RED))
E.append(ex.text(54, by + 32, "qty only crosses to the backend at checkout (stage 5+, a DIFFERENT page) — the favourites suite itself issues zero writes.", fs=10, color=ex.MUTED, ff=3))

ex.append(FP, E)
print(f"PANEL 14: {len(E)} elements")
