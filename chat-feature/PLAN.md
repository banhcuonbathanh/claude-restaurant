# CHAT Epic — Plan & System Drawings

Customer chats with an AI assistant → the AI reads real data and proposes actions via
tools → writes execute in the Go service layer **only after customer confirmation** →
FE reflects the change via SSE + query invalidation.

## v1 scope

- Customer-facing floating chat widget on `(shop)` pages (menu / order).
- Vietnamese-first assistant.
- Tools: `get_menu`, `get_my_order` (read) · `create_order`, `cancel_order` (write, confirm-gated).
- No DB migration: history in Redis (TTL 30 min); orders are the durable record.
- SSE transport for responses (token-level streaming = later enhancement, see Backlog).

## Architecture

```
┌──────────────────────────── FE (Next.js) ─────────────────────────────┐
│                                                                       │
│  ChatWidget (floating)      Menu / Order pages                        │
│  ┌─────────────────┐        ┌──────────────────┐                      │
│  │ ChatMessageList │        │ TanStack Query   │◄── invalidate ──┐    │
│  │ ChatActionCard  │        │ (orders, menu)   │                 │    │
│  │  [Xác nhận][Huỷ]│        └──────────────────┘                 │    │
│  │ ChatInput       │             ▲                               │    │
│  └───────┬─────────┘             │ existing SSE (order events)   │    │
│          │ useChatStream (SSE)   │                               │    │
└──────────┼───────────────────────┼───────────────────────────────┼────┘
           │ POST /api/v1/chat     │                               │
           ▼                       │                               │
┌─────────────────────────── BE (Go / Gin) ─────────────────────────────┐
│  chat_handler ──► chat_service ──────────────► internal/ai (client)  │
│      │                │  ▲                        │                   │
│      │                │  │ tool_use blocks        ▼                   │
│      │                ▼  │                  Anthropic API             │
│      │          chat_tools registry         (AI_CHAT_MODEL,           │
│      │            │ (whitelist, scoped       Go SDK)                  │
│      │            │  to caller JWT)                                   │
│      │            ▼                                                   │
│      │     order_service · product_service   ──► MySQL                │
│      │            │                                                   │
│      │            └──► Redis pub/sub (existing SSE) ──────────────────┘
│      │
│  Redis: chat:{session_id}          = history (TTL 30 min)
│         chat:{session_id}:pending  = proposed action awaiting confirm
└───────────────────────────────────────────────────────────────────────┘
```

## Sequence — a write action

```
Customer          FE ChatWidget        BE chat_service         AI (Claude)      order_service
   │ "2 bánh cuốn thịt"  │                    │                     │                │
   │────────────────────►│ POST /chat (SSE)   │                     │                │
   │                     │───────────────────►│ history + tools     │                │
   │                     │                    │────────────────────►│                │
   │                     │                    │◄─ tool_use:         │                │
   │                     │                    │   create_order(...) │                │
   │                     │◄─ event: proposal ─│  (NOT executed —    │                │
   │  sees ActionCard    │                    │   saved as pending) │                │
   │  taps [Xác nhận]────►│ POST /chat/confirm │                     │                │
   │                     │───────────────────►│── execute pending ──┼───────────────►│ INSERT order
   │                     │◄─ JSON: order_number, message            │◄───────────────│
   │                     │◄─ (chat marks data_updated)              │                │
   │  order views refresh (invalidateQueries + existing order SSE)                   │
```

Key decision: tool execution is **in-process** (chat_service → order_service), not HTTP
loopback — same validation, same business rules, no auth juggling.
Confirm executes **deterministically** (no second model round-trip) — cheaper and predictable.

