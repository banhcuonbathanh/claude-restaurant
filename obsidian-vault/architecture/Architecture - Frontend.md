---
tags: [architecture, fe]
---

# Architecture — Frontend

**Stack:** Next.js 14 App Router · TypeScript strict · Tailwind v3 · Zustand v4 · TanStack Query v5 · React Hook Form + Zod

## Strict state rules

- Server state → TanStack Query
- Client state → Zustand (`fe/src/store/`)
- Forms → RHF + Zod
- All API calls → `fe/src/lib/api-client.ts`
- All localStorage keys → `fe/src/lib/storage-keys.ts` ONLY (no hardcoded strings)

## Route groups (`fe/src/app/`)

- `(shop)/` — customer pages → [[FE - Customer Menu]], [[FE - Checkout]], [[FE - Order Tracking]], [[FE - Favourites]]
- `(dashboard)/` — staff + admin → [[FE - KDS]], [[FE - POS]], [[FE - Admin Overview]]
- `(auth)/` — login/register → [[BE - Auth]]
- `table/[tableId]/` — QR entry point → [[FE - Table QR Entry]]

## Folder conventions (enforced on every new page)

- Shared query hooks → `src/hooks/` (NOT inside page folders)
- Stores → `src/store/` (top-level)
- Shared components → `src/components/shared/` · atoms → `src/components/ui/`
- Feature components → `src/features/<domain>/`

See [[FE - State & Data Layer]] for the concrete stores/hooks/lib inventory.

## Canonical docs

- `docs/fe/FE_SYSTEM_GUIDE.md` — primary FE guide
- `docs/fe/wireframes/` — page wireframes → [[Docs - System Handbook]]
- `.claude/skills/frontend-nextjs/SKILL.md` — rule router read before FE work
