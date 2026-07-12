---
tags: [fe, foundation]
---

# FE — State & Data Layer

The Zustand stores, query/SSE hooks, and lib utilities every page builds on.

## Stores (`fe/src/store/`)

| Store | Holds | Used by |
|---|---|---|
| `cart.ts` | cart items (incl. combo_items, filling, note) | [[FE - Customer Menu]], [[FE - Checkout]] |
| `favourites.ts` | liked products + persisted custom suats | [[FE - Favourites]] |
| `chat.ts` | chat widget state | [[FE - Chat Widget]] |
| `settings.ts` · `theme.ts` | customer settings / theme | `(shop)/menu/settings` |
| `trainingStore.ts` | training page state | [[FE - Admin Staff & Training]] |

## Lib (`fe/src/lib/`)

- `api-client.ts` — ALL API calls go through this
- `order-payload.ts` — **the single order-POST builder** (OC-3); emits filling, combo_items, item note
- `storage-keys.ts` — ALL localStorage keys (no hardcoded strings anywhere)
- `favourite-set-cart.ts` / `favourite-suat-cart.ts` — favourites → cart bridges
- `fly-to-cart.ts` — add-to-cart animation · `utils.ts` · `providers.tsx`

## Hooks (`fe/src/hooks/`)

SSE/WS hooks listed in [[BE - Realtime & Jobs]]; plus `useProductDetail.ts`, `useCustomerProfile.ts`, `useTodoTasks.ts`, `useTrainingQueries.ts`, `useMarketingSpend.ts`.

## Testing note

FE vitest runs `docs/work_flow/*.test.ts`; files in `fe/src/__tests__/` are stale never-run duplicates.

## Rules

- [[Architecture - Frontend]] — strict state routing (server→TanStack Query, client→Zustand)
