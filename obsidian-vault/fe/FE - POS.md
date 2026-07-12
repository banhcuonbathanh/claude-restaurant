---
tags: [fe, page/staff]
---

# FE — POS

Staff point-of-sale: table grid, creating/managing orders on behalf of tables.

## Code

- Page: `fe/src/app/(dashboard)/pos/page.tsx` (TableGrid)
- Live monitor: `(dashboard)/orders/live/page.tsx` (hook `useOrderMonitorSSE.ts`)

## Behaviour

- Staff UI — no combo/filling/canh selection (kept simple; OC-3 left POS as-is)
- 1 table 1 active order → [[BE - Orders]]
- Confirm / cancel / bill flow → [[Concept - Order Lifecycle]]

## Docs

- `docs/work_flow/STAFF_ORDER_FLOW.md` → [[Docs - Workflows]]
- Spec: `docs/spec/Spec_6_QR_POS.md` → [[Docs - Specs]]

## BE

- [[BE - Orders]] · [[BE - Tables & QR]] · then [[FE - Cashier Payment]]
