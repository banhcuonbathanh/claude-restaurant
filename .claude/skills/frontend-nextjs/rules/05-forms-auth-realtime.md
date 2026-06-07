# Rule 05 — Forms · Auth · Errors · Realtime

> Read before: building a form, handling auth/tokens, mapping API errors, or wiring SSE/WebSocket.
> Source of truth for auth + realtime config: `docs/core/MASTER_v1.2.md §6` (JWT/auth) + `§5` (SSE/WS). Error codes: `docs/contract/ERROR_CONTRACT_v1.1.md`.

---

## 1. Forms — RHF + Zod

- Form state lives in React Hook Form + Zod resolver — never `useState` per field, never lift form state into Zustand.
- On submit → mutate via `api-client`; on success → invalidate the relevant query key (rule 03).
- Map server validation errors back onto fields:

```ts
// INVALID_INPUT → RHF fields
const fields = err.response?.data?.details?.fields ?? []
fields.forEach(({ field, message }) =>
  setError(field as keyof FormValues, { message })
)
```

---

## 2. Auth & token storage

| Token | TTL | Storage | Never |
|---|---|---|---|
| Staff access token | 24h | Zustand memory only | localStorage |
| Staff refresh token | 30d | httpOnly cookie (BE sets) | FE never reads |
| Guest JWT | 2h | Zustand memory only | localStorage |

- `withCredentials: true` on axios — browser auto-sends the httpOnly refresh cookie.
- On mount / F5 → `GET /auth/me`; the refresh cookie silently restores the session.
- **Guest exception:** if `token.sub === 'guest'` → do NOT call `/auth/refresh` → redirect `/table/:tableId`.
- Guard protected pages by wrapping content in `AuthGuard` (+ `RoleGuard allowedRoles={...}`) — not manual redirects per page.

**Login → role redirect:**

```ts
const redirectByRole: Record<string, string> = {
  chef: '/kds', cashier: '/pos', staff: '/pos',
  manager: '/dashboard', admin: '/dashboard', customer: '/menu',
}
```

Role enum (`fe/src/types/auth.ts`): `CUSTOMER:1 · CHEF:2 · CASHIER:3 · MANAGER:4 · ADMIN:5`.

---

## 3. API error handling (interceptor)

```ts
switch (error.code) {
  case 'TOKEN_EXPIRED':            // staff: auto-refresh; guest(sub='guest'): redirect /table/:tableId
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

Map every error code to a user-facing toast/route — never swallow silently. Full code list → `ERROR_CONTRACT_v1.1.md`.

---

## 4. Realtime — SSE / WebSocket

```ts
const RECONNECT = {
  maxAttempts: 5,
  baseDelay: 1000,     // ms, doubles each retry
  maxDelay: 30000,
  showBannerAfter: 3,  // show ConnectionErrorBanner after 3 fails
}
```

- **SSE auth:** `Authorization: Bearer <token>` header — use `@microsoft/fetch-event-source` (native `EventSource` can't set headers).
- **WS auth:** `?token=<access_token>` query param (browser WS API can't set custom headers).
- iOS Safari kills `EventSource` on screen lock → add a `visibilitychange` reconnect handler.
- Cache patching + skeleton-until-first-event → rule 04.

---

## References
- `docs/core/MASTER_v1.2.md §5` (realtime) · `§6` (JWT/auth).
- `docs/contract/ERROR_CONTRACT_v1.1.md` — all error codes.
- `fe/src/lib/api-client.ts` — interceptor home. Query invalidation on mutate → rule 03.
