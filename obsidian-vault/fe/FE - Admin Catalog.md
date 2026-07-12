---
tags: [fe, page/admin]
---

# FE — Admin Catalog

Admin CRUD pages for the menu catalog and stock.

## Pages (`fe/src/app/(dashboard)/admin/`)

| Page | Route | BE |
|---|---|---|
| Products | `admin/products/` | [[BE - Products & Menu]] |
| Categories | `admin/categories/` | [[BE - Products & Menu]] |
| Toppings | `admin/toppings/` | [[BE - Products & Menu]] |
| Combos | `admin/combos/` | [[BE - Products & Menu]] |
| Ingredients | `admin/ingredients/` | [[BE - Ingredients]] |

Feature logic: `fe/src/features/admin/`.

## Notes

- Combo editing must respect the header-row model → [[Concept - Combo & Filling Model]]
- Image uploads → file handler in [[BE - Products & Menu]]

## Spec

- `docs/spec/Spec_2_Products_API_v2_CORRECTED.md` + `Spec_9_Admin_Dashboard_Pages.md` → [[Docs - Specs]]
