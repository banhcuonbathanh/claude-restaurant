---
tags: [be, domain/chat, ai]
---

# BE — Chat AI

Customer-facing AI chat assistant (CHAT epic). **Governed by `claude.Chat.md` + `chat-feature/` — NOT the root CLAUDE.md workflow.**

## Code chain

- `be/internal/handler/chat_handler.go` → `be/internal/service/chat_service.go`
- Tool definitions: `be/internal/service/chat_tools.go`
- AI client: `be/internal/ai/`
- Tests: `chat_service_test.go`

## Design

- `POST /api/v1/chat` — SSE streaming, tool loop: `get_menu` · `get_my_order` · `create_order` · `cancel_order` (writes are confirm-gated)
- `POST /api/v1/chat/confirm` — confirms a gated write
- Redis history 7 days + rolling summary
- Status: CHAT-0…5c + 7 ✅ · CHAT-6 live E2E blocked on `ANTHROPIC_API_KEY`

## Docs

- Live tracker: `chat-feature/PROGRESS.md` · receipts: `chat-feature/VERIFICATION.md` · context: `chat-feature/chat_context.md`

## Related

- [[FE - Chat Widget]] · [[BE - Orders]] · [[BE - Products & Menu]] · [[BE - Auth]] (guest auth)
