# BanhCuon — Claude Session Prompt System

A set of ready-to-use prompt templates for every development session on this project.

## How to Use

1. **Pick the template** for your current task (see table below)
2. **Open the template file** — it tells you exactly which docs to paste in
3. **Paste the docs** listed in "Always Include" + "Task Docs" into the Claude session
4. **Fill in the blanks** marked with `[...]`
5. **Start the session** — Claude has everything it needs

## Template Index

| File | When to use |
|---|---|
| [session_start.md](session_start.md) | Beginning of any session — orient Claude to current state |
| [session_handoff.md](session_handoff.md) | End of any session — record what was done, what's next |
| [00_quick_reference.md](00_quick_reference.md) | Keep this open in a tab — field names, rules, commands |
| [phase3_sqlc_setup.md](phase3_sqlc_setup.md) | Task 3.1 — sqlc.yaml + query/auth.sql |
| [phase3_go_scaffold.md](phase3_go_scaffold.md) | Task 3.3 — Go module init + be/ folder structure |
| [phase3_nextjs_scaffold.md](phase3_nextjs_scaffold.md) | Task 3.4 — Next.js 14 init + fe/src/ structure |
| [phase4_1_auth.md](phase4_1_auth.md) | Task 4.1 — pkg/jwt, middleware, auth service + handler |
| [phase4_2_products.md](phase4_2_products.md) | Task 4.2 — product repo, service (Redis cache), handler |
| [phase4_3_orders.md](phase4_3_orders.md) | Task 4.3 — order service, SSE handler |
| [phase4_4_websocket.md](phase4_4_websocket.md) | Task 4.4 — Redis pub/sub, WebSocket hub, 3 WS endpoints |
| [phase4_5_payments.md](phase4_5_payments.md) | Task 4.5 — VNPay/MoMo/ZaloPay + webhook handlers |
| [phase4_6_remaining.md](phase4_6_remaining.md) | Task 4.6 — QR endpoint, file upload, cleanup job |
| [phase5_1_auth.md](phase5_1_auth.md) | Task 5.1 — api-client, auth store, login page, guards |
| [phase5_2_menu_cart.md](phase5_2_menu_cart.md) | Task 5.2 — TypeScript types, cart store, menu components |
| [phase5_3_checkout_sse.md](phase5_3_checkout_sse.md) | Task 5.3 — checkout page, useOrderSSE hook, order tracking |
| [phase5_4_kds.md](phase5_4_kds.md) | Task 5.4 — KDS full-screen, WebSocket, color coding |
| [phase5_5_pos_payment.md](phase5_5_pos_payment.md) | Task 5.5 — POS cashier, payment UI, print receipt |
| [phase6_devops.md](phase6_devops.md) | Task 6.1–6.2 — Dockerfiles, docker-compose, CI/CD |

## Key Rules (Always Enforce)

- Only one task per Claude session — don't combine tasks
- Always run `sqlc generate && go build ./...` after any DB query change
- Always run `npx tsc --noEmit` after any TypeScript change
- Update `CLAUDE.md §Current Work` at every `/handoff`
- When Claude flags `⚠️ FLAG` or `🚨 RISK` — stop and resolve before continuing
