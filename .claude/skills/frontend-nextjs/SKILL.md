---
description: Apply whenever writing or reviewing Next.js frontend code — components, pages, hooks, stores, API calls, or styling. Modular rule router for this project's Next.js 14 App Router + TypeScript + Tailwind stack. ALWAYS read this index first, then read the rule file matching the work.
---

# Frontend Rules — BanhCuon Project (Router)

> **How to use this skill — no exceptions.**
> 1. You are touching FE code (`fe/src/**`). This index is already loaded — read it.
> 2. Find the row(s) below matching the work you are about to do.
> 3. **READ the listed rule file with the Read tool BEFORE writing code** for that concern.
> 4. A task often spans concerns (e.g. a new page = structure + design + data + loading). Read every matching rule file.
> 5. Follow the rule completely. If a rule conflicts with the code you see, STOP and flag it — do not silently diverge.

---

## Rule map — task → file to read

| When you are… | Read this rule | Pairs with shared index |
|---|---|---|
| Creating/splitting a page · extracting zones into components · deciding folder/file placement · naming | [rules/01-structure.md](rules/01-structure.md) | `docs/fe/wireframes/shared/_INDEX_SHARING_COMPONENT.md` |
| Styling · colors · typography · buttons/badges/inputs · spacing · mobile/touch targets · visual layout | [rules/02-design.md](rules/02-design.md) | `docs/fe/wireframes/shared/_INDEX_SHARING_COMPONENT.md` (Tier 1) |
| Fetching server data · adding a query/store · managing state in one page · sharing state across pages · building order payloads | [rules/03-data-and-state.md](rules/03-data-and-state.md) | `docs/fe/wireframes/shared/_INDEX_STATE_MANAGEMENT.md` |
| Choosing how a page renders (SSR/ISR/client) · loading skeletons · error / empty states · realtime hydration | [rules/04-rendering-and-loading.md](rules/04-rendering-and-loading.md) | `docs/fe/wireframes/shared/_INDEX_RENDERING_STRATEGY.md` |
| Building forms · auth/token handling · API error mapping · SSE/WebSocket | [rules/05-forms-auth-realtime.md](rules/05-forms-auth-realtime.md) | `docs/core/MASTER_v1.2.md §5 · §6` |

The four `docs/fe/wireframes/shared/_INDEX_*.md` files are the **living registries** — query keys, stores, shared components, and rendering strategy per page. The rule files tell you *how* to work; the indexes tell you *what already exists*. **Check the index before creating; update the index the moment you create.**

---

## Always-on invariants (true for every FE change)

These are non-negotiable regardless of which rule file applies:

- **IDs are `string` (UUID), never `number`** — everywhere.
- **No hardcoded hex** — only Tailwind token classes (`bg-primary`, `text-muted-fg`, …). → rule 02.
- **No hardcoded localStorage keys** — import from `src/lib/storage-keys.ts` only.
- **No raw `fetch`/`axios`** — go through `src/lib/api-client.ts`.
- **No `.toLocaleString()` for money** — use `formatVND()` from `src/lib/utils.ts`.
- **Server data → TanStack Query · client state → Zustand · forms → RHF+Zod.** Never `useState`+`useEffect`+`fetch` for server data. → rule 03.
- **Every cart→order payload goes through `src/lib/order-payload.ts`** (`buildOrderItemsPayload`) — never hand-build `items[]` in a page. → rule 03.
- **New shared thing (component / query key / store / page rendering strategy) → add a row to the matching `_INDEX_*.md` immediately**, not later.

---

## Field-name traps (match BE exactly — wrong name = silent bug)

| Wrong | Correct |
|---|---|
| `base_price` | `price` |
| `image_url` | `image_path` (relative — build full URL in component) |
| `price_delta` | `price` (on toppings) |
| `slug` | — does not exist |
| `id: number` | `id: string` |

`item_status` is **derived** from `qty_served` vs `quantity` — never a stored field (see rule 03).
