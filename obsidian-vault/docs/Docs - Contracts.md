---
tags: [docs]
---

# Docs — Contracts (`docs/contract/` + `docs/api/`)

The BE↔FE agreement layer. Both sides read these before coding.

## Files

- `docs/contract/API_CONTRACT_v1.2.md` — all endpoints (tables, no prose); §10 = realtime → [[BE - Realtime & Jobs]]
- `docs/contract/ERROR_CONTRACT_v1.1.md` — error codes + `respondError` pattern (BE `handler/respond.go`)
- `docs/api/openapi.yaml` — OpenAPI 3.0; Swagger UI at :8090 (docker compose swagger service)

## Companion single sources

- Field names: `docs/be/be_code_summary/DB_SCHEMA_SUMMARY.md`
- Business rules / RBAC / JWT: [[Docs - Core Rules]]

## Consumers

Every BE domain note ([[BE - Orders]], [[BE - Payment]], …) and `fe/src/lib/api-client.ts` → [[FE - State & Data Layer]].
