---
tags: [be, domain/realtime]
---

# BE — Realtime & Jobs

SSE + WebSocket push for live order/table updates, plus background jobs.

## Code

- `be/internal/sse/` — Server-Sent Events (customer order tracking, admin streams)
- `be/internal/websocket/` — WebSocket (admin overview live floor)
- `be/internal/jobs/` — background jobs

## Single sources

- Realtime config: `docs/core/MASTER_v1.2.md §5` + `docs/contract/API_CONTRACT_v1.2.md §10` → [[Docs - Core Rules]] / [[Docs - Contracts]]
- Proxy implications (Caddy buffering, timeouts) → [[Architecture - Infrastructure]]

## FE consumers (hooks in `fe/src/hooks/`)

| Hook | Feeds |
|---|---|
| `useOrderSSE.ts` | [[FE - Order Tracking]] |
| `useAdminSSE.ts` | [[FE - Admin Overview]] |
| `useOverviewWS.ts` | [[FE - Admin Overview]] live floor |
| `useOrderMonitorSSE.ts` | `(dashboard)/orders/live` monitor |
| `useChatStream.ts` | [[FE - Chat Widget]] |
