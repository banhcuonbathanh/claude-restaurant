#!/usr/bin/env python3
"""PANEL 11 — Storage Row-Level View (reframed: NO favourites DB table).
Sourced from _be.md (read tables) + favourites.ts persistence + storage-keys.ts."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_favourites/customer_favourites.excalidraw"
ex.reset("p11")
E = []

X, Y = 40, 5800
E.append(ex.rect(20, Y - 20, 1760, 1020, bg="#0b1220", stk="#0b1220"))
E += ex.panel_header(X, Y, "PANEL 11 · Storage Row-Level View",
                     "this page writes NO DB rows — its persistence is localStorage; it only READS catalog tables",
                     color=ex.LIGHT, sub_color=ex.MUTED)

cy = Y + 60
els, h1 = ex.card(40, cy, 820, ex.C_ZUS, "localStorage['favourites']  (the real persistence)",
    "{\n"
    "  state: {\n"
    "    items: [\n"
    "      { id:'A', type:'product', qty:2, toppingIds:['t1'] },\n"
    "      { id:'B', type:'combo',   qty:1, toppingIds:[]      }\n"
    "    ],\n"
    "    sets: [ { id:'s1', name:'Bữa sáng',\n"
    "              createdAt:'2026-…', items:[…] } ]\n"
    "  }, version: N\n"
    "}\n"
    "→ NO server row · clearing storage / new device loses it")
E += els

els, h2 = ex.card(900, cy, 860, ex.C_TAN, "Catalog tables READ by resolve (no writes)",
    "products            (GET /products · is_available=1, not soft-deleted)\n"
    "  id · name · base_price · image_url · is_available\n"
    "product_toppings    (GetToppingsByProductID per product)\n"
    "  product_id · topping_id · price\n"
    "combos              (GET /combos · ListCombosAvailable)\n"
    "  id · name · base_price · image_url\n"
    "combo_items         (GetComboItems per combo)\n"
    "  combo_id · product_id · quantity   ← ids only\n"
    "\n"
    "favourite gone ⇔ its id absent from these payloads (auto-prune)")
E += els

cy2 = cy + max(h1, h2) + 30
E.append(ex.rect(40, cy2, 1720, 70, bg=ex.CARD_BG, stk=ex.C_RED, sw=2))
E.append(ex.text(54, cy2 + 12, "KEY INSIGHT — there is NO `favourites` / `favourite_sets` table and no migration.", fs=12, color=ex.C_RED))
E.append(ex.text(54, cy2 + 36, "The favourites suite is 100% client-persisted (localStorage 'favourites'); the DB only ever serves the cached catalog reads it shares with /menu.", fs=10, color=ex.MUTED, ff=3))

ex.append(FP, E)
print(f"PANEL 11: {len(E)} elements")
