# Admin Storage — `/admin/storage`

> **TL;DR:** 🔮 PLANNED (owner decision 2026-06-12) · manager+ · Full inventory management page:
> stock list with quantity in/out, **low-stock warnings**, and a link from ingredient availability
> to product availability on the menu (hết hàng). Builds on the implemented
> [`/admin/ingredients`](admin_ingredients.md) page (CRUD + stock movements already exist).
> Wireframe below is **proposed — owner to confirm**.

---

## ASCII Wireframe (proposed — owner to confirm)

```
┌──────────────────────────────────────────────────────────────────┐
│ (admin shell: tab nav)                                           │
├──────────────────────────────────────────────────────────────────┤
│ A  Kho hàng    🔍[Tìm...]   [+ Nhập hàng]  [+ Xuất hàng]         │
├──────────────────────────────────────────────────────────────────┤
│ B  ⚠ CẢNH BÁO TỒN KHO THẤP                                       │
│    ┌ Mộc nhĩ: còn 0.3 kg (< ngưỡng 1 kg)   [Nhập ngay] ┐         │
│    └ Thịt heo: còn 1.2 kg (< ngưỡng 3 kg)  [Nhập ngay] ┘         │
├──────────────────────────────────────────────────────────────────┤
│ C  ┌─Stock table──────────────────────────────────────────────┐  │
│    │ Nguyên liệu  Tồn  Ngưỡng  Trạng thái   Món bị ảnh hưởng  │  │
│    │ Bột gạo     25.5    5     ● đủ         Bánh cuốn (all)   │  │
│    │ Mộc nhĩ      0.3    1     ⚠ sắp hết    BC mộc nhĩ        │  │
│    │ Tôm tươi     0.0    2     ✖ hết        BC tôm  [Ẩn món]  │  │
│    └──────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│ D  Lịch sử nhập/xuất (movement log, newest first)                │
│    12/06 09:10  Nhập  Bột gạo   +10 kg   "giao sáng"             │
│    11/06 21:00  Xuất  Thịt heo  −4.5 kg  "cuối ngày"             │
└──────────────────────────────────────────────────────────────────┘
  Overlay: link-availability confirm — "Ẩn 'BC tôm' khỏi menu vì hết Tôm tươi?" [Huỷ][Ẩn món]
```

## Zones (proposed)

| Zone | Component (proposed) | Data source |
|---|---|---|
| A Header | reuse `StoragePageHeader` pattern | — |
| B Low-stock warnings | new `LowStockBanner` (extends summary-page low-stock query) | `GET` low-stock (`['admin','low-stock']`) |
| C Stock table | extended `IngredientTable` + threshold + affected-products columns | ingredients + product↔ingredient mapping |
| D Movement log | new `StockMovementLog` | stock-movement history endpoint |
| Availability link | confirm modal → product update | `PATCH` product `is_available` |

## Key Interactions (proposed)

- **+ Nhập hàng / + Xuất hàng** → stock movement modal (reuse `StockMoveModal`).
- **Nhập ngay** on a warning → pre-filled "in" movement for that ingredient.
- **Ẩn món** on an out-of-stock row → confirm → sets the affected product(s) `is_available=false`
  so they show "Hết" on `/menu` and POS; restocking offers to re-enable.
- Thresholds editable per ingredient (edit modal field).

## Business Logic Used

- Product availability drives menu + POS display ("Hết") → [../02_spec/BUSINESS_RULES.md §2 Order Rules](../02_spec/BUSINESS_RULES.md#2-order-rules)
- Existing low-stock query + ingredient CRUD to reuse → [../07_business_logic/LOGIC_FE.md](../07_business_logic/LOGIC_FE.md) (admin CRUD pattern, low-stock)
- Manager+ gate via admin shell → [../02_spec/BUSINESS_RULES.md §1 RBAC](../02_spec/BUSINESS_RULES.md#1-rbac-role-hierarchy)
