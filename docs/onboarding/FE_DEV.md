# Onboarding — Frontend Developer

> Read this first. Then open `docs/fe/FE_SYSTEM_GUIDE.md` and go.

---

## Your Stack

Next.js 14 App Router · TypeScript strict · Tailwind CSS v3 · Zustand v4 · TanStack Query v5 · React Hook Form + Zod · Axios

## Your Entry Point

**`docs/fe/FE_SYSTEM_GUIDE.md`** — start every session here. It has the full epic list, scaffold state, design tokens, code patterns, and what to read per domain.

## State Ownership (memorize this)

| Data type | Where it lives | Never do this |
|---|---|---|
| Server data (products, orders) | TanStack Query `useQuery` | `useState` + `useEffect` + `fetch` |
| Auth token, cart | Zustand store | `localStorage` · React Context |
| Forms | React Hook Form + Zod | `useState` per field |
| API calls | `lib/api-client.ts` only | raw `fetch` · direct `axios.get()` |
| Page auth guard | `AuthGuard` component | manual redirect in each page |
| Prices | `formatVND()` from `lib/utils.ts` | `.toLocaleString()` |

## Your First 3 Tasks (in order)

> FE cannot start until BE-2 (auth handler) is done. While waiting:

1. **FE-1a** — Create `fe/src/lib/api-client.ts` — Axios instance with interceptors (attach token, handle 401 refresh)
2. **FE-1b** — Create Zustand auth store (`useAuthStore`) with `accessToken`, `user`, `setAuth`, `logout`
3. **FE-2** — Build the login page + `AuthGuard` component

> For FE-1: read `docs/contract/API_CONTRACT_v1.2.md` + `docs/MASTER_v1.2.md §6` (JWT rules) first.

## What's Already Done (do not recreate)

- `fe/src/app/layout.tsx` — root layout + fonts
- `fe/src/app/globals.css` — design tokens as CSS vars
- `fe/tailwind.config.ts` — custom color names
- `fe/src/components/ui/` — badge, button, card, input, label
- All page stubs exist but are empty TODOs — you fill them in

## Key Rules

| Rule | Why |
|---|---|
| Never hardcode hex colors | Use Tailwind token names from `tailwind.config.ts` |
| `formatVND()` for all prices | Consistent VND formatting |
| Access token lives in Zustand only (memory) | Prevents XSS via localStorage |
| All API calls through `api-client.ts` | Centralized auth headers + error handling |
| Design tokens from `docs/MASTER_v1.2.md §2` | Single source of truth |

## Branch Naming

`feature/fe-001-auth-ui` · `fix/login-form-validation`

## Useful Commands

```bash
cd fe && npm run dev          # :3000
npm run build                 # check for TS errors
docker compose up -d --build fe
```
