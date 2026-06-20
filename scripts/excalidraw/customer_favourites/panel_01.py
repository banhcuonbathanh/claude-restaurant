#!/usr/bin/env python3
"""PANEL 1 for customer_favourites.excalidraw — Page Wireframe (3 sub-pages).
Sourced from docs/system/08_pages/customer/customer_favourites/customer_favourites.md (ASCII Wireframes + Zones)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_favourites/customer_favourites.excalidraw"
ex.reset("p1")
E = []

X, Y = 40, 40
E += ex.panel_header(X, Y, "PANEL 1 · Page Wireframe",
                     "Favourites suite — 3 mobile sub-pages (420px) · list · save · sets · shared ClientBottomNav (Yêu Thích active)")

def phone(px, py, title, route, zones, footer=None):
    out = []
    W, H = 440, 660
    out.append(ex.rect(px, py, W, H, bg=ex.L_NEUTRAL, stk=ex.L_BORDER, sw=2))
    # title bar
    out.append(ex.rect(px, py, W, 38, bg=ex.L_ORANGE, stk=ex.L_BORDER, sw=1))
    out.append(ex.text(px + 12, py + 11, title, fs=14, color=ex.L_TEXT))
    out.append(ex.text(px + W - 200, py + 13, route, fs=10, color=ex.SUB, ff=3))
    zy = py + 50
    for label, src in zones:
        h = 56
        out.append(ex.rect(px + 10, zy, W - 20, h, bg="#ffffff", stk=ex.L_BORDER, sw=1))
        out.append(ex.text(px + 20, zy + 8, label, fs=12, color=ex.L_TEXT))
        out.append(ex.text(px + 20, zy + 30, src, fs=9, color=ex.SUB, ff=3))
        zy += h + 8
    if footer:
        out.append(ex.rect(px + 10, py + H - 56, W - 20, 44, bg="#fff1e6", stk=ex.C_ORD, sw=2))
        out.append(ex.text(px + 22, py + H - 42, footer, fs=11, color=ex.L_TEXT))
    return out

PY = Y + 70
# ── list page
E += phone(40, PY, "Yêu Thích", "/menu/favourites", [
    ("TopNav · [←] Yêu Thích  [Lưu bộ]  🛒badge", "FavouritesTopNav · cart badge ← useCartStore"),
    ("Filter tabs [Tất cả][Món][Combo]", "FavouriteFilterTabs · counts ← resolvedItems"),
    ("♥ FavouriteItemCard × N  [+ Giỏ] [stepper]", "useFavouritesStore.items ⨝ GET /products+/combos"),
    ("(empty) EmptyState ♡", "\"Nhấn ♥ trên món ăn bất kỳ để thêm\""),
], footer="[ Thêm tất cả vào giỏ ]  → handleAddAllToCart")

# ── save page
E += phone(540, PY, "Lưu bộ yêu thích", "/menu/favourites/save", [
    ("ZB · Tên bộ: [____________]", "RHF + Zod (name min 1) · save/page.tsx"),
    ("ZC · Danh sách món trong bộ", "FavouritesSummaryList ← resolvedItems"),
    ("   • Bánh cuốn thịt ×1 …", "Tổng: NN.NNNđ (reduce over resolved)"),
    ("ZD · [ Lưu set này ]  [ Huỷ ]", "addSet(name) → router.push('/sets')"),
], footer="[Lưu set này] disabled until RHF isValid")

# ── sets page
E += phone(1040, PY, "Bộ đã lưu", "/menu/favourites/sets", [
    ("SetCard · Bộ \"Sáng thứ 7\"", "useFavouritesStore.sets ⨝ catalog"),
    ("   3 món · 88.000đ", "count ← set.items.length · price ← resolved"),
    ("   [Thêm vào giỏ]  [Xoá]", "handleApplySet · deleteSet · renameSet"),
    ("(empty) EmptyState ♡", "\"Chưa có set nào\" (sets.length===0)"),
])

# bottom nav strip note
E.append(ex.rect(40, PY + 740, 1440, 40, bg=ex.L_INDIGO, stk=ex.L_BORDER, sw=1))
E.append(ex.text(54, PY + 751, "ClientBottomNav (injected by (shop)/layout.tsx):  [Menu] [Đơn Hàng] [♥ Yêu Thích ▲active] [Theo Dõi] [Cài Đặt]  — fixed on all 3 sub-pages",
                 fs=11, color=ex.L_TEXT))

ex.save(FP, E)
print(f"PANEL 1: {len(E)} elements")
