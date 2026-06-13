# Admin Combos — `/admin/combos`

> **TL;DR:** ✅ implemented · manager+ · Combo CRUD: header with count + add button, combo table
> showing composition and price, and a form modal where the manager picks component products with
> quantities. Combos surface on `/menu` (ComboSection) and expand into per-item order lines at
> order time.

---

## ASCII Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│ (admin shell: tab nav)                                           │
├──────────────────────────────────────────────────────────────────┤
│ B  Combo (5)                                    [+ Thêm combo]   │ ← PageHeader
├──────────────────────────────────────────────────────────────────┤
│ C  ┌──────────────────────────────────────────────────────────┐  │ ← ComboTable
│    │ [img] Tên combo     Gồm có              Giá     Còn  HĐ  │  │
│    │ [▣] Combo Đầy Đặn   1×BC thịt, 1×Canh,  42.000đ  ●  [✎][🗑]│ │
│    │                     1×Trà đá                              │  │
│    │ [▣] Combo Đôi       2×BC thịt, 2×Canh   78.000đ  ●  [✎][🗑]│ │
│    └──────────────────────────────────────────────────────────┘  │
│     (empty → EmptyState)                                         │
└──────────────────────────────────────────────────────────────────┘
  Overlay (D): ComboFormModal — tên, giá, mô tả, ảnh, danh sách món:
  ┌───────────────────────────────┐
  │ [Bánh cuốn thịt ▾] SL [1] [×] │
  │ [Canh mọc       ▾] SL [1] [×] │
  │ [+ Thêm món]                  │
  │            [Lưu] [Huỷ]        │
  └───────────────────────────────┘
```

## Zones

| Zone | Component | Data source |
|---|---|---|
| B Header | inline JSX in `admin/combos/page.tsx` | combo count |
| C Table | inline table ("Zone C — ComboTable") | `['admin','combos']` query; product names via `['admin','products']` |
| D Modal | inline form modal (RHF + Zod) | `createCombo` / `updateCombo` / `deleteCombo` |

## Key Interactions

- **+ Thêm combo** → modal: pick products + quantities, set combo price (independent of the sum
  of component prices), upload image.
- **✎** edit · **🗑** confirm + delete; writes invalidate `['admin','combos']`.
- Availability toggle controls whether the combo shows in `/menu` ComboSection.

## Business Logic Used

- Combo expansion at order time (header row `unit_price=0`, sub-items priced — total = combo
  price, no double count) → [../02_spec/BUSINESS_RULES.md §2.5 Combo Expansion](../02_spec/BUSINESS_RULES.md#25-combo-expansion)
- FE combo enrichment (names/prices resolved from products) → [../07_business_logic/LOGIC_FE.md](../07_business_logic/LOGIC_FE.md) (combo display)
- Admin CRUD pattern → [../07_business_logic/LOGIC_FE.md](../07_business_logic/LOGIC_FE.md) (admin CRUD pattern)
