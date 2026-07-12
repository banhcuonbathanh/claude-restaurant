---
tags: [be, domain/products]
---

# BE — Products & Menu

Products, categories (groups), toppings, combos, image uploads.

## Code chain

- `be/internal/handler/product_handler.go` → `be/internal/service/product_service.go` → `be/internal/repository/product_repo.go`
- Category groups: `group_handler.go` → `group_service.go`
- File/image upload: `file_handler.go` → `file_repo.go`

## Key field names (single source: `docs/be/be_code_summary/DB_SCHEMA_SUMMARY.md`)

- `price` not `base_price` · `image_path` not `image_url`
- Soft delete everywhere: `deleted_at` — all queries filter `WHERE deleted_at IS NULL`

## Combo model

A combo = 1 header row + N sub-item rows → details in [[Concept - Combo & Filling Model]]

## Spec

- `docs/spec/Spec_2_Products_API_v2_CORRECTED.md` → [[Docs - Specs]]

## Consumers

- [[FE - Customer Menu]] · [[FE - Product & Combo Detail]] · [[FE - Admin Catalog]]
- [[BE - Chat AI]] `get_menu` tool
