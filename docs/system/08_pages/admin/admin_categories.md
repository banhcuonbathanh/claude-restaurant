# Admin Categories — `/admin/categories`

> **TL;DR:** ✅ implemented · manager+ · Category CRUD: simple header with count, category list
> with sort order, inline form modal (RHF + Zod). Categories feed the `CategoryTabs` component on
> `/menu` and `/pos`.

---

## ASCII Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│ (admin shell: tab nav)                                           │
├──────────────────────────────────────────────────────────────────┤
│ Danh mục (4)                                  [+ Thêm danh mục]  │
├──────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Tên danh mục      Thứ tự    Số món    Hành động              │ │
│ │ Bánh cuốn           1         8        [✎] [🗑]              │ │
│ │ Canh                2         3        [✎] [🗑]              │ │
│ │ Đồ uống             3         6        [✎] [🗑]              │ │
│ │ Combo               4         5        [✎] [🗑]              │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
  Overlay: category form modal — tên, thứ tự (sort_order)  [Lưu][Huỷ]
```

## Zones

| Zone | Component | Data source |
|---|---|---|
| Header | inline JSX in `admin/categories/page.tsx` | category count |
| Table | inline table | `listCategories` (`['admin','categories']`) |
| Form modal | inline modal (RHF + Zod) | `createCategory` / `updateCategory` / `deleteCategory` |

## Key Interactions

- **+ Thêm danh mục** → modal (add) · **✎** → edit name/sort order · **🗑** → confirm + delete
  (deleting a category with products is rejected server-side).
- Writes invalidate `['admin','categories']`; `/menu` CategoryTabs pick up changes on next fetch.

## Business Logic Used

- Category → tab ordering on menu/POS (sort_order) → [../07_business_logic/LOGIC_FE.md](../07_business_logic/LOGIC_FE.md) (menu queries)
- Admin CRUD pattern → [../07_business_logic/LOGIC_FE.md](../07_business_logic/LOGIC_FE.md) (admin CRUD pattern)
- Manager+ gate → [../02_spec/BUSINESS_RULES.md §1 RBAC](../02_spec/BUSINESS_RULES.md#1-rbac-role-hierarchy)
