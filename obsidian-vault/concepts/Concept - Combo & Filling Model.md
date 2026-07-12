---
tags: [concept, domain/orders, domain/products]
---

# Concept — Combo & Filling Model

How combos, fillings (nhân), and the unified order payload work (OC epic — Order Consistency, complete).

## Combo = header + sub-items

A combo in `order_items` is **1 header row (`unit_price = 0`, label only) + N sub-item rows (real prices)**.
- `recalculateTotalAmount()` sums ALL rows → header MUST be 0 or the combo double-counts (the OC-2 bug: 72k instead of 42k)
- FE read views hide the header row
- `filling` lives on sub-items, never the header
- Reference: `docs/be/be_code_summary/BE_API_DTO.md §Orders`

## Filling (nhân)

- Migration 016 added `order_items.filling` (`thit`/`moc_nhi`/`NULL`, OC-1), but migration **017 (TOP-1) dropped the column** — nhân is now backfilled into and carried by `toppings_snapshot`
- Rendered by read views (OC-4): `DishRow` badge in `fe/src/features/order/components/OrderDetailView.tsx`, admin `toppingLabel`, KDS variant

## Single payload builder

`fe/src/lib/order-payload.ts` (OC-3) — ALL cart-driven POST /orders paths use it (menu table-confirm, /checkout, CartDrawer add-to-order). Emits `filling`, expanded `combo_items`, item `note`.

## Custom suất (FAV-2)

Custom portions are personal data ordered as **individual món-lẻ lines** (`combo_id: null`) — never written to the combos table → [[FE - Favourites]].

## Touchpoints

[[BE - Orders]] · [[BE - Products & Menu]] · [[FE - Customer Menu]] · [[FE - Checkout]] · [[FE - Order Tracking]] · [[FE - KDS]] · [[FE - Admin Overview]] · [[FE - State & Data Layer]]
