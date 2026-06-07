# Rule 04 — Rendering & Loading (strategy · skeleton · error · empty)

> Read before: deciding how a page renders, adding loading skeletons, error states, empty states, or realtime hydration.
> Living registry: `docs/fe/wireframes/shared/_INDEX_RENDERING_STRATEGY.md` — **pick a pattern from here; register the page's pattern there after implementing. Also check its "Known Gaps".**

---

## 1. Choose the rendering pattern

| Question | Yes → |
|---|---|
| API data that is the same for every user (menus, lists, admin tables)? | **Pattern A** |
| All data user-specific or realtime (SSE/WS — KDS, order tracking)? | **Pattern B** |
| Server must gate/redirect before client loads (auth wall, role HTML)? | **Pattern C** |

### Pattern A — ISR + RSC + HydrationBoundary (preferred for data pages)
Server component prefetches into a `QueryClient`, wraps a `'use client'` `PageClient` in `<HydrationBoundary>`. `export const revalidate = N` **must equal** the TanStack `staleTime` for that resource. `page.tsx` cannot read Zustand/localStorage — that lives in `PageClient`. Result: zero loading flash on first paint.

### Pattern B — Full client (`'use client'` on page root)
For user-specific/realtime pages. Simpler, but a skeleton shows on every cold visit. **A `<PageSkeleton />` is required — never ship Pattern B without one.**

### Pattern C — SSR per request (rare)
Server `redirect()` / per-request fetch when client-side auth is insufficient. No static caching.

---

## 2. The three render states — always handle all three

Every data-driven zone handles **loading → error → empty → data** explicitly. Order in the page body:

```tsx
{isError   ? <ErrorRetry onRetry={refetch} />
 : isLoading ? <Skeleton />
 : isEmpty  ? <EmptyState message="…" />
 : <Data />}
```

- **Loading:** a real skeleton matching the layout (not a spinner) — mirror the grid/card shape. Required for Pattern B; recommended for Pattern A zones that wait on client data.
- **Error:** show a retry affordance wired to `refetch()`. Use `<Button>` (rule 02).
- **Empty:** use `shared/EmptyState` with a context message; distinguish "no results for search" vs "nothing here yet".
- These loading/error/empty branches are **page-level query orchestration** — keep them in the page; extract only the data zones (rule 01).

---

## 3. Realtime hydration (SSE/WS pages)

- Initial fetch via `useQuery` with `staleTime: 0`; the SSE/WS handler patches the cache with `queryClient.setQueryData`. Show the skeleton until the query resolves **and** the first event arrives.
- On reconnect, re-fetch / invalidate to resync missed events. `refetchOnWindowFocus: true` mitigates dropped events.
- Connection/transport details → rule 05.

---

## 4. Register the page

After setting a page's strategy, add/update its row in `_INDEX_RENDERING_STRATEGY.md` Page Directory: Pattern · `revalidate` · RSC prefetched keys · client zones · **Skeleton defined?**. Read "Known Gaps" first — several pages are flagged "skeleton required before shipping."

---

## References
- `docs/fe/wireframes/shared/_INDEX_RENDERING_STRATEGY.md` — pattern library, per-page directory, known gaps.
- `fe/src/components/shared/EmptyState.tsx` · `ConnectionErrorBanner.tsx`.
- Which keys to prefetch / staleTime values → rule 03. Skeleton/error visuals + tokens → rule 02.
