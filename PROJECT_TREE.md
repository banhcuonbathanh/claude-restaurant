# Project Tree — Hệ Thống Quản Lý Quán Bánh Cuốn

> Mô tả cấu trúc thư mục và file của toàn bộ project (không bao gồm `docs/`).

---

## Root

```
claude restaurant/
├── .claude/
│   └── settings.local.json    # Tool permissions, hooks cho Claude Code
├── .env                       # Biến môi trường thực (không commit)
├── .env.example               # Template biến môi trường
├── .gitignore
├── CLAUDE.md                  # Hướng dẫn làm việc với Claude (3-layer map)
├── PROJECT_TREE.md            # File này
├── docker-compose.yml         # Toàn bộ stack: MySQL, Redis, BE, FE, Caddy
├── go.mod                     # Go module root (module: banhcuon, go 1.25)
├── go.sum
├── tree.sh                    # Script sinh cây thư mục
├── server/                    # Placeholder — chưa dùng
├── prompts/                   # Prompt templates theo từng phase
├── be/                        # Backend Go
└── fe/                        # Frontend Next.js
```

---

## `prompts/` — Prompt Templates

Tập hợp prompt sẵn để paste vào Claude khi bắt đầu từng phase. Không chứa code.

```
prompts/
├── README.md
├── 00_quick_reference.md        # Tham chiếu nhanh: commands, ports, naming
├── session_start.md             # Prompt mở session mới
├── session_handoff.md           # Prompt đóng session / bàn giao
├── phase3_go_scaffold.md        # Scaffold Go project structure
├── phase3_nextjs_scaffold.md    # Scaffold Next.js project structure
├── phase3_sqlc_setup.md         # Cài và config sqlc
├── phase4_1_auth.md             # BE: Auth API (login, refresh, logout)
├── phase4_2_products.md         # BE: Products + Categories API
├── phase4_3_orders.md           # BE: Orders API
├── phase4_4_websocket.md        # BE: WebSocket / SSE realtime
├── phase4_5_payments.md         # BE: Payments + Webhooks
├── phase4_6_remaining.md        # BE: Các endpoint còn lại
├── phase5_1_auth.md             # FE: Auth pages (login, session guard)
├── phase5_2_menu_cart.md        # FE: Menu + Cart (QR flow)
├── phase5_3_checkout_sse.md     # FE: Checkout + SSE order tracking
├── phase5_4_kds.md              # FE: Kitchen Display System
├── phase5_5_pos_payment.md      # FE: POS + Payment UI
└── phase6_devops.md             # DevOps: Caddy, CI/CD, GitHub Actions
```

---

## `be/` — Backend (Go 1.25, Gin, sqlc, MySQL, Redis)

```
be/
├── .dockerignore
├── CLAUDE.md                    # Hướng dẫn riêng cho BE Claude agent
├── Dockerfile                   # Multi-stage build: golang:1.25-alpine → alpine
├── sqlc.yaml                    # Config sqlc: schema=migrations/, query=query/, out=internal/db/
│
├── cmd/
│   └── server/
│       └── main.go              # Entry point: init DB, Redis, router, start HTTP :8080
│
├── migrations/                  # Goose SQL migrations (chạy theo thứ tự số)
│   ├── 001_auth.sql             # users, refresh_tokens, sessions
│   ├── 002_products.sql         # products, categories
│   ├── 003_tables.sql           # restaurant_tables, qr_codes
│   ├── 004_combos.sql           # combos, combo_items
│   ├── 005_orders.sql           # orders, order_items, order_status_history
│   ├── 006_payments.sql         # payments, payment_methods
│   └── 007_files.sql            # uploaded_files (metadata lưu trữ media)
│
├── query/                       # SQL queries thô → sqlc generate → internal/db/
│   ├── auth.sql                 # Queries: users, refresh_tokens
│   ├── products.sql             # Queries: products, categories, combos
│   ├── orders.sql               # Queries: orders, order_items
│   ├── payments.sql             # Queries: payments
│   └── files.sql                # Queries: uploaded_files
│
├── internal/                    # Code nội bộ (không import bên ngoài module)
│   ├── db/                      # AUTO-GENERATED bởi sqlc — KHÔNG sửa tay
│   │                            # Chứa: *.sql.go, db.go, models.go, querier.go
│   │
│   ├── handler/                 # HTTP handlers (Gin) — layer ngoài cùng
│   │   └── respond.go           # respondOK() / respondError() theo ERROR_CONTRACT
│   │
│   ├── middleware/
│   │   ├── auth.go              # JWT verify middleware (Bearer token)
│   │   └── rbac.go              # Role-based access control (admin/manager/staff/customer)
│   │
│   ├── service/                 # Business logic — layer giữa handler và repository
│   │   └── errors.go            # Error types: ErrNotFound, ErrUnauthorized, v.v.
│   │
│   ├── repository/              # Data access layer — wrap sqlc queries, trả domain types
│   │
│   ├── model/                   # Request / Response DTOs (không phải DB structs)
│   │
│   ├── jobs/                    # Background jobs (cron, session cleanup)
│   ├── sse/                     # Server-Sent Events hub + handlers (realtime cho FE)
│   ├── websocket/               # WebSocket hub (dự phòng — luồng chính dùng SSE)
│   └── payment/                 # Payment gateway integrations (VNPay, v.v.)
│
└── pkg/                         # Shared utilities — có thể import từ bất kỳ đâu
    ├── bcrypt/
    │   └── bcrypt.go            # Hash / verify password
    ├── jwt/
    │   └── jwt.go               # Sign / parse JWT, đọc config từ env
    └── redis/
        └── client.go            # Khởi tạo Redis Stack client
```

