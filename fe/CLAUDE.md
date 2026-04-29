# fe/CLAUDE.md

> Tầng 1 — FE map only. KHÔNG chứa: business rules, hex colors, token values.
> Full FE dev guide → `docs/claude/CLAUDE_FE.md`

---

## Đọc Trước Khi Code (Tầng 2)

| Cần Gì | File | Section |
|---|---|---|
| Full FE dev guide (roles, protocol) | `docs/claude/CLAUDE_FE.md` | tất cả |
| Design tokens (màu, font, spacing) | `docs/MASTER_v1.2.md` | §2 |
| KDS color-code logic (urgency) | `docs/MASTER_v1.2.md` | §2 (KDS) |
| Auth flow + token storage rules | `docs/MASTER_v1.2.md` | §6 |
| WS/SSE config + reconnect | `docs/MASTER_v1.2.md` | §5 |
| API endpoint URLs + request body | `docs/contract/API_CONTRACT_v1.2.md` | §2–§10 |
| Error codes → toast messages | `docs/contract/ERROR_CONTRACT_v1.1.md` | — |
| Domain UI + store logic | `docs/spec/Spec_3_Menu_Checkout_UI_v2.md` … | per domain |

## Architecture (Strict)

```
Server state  → TanStack Query
Client state  → Zustand (memory only — never localStorage for tokens)
Forms         → React Hook Form + Zod
API calls     → lib/api-client.ts (axios + interceptors)
```

```
fe/
├── app/
│   ├── (auth)/login/           ← login page
│   ├── (shop)/                 ← customer menu + order tracking (SSE)
│   └── (dashboard)/            ← staff: kds/ (WS) · pos/ · manager/
├── features/
│   ├── auth/                   ← auth.store.ts · auth.api.ts
│   └── [domain]/               ← [domain].store.ts · [domain].api.ts
├── components/
│   ├── ui/                     ← Button, Input, Modal, Badge
│   └── guards/                 ← AuthGuard.tsx · RoleGuard.tsx
└── lib/
    └── api-client.ts           ← axios instance + interceptors
```

## Commands

```bash
# từ repo root
cd fe && npm run dev             # :3000
cd fe && npm run build
cd fe && npm run lint
docker compose up -d --build fe  # rebuild FE container
```

## Critical Pointers

- KHÔNG hardcode hex — dùng Tailwind class từ `docs/MASTER_v1.2.md §2`
- Access token: Zustand memory ONLY → `docs/MASTER_v1.2.md §6`
- SSE auth: `Authorization: Bearer` header · WS auth: `?token=` query param → `docs/MASTER_v1.2.md §5`
- All IDs: `string` (UUID) — never `number`
- Next.js conventions → `docs/MASTER_v1.2.md §7.2`

## Root Context

Root map → `../CLAUDE.md` · Phase status + branch → root CLAUDE.md §Phase Status
