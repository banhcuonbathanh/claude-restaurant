---
tags: [be, domain/auth]
---

# BE — Auth

Login, JWT issuance/refresh, guest sessions for QR customers.

## Code chain

`be/internal/handler/auth_handler.go` → `be/internal/service/auth_service.go` → `be/internal/repository/auth_repo.go`

- JWT middleware: `be/internal/middleware/`
- Tests: `auth_service_test.go`, `auth_extra_test.go`

## Rules

- JWT config + auth rules: `docs/core/MASTER_v1.2.md §6` → [[Docs - Core Rules]]
- FE side: access token in Zustand memory only, refresh token in httpOnly cookie — **never localStorage**
- Roles + hierarchy → [[Concept - RBAC]]

## Spec

- `docs/spec/Spec1_Auth_Updated_v2.md` → [[Docs - Specs]]

## Consumers

- [[FE - Table QR Entry]] (guest auth for QR scan)
- [[FE - Chat Widget]] (guest-auth chat)
- `(auth)/login` + `(auth)/register` pages, `dev-login/` helper
