# Rule 03 — Data & State (fetching · stores · one-page & cross-page)

> Read before: fetching server data, adding a query or store, wiring state in a page, sharing state across pages, building an order payload.
> Living registry: `docs/fe/wireframes/shared/_INDEX_STATE_MANAGEMENT.md` — **the canonical list of every query key, every store, and per-page state. Check it before adding state; add a row the moment you create a key or store.**

---

## 1. Pick the right layer (wrong choice = bugs)

| Data | Correct home | Wrong alternative |
|---|---|---|
| Server data (products, orders, lists) | TanStack Query `useQuery` | `useState`+`useEffect`+`fetch` |
| Cross-page client state (cart, auth, favourites, settings) | Zustand store in `src/store/` | `localStorage` · React Context |
| Form data | React Hook Form + Zod | `useState` per field |
| UI-only local state (modal open, selected row, active tab) | `useState` / `useReducer` | a Zustand store |
| API calls | `src/lib/api-client.ts` | raw `fetch` · direct `axios` |

Rule of thumb: **does this state cross a page boundary?** Yes → Zustand or a shared query key. No → local `useState`.

---

## 2. Fetching in ONE page (TanStack Query)

- One `useQuery` per resource; **reuse the exact `queryKey`** listed in `_INDEX_STATE_MANAGEMENT.md` (e.g. `['categories']`, `['products', categoryId, searchQuery]`). Do not invent a second key for the same resource.
- Parameterize the key with everything that changes the result: `['products', categoryId, searchQuery]`. Changing a filter = changing the key, not a manual refetch.
- Set `staleTime` to match the index. Use `enabled` to gate dependent/conditional fetches (e.g. `enabled: searchQuery.length === 0 || searchQuery.length >= 2`).
- Components may read query data via the **same key** (TanStack dedupes by key) instead of prop-drilling — but page-owned filter state (`selectedCategory`, `searchQuery` as `useState`) is passed down or lifted; it does not belong in a store unless it crosses pages.

## 3. Mutations

- Mutate with `useMutation`; on success **invalidate the shared key** so every page reading it refreshes: `queryClient.invalidateQueries({ queryKey: ['categories'] })`.
- For realtime, patch the cache directly: `queryClient.setQueryData(['order', id], next)` from the SSE handler (see rule 05). Such queries use `staleTime: 0`.

---

## 4. Sharing state ACROSS pages

Two mechanisms only:

1. **Shared TanStack key** — same `queryKey` in two pages shares one cache. A mutation/invalidate in page A refreshes page B. (e.g. `['categories']` shared Menu ↔ Admin — Categories; `['products', id]` shared Menu ↔ Favourites.)
2. **Global Zustand store** in `src/store/` — `useCartStore`, `useAuthStore`, `useFavouritesStore`, `useSettingsStore`, etc. Read the store hook directly in whichever component needs it.

**Before** adding either: open `_INDEX_STATE_MANAGEMENT.md` → "Server Cache Keys", "Global Zustand Stores", and "Cross-Page State Sharing Map". Reuse what exists. **After** creating a new key/store: add the row there + the page's row in the Per-Page table and Page Directory.

Tokens are **memory-only** (Zustand), never localStorage (see rule 05).

---

## 5. Order payloads — one builder, always

Every cart→order POST (menu / checkout / add-to-order) **must** go through `src/lib/order-payload.ts` → `buildOrderItemsPayload(cart.items, cart.drinkConfig)`. Never hand-build `items[]` in a page. One builder keeps all three paths identical and matching the preview total (filling · combo overrides · canh split).

```ts
items: buildOrderItemsPayload(cart.items, cart.drinkConfig),
```

---

## 6. Derived fields — never store them

`item_status` is derived, not fetched:

```ts
export function deriveItemStatus(qty_served: number, quantity: number): ItemStatus {
  if (qty_served === 0) return 'pending'
  if (qty_served >= quantity) return 'done'
  return 'preparing'
}
```

---

## References
- `docs/fe/wireframes/shared/_INDEX_STATE_MANAGEMENT.md` — all keys, stores, per-page state, cross-page map.
- `fe/src/lib/order-payload.ts` · `fe/src/lib/api-client.ts` · `fe/src/lib/storage-keys.ts`.
- How render strategy interacts with prefetch/hydration → rule 04. Auth token storage + SSE cache patching → rule 05.
