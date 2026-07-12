---
tags: [fe, page/staff]
---

# FE — KDS (Kitchen Display)

Kitchen display system: incoming order items for the kitchen, serving progress.

## Code

- Page: `fe/src/app/(dashboard)/kds/page.tsx`
- Shows nhân/rau variant per item (OC-4) → [[Concept - Combo & Filling Model]]

## Behaviour

- Item status derived from `qty_served` → [[Concept - Order Lifecycle]]
- Live order feed via SSE → [[BE - Realtime & Jobs]]
- Role-gated → [[Concept - RBAC]]

## Docs

- Flow: `docs/work_flow/STAFF_ORDER_FLOW.md` → [[Docs - Workflows]] — must read before touching staff order management

## BE

- [[BE - Orders]]
