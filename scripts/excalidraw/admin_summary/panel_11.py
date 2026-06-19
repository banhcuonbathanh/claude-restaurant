#!/usr/bin/env python3
"""PANEL 11 — DB Row-Level View (dark) for admin_summary.excalidraw.
Sourced from admin_summary_be.md per-endpoint SQL + repo line refs.
The real rows this page writes + the tables the analytics SQL scans."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_summary/admin_summary.excalidraw"
ex.reset("p11")
E = []

X, Y = 40, 3680
E += ex.panel_header(X, Y, "PANEL 11 · DB Row-Level View",
                     "The 2 rows the WRITE touches + the 4 tables the analytics reads scan · MySQL, no Redis",
                     color=ex.LIGHT, sub_color=ex.MUTED)
E.append(ex.rect(X - 20, Y - 20, 2400, 520, bg="#0b1220", stk="#1e293b", sw=1))

cy = Y + 50
# WRITE rows
els, h = ex.card(X, cy, 600, ex.C_ORD,
    "WRITE — stock_movements (INSERT)",
    "INSERT INTO stock_movements (\n"
    "  ingredient_id, type, quantity,\n"
    "  note, created_by, created_at)\n"
    "VALUES ('<uuid>','in',2,\n"
    "  'Nhập hàng sau ca trưa',\n"
    "  '<uuid manager1>', NOW())\n"
    "-- repo:222-227")
E += els
els, h2 = ex.card(X + 640, cy, 600, ex.C_BE,
    "WRITE — ingredients (UPDATE)",
    "UPDATE ingredients\n"
    "SET current_stock =\n"
    "  current_stock + 2      -- 'in'/'adjust' ADD\n"
    "  (out → GREATEST(0, stock-qty))\n"
    "WHERE id = '<uuid Mộc nhĩ>'\n"
    "-- 0.2 → 2.2 kg · repo:235-238\n"
    "-- ⚠ INSERT+UPDATE NOT in one tx")
E += els

# READ tables
els, h3 = ex.card(X + 1280, cy, 560, ex.C_TAN,
    "READ — analytics SQL scans (no writes)",
    "orders         status!='cancelled' + date\n"
    "               status IN(confirmed,prep,ready)\n"
    "order_items ⋈ orders status IN(deliv,paid)\n"
    "               combo_ref_id IS NULL (top-dish)\n"
    "payments       status='completed' (revenue)\n"
    "staff LEFT JOIN orders/payments\n"
    "  WHERE is_active=1 AND role!='customer'\n"
    "-- repo:63-201 · raw SQL, no sqlc")
E += els

# status derivation note
ny = cy + max(h, h2, h3) + 16
E.append(ex.rect(X, ny, 1840, 70, bg="#111827", stk=ex.C_VIOLET, sw=2))
E.append(ex.text(X + 14, ny + 8, "IngredientStatus computed at serialize time (ingredient_handler ingredientStatus:14-26) — NOT a stored column:", fs=11, color=ex.C_VIOLET))
E.append(ex.text(X + 14, ny + 30, "current_stock==0 → out_of_stock · expiry < now+7d → expiring_soon · current_stock <= min_stock → low_stock · else in_stock", fs=10, color=ex.LIGHT, ff=3))
E.append(ex.text(X + 14, ny + 50, "low-stock list WHERE current_stock <= min_stock * 1.2  ORDER BY current_stock/GREATEST(min_stock,0.001) ASC  (repo:120-141)", fs=10, color=ex.MUTED, ff=3))

n = ex.append(FP, E)
print(f"PANEL 11: added {len(E)} elements (file total {n})")
