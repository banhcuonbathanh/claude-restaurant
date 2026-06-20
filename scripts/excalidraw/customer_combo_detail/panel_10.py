#!/usr/bin/env python3
"""PANEL 10 for customer_combo_detail.excalidraw — Object Lifecycle (moving, dark).
Sourced from SCENARIO_COMBO_ADD.md beats + _loading.md + _crosspage. Per-beat lanes:
Action · cart-store snapshot after · components reacting · TanStack/BE reaction."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_combo_detail/customer_combo_detail.excalidraw"
ex.reset("p10")
E = []

X, Y = 1820, 3100
E += ex.panel_header(X, Y, "PANEL 10 · Object Lifecycle (moving)",
    "the same objects MOVING per scenario beat — items[] goes []→[combo_<id> x2]",
    color=ex.LIGHT, sub_color=ex.MUTED)

cols = ["Action", "cart store snapshot AFTER", "components reacting", "TanStack / BE reaction"]
colx = [X, X + 360, X + 800, X + 1180]
colw = [350, 430, 370, 480]
hy = Y + 56
for c, x, w in zip(cols, colx, colw):
    E.append(ex.rect(x, hy, w, 28, bg=ex.C_VIOLET, stk=ex.C_VIOLET))
    E.append(ex.text(x + 10, hy + 7, c, fs=11, color="#0a0a0a"))

rows = [
 ("0:00 mount /combo/:id", "items: []  (unchanged)", "ComboDetailSkeleton", "['combos']+['products-all'] fetch (5-min cache)"),
 ("0:01 combo resolves", "items: []", "Zones A–E paint; CTA=42.000d", "rawCombos.find(id) + productMap join (read-only)"),
 ("0:08 tap [+]", "items: []  (local qty=2 only)", "CTA total → 84.000d (useState)", "no store / no BE — pure local state"),
 ("0:10 Add to cart", "items: [combo_<id> qty2]", "router.back()→/menu; cart badge", "NO BE write — addItem is client-only"),
 ("F5 before submit", "items: []  (LOST)", "/menu cart empty", "partialize keeps only orderNote/activeOrderId"),
]
yy = hy + 28
for act, snap, comp, react in rows:
    rh = 50
    E.append(ex.rect(colx[0], yy, colw[0], rh, bg=ex.CARD_BG, stk=ex.CARD_STK, sw=1))
    E.append(ex.text(colx[0] + 10, yy + 8, act, fs=10, color=ex.LIGHT, w=colw[0]-20, wrap=True))
    E.append(ex.rect(colx[1], yy, colw[1], rh, bg="#0b1220", stk=ex.C_ZUS, sw=1))
    E.append(ex.text(colx[1] + 10, yy + 8, snap, fs=10, color=ex.C_ZUS, ff=3, w=colw[1]-20, wrap=True))
    E.append(ex.rect(colx[2], yy, colw[2], rh, bg=ex.CARD_BG, stk=ex.C_CYAN, sw=1))
    E.append(ex.text(colx[2] + 10, yy + 8, comp, fs=10, color=ex.LIGHT, w=colw[2]-20, wrap=True))
    E.append(ex.rect(colx[3], yy, colw[3], rh, bg=ex.CARD_BG, stk=ex.C_TAN, sw=1))
    E.append(ex.text(colx[3] + 10, yy + 8, react, fs=10, color=ex.MUTED, w=colw[3]-20, wrap=True))
    yy += rh + 6

ex.append(FP, E)
print(f"PANEL 10: {len(E)} elements")
