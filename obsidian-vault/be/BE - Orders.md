---
tags: [be, domain/orders]
---

# BE — Orders

Order creation, status transitions, item serving, cancellation. The core domain.

## Code chain

`be/internal/handler/order_handler.go` → `be/internal/service/order_service.go` → `be/internal/repository/order_repo.go`

- Tests: `order_service_test.go`, `order_payment_extra_test.go`

## Critical rules (from `docs/tasks/MASTER_TASK.md` Critical Rules)

- **1 table 1 active order** — check before INSERT into orders
- **total_amount drift** — call `recalculateTotalAmount()` after EVERY order_items mutation
- **Combo header price = 0** — or the combo double-counts → [[Concept - Combo & Filling Model]]
- **No order_items.status column** — derive from `qty_served` (0=pending, 0<x<qty=preparing, x=qty=done)
- **Filling (nhân) history:** migration 016 added `order_items.filling` (OC-1), but migration `017_drop_order_item_filling.sql` (TOP-1) backfilled nhân into `toppings_snapshot` and **dropped the column** — current schema has no `filling` column
- IDs are UUID strings (CHAR(36)), never integers

## Lifecycle

Status flow, cancel rules, payment gate → [[Concept - Order Lifecycle]]

## Spec & flows

- `docs/spec/Spec_4_Orders_API.md` → [[Docs - Specs]]
- `docs/work_flow/CLIENT_QR_FLOW.md` + `docs/work_flow/STAFF_ORDER_FLOW.md` → [[Docs - Workflows]] — **must read before touching this flow**
- Rule skill: `.claude/skills/order-flow/SKILL.md` (triggers on any `*order*` file)

## Consumers

- [[FE - Checkout]] · [[FE - Order Tracking]] · [[FE - KDS]] · [[FE - POS]] · [[FE - Admin Overview]]
- [[BE - Chat AI]] `create_order` / `cancel_order` tools
- Realtime order events → [[BE - Realtime & Jobs]]
