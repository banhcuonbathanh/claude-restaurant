#!/usr/bin/env python3
"""PANEL 6 — Loading States.
Sourced from customer_favourites_loading.md (layers, empty/loading/error conflation, state table)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_favourites/customer_favourites.excalidraw"
ex.reset("p6")
E = []

X, Y = 1900, 1100
E += ex.panel_header(X, Y, "PANEL 6 · Loading States",
                     "No skeleton, no spinner, no error banner on any sub-page · cold load = empty = error until both queries resolve")

def box(x, y, w, h, title, lines, accent, fs=10):
    return [ex.rect(x, y, w, h, bg="#ffffff", stk=accent, sw=2),
            ex.rect(x, y, w, 26, bg=accent, stk=accent),
            ex.text(x + 10, y + 6, title, fs=12, color=ex.DARK),
            ex.text(x + 10, y + 34, lines, fs=fs, color=ex.L_TEXT, ff=3)]

cy = Y + 60
E += box(1900, cy, 1080, 96, "Loading layers (outer → inner)",
         "1. route nav   → ShopLoading: centered orange spinner (whole (shop) shell) — loading.tsx:1-7\n"
         "2. page mount  → NO Suspense boundary, NO page-level fallback (no useSearchParams)\n"
         "3. 2 useQuery  → ['products-all'] + ['combos'], both default [] → page renders from store immediately, items pop in silently",
         ex.C_AMBER)

qy = cy + 116
E += box(1900, qy, 1080, 66, "Per-query (all 3 pages, identical)",
         "['products-all'] GET /products  staleTime 5min  default []   ·   ['combos'] GET /combos  staleTime 5min  default []\n"
         "neither destructures isLoading/isFetching/isError — only the list page reads isSuccess (productsLoaded/combosLoaded) for the stale useEffect",
         ex.C_TAN)

ey = qy + 86
E += box(1900, ey, 1080, 110, "⚠ The empty-state conflation (list page)",
         "resolvedItems = flatMap with early-return [] for any id not yet in catalog (page.tsx:52-85)\n"
         "→ while both queries in flight, EVERY stored id resolves to nothing → resolvedItems.length===0 always true\n"
         "→ EmptyState \"Nhấn ♥ trên món ăn bất kỳ để thêm\" shows in 3 identical situations:\n"
         "   1. cold load   2. genuinely empty   3. fetch failed (both → [])  — no spinner, no error to tell them apart",
         ex.C_RED)

sy = ey + 130
E += box(1900, sy, 1080, 200, "State table — what the user sees",
         "phase                         │ /favourites          │ /save                  │ /sets\n"
         "nav in progress               │ orange spinner       │ orange spinner         │ orange spinner\n"
         "mounted, queries in flight    │ EmptyState \"Nhấn ♥\"  │ summary empty, input ok│ SetCard empty-resolved / EmptyState\n"
         "resolved, items present       │ FilterTabs + cards   │ SummaryList populated  │ SetCard populated\n"
         "resolved, no items            │ EmptyState \"Nhấn ♥\"  │ summary empty          │ \"Chưa có set nào\"\n"
         "fetch error (either query)    │ EmptyState — same    │ summary empty          │ resolved empty — no error\n"
         "revisit <5min of menu visit   │ items appear instant │ instant                │ instant (cache hit)\n"
         "\n"
         "gates: save/sets gate on STORE (sets.length / RHF isValid), NOT query state — empty set saveable mid-load",
         ex.C_SLATE, fs=9)

ex.append(FP, E)
print(f"PANEL 6: {len(E)} elements")
