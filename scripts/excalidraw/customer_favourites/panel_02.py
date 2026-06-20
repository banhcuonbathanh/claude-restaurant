#!/usr/bin/env python3
"""PANEL 2 — Cross-Component Dataflow (two stores as hubs).
Sourced from customer_favourites_crosscomponent_dataflow.md (§0 picture, §1 cast, §2 stores, §3 selectors)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_favourites/customer_favourites.excalidraw"
ex.reset("p2")
E = []

X, Y = 40, 1100
E += ex.panel_header(X, Y, "PANEL 2 · Cross-Component Dataflow",
                     "Two Zustand stores as hubs · TanStack cache = resolve bridge · presentational leaves hold zero store bindings · no widget→widget arrow")

def box(x, y, w, h, title, lines, accent, fs=10):
    out = [ex.rect(x, y, w, h, bg="#ffffff", stk=accent, sw=2),
           ex.rect(x, y, w, 26, bg=accent, stk=accent),
           ex.text(x + 10, y + 6, title, fs=12, color=ex.DARK)]
    out.append(ex.text(x + 10, y + 34, lines, fs=fs, color=ex.L_TEXT, ff=3))
    return out

cy = Y + 60
# Widgets row (presentational + page orchestrators)
E += box(40, cy, 1660, 90, "WIDGETS (presentational leaves — receive props, emit callbacks · zero store access)",
         "FavouriteItemCard(item,onRemove,onQtyChange) · FavouriteFilterTabs(counts,onChange) · FavouritesFooter(callbacks) · FavouritesSummaryList(items) · SetCard(set,resolvedItems,onApply,onRename,onDelete)",
         ex.C_CYAN, fs=10)

# page orchestrators
py = cy + 110
E += box(40, py, 540, 80, "FavouritesPage (list page.tsx)",
         "owns resolvedItems · filteredItems · counts\nhandleAddAllToCart · stale-removal useEffect", ex.C_ORD)
E += box(600, py, 520, 80, "SaveSetPage (save/page.tsx)",
         "reads items[] · RHF+Zod form\nonSubmit → addSet(name.trim())", ex.C_ORD)
E += box(1140, py, 560, 80, "SetsPage (sets/page.tsx)",
         "reads sets[] · resolveItems() helper\nhandleApplySet · renameSet · deleteSet", ex.C_ORD)

# the two stores (hubs)
sy = py + 130
E += box(40, sy, 820, 150, "useFavouritesStore  (Zustand + persist · key 'favourites')",
         "items: FavouriteItem[]  { id, type, qty(min1), toppingIds[] }\n"
         "sets:  FavouriteSet[]   { id(UUID), name, createdAt, items[] }\n"
         "writes: addItem · removeItem · updateQty(Math.max(1)) ·\n"
         "        addSet(snapshot) · renameSet · deleteSet · toggleFav\n"
         "PERSISTED — whole {items,sets} survives reload  (favourites.ts:43-93)",
         ex.C_ZUS)
E += box(900, sy, 800, 150, "useCartStore  (Zustand · session)  [write target]",
         "addItem(CartItem) → dedup by id (qty bump)   (cart.ts:50-60)\n"
         "itemCount() → Σ quantity (selector)          (cart.ts:125)\n"
         "items[] NOT persisted — session-only         (cart.ts:153)\n"
         "partialize: only { orderNote, activeOrderId } survive reload\n"
         "FavouritesTopNav reads itemCount() → badge",
         ex.C_AMBER)

# resolve bridge (TanStack)
ry = sy + 180
E += box(40, ry, 1660, 86, "TanStack Query  (server cache · the resolve / hydration bridge)",
         "['products-all']  GET /products  staleTime 5min   ·   ['combos']  GET /combos  staleTime 5min   (same keys as /menu → cache hit, no RTT)\n"
         "resolve step (page.tsx:52-85):  items[] IDs  ⨝  catalog  →  FavouriteItemResolved[]   ·   filteredItems = activeTab gate (page-local useState)   ·   counts = derived from resolvedItems",
         ex.C_TAN)

# arrows: widgets <-> page (props down / callbacks up)
E.append(ex.arrow(300, cy + 90, 300, py, ex.C_CYAN, sw=2))           # widgets -> page (callbacks up visually drawn down)
E.append(ex.text(312, cy + 95, "callbacks ↑ / props ↓", fs=9, color=ex.SUB))
# page -> stores (writes)
E.append(ex.arrow(310, py + 80, 310, sy, ex.C_ZUS, sw=2))
E.append(ex.text(322, py + 92, "writes", fs=9, color=ex.SUB))
E.append(ex.arrow(1000, py + 80, 1000, sy, ex.C_AMBER, sw=2))
E.append(ex.text(1012, py + 92, "addToCart", fs=9, color=ex.SUB))
# store -> resolve bridge
E.append(ex.arrow(400, sy + 150, 400, ry, ex.C_TAN, sw=2))
E.append(ex.text(412, sy + 156, "IDs hydrated against catalog", fs=9, color=ex.SUB))

ex.append(FP, E)
print(f"PANEL 2: {len(E)} elements")
