---
tags: [fe, page/customer]
---

# FE — Customer Menu

The main customer ordering page: product grid, combos, cart bar, table confirm.

## Code

- Page: `fe/src/app/(shop)/menu/page.tsx`
- Components: `fe/src/features/menu/components/` (ProductCard, ComboCard, CartDrawer, CategoryTabs, …) — `fe/src/components/menu/` is empty (.gitkeep only)
- Cart store: `fe/src/store/cart.ts` → [[FE - State & Data Layer]]
- Order POST goes through the single builder `fe/src/lib/order-payload.ts` (OC-3)

## Behaviour

- QR table context → popup confirm ordering flow (no `/checkout` for offline table scan) → [[FE - Table QR Entry]]
- Online flow → [[FE - Checkout]]
- Combos and filling (nhân) selection → [[Concept - Combo & Filling Model]]
- Favourites rail + quick-add → [[FE - Favourites]]

## Docs (gold-standard page doc-set)

- `docs/system/08_pages/customer/customer_menu/` — full 6-file doc-set incl. `customer_menu.excalidraw`
- Spec: `docs/spec/Spec_3_Menu_Checkout_UI_v2.md` → [[Docs - Specs]]

## BE

- [[BE - Products & Menu]] · [[BE - Orders]]
