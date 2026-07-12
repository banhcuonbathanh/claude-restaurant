---
tags: [fe, page/customer, ai]
---

# FE — Chat Widget

Customer AI chat widget, mounted in the `(shop)` layout (CHAT epic).

## Code

- Feature: `fe/src/features/chat/`
- Store: `fe/src/store/chat.ts`
- Streaming hook: `fe/src/hooks/useChatStream.ts`

## Governance

CHAT epic runs on `claude.Chat.md` + `chat-feature/` (10-primitive harness) — **not** the root CLAUDE.md workflow. Tracker: `chat-feature/PROGRESS.md`.

## Related

- [[BE - Chat AI]] — SSE endpoint + tool loop
- [[FE - Customer Menu]] — host layout