## API contract (new endpoints)

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/v1/chat` | Bearer (guest or staff) | `{session_id?, message, table_id?, order_id?}` | **SSE stream**: events `text` · `proposal` · `done` · `error`, each `data:` JSON |
| POST | `/api/v1/chat/confirm` | Bearer | `{session_id, action_id, approve}` | JSON `{status:"executed"\|"rejected", message, order_id?, order_number?, data_updated}` |

SSE event payloads:

```
event: text      data: {"text":"..."}
event: proposal  data: {"action_id":"...","tool":"create_order","summary":"...","input":{...}}
event: done      data: {"session_id":"..."}
event: error     data: {"code":"CHAT_001","message":"..."}
```

Error codes (extends ERROR_CONTRACT): `CHAT_001` AI unavailable/not configured ·
`CHAT_002` invalid session/pending action · `CHAT_003` model refused/failed.

## File map (implementation)

```
be/internal/ai/client.go                 Anthropic SDK wrapper; env ANTHROPIC_API_KEY, AI_CHAT_MODEL
be/internal/handler/chat_handler.go      SSE endpoint + confirm endpoint
be/internal/service/chat_service.go      loop · Redis history · proposal gate · system prompt
be/internal/service/chat_tools.go        tool registry: schemas + executors
be/cmd/server/main.go                    DI wiring + routes (chat group)
fe/src/store/chat.ts                     Zustand store
fe/src/hooks/useChatStream.ts            SSE consume (fetch stream) + invalidation
fe/src/features/chat/ChatWidget.tsx      floating button + panel (mounted in (shop)/layout.tsx)
fe/src/features/chat/ChatMessageList.tsx
fe/src/features/chat/ChatInput.tsx
fe/src/features/chat/ChatActionCard.tsx  [Xác nhận] [Huỷ]
fe/src/lib/storage-keys.ts               + CHAT_SESSION key
.env.example                             + ANTHROPIC_API_KEY, AI_CHAT_MODEL
```

## Security model

- Caller identity comes from the JWT only (`middleware.AuthRequired`) — guest tokens are `role=customer`.
- `get_my_order` / `cancel_order` pass `callerID/callerRole` into the existing service methods → the same ownership rules apply as everywhere else.
- Tool whitelist: model can only invoke registered tools; anything else → tool_result error.
- Menu text (names/notes) is untrusted content inside the prompt — system prompt instructs the model that product data is data, not instructions.
- `ANTHROPIC_API_KEY` never leaves the BE.

## Backlog (post-v1)

- Token-level streaming (`Messages.NewStreaming`) for typing effect.
- Staff/admin chat surface.
- `chat_messages` audit table if the owner wants durable transcripts.
- Prompt caching for the system prompt + tool defs.


be/internal/
├── ai/
│   ├── client.go          # Anthropic Go SDK wrapper (github.com/anthropics/anthropic-sdk-go)
│   │                      #   model from env AI_CHAT_MODEL (default claude-opus-4-8), streaming
│   └── client_test.go
├── handler/
│   └── chat_handler.go    # POST /api/v1/chat (SSE out) · POST /api/v1/chat/confirm
├── service/
│   ├── chat_service.go    # conversation loop, Redis history, proposal/confirm state
│   ├── chat_tools.go      # tool registry: schemas + executors calling existing services
│   └── chat_service_test.go
└── (routes wired in existing router file)


fe/src/
├── features/chat/
│   ├── ChatWidget.tsx        # floating button + slide-up panel (same pattern as FavouritesSpeedDial)
│   ├── ChatMessageList.tsx
│   ├── ChatInput.tsx
│   └── ChatActionCard.tsx    # proposed action + [Xác nhận] [Huỷ]
├── hooks/
│   └── useChatStream.ts      # SSE consumption + emits invalidateQueries on data_updated
├── store/
│   └── chat.ts               # Zustand: open state, messages, pendingProposal
└── lib/storage-keys.ts       # + CHAT_SESSION_ID key (rule: no hardcoded keys)


docs/spec/Spec_11_AI_Chat.md                       # tools, confirm flow, error codes, prompts
docs/fe/wireframes/customer_chat/                  # via /wireframe + /excalidraw skills
docs/system/08_pages/customer/customer_chat/       # 6-file doc-set later via /page-doc-set
docs/contract/API_CONTRACT_v1.2.md                 # ⚠️ new §Chat rows — table edit, I will show
                                                   #   the exact rows and wait for your OK first
