---
tags: [fe, page/customer]
---

# FE — Favourites

Customer favourites: liked products, saved sets, and the "Tự tạo suất" custom-portion builder (Phase FAV — FE only, no BE/DB change).

## Code

- List: `fe/src/app/(shop)/menu/favourites/page.tsx`
- Builder: `.../favourites/build/page.tsx` — imports `SuatBuilder` from `.../favourites/components/SuatBuilder.tsx` (`SaveSuatModal.tsx` exists in the same components folder but is currently **not imported anywhere** — orphan)
- Sets: `.../favourites/sets/page.tsx` · Save: `.../favourites/save/page.tsx`
- Store: `fe/src/store/favourites.ts` (persisted `suats[]`, `CustomSuat`/`SuatLine`)
- Cart bridges: `fe/src/lib/favourite-set-cart.ts` · `fe/src/lib/favourite-suat-cart.ts`

## Key decisions (owner-confirmed)

- Custom suất = **personal data**, ordered as **individual món-lẻ product lines** — never written to the combos DB table
- "Lưu suất này" saves + adds to cart in one step
- Trứng ghi chú threaded as item `note` through `order-payload.ts`

## Docs

- Design truth: `docs/system/08_pages/customer/customer_favourites/claude_design/favourites.html` + `DESIGN_PROMPT.md`
- Behaviour truth: `customer_favourites.md` (same folder)

## Related

- [[FE - Customer Menu]] · [[FE - State & Data Layer]] · [[Concept - Combo & Filling Model]] · [[BE - Orders]]
