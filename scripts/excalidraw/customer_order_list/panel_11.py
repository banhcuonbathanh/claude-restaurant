#!/usr/bin/env python3
"""PANEL 11 (dark) — DB Row-Level View.
Source: customer_order_list_be.md + DB_SCHEMA_SUMMARY.md (005_orders, 016 filling)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_list/customer_order_list.excalidraw"
ex.reset("p11")
E = []

X, Y = 40, 5980
E += ex.panel_header(X, Y, "PANEL 11 · DB Row-Level View — the rows this page reads/writes", color=ex.PANEL_TXT)
E.append(ex.text(X, Y + 26, "Columns from DB_SCHEMA_SUMMARY.md (005_orders, 016 filling). No order_items.status column — status is derived.", fs=10, color="#475569"))

def table(x, y, w, title, accent, cols, rows):
    hh = 30 + 24 + len(rows)*22 + 14
    E.append(ex.rect(x, y, w, hh, bg=ex.CARD_BG, stk=accent, sw=2))
    E.append(ex.rect(x, y, w, 30, bg=accent, stk=accent))
    E.append(ex.text(x + 12, y + 8, title, fs=13, color=ex.DARK))
    cy = y + 40
    E.append(ex.text(x + 12, cy, cols, fs=10, color=accent, ff=3)); cy += 22
    for r in rows:
        E.append(ex.text(x + 12, cy, r, fs=10, color=ex.LIGHT, ff=3)); cy += 22
    return hh

y = Y + 60
orders_rows = [
    "id            CHAR(36) PK      ord-016",
    "table_id      CHAR(36) NULL    tbl-ban03   (NULL = online)",
    "status        ENUM             confirmed   pending|confirmed|preparing|ready|delivered|cancelled|paid",
    "total_amount  DECIMAL(10,0)    60000       ⚠ DENORMALIZED → RecalculateTotalAmount after every item mutation",
    "created_by    CHAR(36) NULL    NULL        NULL = customer self-order",
    "created_at / updated_at / deleted_at  DATETIME   (soft delete → WHERE deleted_at IS NULL)",
]
h = table(X, y, 1500, "orders   (one row per order — the cross-device hub)", ex.C_ORD,
          "Column         Type             Example / note", orders_rows)
y += h + 24

oi_rows = [
    "id            CHAR(36) PK      oi-1 / oi-2 / oi-3",
    "order_id      CHAR(36) FK      ord-016   (ON DELETE CASCADE)",
    "product_id    CHAR(36) NULL    NULL on combo header line",
    "combo_id      CHAR(36) NULL    cb-tt on header; NULL on standalone/sub-item",
    "combo_ref_id  CHAR(36) NULL    →header on sub-item; NULL on header/standalone",
    "unit_price    DECIMAL(10,0)    snapshot at order time (0 on combo header)",
    "quantity      INT  >0          / qty_served INT 0..quantity (chef increments)",
    "filling       ENUM NULL        thit | moc_nhi | NULL   (migration 016 · OC epic)",
    "note          TEXT NULL        · created_at / updated_at",
]
h = table(X, y, 1500, "order_items   (combo header + children — 3 valid types via chk_oi_item_type)", ex.C_TAN,
          "Column         Type             Example / note", oi_rows)
y += h + 20

# derived rules strip
E.append(ex.rect(X, y, 1500, 70, bg="#1e293b", stk=ex.C_VIOLET, sw=2))
E.append(ex.text(X + 12, y + 10, "DERIVED / WRITE RULES", fs=11, color=ex.C_VIOLET))
E.append(ex.text(X + 12, y + 32,
    "• ItemStatus = itemStatus(qty_served,quantity): 0=pending · 0<n<qty=preparing · n=qty=done  (NO column)\n"
    "• RecalculateTotalAmount = SUM(unit_price × quantity) over remaining items  • Cancel order: SumQtyServedAndQuantity, reject if served/total ≥ 0.30",
    fs=10, color=ex.LIGHT, ff=3, w=1470, wrap=True))

ex.append(FP, E)
print(f"PANEL 11: added {len(E)} elements")
