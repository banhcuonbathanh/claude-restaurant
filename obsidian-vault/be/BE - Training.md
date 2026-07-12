---
tags: [be, domain/staff]
---

# BE — Training

Staff training content backend (Phase P-TRAINING).

## Code chain

`be/internal/handler/training_handler.go` → `be/internal/service/training_service.go` → `be/internal/repository/training_repo.go`

## Consumers

- [[FE - Admin Staff & Training]] — training page (`(dashboard)/admin/training/`)
- FE hook: `fe/src/hooks/useTrainingQueries.ts` · store: `fe/src/store/trainingStore.ts`

## Related

- [[BE - Staff]]
