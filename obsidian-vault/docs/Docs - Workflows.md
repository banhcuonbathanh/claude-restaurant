---
tags: [docs]
---

# Docs — Workflows (`docs/work_flow/`)

The two end-to-end flow documents — **MUST READ before touching either flow.**

## Client QR flow

`docs/work_flow/CLIENT_QR_FLOW.md` — scan → menu → order → tracking.
Touches: [[FE - Table QR Entry]] → [[FE - Customer Menu]] → [[FE - Order Tracking]] · [[BE - Tables & QR]] · [[BE - Orders]].
Key rule: offline QR scan = popup confirm only, **no /checkout, no name/phone** — staff handles the rest.

## Staff order flow

`docs/work_flow/STAFF_ORDER_FLOW.md` — login → KDS → POS → confirm → cancel → bill → payment.
Touches: [[FE - KDS]] · [[FE - POS]] · [[FE - Cashier Payment]] · [[BE - Orders]] · [[BE - Payment]].

## Testing note

FE vitest actually runs the `docs/work_flow/*.test.ts` files (not `fe/src/__tests__/`, which are stale duplicates) → [[FE - State & Data Layer]].

## Related

- [[Concept - Order Lifecycle]] — the rules both flows obey
