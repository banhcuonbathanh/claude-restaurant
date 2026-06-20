#!/usr/bin/env python3
"""PANEL 1 for customer_combo_detail.excalidraw — Page Wireframe (mobile 420px).
Sourced from docs/system/08_pages/customer/customer_combo_detail/customer_combo_detail.md
(ASCII wireframe + Zones table) · code refs fe/src/app/(shop)/menu/combo/[id]/page.tsx."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_combo_detail/customer_combo_detail.excalidraw"
ex.reset("p1")
E = []

X, Y = 40, 40
E += ex.panel_header(X, Y, "PANEL 1 · Page Wireframe",
    "/menu/combo/:id — full-screen combo view (mobile 420px) · from customer_combo_detail.md")

# phone frame
fx, fy, fw = X, Y + 56, 460
E.append(ex.rect(fx, fy, fw, 880, bg=ex.L_NEUTRAL, stk=ex.L_BORDER, sw=2))

def zone(yy, h, accent, tag, title, lines):
    E.append(ex.rect(fx + 16, yy, fw - 32, h, bg="#ffffff", stk=accent, sw=2))
    E.extend(ex.badge(fx + 26, yy + 10, tag, accent))
    E.append(ex.text(fx + 70, yy + 13, title, fs=13, color=ex.L_TEXT))
    E.append(ex.text(fx + 26, yy + 40, lines, fs=10, color=ex.SUB, ff=2))
    return yy + h + 12

# back bar
E.append(ex.rect(fx + 16, fy + 14, fw - 32, 34, bg="#ffffff", stk=ex.L_BORDER, sw=1))
E.append(ex.text(fx + 28, fy + 22, "[←]  back → /menu   (page.tsx:76-82, outside all branches)",
    fs=10, color=ex.SUB))

yy = fy + 60
yy = zone(yy, 150, ex.C_CYAN, "A", "Hero image",
    "inline next/image — combo image_path\nrenders during every branch except not-found")
yy = zone(yy, 100, ex.C_ORD, "B", "Info",
    "name · price · description\nfrom GET /combos (rawCombos.find by id)")
yy = zone(yy, 150, ex.C_TAN, "C", "\"Gom co\" items list",
    "combo_items[] joined w/ product names via GET /products\nx1 qty badge + name ONLY — no per-item price (page.tsx:141-148)")
yy = zone(yy, 78, ex.C_ZUS, "D", "QuantityStepper (inline)",
    "[-] n [+]  lucide Minus/Plus — local useState (page.tsx:15)")
yy = zone(yy, 78, ex.C_VIOLET, "E", "Sticky CTA footer",
    "[ Them vao gio · 42.000d ]  → useCartStore.addItem\ntotal = combo.price * qty (live)")

# bottom nav
E.append(ex.rect(fx + 16, fy + 800, fw - 32, 40, bg=ex.L_INDIGO, stk=ex.L_BORDER, sw=1))
E.append(ex.text(fx + 28, fy + 812, "[Menu][Don Hang][Yeu Thich][Theo Doi][Cai Dat]  ← ClientBottomNav (shell)",
    fs=10, color=ex.SUB))

ex.save(FP, E)
print(f"PANEL 1: {len(E)} elements")
