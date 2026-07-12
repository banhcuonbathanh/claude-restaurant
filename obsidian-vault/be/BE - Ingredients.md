---
tags: [be, domain/ingredients]
---

# BE — Ingredients

Ingredient storage: daily usage tracking + run-out forecast (Phase STOR).

## Code chain

`be/internal/handler/ingredient_handler.go` → `be/internal/service/ingredient_service.go` → `be/internal/repository/ingredient_repo.go`

## Consumers

- [[FE - Admin Catalog]] — admin ingredients page (`(dashboard)/admin/ingredients/`)
- FE queries live under `fe/src/features/admin/`

## Related

- Phase STOR rows → [[Docs - Task Management]]
