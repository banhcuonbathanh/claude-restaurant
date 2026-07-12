---
tags: [fe, page/customer]
---

# FE — Checkout

Online-order checkout page (name/phone fields for online customers; offline QR table orders skip this page entirely).

## Code

- Page: `fe/src/app/(shop)/checkout/page.tsx`
- Payload: all cart-driven POSTs go through `fe/src/lib/order-payload.ts` (single builder, OC-3)

## Behaviour

- **Offline QR scan flow does NOT use /checkout** — popup confirm on the menu page only; staff handles the rest
- Online checkout fields added in Phase ONLINE-ORD; UX fixes in Phase FIX-OL
- Combo expansion + filling + canh handling in payload → [[Concept - Combo & Filling Model]]

## Docs

- Spec: `docs/spec/Spec_3_Menu_Checkout_UI_v2.md` → [[Docs - Specs]]
- Flow: `docs/work_flow/CLIENT_QR_FLOW.md` → [[Docs - Workflows]]

## BE

- [[BE - Orders]] — POST /orders · then [[FE - Order Tracking]]
