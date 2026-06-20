#!/usr/bin/env python3
"""PANEL 7 — Scenario Timeline (Chị Lan re-orders 'the usual').
Sourced from SCENARIO_FAVOURITES.md (5 beats)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_favourites/customer_favourites.excalidraw"
ex.reset("p7")
E = []

X, Y = 1900, 1730
E += ex.panel_header(X, Y, "PANEL 7 · Scenario Timeline",
                     "Chị Lan, a regular, re-orders last week's hearted meal without hunting the menu")

beats = [
    ("Beat 1 · opens Favourites", ex.C_TAN,
     "taps [Yêu Thích] → /menu/favourites. 2 queries fire (['products-all'],['combos']).\nCame from /menu <5min → served from TanStack cache: no RTT, no spinner. 3 hearts resolve to cards (each qty1, no toppings — toggleFav default). Bumps bánh cuốn ×2 via stepper (updateQty)."),
    ("Beat 2 · one item gone (silent prune)", ex.C_RED,
     "a hearted dish was removed from the menu → absent from GET /products payload.\nresolvedItems drops it (if(!p)return[]); mount useEffect (runs once both loaded) → removeItem + toast \"Một số món không còn phục vụ…\". No BE call drove it — pull + 5-min TTL."),
    ("Beat 3 · bulk-adds to cart", ex.C_AMBER,
     "taps [Thêm tất cả vào giỏ] → handleAddAllToCart. each resolved fav → CartItem\n(product_<id>_<toppings> / combo_<id>) → addToCart. additive (keeps existing). cart items[] session-only — fine, checking out now. badge updates."),
    ("Beat 4 · saves a set (optional)", ex.C_ZUS,
     "taps [Lưu bộ] → /save. types \"Bữa sáng quen\" (RHF+Zod name min1) → [Lưu set này]\n→ addSet snapshots items[] into sets[] — PERSISTED → router.push('/sets'). next visit: SetCard [Thêm vào giỏ] re-applies whole set in one tap."),
    ("Beat 5 · hand-off to order pipeline", ex.C_VIOLET,
     "suite's job ends at the cart. opens cart on /menu, confirms table in TableConfirmModal,\ncart normalised by lib/order-payload.ts → single POST /orders. snapshot/combo-expand/one-active-order rule = NOT this page's concern (see customer_menu_be.md)."),
]

cy = Y + 60
w = 1280
for title, accent, body in beats:
    h = 88
    E.append(ex.rect(X, cy, w, h, bg="#ffffff", stk=accent, sw=2))
    E.append(ex.rect(X, cy, 8, h, bg=accent, stk=accent))
    E.append(ex.text(X + 18, cy + 8, title, fs=12, color=ex.L_TEXT))
    E.append(ex.text(X + 18, cy + 30, body, fs=9, color=ex.SUB, ff=3))
    cy += h + 10

E.append(ex.rect(X, cy, w, 70, bg=ex.L_INDIGO, stk=ex.L_BORDER, sw=1))
E.append(ex.text(X + 14, cy + 8, "Proves:  only 2 public reads, ZERO writes — every \"action\" (heart, save set, add to cart) is local store state.", fs=10, color=ex.L_TEXT))
E.append(ex.text(X + 14, cy + 28, "Freshness bounded by the shared 5-min catalog cache, not any favourites-specific call.", fs=10, color=ex.L_TEXT))
E.append(ex.text(X + 14, cy + 48, "It is a BRIDGE: consumes heart toggles from /menu, produces a cart for /checkout.", fs=10, color=ex.L_TEXT))

ex.append(FP, E)
print(f"PANEL 7: {len(E)} elements")
