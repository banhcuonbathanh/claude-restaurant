# Table QR Landing — `/table/:tableId`

> **TL;DR:** ✅ implemented · public → guest JWT · Invisible "airlock" page the customer hits when
> scanning the QR sticker on a table. Exchanges the QR token for a guest JWT, stores table id/name
> in the cart store, then redirects to `/menu`. Customer only ever sees a spinner (or an error).

---

## ASCII Wireframe

```
Loading state (normal — sub-second):          Error state (bad/expired token):
┌──────────────────────────────┐              ┌──────────────────────────────┐
│                              │              │                              │
│                              │              │            ⚠️                │
│            ◌                 │              │  Mã bàn không hợp lệ hoặc    │
│      (spinner, primary)      │              │  đã hết hạn. Vui lòng quét   │
│                              │              │  lại QR.                     │
│      Đang tải menu…          │              │                              │
│                              │              │        Vào menu (link)       │
│                              │              │                              │
└──────────────────────────────┘              └──────────────────────────────┘
```

## Zones

| Zone | Component | Data source |
|---|---|---|
| Spinner / error | inline JSX in `app/table/[tableId]/page.tsx` | `POST /auth/guest { qr_token }` |
| Session write | `useAuthStore.setAuth` (memory only) | response `access_token` |
| Table write | `useCartStore.setTableId` / `setTableName` | response `table` |

## Key Interactions

- **On mount** → `POST /auth/guest` with the URL token:
  - success → store guest user + token (Zustand memory, never localStorage), store table id/name,
    `router.replace('/menu')`.
  - error `TABLE_HAS_ACTIVE_ORDER` → redirect to `/order/:active_order_id` (or `/menu` if no id) —
    the table already has a running order, customer joins it instead of starting a new one.
  - other errors → error screen with a "Vào menu" link.

## Business Logic Used

- Guest JWT (2 h, stateless) → [../02_spec/BUSINESS_RULES.md §5.2 Guest JWT Payload](../02_spec/BUSINESS_RULES.md#52-guest-jwt-payload)
- One active order per table → [../02_spec/BUSINESS_RULES.md §2.3](../02_spec/BUSINESS_RULES.md#23-one-active-order-per-table)
- FE auth-store + cart-store bootstrap → [../07_business_logic/LOGIC_FE.md](../07_business_logic/LOGIC_FE.md) (guest session, table binding)
