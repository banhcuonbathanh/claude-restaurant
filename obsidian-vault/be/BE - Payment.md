---
tags: [be, domain/payment]
---

# BE — Payment

Payments (cash + gateway) and payment webhooks (VNPay, MoMo).

## Code chain

`be/internal/handler/payment_handler.go` → `be/internal/service/payment_service.go` → `be/internal/repository/payment_repo.go`

- Gateway integrations: `be/internal/payment/`
- Tests: `payment_service_test.go`

## Critical rules

- **Verify HMAC first** — webhook signature check is the FIRST operation, before any DB access
- **Idempotent webhooks** — check `payment.status` before updating; gateways call multiple times
- **Payment gate** — POST /payments rejects (409) unless `order.status` is `ready` or `delivered` → [[Concept - Order Lifecycle]]
- Field names: `gateway_data` not `webhook_payload` · status `completed` not `success`

## Spec

- `docs/spec/Spec_5_Payment_Webhooks.md` → [[Docs - Specs]]

## Consumers

- [[FE - Cashier Payment]] · [[FE - POS]]
- Pending work: P7-7 payment sandbox (VNPay + MoMo via ngrok) → [[Docs - Task Management]]
