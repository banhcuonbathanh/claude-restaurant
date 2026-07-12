---
tags: [fe, page/staff]
---

# FE — Cashier Payment

Cashier screen to take payment for a ready order.

## Code

- Page: `fe/src/app/(dashboard)/cashier/payment/[id]/page.tsx`

## Behaviour

- Payment allowed only when `order.status` is `ready` or `delivered` → [[Concept - Order Lifecycle]]
- Cash + gateway (VNPay/MoMo) → [[BE - Payment]]
- Role-gated (cashier) → [[Concept - RBAC]]

## Docs

- Spec: `docs/spec/Spec_5_Payment_Webhooks.md` → [[Docs - Specs]]
- `docs/work_flow/STAFF_ORDER_FLOW.md` → [[Docs - Workflows]]