---

## `fe/` — Frontend (Next.js 14 App Router, TypeScript strict, Tailwind v3)

```
fe/
├── .dockerignore
├── .env.local.example           # Template: NEXT_PUBLIC_API_URL, v.v.
├── .eslintrc.json
├── CLAUDE.md                    # Hướng dẫn riêng cho FE Claude agent
├── Dockerfile                   # Multi-stage: node:20-alpine → standalone output
├── next.config.js
├── next-env.d.ts
├── package.json                 # Deps chính: Next 14, Zustand v4, TanStack Query v5, RHF, Zod
├── package-lock.json
├── postcss.config.mjs
├── tailwind.config.ts           # Tailwind v3 + design tokens (màu, font từ MASTER §2)
└── tsconfig.json                # strict: true
│
└── src/
    ├── app/                     # Next.js App Router — mỗi thư mục = route segment
    │   ├── layout.tsx           # Root layout: fonts, providers (QueryClient, Zustand)
    │   ├── page.tsx             # Landing / redirect tuỳ role
    │   ├── globals.css          # Tailwind base + custom CSS vars
    │   │
    │   ├── (auth)/              # Route group không có shared layout
    │   │   └── login/
    │   │       └── page.tsx     # Trang đăng nhập cho staff / admin
    │   │
    │   ├── (dashboard)/         # Route group: layout dashboard (sidebar, header)
    │   │   ├── kds/
    │   │   │   └── page.tsx     # Kitchen Display System — hiển thị order realtime cho bếp
    │   │   ├── orders/live/
    │   │   │   └── page.tsx     # Quản lý order live (manager / cashier)
    │   │   └── pos/
    │   │       └── page.tsx     # Point-of-Sale — nhân viên tạo order tại quầy
    │   │
    │   ├── (shop)/              # Route group: layout customer-facing (QR flow)
    │   │   ├── menu/
    │   │   │   └── page.tsx     # Menu cho khách hàng (sau khi scan QR)
    │   │   ├── checkout/
    │   │   │   └── page.tsx     # Xác nhận giỏ hàng và đặt order
    │   │   └── order/[id]/
    │   │       └── page.tsx     # Theo dõi trạng thái order realtime (SSE)
    │   │
    │   └── table/[tableId]/
    │       └── page.tsx         # Entry point QR scan → lưu tableId → redirect vào menu
    │
    ├── components/              # UI components dùng chung
    │   ├── guards/              # Auth / role guard: bảo vệ route theo JWT role
    │   ├── menu/                # MenuCard, MenuList, CategoryFilter, v.v.
    │   ├── shared/              # Spinner, Modal, Toast, EmptyState, v.v.
    │   └── ui/                  # Primitives: Button, Input, Badge, Select (shadcn-style)
    │
    ├── features/                # Feature modules — co-locate logic theo domain
    │   ├── auth/                # Auth hooks, API calls, token helpers, types
    │   └── orders/              # Order hooks, SSE subscription, cart logic, types
    │
    ├── hooks/                   # Custom React hooks dùng chung (không gắn domain cụ thể)
    │
    ├── lib/                     # Utilities và configs
    │   └── .gitkeep             # Sẽ có: api-client.ts, queryClient.ts, validators…
    │
    ├── store/                   # Zustand stores — global client state
    │   └── .gitkeep             # Sẽ có: authStore.ts, cartStore.ts
    │
    └── types/                   # Shared TypeScript types / interfaces
        └── .gitkeep             # Sẽ có: api.ts, order.ts, product.ts…
```

---

## Docker Stack (`docker-compose.yml`)

| Service | Image | Port(s) | Mô tả |
|---|---|---|---|
| `mysql` | mysql:8.0 | 3306 | Database chính |
| `redis` | redis/redis-stack | 6379 / 8001 | Cache + pub/sub; RedisInsight UI tại :8001 |
| `be` | ./be/Dockerfile | 8080 | Go API server |
| `fe` | ./fe/Dockerfile | 3000 | Next.js server |
| `caddy` | caddy:alpine | 80 / 443 | Reverse proxy + TLS (Phase 6) |

---

## Luồng Dữ Liệu Tổng Quát

```
Khách hàng (QR Flow)
  table/[tableId]     → ghi nhận tableId vào session/store
  (shop)/menu         → GET /api/products → hiển thị menu
  (shop)/checkout     → POST /api/orders  → tạo order
  (shop)/order/[id]   → SSE /api/orders/:id/stream → theo dõi trạng thái

Staff (Dashboard)
  (auth)/login        → POST /api/auth/login → nhận JWT
  (dashboard)/pos     → tạo order thay khách
  (dashboard)/kds     → SSE → nhận order mới realtime, cập nhật trạng thái
  (dashboard)/orders  → xem + quản lý toàn bộ order

BE Layer (strict, trái → phải)
  handler → service → repository → db (sqlc generated)
```

---

## Naming Conventions

| Loại | Pattern | Ví dụ |
|---|---|---|
| Git branch (feature) | `feature/spec-NNN-slug` | `feature/spec-001-auth` |
| Git branch (fix) | `fix/slug` | `fix/auth-refresh-token-null` |
| Git branch (chore) | `chore/slug` | `chore/docker-compose-redis-stack` |
| Go package | lowercase, no underscore | `handler`, `service`, `repository` |
| FE component | PascalCase | `MenuCard.tsx`, `OrderStatus.tsx` |
| FE hook | camelCase, prefix `use` | `useCartStore.ts`, `useOrderSSE.ts` |
| Env var | UPPER_SNAKE_CASE | `MYSQL_ROOT_PASSWORD`, `JWT_SECRET` |
