---
tags: [be, domain/qr-pos]
---

# BE — Tables & QR

Restaurant tables, QR code table binding, POS table state.

## Code chain

`be/internal/handler/table_handler.go` → `be/internal/repository/table_repo.go` — **no table service layer by design** ("table operations are simple enough"); it only borrows `service.NewPublicUUID` / `NewRandomBytes` helpers.

## Flow

QR scan → `table/[tableId]` page → guest auth → menu with table context → order bound to table.

- **Offline QR table scan:** popup confirm only — no `/checkout`, no name/phone; staff handles the rest
- 1 table 1 active order → [[BE - Orders]]

## Spec & flows

- `docs/spec/Spec_6_QR_POS.md` → [[Docs - Specs]]
- `docs/work_flow/CLIENT_QR_FLOW.md` → [[Docs - Workflows]]

## Consumers

- [[FE - Table QR Entry]] · [[FE - POS]] · [[FE - Admin Overview]] (live floor / Danh sách bàn)
- QR code generation for marketing → [[BE - Marketing]]
