#!/usr/bin/env python3
"""PANEL 3 for customer_combo_detail.excalidraw — BE View.
Sourced from customer_combo_detail_be.md · code: be/cmd/server/main.go,
be/internal/handler/product_handler.go, be/internal/service/product_service.go."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_combo_detail/customer_combo_detail.excalidraw"
ex.reset("p3")
E = []

X, Y = 620, 40
E += ex.panel_header(X, Y, "PANEL 3 · BE View",
    "read-only page: 2 public cached catalog GETs, zero BE write · from customer_combo_detail_be.md")

# endpoint table
ty = Y + 60
E.append(ex.rect(X, ty, 1180, 30, bg=ex.L_ORANGE, stk=ex.L_BORDER, sw=1))
E.append(ex.text(X + 12, ty + 8,
    "#   Endpoint        Auth     Handler          Service       Repo / Query                        Redis",
    fs=10, color=ex.L_TEXT, ff=3))
rows = [
 "1   GET /combos     public   productH.List-   ListCombos    ListCombosAvailable + GetComboItems   combos:list",
 "                             Combos                          (main.go:216)",
 "2   GET /products   public   productH.List-   ListProducts  ListProductsAvailable +               products:list",
 "                             Products                        GetToppingsByProductID (main.go:168)",
]
for i, r in enumerate(rows):
    yy = ty + 30 + i * 26
    E.append(ex.rect(X, yy, 1180, 26, bg="#ffffff", stk=ex.L_BORDER, sw=1))
    E.append(ex.text(X + 12, yy + 7, r, fs=10, color=ex.SUB, ff=3))

# callout — no /combos/:id
cy = ty + 30 + len(rows) * 26 + 16
E.append(ex.rect(X, cy, 1180, 56, bg="#fff1f2", stk=ex.C_RED, sw=2))
E.append(ex.text(X + 12, cy + 10,
    "⚠ NO  GET /combos/:id  — combos group registers GET \"\" + manager/admin writes only (main.go:215-227).",
    fs=11, color=ex.L_TEXT))
E.append(ex.text(X + 12, cy + 32,
    "Page over-fetches WHOLE combo list + WHOLE product list, resolves the one combo client-side (page.tsx:30-50).",
    fs=10, color=ex.SUB))

# three info cards
b1y = cy + 76
def box(x, w, accent, title, lines):
    E.append(ex.rect(x, b1y, w, 200, bg="#ffffff", stk=accent, sw=2))
    E.append(ex.rect(x, b1y, w, 28, bg=accent, stk=accent))
    E.append(ex.text(x + 12, b1y + 7, title, fs=12, color="#0a0a0a"))
    E.append(ex.text(x + 12, b1y + 40, lines, fs=10, color=ex.SUB, ff=2))

box(X, 380, ex.C_ORD, "Auth model",
    "• Both GETs fully public — no authMW\n  (main.go:168,216).\n• Page issues ZERO authenticated requests.\n• add-to-cart → in-memory cart only\n  (useCartStore.addItem, page.tsx:60-69).\n• POST /orders happens later on /menu.\n• Catalog mutations staff-only\n  (manager/admin) — not used here.")
box(X + 400, 380, ex.C_TAN, "Caching & invalidation",
    "• productCacheTTL = 5 min\n  (product_service.go:21) — matches FE\n  staleTime 5 min → ~10 min worst case.\n• keys: combos:list · products:list.\n• write-triggered invalidation only —\n  none reachable from this page.\n• Redis fail-open: getCacheJSON swallows\n  errors → falls through to MySQL.")
box(X + 800, 380, ex.C_RED, "Error behaviour",
    "• No body/params bound → no 400 path.\n• Not-found is a CLIENT concept:\n  no GET /combos/:id, so missing combo =\n  rawCombos.find()→undefined →\n  \"Khong tim thay combo\" (page.tsx:86-93).\n• combos isError renders the SAME block.\n• products error → defaults [] (page.tsx:24)\n  → sub-items silently lose names/prices.")

ex.append(FP, E)
print(f"PANEL 3: {len(E)} elements")
