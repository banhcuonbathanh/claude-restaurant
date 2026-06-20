#!/usr/bin/env python3
"""PANEL 6 for customer_combo_detail.excalidraw — Loading States.
Sourced from customer_combo_detail_loading.md · page.tsx queries :18-28,
branches :84-95, skeleton :194-217."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_combo_detail/customer_combo_detail.excalidraw"
ex.reset("p6")
E = []

X, Y = 1700, 1140
E += ex.panel_header(X, Y, "PANEL 6 · Loading States",
    "no loading.tsx, no Suspense — gate on combos.isLoading only · from customer_combo_detail_loading.md")

cy = Y + 60
# layers
E.append(ex.rect(X, cy, 460, 150, bg="#ffffff", stk=ex.C_AMBER, sw=2))
E.append(ex.text(X + 12, cy + 10, "Loading layers (outer → inner)", fs=12, color=ex.L_TEXT))
E.append(ex.text(X + 12, cy + 38,
    "1. Route spinner — NONE (no loading.tsx in\n   menu/ menu/combo/ menu/combo/[id]/).\n2. No <Suspense> — client comp ('use client').\n3. Per-query state (only real layer):\n   • combos  :18-22 → isLoading = THE GATE\n   • products :24-28 → only data ([]), ungated",
    fs=10, color=ex.SUB, ff=2))

# branch tree
by = cy + 174
E.append(ex.text(X, by, "Main content branch (page.tsx:84-95, in order)", fs=12, color=ex.L_TEXT))
branches = [
 ("1  combos isLoading", ex.C_AMBER, "→ <ComboDetailSkeleton /> (:194-217)\n  hero + title + price + 3 item rows · no layout shift"),
 ("2  isError OR (loaded & !combo)", ex.C_RED, "→ \"Khong tim thay combo.\" (:86-93)\n  TWO causes collapse: net-fail + empty find()"),
 ("3  combo resolved", ex.C_TAN, "→ full page Zones A–E (:95-189)"),
]
yy = by + 28
for label, acc, desc in branches:
    E.append(ex.rect(X, yy, 460, 58, bg="#ffffff", stk=acc, sw=2))
    E.append(ex.text(X + 12, yy + 8, label, fs=11, color=ex.L_TEXT))
    E.append(ex.text(X + 12, yy + 28, desc, fs=9, color=ex.SUB, ff=2))
    yy += 70

# flash callout
fy = yy + 6
E.append(ex.rect(X, fy, 460, 90, bg="#fff7ed", stk=ex.C_ORD, sw=2))
E.append(ex.text(X + 12, fy + 8, "The cross-query flash", fs=12, color=ex.L_TEXT))
E.append(ex.text(X + 12, fy + 30,
    "products ungated → if combos resolves first,\nZone C renders sub-items as raw product_id UUID\nfor one render, then snaps to real name (page.tsx:45).\nInvisible on warm cache, visible on cold deep-link.",
    fs=9, color=ex.SUB))
E.append(ex.text(X + 12, fy + 84, "Back button rendered OUTSIDE all branches (page.tsx:76-82).",
    fs=9, color=ex.C_VIOLET))

ex.append(FP, E)
print(f"PANEL 6: {len(E)} elements")
