# Rule 01 — Structure (folders · page composition · component extraction)

> Read before: creating a page, splitting a page, extracting JSX into components, deciding where a file lives, naming things.
> Living registry: `docs/fe/wireframes/shared/_INDEX_SHARING_COMPONENT.md` — **check it before building any component; add a row the moment you build one.**

---

## 1. Where things live (enforce on every new file)

| Thing | Home | Never put it in |
|---|---|---|
| Shared query hooks | `src/hooks/` | inside a page folder |
| Global stores (Zustand) | `src/store/` | inside a page folder |
| Cross-page components | `src/components/shared/` | a feature folder |
| Atoms / primitives | `src/components/ui/` | hand-rolled per page |
| Feature-only components | `src/features/<domain>/components/` | the page file |
| Route guards | `src/components/guards/` | the page body |
| localStorage keys | `src/lib/storage-keys.ts` (only) | hardcoded strings |

Before building a component, search `_INDEX_SHARING_COMPONENT.md`. If it exists → reuse. If it's cross-cutting → build in `shared/` and add a row. If feature-only → build in the feature folder.

---

## 2. Page = orchestrator, not a JSX dump

A `page.tsx` (or `PageClient`) should read as a **composition of zones**, not inline markup. Each visual zone is its own component under the feature folder.

**Extraction rules (this is how SearchBar / MenuHeader / ComboSection are done):**

1. **One zone → one component.** Pull each labelled zone (`Zone A`, `Zone B`, …) out into `features/<domain>/components/<ZoneName>.tsx`.
2. **Components read their own store data.** Display state that lives in a store (cart `items`/`count`/`total`, auth `role`, favourites) is read **inside** the component via the store hook — do **not** prop-drill it from the page.
3. **Pass only callbacks + small flags as props.** `onClick`, `onCheckout`, `visible`, `disabled`. Server-query results the page owns may be passed as props (they are not store display-state).
4. **Business logic / routing decisions stay in the page**, handed down as a callback (e.g. `handleCheckout` → `onCheckout`). A zone component never decides routes; it calls the prop.
5. **Self-guard visibility inside the component.** `if (!orderId) return null` — instead of `{cond && <Zone/>}` in the page.
6. **Leave query-state orchestration (loading / error / empty branches) in the page** unless a zone owns its own fetch — see rule 04.

**Shape to copy:**

```tsx
'use client'
import { useCartStore } from '@/store/cart'

interface Props {
  onCheckout: () => void   // callback — routing decided by page
  dimmed?: boolean         // small flag
}

export function CartBottomBar({ onCheckout, dimmed }: Props) {
  const count = useCartStore(s => s.itemCount())   // reads its own store data
  if (count === 0) return null                      // self-guard
  return /* … */
}
```

---

## 3. After extracting

- Remove now-unused imports/variables from the page.
- `npm run typecheck` (`cd fe && npm run typecheck`) — zero new errors.
- Pure structural extraction = **zero behavior change**. If behavior would change, it's not a structural refactor — stop and flag.

---

## 4. Naming

- Components: `PascalCase.tsx`, named export matching the file.
- Hooks: `useXxx.ts` in `src/hooks/`.
- Stores: `xxx.ts` in `src/store/`, hook named `useXxxStore`.
- Branches: `feature/...` · `fix/...` · `chore/...`.

---

## References
- `docs/fe/wireframes/shared/_INDEX_SHARING_COMPONENT.md` — what components/stores already exist + per-page component map.
- `fe/CLAUDE.md` — folder tree.
- Design of each zone → rule 02. Data each zone reads → rule 03. How the page renders + loads → rule 04.
