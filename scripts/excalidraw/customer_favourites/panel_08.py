#!/usr/bin/env python3
"""PANEL 8 — Flags / Known Mismatches (collected across all docs).
Sourced from _be.md Flags, _loading.md Flags, _crosscomponent §6 gotchas, _crosspage."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_favourites/customer_favourites.excalidraw"
ex.reset("p8")
E = []

X, Y = 40, 3600
E += ex.panel_header(X, Y, "PANEL 8 · Flags / Known Mismatches",
                     "Collected doc-vs-code drift & conventions across the 6-file doc-set · no _BUGS.md — trace found no FE/BE disagreement")

flags = [
    ("be#1 · whole suite is BE-read-only", ex.C_RED,
     "favourites + sets never reach the backend — live in useFavouritesStore (localStorage 'favourites'). No \"save to account\" endpoint. Clearing storage / switching device loses them."),
    ("be#2 · availability inferred, not queried", ex.C_AMBER,
     "page learns a fav is gone only because cached GET /products/combos omits it — no per-id check. Can show stale up to ~10min (TTL 5m + staleTime 5m) before prune."),
    ("be#3 · GET /products ignores all query params", ex.C_SLATE,
     "handler makes zero c.Query calls; suite never sends params anyway → inert here, but it cannot ask BE to filter by topping/availability."),
    ("be#4 · combo product_ids resolved vs products", ex.C_CYAN,
     "GET /combos = ids only; names via the /products join. dead product → 'Món không rõ tên' (list) / raw id (sets) — cosmetic, not a BE error."),
    ("xpage · toppings/qty dropped at toggleFav", ex.C_VIOLET,
     "toggleFav always inserts {qty:1, toppingIds:[]} regardless of menu-card config (favourites.ts:88). list can edit qty after, but topping choice never carried in."),
    ("xcomp · duplicate resolve logic ×3 pages", ex.C_ORD,
     "page.tsx / save / sets all contain functionally identical resolve derivation; sets extracts resolveItems() helper, the other two inline it — code-duplication smell."),
    ("load#1 · empty = loading = error", ex.C_RED,
     "resolvedItems.length===0 true during cold load, genuinely empty, AND fetch error. No spinner / error banner — a network failure is silent (page.tsx:128-129)."),
    ("xcomp · 'Add all' acts on resolvedItems", ex.C_AMBER,
     "filtering to 'Combo' then [Thêm tất cả] still pushes products too — footer acts on the FULL list, filter only gates the view (page.tsx:97-122)."),
    ("xcomp · addSet snapshots, not references", ex.C_ZUS,
     "sets[].items = [...s.items] at save time (favourites.ts:67). edits to items[] after saving don't update existing sets — apply always uses the frozen snapshot."),
    ("load · stale useEffect dep array", ex.C_SLATE,
     "deps = [productsLoaded, combosLoaded] (booleans only). safe (flip once/mount) but stale check won't re-run if catalog changes mid-session without remount (eslint-disable at :49)."),
]

cy = Y + 60
col_w = 945
cols = 3
gap = 14
ch = 96
for i, (title, accent, body) in enumerate(flags):
    col = i % cols
    row = i // cols
    x = 40 + col * (col_w + gap)
    y = cy + row * (ch + gap)
    E.append(ex.rect(x, y, col_w, ch, bg="#ffffff", stk=accent, sw=2))
    E.append(ex.rect(x, y, 8, ch, bg=accent, stk=accent))
    E.append(ex.text(x + 18, y + 8, title, fs=11, color=ex.L_TEXT))
    E.append(ex.text(x + 18, y + 30, body, fs=9, color=ex.SUB, ff=2, w=col_w - 34, wrap=True))

ex.append(FP, E)
print(f"PANEL 8: {len(E)} elements")
