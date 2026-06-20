#!/usr/bin/env python3
"""PANEL 11 — DB Row-Level View (dark). From _be.md + be/migrations/005_orders.sql + 016_*.sql.
The actual orders + order_items columns this page reads/writes."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_detail/customer_order_detail.excalidraw"
ex.reset("p11")
E = []
X, Y = 40, 7820
E += ex.panel_header(X, Y, "PANEL 11 · DB Row-Level View — orders + order_items (005_orders.sql, 016)",
                     "from migrations · total_amount DENORMALIZED · order_items has NO status column (derived from qty_served)",
                     color="#0f172a")

y0 = Y + 60
c1, _ = ex.card(X, y0, 560, ex.C_ORD, "orders row (this page reads + cancels)",
                'id            CHAR(36)  PK\n'
                'order_number  VARCHAR(30) UNIQUE\n'
                'table_id      CHAR(36)  → ownership gate\n'
                'status        ENUM(pending,confirmed,\n'
                '   preparing,ready,delivered,cancelled)\n'
                'total_amount  DECIMAL(10,0)  ← DENORMALIZED\n'
                'deleted_at    DATETIME  ← SoftDeleteOrder (#3)')
E += c1
c2, _ = ex.card(X + 590, y0, 680, ex.C_TAN, "order_items row (no status col — derived)",
                'id           CHAR(36) PK\n'
                'order_id     CHAR(36) → orders (CASCADE)\n'
                'product_id / combo_id / combo_ref_id  (chk_oi_item_type)\n'
                'name         VARCHAR(200)\n'
                'unit_price   DECIMAL(10,0)   (combo header = 0)\n'
                'quantity     INT  CHECK(>0)   ← PATCH #5 writes\n'
                'qty_served   INT  CHECK(>=0)  ← item_progress; gates cancel/edit\n'
                'filling      VARCHAR(20) thit|moc_nhi|NULL  (mig 016)\n'
                'note · toppings_snapshot JSON')
E += c2

# derived status + write ops
y1 = y0 + 230
c3, _ = ex.card(X, y1, 560, ex.C_VIOLET, "item_status derived (no column)",
                'itemStatus(qty_served, quantity):\n'
                '  0            → "pending"\n'
                '  0 < n < qty  → "preparing"\n'
                '  n >= qty     → "done"\n'
                '3 item types via chk_oi_item_type (MySQL 8.0.16+)')
E += c3
c4, _ = ex.card(X + 590, y1, 680, ex.C_RED, "write ops this page fires",
                '#3 DELETE order → SoftDeleteOrder (deleted_at=NOW) + RecalculateTotalAmount\n'
                '#4 DELETE item  → DeleteOrderItem + RecalculateTotalAmount\n'
                '#5 PATCH qty    → UpdateItemQuantity (orders.sql.go:423)\n'
                '                  + RecalculateTotalAmount (orders.sql.go:364)\n'
                'every write → publishOrderEvent(order:<id> + orders:kds)')
E += c4

print("PANEL 11:", ex.append(FP, E), "total elements")
