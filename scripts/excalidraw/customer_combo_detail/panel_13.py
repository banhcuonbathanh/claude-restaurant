#!/usr/bin/env python3
"""PANEL 13 for customer_combo_detail.excalidraw — Failure / Edge Map (dark).
Sourced from _be.md Error Behaviour + _loading.md Flags + COMBO_BUGS.md Bugs 1-2 +
_crosspage F5 row."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_combo_detail/customer_combo_detail.excalidraw"
ex.reset("p13")
E = []

X, Y = 1820, 4280
E += ex.panel_header(X, Y, "PANEL 13 · Failure / Edge Map",
    "every unhappy path on a read-only leaf · from _be.md + _loading.md + COMBO_BUGS.md",
    color=ex.LIGHT, sub_color=ex.MUTED)

cy = Y + 56
edges = [
 ("GET /combos network fail", ex.C_RED,
  "isError → \"Khong tim thay combo.\" — SAME block as a bad/stale id. No retry hint (Load Flag 3)."),
 ("id not in list (stale/bad)", ex.C_AMBER,
  "rawCombos.find()→undefined → same not-found block. No BE 404 (no GET /combos/:id)."),
 ("combo is_available=false", ex.C_RED,
  "filtered out by ListCombosAvailable → never on wire → user sees not-found, not \"Het hang\" (BUG 1, dead UI)."),
 ("sub-product unavailable/deleted", ex.C_RED,
  "drops from productMap → name falls back to raw product_id UUID, unit_price undefined (BUG 2). Fix: 'Mon tam het'."),
 ("GET /products fails", ex.C_AMBER,
  "query defaults [] (page.tsx:24) → combo still renders, every sub-item shows UUID + no price (Load Flag 4)."),
 ("Redis down", ex.C_TAN,
  "getCacheJSON/setCacheJSON swallow errors → fall through to MySQL; page survives (BE caching)."),
 ("F5 before submitting on /menu", ex.C_VIOLET,
  "combo cart item LOST — partialize keeps only orderNote/activeOrderId (cart.ts:153). items[] is in-memory."),
]
yy = cy
for title, acc, desc in edges:
    E.append(ex.rect(X, yy, 1880, 50, bg=ex.CARD_BG, stk=acc, sw=2))
    E.append(ex.text(X + 14, yy + 8, title, fs=11, color=ex.LIGHT))
    E.append(ex.text(X + 14, yy + 28, desc, fs=9, color=ex.MUTED, w=1850, wrap=True))
    yy += 58

ex.append(FP, E)
print(f"PANEL 13: {len(E)} elements")
