# AI Chat Widget — floating on every `(shop)` page

> **TL;DR:** ✅ implemented · guest JWT required to talk · Floating 💬 FAB (bottom-LEFT — the
> favourites speed-dial owns the right) that opens a 70vh bottom sheet: message list, streaming
> assistant replies over SSE, a confirm-gated ActionCard for proposed writes (create/cancel
> order), and a text input. Mounted **once** in `fe/src/app/(shop)/layout.tsx` — it rides on
> `/menu`, `/order/*`, `/checkout`, everywhere in the shop shell.
> Traced from source on branch `docs/customer-menu-alignment` (verified 2026-07-08).
> BE view (endpoints, agent loop, Redis state) → [be.md](be.md) ·
> Harness spec → [../claude.Chat.md](../claude.Chat.md)

---

## ASCII Wireframe — closed (FAB) vs open (sheet)

```
CLOSED — every (shop) page                OPEN — fixed inset-x-0 bottom-0, h-70vh, z-40
┌──────────────────────────────┐          ┌──────────────────────────────────────────┐
│                              │          │ Trợ lý Bánh Cuốn 🤖                  ✕  │ ← A Header
│         (page content)       │          │ Tư vấn món · đặt món · kiểm tra đơn      │
│                              │          ├──────────────────────────────────────────┤
│                              │          │        Xin chào! Mình có thể tư vấn      │ ← B ChatMessageList
│ ┌────┐                       │          │        món và đặt món giúp bạn 🍽️        │   (empty greeting)
│ │ 💬 │            ┌────┐     │          │                      ┌─────────────────┐ │
│ └────┘            │ ♥  │     │          │                      │ user bubble     │ │   user → right, primary bg
│  ↑ FAB bottom-left│fav │     │          │                      └─────────────────┘ │
│  (z-30, h-11 w-11)└────┘     │          │ ┌──────────────────────┐                 │   assistant → left, gray bg
│ [Menu][Đơn][Yêu][Theo][Cài]  │          │ │ assistant bubble     │                 │   system → centered muted
└──────────────────────────────┘          │ └──────────────────────┘                 │
                                          │ ┌──────────────────────┐                 │
  FAB: bottom-[calc(96px+safe-area)]      │ │ Đang trả lời…        │ ← streaming     │
  left-4 · hidden while sheet is open     │ └──────────────────────┘   placeholder   │
                                          ├──────────────────────────────────────────┤
                                          │ ┌ Trợ lý đề xuất: ────────────────────┐  │ ← C ChatActionCard
                                          │ │ Tạo đơn: 2× Bánh cuốn nhân thịt     │  │   (only when proposal
                                          │ │ [    Xác nhận    ] [     Huỷ     ]  │  │    pending)
                                          │ └─────────────────────────────────────┘  │
                                          ├──────────────────────────────────────────┤
                                          │ ┌──────────────────────────┐             │
                                          │ │ Nhắn cho trợ lý…         │      [Gửi]  │ ← D ChatInput
                                          │ └──────────────────────────┘             │   (disabled while streaming)
                                          └──────────────────────────────────────────┘
```

### Per-Zone Detail — where each zone's data comes from

**Legend** (same notation as [customer_menu.md](../docs/system/08_pages/customer/customer_menu/customer_menu.md)):

```
◀── reads      zone renders FROM this source      ⚡  in-memory Zustand singleton
──▶ writes     zone mutates this source           📦  TanStack Query (server state)
(local)        component useState — never shared
```

**The one rule:** every zone talks to the same **`useChatStore`** singleton (memory-only, NOT
persisted); the only network surface is **`useChatStream`** (`send` / `confirm` / `reject`).
The durable conversation lives **server-side** in Redis — the store's `messages[]` is just a
display mirror for the current page load.

```
   ⚡ useChatStore (memory only)            useChatStream (the only network path)
   isOpen · isStreaming · sessionId ·       send()    → POST /chat (raw fetch, SSE parse)
   messages[] · proposal                    confirm() → POST /chat/confirm approve:true
        ▲ writes            reads ▲         reject()  → POST /chat/confirm approve:false
        │                         │              │ reads ⚡ useAuthStore.accessToken
   useChatStream ────────────────ChatWidget      │ reads ⚡ useCartStore.tableId/activeOrderId
   (SSE events → store actions)  (+ B, C, D)     │ localStorage: chat-session-id
                                                 └ on data_updated ──▶ 📦 invalidateQueries()
```

---

