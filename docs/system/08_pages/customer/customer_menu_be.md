# Customer Menu — `/menu` · Backend View

> **TL;DR:** every BE endpoint the menu page calls, traced handler → service → repository →
> SQL, with auth, caching and error behaviour. Traced from source on branch
> `experience_claude.md_system_1` (NOT from docs).
> Sources: `be/cmd/server/main.go` (routes) · `be/internal/handler/product_handler.go` ·
> `be/internal/service/product_service.go` · `be/internal/handler/order_handler.go`.
>
> FE view + zones → [customer_menu.md](customer_menu.md) ·
> Object shapes (all layers) → [customer_menu.md §Object Model](customer_menu.md#object-model--menu-page-fe--be--db) ·
> Order write pipeline → [../../02_spec/OBJECT_MODEL_ORDER.md](../../02_spec/OBJECT_MODEL_ORDER.md)

---

## Endpoints Used by This Page

| # | Endpoint | Auth | Handler | Service | Repo / Query | Redis cache |
|---|---|---|---|---|---|---|
| 1 | `GET /categories` | public | `productH.ListCategories` | `ListCategories` | `ListCategories` (active only) | `categories:list` |
| 2 | `GET /products` | public | `productH.ListProducts` | `ListProducts` | `ListProductsAvailable` | `products:list` |
| 3 | `GET /combos` | public | `productH.ListCombos` | `ListCombos` | `ListCombosAvailable` | `combos:list` |
| 4 | `POST /orders` | authMW (guest JWT OK) | `orderH.Create` | order service | tx: insert order + items | — |
| 5 | `POST /orders/:id/items` | authMW (guest JWT OK) | `orderH.AddItemsToOrder` | order service | tx: insert items + recalc total | — |
| 6 | `GET /orders/:id` | authMW | `orderH.Get` | order service | order + items + table join | — |

Route registration: `be/cmd/server/main.go:167-228` (products/categories/combos groups) and
`:230-251` (orders group). All under `/api/v1`.

## Auth Model on This Page

- **Catalog GETs (1–3) are fully public** — no `authMW` on the GET routes. The page can browse
  without any token; the guest JWT from `/table/:tableId` is only needed once the cart submits.
- **Write routes (4–6) require `authMW`** — the guest JWT (`sub='guest'`, carries `table_id`)
  passes; `created_by` stays NULL for customer self-orders (set only from staff JWTs).
- Catalog **mutations** are staff-only and not used by this page: writes `AtLeast("manager")`,
  deletes `AtLeast("admin")` (`main.go` route groups).

## Per-Endpoint Detail

### 1 · `GET /categories`

- Service `ListCategories` (`product_service.go:343-356`): Redis `categories:list` hit → return;
  miss → repo `ListCategories` (active, not soft-deleted) → cache set.
- Serialized inline in the handler (`product_handler.go:169-191`): `id, name, description
  (NULL→""), sort_order, is_active`. Returns raw `[]db.Category` from service — no Details struct.

### 2 · `GET /products`

- Handler `ListProducts` (`product_handler.go:42-55`): **reads no query params** — see Flags.
- Service `ListProducts` (`product_service.go:162-191`): Redis `products:list` hit → return;
  miss → repo `ListProductsAvailable` (`is_available=1`, soft-deleted excluded), toppings
  resolved per product via the `product_toppings` junction into `ProductDetails.Toppings`,
  then cache set.
- Serializer `productJSON` (`product_handler.go:443-460`) — full shape in
  [customer_menu.md §3](customer_menu.md#3--product).
- Manager twin `GET /products/all` returns unavailable products too and is **uncached**
  (`ListAllProducts` → repo `ListProducts`).

### 3 · `GET /combos`

- Service `ListCombos` (`product_service.go:496-516`): Redis `combos:list` hit → return; miss →
  repo `ListCombosAvailable` + `combo_items` template rows per combo → cache set.
- Inline serializer (`product_handler.go:327-356`): combo fields + `combo_items:
  [{id, product_id, quantity}]` — **ids only**; product names/prices are resolved FE-side by
  joining against `GET /products` (see [customer_menu.md §4](customer_menu.md#4--combo-two-fe-shapes-raw-wire--enriched)).

### 4 · `POST /orders` (TableConfirmModal — QR path)

FE sends (`TableConfirmModal.tsx:20-27`): `source:'qr'`, `table_id` from cart store,
`customer_name`/`customer_phone` empty, `items` from `buildOrderItemsPayload()`.

BE behaviour (full DTO + DB mapping → OBJECT_MODEL_ORDER §2.3–§2.6):

- Validates `source` oneof + `items` min 1; product/combo XOR per item.
- Snapshots `name`, `unit_price`, `toppings_snapshot` server-side — client prices never trusted.
- Expands combos into header row (`unit_price`=0) + sub-item rows (`combo_ref_id`).
- One-active-order-per-table rule: response may carry `table_busy: true` — order is still
  created; FE shows a "served after current order" toast (`TableConfirmModal.tsx:44-46`).
- `created_by` NULL (guest), `status` starts `pending`, `order_number` from Redis counter with
  DB `order_sequences` fallback.

### 5 · `POST /orders/:id/items` (`?add_to_order=` mode)

- FE helper in `lib/api-client.ts:68` posts `{ items }` (same `buildOrderItemsPayload()` output)
  onto the existing order instead of creating one.
- BE `AddItemsToOrder` appends rows with the same snapshot/expansion rules, then
  `recalculateTotalAmount` updates the denormalized `orders.total_amount`.

### 6 · `GET /orders/:id` (post-submit fetch)

After a successful create, FE immediately re-fetches the full order and caches it in
localStorage under `STORAGE_KEYS.ORDER_CACHE` (`TableConfirmModal.tsx:33-40`). Response shape →
OBJECT_MODEL_ORDER §2.7.

## Caching & Invalidation

- One shared TTL: `productCacheTTL = 5 * time.Minute` (`product_service.go:21`) — matches the
  FE TanStack `staleTime` of 5 min, so worst-case staleness is ~10 min end-to-end.
- Keys: `products:list` · `categories:list` · `combos:list` · `toppings:list` ·
  `product:<id>` (detail).
- Invalidation is write-triggered, not TTL-only: every product/category mutation calls
  `invalidateProductCaches`, topping mutations `invalidateToppingCaches`, combo mutations
  `invalidateComboCaches`.
- Cache failures are non-fatal: `getCacheJSON`/`setCacheJSON` swallow Redis errors and fall
  through to MySQL — menu browsing survives a Redis outage.

## Error Behaviour

- Bind failures → `400 INVALID_INPUT` via `respondError()`
  (pattern → `docs/contract/ERROR_CONTRACT_v1.1.md`).
- Service errors → `handleServiceError` mapping (`ErrNotFound` → 404, etc.).
- FE shows a single retry state ("⚠ Kết nối mạng yếu" + Thử lại) for the products query only;
  categories/combos queries fail silently to empty arrays.

## Flags

| # | Flag | Detail |
|---|---|---|
| 1 | **`GET /products` ignores all query params** | FE sends `category_id`, `search`, `is_available` but the handler has zero `c.Query` calls and the service takes no filter args — category tabs and search are no-ops at the BE on this branch. Same as [customer_menu.md §6 flag 1](customer_menu.md#6--flags--known-mismatches). |
| 2 | **Catalog GETs are unauthenticated by design** | Fine for a public menu, but no rate-limit middleware is wired in `main.go` (global chain is only `Logger, Recovery, Metrics` — `middleware/ratelimit.go` exists but is unused there) — Redis caching is the only pressure valve. |
| 3 | **`table_busy` is response-only** | Extra field on the `POST /orders` response, not part of the order object — it never appears on `GET /orders/:id`. Don't look for it in OBJECT_MODEL_ORDER's matrices. |
