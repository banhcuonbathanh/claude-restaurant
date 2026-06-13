# Admin Toppings — `/admin/toppings`

> **TL;DR:** ✅ implemented · manager+ · Topping CRUD: header with add button, topping table
> (name, price, which products use it), form modal. Toppings attach to products and surface in the
> `ToppingSelector` on `/menu/product/:id`.

---

## ASCII Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│ (admin shell: tab nav)                                           │
├──────────────────────────────────────────────────────────────────┤
│ Topping (6)                                    [+ Thêm topping]  │ ← ToppingPageHeader
├──────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────────┐ │ ← ToppingTable
│ │ Tên topping     Giá        Dùng cho món          Hành động   │ │
│ │ Chả lụa         10.000đ    BC thịt, BC tôm        [✎] [🗑]   │ │
│ │ Hành phi         5.000đ    BC thịt, BC mộc nhĩ    [✎] [🗑]   │ │
│ │ Rau               0đ       Canh mọc               [✎] [🗑]   │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
  Overlay: topping form modal — tên, giá  [Lưu][Huỷ]
```

## Zones

| Zone | Component | Data source |
|---|---|---|
| Header | `toppings/_components/ToppingPageHeader` | topping count |
| Table | `toppings/_components/ToppingTable` | `listToppings` (`['admin','toppings']`) + `listProducts` for the "dùng cho" column |
| Form modal | `toppings/_components/` modal | create/update; `deleteTopping` mutation |

## Key Interactions

- **+ Thêm topping** → modal · **✎** → edit · **🗑** → confirm + delete (in-use toppings rejected
  server-side); writes invalidate `['admin','toppings']`.
- Product↔topping assignment happens on the product form (`/admin/products`), not here.

## Business Logic Used

- Topping price snapshot copied into `toppings_snapshot` at order time (price edits don't change
  past orders) → [../02_spec/BUSINESS_RULES.md §2 Order Rules](../02_spec/BUSINESS_RULES.md#2-order-rules)
- The "Rau" topping doubles as the canh có/không-rau variant marker on KDS →
  [../07_business_logic/LOGIC_FE.md](../07_business_logic/LOGIC_FE.md) (KDS variant rules)
- Admin CRUD pattern → [../07_business_logic/LOGIC_FE.md](../07_business_logic/LOGIC_FE.md) (admin CRUD pattern)