**FAB · open button** — `ChatWidget.tsx:19-28`. Renders only while `!isOpen`; tap
`──▶ ⚡ setOpen(true)`. Fixed `left-4`, above the bottom nav; z-30 (below the sheet's z-40).

**A · Header** — static title + subtitle; ✕ tap `──▶ ⚡ setOpen(false)`. Closing does NOT
reset the conversation — `messages`/`proposal` stay in the store for reopening (until reload).

**B · ChatMessageList** — pure render of `◀── ⚡ messages[]` + `isStreaming`.

```
role='user'      → right-aligned bubble, bg-primary white text
role='assistant' → left-aligned bubble, bg-gray-100          (max-w-80%, whitespace-pre-wrap)
role='system'    → centered muted caption (errors, "cần quét QR…")
isStreaming      → extra left bubble "Đang trả lời…"
auto-scroll: bottomRef.scrollIntoView(smooth) on every messages/isStreaming change
empty state: "Xin chào! Mình có thể tư vấn món và đặt món giúp bạn 🍽️"
```

Streaming merge: `appendAssistant` (`store/chat.ts:53-61`) folds consecutive `text` SSE events
into the **last assistant bubble** (joined with `\n`) while `isStreaming` — one bubble per
turn, one line per agent-loop iteration.

**C · ChatActionCard** — the human side of the approval gate. Renders only while
`◀── ⚡ proposal !== null`.

```
┌ Trợ lý đề xuất: ───────────────────────────┐   ◀── ⚡ proposal.summary (BE-built Vietnamese
│ Tạo đơn: 2× Bánh cuốn nhân thịt, 1× Canh   │       text with real product names, not UUIDs)
│ [ Xác nhận ]                    [ Huỷ ]    │
└────────────────────────────────────────────┘
  Xác nhận ──▶ respondToProposal(true)  → POST /chat/confirm {session_id, action_id, approve:true}
  Huỷ      ──▶ respondToProposal(false) → same, approve:false
  BOTH first ⚡ setProposal(null) — the card disappears immediately (flag §2)
  success  → assistant bubble with result message ("Đã tạo đơn BC-…")
           → data_updated ⇒ ⚡ setActiveOrderId(order_id) + 📦 queryClient.invalidateQueries()
             (order/menu views on the page behind the sheet refresh — the visible receipt)
```

**D · ChatInput** — `(local)` useState value; Enter or [Gửi] `──▶ send(text)`, then clears.
Both input actions no-op while `disabled` (= `isStreaming`); [Gửi] also disabled when empty.

### `useChatStream.send()` — the SSE pipeline (`useChatStream.ts:61-142`)

```
send(text)
├─ ⚡ addMessage('user', text)                       (optimistic — shown before any network)
├─ no ⚡ accessToken → system msg "Bạn cần quét mã QR trên bàn trước…" → STOP (flag §3)
├─ ⚡ setStreaming(true)
├─ raw fetch POST {baseURL}/chat                     (NOT the axios client — EventSource
│    body: { session_id: localStorage ?? undefined,   can't POST, so manual stream read)
│           message, table_id: ⚡cart.tableId, order_id: ⚡cart.activeOrderId }
├─ read body chunks → parseSSE(buffer) → for each event:
│    text     → ⚡ appendAssistant(payload.text)
│    proposal → ⚡ setProposal({actionId, tool, summary})
│    done     → localStorage.setItem('chat-session-id', session_id) + ⚡ setSessionId
│    error    → ⚡ addMessage('system', payload.message)
└─ finally ⚡ setStreaming(false)
   non-OK response → system msg "Trợ lý AI đang gặp sự cố…" · thrown/network → "Mất kết nối…"
```

## Zones

| Zone | Component | Data source |
|---|---|---|
| FAB | `features/chat/ChatWidget` | `⚡ useChatStore.isOpen` — render gate only |
| A Header | inline in `ChatWidget` | static text; ✕ → `setOpen(false)` |
| B Messages | `features/chat/ChatMessageList` | `⚡ messages[]` + `isStreaming`; auto-scroll; role-styled bubbles |
| C ActionCard | `features/chat/ChatActionCard` | `⚡ proposal` (from the `proposal` SSE event); buttons → `POST /chat/confirm` |
| D Input | `features/chat/ChatInput` | `(local)` value; submit → `useChatStream.send()` |
| (hook) | `hooks/useChatStream` | `POST /chat` SSE + `POST /chat/confirm`; reads `⚡ auth.accessToken`, `⚡ cart.tableId/activeOrderId`; writes `⚡ useChatStore`; `localStorage STORAGE_KEYS.CHAT_SESSION ('chat-session-id')` |
| (store) | `store/chat.ts` | memory-only Zustand — no `persist`, no localStorage (session id is the hook's job) |

Mount point: `fe/src/app/(shop)/layout.tsx:13` — once for the whole customer shell; staff
`(dashboard)` pages do NOT get the widget.

## Key Interactions

- **Ask about menu/order** → send → assistant streams into one bubble; the model reads real
  data through BE tools (`get_menu`, `get_my_order`) — never FE caches.
- **"Đặt cho mình 2 bánh cuốn"** → assistant text + `proposal` event → ActionCard renders.
  **Nothing is written yet** — the order exists only as `chat:{sid}:pending` in Redis (10 min).
- **Xác nhận** → `POST /chat/confirm` → BE executes through the real order pipeline → result
  bubble with `order_number` → `setActiveOrderId` + global query invalidation refreshes the
  page behind the sheet. **Huỷ** → pending action cleared, "Đã huỷ đề xuất." bubble.
- **Session continuity** → `chat-session-id` in localStorage; the BE keeps 7 days of history
  (compacted with a rolling summary) so a returning customer's model remembers preferences —
  but the on-screen list starts empty each page load (flag §1).
- **Streaming lock** → input + send disabled while a turn is in flight; the FAB hides while
  the sheet is open.

## Object Model — chat wire shapes (FE ⇄ BE)

| Shape | FE type | Wire | Notes |
|---|---|---|---|
| request | — | `{session_id?, message, table_id?, order_id?}` | `table_id`/`order_id` from `⚡ useCartStore` — same identity the menu page uses |
| SSE `text` | → `ChatMessage{role:'assistant'}` | `{text}` | merged per-turn by `appendAssistant` |
| SSE `proposal` | `ChatProposal{actionId, tool, summary}` | `{action_id, tool, summary, input}` | `input` (raw tool args) is **ignored by FE** — only the summary is shown |
| SSE `done` | `sessionId` | `{session_id}` | persisted to localStorage |
| SSE `error` | → `ChatMessage{role:'system'}` | `{code, message}` | `code` currently unused by FE |
| confirm req | — | `{session_id, action_id, approve}` | via axios `api.post` (auth header from interceptor) |
| confirm res | `ConfirmResponse` | `{status, message, order_id?, order_number?, data_updated}` | `data_updated:true` → invalidate all queries |

## Flags / Known Mismatches

| # | Flag | Detail |
|---|---|---|
| 1 | **Reload loses the visible history (and any pending card)** | `useChatStore` has no `persist` and there is **no GET-history endpoint** — after a reload the widget greets fresh while BE Redis still holds 7 days of turns and possibly a live `pending` action. [claude.Chat.md §6](../claude.Chat.md) claims "a page reload resumes the same conversation and the same pending proposal" — true for the *model's* memory, **not** for the UI. Doc-vs-code drift; either build a history/pending fetch or soften the harness claim. |
| 2 | **Proposal card is cleared before the confirm POST** | `respondToProposal` calls `setProposal(null)` first (`useChatStream.ts:150`); if the POST then fails, the card is gone with no retry path while `chat:{sid}:pending` is still alive in Redis for 10 min — the customer must re-ask the assistant. |
| 3 | **No-token message is narrower than reality** | "Bạn cần quét mã QR trên bàn trước khi dùng trợ lý" — but online-guest tokens (`POST /auth/guest/online`, auto-minted by `/menu`) also pass `authMW`. In practice a menu visitor almost always has a token; the copy just misdescribes the requirement. |
| 4 | **`invalidateQueries()` is unscoped** | After a confirmed write the hook invalidates **every** query (menu catalog included), not just order keys. Simple and correct, but a full refetch storm on slower connections. |
| 5 | **`reset()` is dead code** | `useChatStore.reset` is never called anywhere — conversations only clear on reload. |
| 6 | **Chat orders bypass the cart conventions** | The chat flow never touches `useCartStore.items` or `buildOrderItemsPayload()` — no `filling`, no combo overrides, no canh-required gate (see [be.md flag §2](be.md#flags)). A chat-created order can therefore violate the "every order has canh" UX rule the menu page enforces. Confirm with owner whether that's acceptable for v1. |
| 7 | **Streaming bubble joins iterations with `\n`** | Multi-iteration turns (text → tool → text) render as one bubble with hard line breaks — cosmetic, but distinct paragraphs from one model turn are indistinguishable from the iteration seams. |
