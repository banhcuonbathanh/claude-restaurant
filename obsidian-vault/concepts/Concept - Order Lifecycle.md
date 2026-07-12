---
tags: [concept, domain/orders]
---

# Concept — Order Lifecycle

The business rules that govern an order from creation to payment. Single source: `docs/core/MASTER_v1.2.md §4` → [[Docs - Core Rules]].

## Key invariants

- **1 table 1 active order** — checked before INSERT
- **Item status is derived**, not stored: `qty_served` 0=pending · 0<x<qty=preparing · x=qty=done
- **Payment gate:** POST /payments rejected (409) unless `order.status` is `ready` **or** `delivered` (MASTER §4.3)
- **total_amount** recalculated after every order_items mutation
- **Cancel:** owner decision drift — cancel-anytime is allowed (documented DRIFT in `docs/system/07_business_logic/`)

## The two flows (MUST READ docs before touching)

- Customer: `docs/work_flow/CLIENT_QR_FLOW.md` — scan → menu → order → tracking
- Staff: `docs/work_flow/STAFF_ORDER_FLOW.md` — login → KDS → POS → confirm → cancel → bill → payment
→ [[Docs - Workflows]]

## Touchpoints

- BE: [[BE - Orders]] · [[BE - Payment]]
- FE: [[FE - Customer Menu]] → [[FE - Checkout]] → [[FE - Order Tracking]] · staff [[FE - KDS]] / [[FE - POS]] / [[FE - Cashier Payment]] · [[FE - Admin Overview]]
- Rule skill: `.claude/skills/order-flow/SKILL.md`
