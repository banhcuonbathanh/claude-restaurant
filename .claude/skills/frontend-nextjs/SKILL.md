---
description: Apply whenever writing or reviewing Next.js frontend code — components, pages, hooks, stores, or API calls. Encodes the non-obvious rules and patterns for this project's Next.js 14 App Router + TypeScript + Tailwind stack.
---

# Frontend Next.js Skill — BanhCuon Project

## State ownership (strict — wrong choice causes bugs)

| Data type | Correct home | Wrong alternative |
|---|---|---|
| Products, orders (server data) | TanStack Query `useQuery` | `useState` + `useEffect` + `fetch` |
| Auth token, cart (client state) | Zustand store | `localStorage` · React Context |
| Form data | React Hook Form + Zod | `useState` per field |
| API calls | `api-client.ts` only | raw `fetch` · direct `axios.get()` |
| Page auth guard | `AuthGuard` wrapping page | manual redirect in each page |
| Color values | Tailwind token names | hardcoded hex |
| Price display | `formatVND()` from `lib/utils.ts` | `.toLocaleString()` |
| localStorage keys | `src/lib/storage-keys.ts` ONLY | hardcoded strings anywhere |

---

## Folder conventions (enforce on every new page)

- Shared query hooks → `src/hooks/` (NOT inside page folders)
- Stores → `src/store/` (top-level, NOT inside page folders)
- Shared components → `src/components/shared/`
- Atoms/primitives → `src/components/ui/`
- All localStorage keys → `src/lib/storage-keys.ts` ONLY

---

## TypeScript: critical type rules

### All IDs are `string` (UUID), never `number`

```ts
// ❌ WRONG
interface Product { id: number }
// ✅ CORRECT
interface Product { id: string }  // "550e8400-e29b-41d4-a716-446655440000"
```

### Role enum

```ts
// fe/src/types/auth.ts
export const Role = {
  CUSTOMER: 1, CHEF: 2, CASHIER: 3, MANAGER: 4, ADMIN: 5,
} as const
export type RoleValue = typeof Role[keyof typeof Role]
```

### item_status — DERIVE from qty_served, never a stored field

```ts
export function deriveItemStatus(qty_served: number, quantity: number): ItemStatus {
  if (qty_served === 0) return 'pending'
  if (qty_served >= quantity) return 'done'
  return 'preparing'
}
```

### Product field names (match BE exactly)

| Wrong | Correct |
|---|---|
| `base_price` | `price` |
| `image_url` | `image_path` (relative — build full URL in component) |
| `price_delta` | `price` (on toppings) |
| `slug` | — does not exist |
| `id: number` | `id: string` |

### Image URL construction

```ts
const imageUrl = product.image_path
  ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${product.image_path}`
  : '/placeholder.jpg'
```

---

## Design tokens (NEVER hardcode hex)

| Token | Tailwind class | Use case |
|---|---|---|
| Primary accent | `bg-primary` · `text-primary` | Prices · badges · active states |
| Page background | `bg-background` | Dark page bg |
| Card | `bg-card` | Cards · modals |
| Success | `text-success` | Done status |
| Warning | `text-warning` | Preparing · KDS 10-20min |
| Urgent | `text-urgent` | Cancelled · >20min · out of stock |
| Foreground | `text-foreground` | Main text |
| Border | `border-border` | Dividers |
| Muted bg | `bg-muted` | Disabled · secondary areas |
| Muted text | `text-muted-fg` | Placeholders |

```tsx
// ❌ WRONG
<div className="bg-[#FF7A1A] text-[#9CA3AF]" />

// ✅ CORRECT
<div className="bg-primary text-muted-fg" />
```

Typography: body = `font-body` (Be Vietnam Pro) · headings = `font-display` (Playfair Display)

---

## Auth rules

| Token | TTL | Storage | Never |
|---|---|---|---|
| Staff access token | 24h | Zustand memory only | localStorage |
| Staff refresh token | 30d | httpOnly cookie (BE sets it) | FE never reads |
| Guest JWT | 2h | Zustand memory only | localStorage |

- `withCredentials: true` on axios — browser auto-sends httpOnly refresh cookie
- On mount/F5: call `GET /auth/me` — refresh cookie silently restores session
- Guest exception: if `token.sub === 'guest'` → do NOT call `/auth/refresh` → redirect `/table/:tableId`

**Login → role redirect:**

```ts
const redirectByRole: Record<string, string> = {
  chef: '/kds', cashier: '/pos', staff: '/pos',
  manager: '/dashboard', admin: '/dashboard', customer: '/menu',
}
```

---

## Error handling (interceptor pattern)

```ts
switch (error.code) {
  case 'TOKEN_EXPIRED':
    // Staff: auto-refresh; Guest (sub='guest'): redirect /table/:tableId
  case 'MISSING_TOKEN':
  case 'ACCOUNT_DISABLED':
  case 'REFRESH_TOKEN_INVALID':
    clearAuth(); router.push('/login'); break
  case 'TABLE_HAS_ACTIVE_ORDER':
    router.push(`/order/${details?.active_order_id}`); break
  case 'CANCEL_THRESHOLD':
    toast.error('Không thể huỷ đơn khi đã phục vụ hơn 30% món'); break
  default:
    toast.error(message ?? 'Đã xảy ra lỗi')
}
```

**INVALID_INPUT → map to RHF fields:**

```ts
const fields = err.response?.data?.details?.fields ?? []
fields.forEach(({ field, message }) =>
  setError(field as keyof FormValues, { message })
)
```

---

## Realtime reconnect config

```ts
const RECONNECT = {
  maxAttempts: 5,
  baseDelay: 1000,      // ms, doubles each retry
  maxDelay: 30000,
  showBannerAfter: 3,   // show ConnectionErrorBanner after 3 fails
}
```

- SSE auth: `Authorization: Bearer <token>` header (use `@microsoft/fetch-event-source`)
- WS auth: `?token=<access_token>` query param (browser WS API cannot set custom headers)
