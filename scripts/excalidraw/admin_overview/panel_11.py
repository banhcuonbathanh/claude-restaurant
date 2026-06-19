#!/usr/bin/env python3
"""PANEL 11 — DB Row-Level View (dark) — be.md §Per-Endpoint + SQL.
Actual orders/payments rows this page reads/writes; raw SQL WHERE clauses; UPDATE; derived ItemStatus."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_overview/admin_overview.excalidraw"
ex.reset("p11")
E = []

X, Y = 40, 4720
E += ex.panel_header(X, Y, "PANEL 11 · DB Row-Level View", "the raw SQL this page reads & writes (no sqlc for live/history) · source: be.md §1-3,5-6",
                     color=ex.LIGHT, sub_color=ex.MUTED)
E.append(ex.rect(X - 20, Y - 20, 1740, 470, bg="#0b1220", stk=ex.CARD_STK, sw=1))

oy = Y + 56
els, _ = ex.card(X, oy, 540, ex.C_TAN, "READ · GET /orders/live  (raw SQL)",
    "SELECT … FROM orders\nWHERE status IN ('pending','confirmed',\n   'preparing','ready','delivered')\n  AND deleted_at IS NULL\nORDER BY created_at ASC\n+ N+1 GetOrderItemsByOrderID\n+ table_name (GetTableByID)")
E += els
els, _ = ex.card(X + 560, oy, 540, ex.C_CYAN, "READ · GET /orders/history  (raw SQL)",
    "SELECT … FROM orders\nWHERE status IN ('cancelled','paid')\n  AND deleted_at IS NULL\n  AND DATE(updated_at) = CURDATE()\nORDER BY updated_at DESC\n⚠ no order_items fetched → items:[]\n\"today\" = updated_at date (MySQL TZ)")
E += els
els, _ = ex.card(X + 1120, oy, 480, ex.C_ORD, "WRITE · PATCH status (sqlc)",
    "UPDATE orders\nSET status=?, updated_at=NOW()\nWHERE id=? AND deleted_at IS NULL\n→ publish order_status_changed\n   (order:<id> · orders:kds)\nNo total recalc on status change")
E += els

# payments + ItemStatus row
py = oy + 230
els, _ = ex.card(X, py, 800, ex.C_BE, "WRITE · POST /payments (cash, sqlc)",
    "INSERT payments(order_id, method='cash', amount=order.total_amount, status='pending')\n"
    "→ completePayment: status='completed', paid_at=NOW()\n"
    "→ MarkOrderPaid: UPDATE orders SET status='paid'  (requires delivered)\n"
    "→ publish payment_success → orders:kds")
E += els
els, _ = ex.card(X + 820, py, 780, ex.C_ZUS, "DERIVED · ItemStatus (GET /orders/:id only)",
    "per item:  qty_served vs quantity →\n"
    "  qty_served == 0           → 'pending'\n"
    "  0 < qty_served < quantity → 'preparing'\n"
    "  qty_served == quantity    → 'done'\n"
    "NOT a stored column · computed in GetOrder service")
E += els

n = ex.append(FP, E)
print(f"PANEL 11: {len(E)} elements added (total {n})")
