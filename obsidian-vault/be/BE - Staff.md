---
tags: [be, domain/staff]
---

# BE — Staff

Staff CRUD and management (Phase 8 admin dashboard backend).

## Code chain

`be/internal/handler/staff_handler.go` → `be/internal/service/staff_service.go` → `be/internal/repository/staff_repo.go`

## Rules

- Roles + hierarchy → [[Concept - RBAC]] (`docs/core/MASTER_v1.2.md §3`)
- Field name: `created_by` not `staff_id`

## Spec

- `docs/spec/Spec_7_Staff_Management.md` → [[Docs - Specs]]

## Consumers

- [[FE - Admin Staff & Training]] (staff page + task board)
- Related domains: [[BE - Tasks & Todo]] · [[BE - Training]]
