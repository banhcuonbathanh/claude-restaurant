# Public Landing — `/`

> **TL;DR:** ✅ implemented · public (no auth) · Marketing/demo landing for the whole system.
> Feature tour + quick entry points: admin dashboard, staff quick login, and one-click table QR
> shortcuts for demoing the customer flow. Desktop-oriented; mostly static content.

---

## ASCII Wireframe

```
┌──────────────────────────────────────────────────────────────┐
│ [🍴] Bánh Cuốn POS        Tính Năng · Cách Dùng [Dashboard]  │ ← Navbar (sticky)
├──────────────────────────────────────────────────────────────┤
│ ▒▒ DevPanel (dev tooling strip, amber)                    ▒▒ │
├──────────────────────────────────────────────────────────────┤
│                    HERO (gradient)                           │
│        Quản Lý Quán Thông Minh — Không Cần Cài App           │
│   [ Vào Admin Dashboard ]   [ Thử Menu Khách ]               │
│   (<1s đơn đến bếp) (8–15 phút) (99.9%) (0 app)  ← stats     │
├──────────────────────────────────────────────────────────────┤
│ StaffQuickLogin — one-click login as chef/cashier/admin      │
├──────────────────────────────────────────────────────────────┤
│ Demo Nhanh — Chọn Bàn Để Xem Menu                            │
│ ┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌────────┐           │
│ │Bàn 01││Bàn 02││Bàn 03││Bàn 04││Bàn 05││Bàn VIP │ TableGrid │
│ └──────┘└──────┘└──────┘└──────┘└──────┘└────────┘           │
├──────────────────────────────────────────────────────────────┤
│ #features — 6 feature cards (QR · KDS · POS · Admin · …)     │
├──────────────────────────────────────────────────────────────┤
│ #how-it-works — 4 steps 01→04                                │
├──────────────────────────────────────────────────────────────┤
│ Vai Trò — 4 role cards (Admin/Manager/Cashier/Chef)          │
├──────────────────────────────────────────────────────────────┤
│ CTA — Sẵn Sàng Chạy? [Vào Admin Dashboard] [Xem Demo Khách]  │
├──────────────────────────────────────────────────────────────┤
│ Footer — Admin · Demo Khách · Đăng Nhập                      │
└──────────────────────────────────────────────────────────────┘
```

## Zones

| Zone | Component | Data source |
|---|---|---|
| Navbar / Hero / Features / Steps / Roles / CTA / Footer | inline JSX in `app/page.tsx` | static arrays in file |
| Dev panel | `components/shared/DevPanel` | dev API (`/api/dev/run`) |
| Staff quick login | `app/StaffQuickLogin` | `POST /auth/login` with seeded accounts |
| Table shortcuts | `app/TableGrid` | hardcoded QR-token hrefs → `/table/:token` |

## Key Interactions

- Click **Vào Admin Dashboard** → `/admin` (redirects to `/admin/overview`; requires staff login).
- Click a table card in **TableGrid** → `/table/:token` (starts the guest QR flow).
- **Giả lập khách** button in TableGrid → simulates a random customer order (dev helper).
- **StaffQuickLogin** → logs in as a seeded role and redirects per role.

## Business Logic Used

- Guest session bootstrap triggered via the table links → [../02_spec/BUSINESS_RULES.md §5 JWT / Auth Rules](../02_spec/BUSINESS_RULES.md#5-jwt--auth-rules)
- Role → landing-page mapping → [../02_spec/BUSINESS_RULES.md §1 RBAC](../02_spec/BUSINESS_RULES.md#1-rbac-role-hierarchy)
- FE auth/session logic → [../07_business_logic/LOGIC_FE.md](../07_business_logic/LOGIC_FE.md) (auth store, role redirect)
