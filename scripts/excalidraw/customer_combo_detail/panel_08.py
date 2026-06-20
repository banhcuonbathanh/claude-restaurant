#!/usr/bin/env python3
"""PANEL 8 for customer_combo_detail.excalidraw — Flags / Known Mismatches.
Collected from _be.md Flags 1-5, _loading.md Flags 1-4, _crosspage drift note,
COMBO_BUGS.md Bugs 1-2."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_combo_detail/customer_combo_detail.excalidraw"
ex.reset("p8")
E = []

X, Y = 40, 2200
E += ex.panel_header(X, Y, "PANEL 8 · Flags / Known Mismatches",
    "doc-vs-code drift + dead UI paths collected across the whole doc-set")

ty = Y + 56
E.append(ex.rect(X, ty, 1820, 28, bg=ex.L_ORANGE, stk=ex.L_BORDER, sw=1))
E.append(ex.text(X + 12, ty + 7, "Source        Flag                                       Detail",
    fs=10, color=ex.L_TEXT, ff=3))
flags = [
 ("BE 1", ex.C_ORD, "Over-fetch whole catalog (no :id)", "deep-link pays for full /combos + /products on every cold load (page.tsx:31)."),
 ("BE 2", ex.C_ORD, "Item names/prices joined FE-side", "/combos sends ids only; join vs /products — two independently-stale 5-min queries."),
 ("BE 3", ex.C_RED, "Unavailable-combo UI unreachable", "ListCombosAvailable filters is_available=1 → badge + disabled CTA never fire (Bug 1)."),
 ("BE 4", ex.C_RED, "Unavailable sub-product → UUID name", "missing from productMap → falls back to raw product_id (page.tsx:45) (Bug 2)."),
 ("BE 5", ex.C_VIOLET, "Page issues no authed/write request", "add-to-cart is pure client state; POST /orders happens later on /menu."),
 ("Load 3", ex.C_RED, "Error & not-found indistinguishable", "flaky network + bad/stale id both render \"Khong tim thay combo.\" — no retry hint."),
 ("Load 4", ex.C_AMBER, "products failure is silent", "defaults [] (page.tsx:24) → combo renders but every sub-item shows UUID, no price."),
 ("Drift", ex.C_AMBER, "key 'cart-config-v3' vs version:5", "storage-keys.ts:6 literal vs cart.ts:129 persist version — harmless mismatch."),
]
yy = ty + 28
for src, acc, flag, detail in flags:
    E.append(ex.rect(X, yy, 1820, 30, bg="#ffffff", stk=ex.L_BORDER, sw=1))
    E += ex.badge(X + 8, yy + 7, src, acc)
    E.append(ex.text(X + 86, yy + 8, flag, fs=11, color=ex.L_TEXT))
    E.append(ex.text(X + 560, yy + 9, detail, fs=9, color=ex.SUB))
    yy += 32

ex.append(FP, E)
print(f"PANEL 8: {len(E)} elements")
