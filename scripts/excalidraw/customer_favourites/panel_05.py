#!/usr/bin/env python3
"""PANEL 5 — Cross-Page Dataflow (consumer ↔ producer).
Sourced from customer_favourites_crosspage_dataflow.md (state vehicles, inbound, outbound, durability)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_favourites/customer_favourites.excalidraw"
ex.reset("p5")
E = []

X, Y = 40, 2400
E += ex.panel_header(X, Y, "PANEL 5 · Cross-Page Dataflow",
                     "Owns no server state — CONSUMER of /menu heart toggles, PRODUCER of a filled cart → order pipeline · two stores, one persisted one not")

def box(x, y, w, h, title, lines, accent, fs=10):
    return [ex.rect(x, y, w, h, bg="#ffffff", stk=accent, sw=2),
            ex.rect(x, y, w, 26, bg=accent, stk=accent),
            ex.text(x + 10, y + 6, title, fs=12, color=ex.DARK),
            ex.text(x + 10, y + 34, lines, fs=fs, color=ex.L_TEXT, ff=3)]

cy = Y + 60
# inbound
E += box(40, cy, 700, 120, "INBOUND — favourites suite as CONSUMER",
         "no favourites page creates a favourite — heart toggled elsewhere:\n"
         "/menu ProductCard.tsx:70  → toggleFav(id,'product')\n"
         "/menu ComboCard.tsx:95    → toggleFav(id,'combo')\n"
         "/menu FavouritesRail.tsx:36,47 → toggleFav\n"
         "⚠ toggleFav inserts {qty:1, toppingIds:[]} — drops menu config",
         ex.C_VIOLET)

# the suite (middle)
E += box(800, cy, 480, 120, "THIS SUITE (reads store back)",
         "/menu/favourites   (list)\n/menu/favourites/save\n/menu/favourites/sets\n\nre-reads useFavouritesStore on each mount\n(no URL params between routes)",
         ex.C_ORD)

# outbound
E += box(1340, cy, 660, 120, "OUTBOUND — favourites suite as PRODUCER",
         "handleAddAllToCart (page.tsx:97-122) → addToCart × N\n"
         "handleApplySet     (sets:72-98)      → addToCart × set\n"
         "addSet (save:73-75) → snapshot items[] → sets[] (persisted)\n"
         "→ cart → /menu TableConfirmModal / checkout → POST /orders\n"
         "(normalised by lib/order-payload.ts at submit)",
         ex.C_TAN)

E.append(ex.arrow(740, cy + 60, 800, cy + 60, ex.C_VIOLET, sw=2))
E.append(ex.arrow(1280, cy + 60, 1340, cy + 60, ex.C_TAN, sw=2))

# durability matrix
dy = cy + 150
E += box(40, dy, 1960, 120, "Durability matrix — survives F5?",
         "store                 │ persist key                  │ persisted across sessions?            │ role here\n"
         "useFavouritesStore    │ 'favourites'                 │ YES — whole {items,sets} tree         │ own data (written upstream on /menu)\n"
         "useCartStore          │ 'cart-config-v3'             │ config YES · items[] NO (session-only)│ hand-off target (this page pushes in)\n"
         "⇒ a saved favourite/set survives a browser restart; the cart it fills does NOT — re-applying a set after restart is expected",
         ex.C_SLATE)

# cross-page concerns
ny = dy + 150
E += box(40, ny, 1960, 86, "Cross-page concerns",
         "• stale-favourite prune = side effect of catalog reads, not a push: admin deletes product → pruned from a guest's favourites only after that guest reopens list + 5-min TTL refreshes (pull+TTL, no push)\n"
         "• cart is shared mutable state: \"Add all\"/\"apply set\" APPENDS — applying two sets gives both (addItem additive)",
         ex.C_RED)

ex.append(FP, E)
print(f"PANEL 5: {len(E)} elements")
