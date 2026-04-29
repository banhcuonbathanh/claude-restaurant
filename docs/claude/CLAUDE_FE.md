| 🍜  HỆ THỐNG QUẢN LÝ QUÁN BÁNH CUỐN
⚛️  FRONTEND DEVELOPER
Next.js 14 · TypeScript · Tailwind · Zustand · TanStack Query
CLAUDE_FE.docx  ·  v1.0  ·  ECC-Free  ·  Tháng 4 / 2026 |
| --- |

| ℹ️  Đọc MASTER.docx §1 (design tokens) và §3 (auth flow) trước khi build bất kỳ component nào.
KHÔNG hardcode màu HEX — dùng Tailwind class từ MASTER.docx §1.1. |
| --- |

**§  ****Section 1 — Role & Responsibilities**
| Owns | Không Sửa | Coordinate With |
| --- | --- | --- |
| fe/app/ (App Router pages) | be/ (BE Dev) | BE Dev: API response shape |
| fe/features/ (domain stores + APIs) | migrations/ (DB Dev) | System Dev: WS/SSE client |
| fe/components/ (UI components) | docs/MASTER.docx (Lead) | BA: AC + UX questions |
| fe/lib/api-client.ts | docs/API_CONTRACT.docx (Lead) | Lead: design token decisions |
| fe/public/, fe/styles/ |  | DevOps: build + env vars |

**§  ****Section 2 — Tài Liệu Đọc Trước Khi Code**
| Cần Gì | Đọc File | Section |
| --- | --- | --- |
| Màu sắc, typography, spacing | MASTER.docx | §1.1 Color Palette + §1.3 Typography |
| KDS color-code logic | MASTER.docx | §1.2 KDS Color-Code (3 mức urgency) |
| Auth flow, token storage | MASTER.docx | §3 Authentication & JWT Config |
| Zustand store + interceptor pattern | docs/specs/001_auth.docx | F2 — State & Token Management |
| API endpoint URLs + request body | API_CONTRACT.docx | §2 Auth, §3 Products, §4 Orders |
| Error codes → toast messages | MASTER.docx | §6 — Error Codes (FE Action column) |
| WebSocket reconnect | MASTER.docx | §5.1 — WebSocket (KDS) |
| SSE events + format | MASTER.docx | §5.2 + §5.3 — SSE Format |
| Next.js conventions | MASTER.docx | §7.2 — Next.js Frontend Rules |

**§  ****Section 3 — Folder Structure**
| fe/
├── app/
│   ├── (auth)/login/page.tsx       ← login page
│   ├── (shop)/page.tsx             ← customer menu
│   ├── (shop)/order/[id]/page.tsx  ← SSE order tracking
│   └── (dashboard)/               ← staff pages (chef, cashier, manager)
│       ├── kds/page.tsx            ← WebSocket KDS
│       └── pos/page.tsx            ← POS offline
├── features/
│   ├── auth/
│   │   ├── auth.store.ts           ← Zustand: { user, accessToken, setAuth, clearAuth }
│   │   └── auth.api.ts             ← login(), logout(), refreshToken(), getMe()
│   └── orders/
│       ├── orders.store.ts
│       └── orders.api.ts
├── components/
│   ├── ui/                         ← Button, Input, Modal, Badge ...
│   └── guards/
│       ├── AuthGuard.tsx           ← redirect nếu chưa login
│       └── RoleGuard.tsx           ← 403 nếu role không đủ
└── lib/
    └── api-client.ts               ← axios instance + interceptors |
| --- |

**§  ****Section 4 — Current Work: Spec 001 — Auth**
**☐  **fe/lib/api-client.ts — axios instance, request interceptor (Bearer), response interceptor (401 → refresh)
**☐  **fe/features/auth/auth.store.ts — Zustand: user, accessToken IN MEMORY (không localStorage)
**☐  **fe/features/auth/auth.api.ts — login(), logout(), refreshToken(), getMe()
**☐  **fe/app/(auth)/login/page.tsx — form với React Hook Form + Zod validation
**☐  **fe/app/(auth)/layout.tsx — centered card layout cho auth pages
**☐  **fe/components/guards/AuthGuard.tsx — HOC check auth → redirect /login
**☐  **fe/components/guards/RoleGuard.tsx — HOC check role_value >= required → 403

**Critical Implementation Notes**
| Access token: KHÔNG lưu localStorage. Lưu trong module-level Zustand state (memory only). Xem MASTER §3.1.
Refresh token: httpOnly cookie — KHÔNG handle thủ công. Browser gửi tự động với credentials.
interceptor: on 401 → call /auth/refresh → update store → retry original request. Xem 001_auth F2.
Design tokens: KHÔNG hardcode '#FF7A1A'. Dùng 'text-orange-500'. Xem MASTER §1.1.
State: Server state → TanStack Query. Client state → Zustand. Form → React Hook Form + Zod.
Sau F5: onMount → GET /auth/me (access token sẽ được refresh tự động nếu cần). |
| --- |

**§  ****Section 5 — Working Protocol**
| Situation | Action |
| --- | --- |
| API response shape không khớp spec | Check API_CONTRACT.docx trước. Nếu BE chưa implement → coordinate với BE Dev. |
| Design token không có trong MASTER §1 | Hỏi Lead trước khi add. Không tự thêm màu mới. |
| WebSocket / SSE cần implement | Coordinate với System Dev — họ sẽ cung cấp event format (MASTER §5.3). |
| Component cần data từ backend chưa có | Mock data locally. Flag là TODO. Đừng block toàn bộ feature. |
| Cần thêm endpoint | Propose format cho Lead. KHÔNG tự call endpoint không có trong API_CONTRACT.docx. |
