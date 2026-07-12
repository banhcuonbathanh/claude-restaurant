---
tags: [fe, page/customer]
---

# FE — Order Tracking

Customer's live view of their order after submitting.

## Code

- `fe/src/app/(shop)/order/[id]/page.tsx` is a **redirect stub** → `/orders?id=...`
- The real detail view: `fe/src/features/order/components/OrderDetailView.tsx` (contains `DishRow` with the filling badge — OC-4), mounted by `(shop)/orders/page.tsx`
- Order hub: `(shop)/order/page.tsx` · tracking: `(shop)/tracking/page.tsx`
- Feature components: `fe/src/features/order/components/` (`fe/src/features/orders/` is empty — .gitkeep only)
- Live updates: `fe/src/hooks/useOrderSSE.ts` → [[BE - Realtime & Jobs]]

## Behaviour

- Shows per-item status derived from `qty_served` → [[Concept - Order Lifecycle]]
- Renders `filling` + `note` per item → [[Concept - Combo & Filling Model]]
- Cancel rules (cancel-anytime drift is a known owner decision) → [[Concept - Order Lifecycle]]

## Docs

- Flow: `docs/work_flow/CLIENT_QR_FLOW.md` → [[Docs - Workflows]]

## BE

- [[BE - Orders]]
