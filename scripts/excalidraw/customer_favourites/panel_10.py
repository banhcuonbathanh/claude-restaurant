#!/usr/bin/env python3
"""PANEL 10 — Object Lifecycle (moving): per-beat store snapshots.
Sourced from _crosscomponent_dataflow.md §3 (Step 1-5 STORE SNAPSHOT blocks) + §7 sequence."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_favourites/customer_favourites.excalidraw"
ex.reset("p10")
E = []

X, Y = 1900, 4500
E.append(ex.rect(1880, Y - 20, 1540, 1140, bg="#0b1220", stk="#0b1220"))
E += ex.panel_header(X, Y, "PANEL 10 · Object Lifecycle (moving)",
                     "same objects, per-beat lanes: ACTION · store-snapshot-after (← what changed) · who reacts",
                     color=ex.LIGHT, sub_color=ex.MUTED)

steps = [
    ("STEP 1 · mount", ex.C_ZUS,
     "items[] loaded from localStorage:\n A{qty2,t1} · B(combo,qty1) · sets:[s1]\n→ fires ['products-all']+['combos'] (cache hit if from /menu)"),
    ("STEP 2 · stale useEffect", ex.C_RED,
     "both loaded → filter items not in catalog →\n removeItem(stale) + toast → resolvedItems shrinks\n→ FilterTabs counts update (no prop-passing)"),
    ("STEP 3 · resolve", ex.C_TAN,
     "items[] ⨝ catalog → FavouriteItemResolved[]\n product: subtotal=base+Σtopping · combo: subtotal=base\n flatMap drops any unresolved id"),
    ("STEP 4 · qty+ on a card", ex.C_AMBER,
     "onQtyChange → updateQty(id,n) Math.max(1,n)\n store items[] mutates → resolvedItems re-derives\n qty propagates via ...item spread"),
    ("STEP 5 · Thêm tất cả vào giỏ", ex.C_ORD,
     "handleAddAllToCart: forEach resolvedItems → CartItem\n → addToCart × N (product_A_t1, combo_B)\n cart itemCount() → 3 → TopNav badge '3'"),
    ("AFTER · favourites unchanged", ex.C_SLATE,
     "useCartStore.items = [product_A_t1 q2, combo_B q1]  (in-mem)\n useFavouritesStore UNCHANGED — cart push doesn't touch it\n (set push via SetCard handleApplySet = identical valve)"),
]

cy = Y + 60
for title, accent, body in steps:
    els, h = ex.card(1900, cy, 1480, accent, title, body, fs=10)
    E += els
    cy += h + 14

ex.append(FP, E)
print(f"PANEL 10: {len(E)} elements")
