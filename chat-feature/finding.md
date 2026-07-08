# finding.md — Chat Feature Findings (to solve later)

> Found 2026-07-08 while tracing source for [fe.md](fe.md) / [be.md](be.md), branch
> `docs/customer-menu-alignment`. Every item is traced to code, not guessed.
> Status: ⬜ open · 🔄 in progress · ✅ fixed · 🚫 won't fix (owner decision).
> Detail lives in the flags tables of [be.md §Flags](be.md#flags) and [fe.md §Flags](fe.md#flags--known-mismatches).

| # | Status | Severity | Finding | Where |
|---|---|---|---|---|
| F1 | ⬜ | ⚠️ UX | `table_busy` discarded on chat path | `chat_service.go:320` |
| F2 | ⬜ | ⚠️ contract | Chat orders can't carry `filling` / combo overrides (OC epic) | `chat_tools.go:42-64` |
| F3 | ⬜ | ⚠️ UX/rule | Chat bypasses the canh-required gate | FE `useChatStream.ts` (no cart involvement) |
| F4 | ⬜ | 💡 data | `created_by='guest'` string vs NULL — two conventions | `chat_service.go:315-318` vs `order_handler.go:94` |
| F5 | ⬜ | ⚠️ doc drift | claude.Chat.md §6 claims reload resumes UI history + pending — FE can't | `store/chat.ts` (no persist), no GET-history endpoint |
| F6 | ⬜ | ⚠️ UX | Proposal card cleared before confirm POST — no retry on network failure | `useChatStream.ts:150` |
| F7 | ⬜ | 🚨 cost | No rate limit on `/chat` — 1–6 paid Anthropic calls per request behind authMW only | `main.go:280-284` |
| F8 | ⬜ | 💡 security note | Guest confirm scoping rests on UUID secrecy, not identity (all guests `sub='guest'`) | `chat_service.go:266` |
| F9 | ⬜ | 💡 copy | No-token message says "quét mã QR" but online-guest tokens also work | `useChatStream.ts:73` |
| F10 | ⬜ | 💡 perf | `invalidateQueries()` unscoped — refetches every query after a confirm | `useChatStream.ts:162` |
| F11 | ⬜ | 💡 cleanup | `useChatStore.reset()` is dead code — never called | `store/chat.ts:65` |
| F12 | ⬜ | 💡 cosmetic | Streaming bubble joins loop iterations with `\n` — paragraph vs iteration seams indistinguishable | `store/chat.ts:53-61` |
| F13 | ⬜ | 💡 doc | `CHAT_001/002/003` codes minted locally — verify registered in ERROR_CONTRACT_v1.1 | `chat_service.go` / `chat_handler.go` |
| F14 | ⬜ | ℹ️ by design | History persists plain text only — tool blocks dropped between requests (intentional, context mgmt) | `chat_service.go:93-96` |

---

## F1 · `table_busy` discarded on chat path — ⚠️ UX

`OrderService.CreateOrder` returns `(orderID, tableBusy, err)`; `tableBusy=true` means the
table already has a live order (order is still created — "one active order per table" warns,
never blocks; `order_service.go:284-295`). The normal path surfaces it: `order_handler.go:136`
puts `table_busy` in the 201 response and `TableConfirmModal` shows the "Bàn đang phục vụ
khách khác…" toast. The chat path throws it away:

```go
orderID, _, err := s.orders.CreateOrder(ctx, ...)   // chat_service.go:320
```

`ConfirmResult` has no `table_busy` field, so the FE can never show it — the chat always says
the happy-path "Đã tạo đơn BC-xxx". Same customer, same table: QR path warns, chat doesn't.

**Suggested fix (small):** capture the bool and, when true, append "Bàn đang phục vụ đơn
khác, món của bạn sẽ lên sau nhé" to `ConfirmResult.Message`. FE displays `data.message`
verbatim → BE-only change.

## F2 · Chat `create_order` tool predates the OC epic — ⚠️ contract

Tool schema (`chat_tools.go:42-64`) accepts only `{product_id|combo_id, quantity, note}` —
no `filling` (thit/moc_nhi), no `combo_items` sub-item overrides. `POST /orders` honours both
(OC-2, migration 016). Consequence: every chat order has `order_items.filling = NULL` and
stock combo templates; kitchen views (DishRow, WaitingSection, KDS) that render filling show
nothing for chat orders.

**Suggested fix:** add `filling` enum to the item schema + thread through
`confirmCreateOrder` → `CreateOrderItemInput`. Combo overrides optional — decide if chat
needs them at all.

## F3 · Chat bypasses the canh-required gate — ⚠️ UX/rule

Menu page enforces "order must include canh bowls" (CartBottomBar dim + OrderSummary shake).
Chat flow never touches `useCartStore.items` or `buildOrderItemsPayload()` — a chat customer
can confirm an order with zero canh and no warning. Model *may* upsell canh by prompt luck,
but nothing enforces it.

**Decide first:** is the canh rule a hard business rule (then BE/prompt must enforce it for
chat too) or a menu-page UX nudge only (then document the exemption)?

## F4 · `created_by` two conventions — 💡 data hygiene

- Menu/QR path: `order_handler.go:94` sets `callerID = ""` for guests → stored NULL.
- Chat path: `chat_service.go:315-318` sets `CreatedBy = "guest"` → the local
  `nullStr` closure (`order_service.go:327`) stores non-empty strings verbatim → literal
  `'guest'` in `orders.created_by`.

Any query using `created_by IS NULL` = "customer self-order" now misses chat orders.

**Suggested fix:** pass `""` for customer-role callers in `confirmCreateOrder` (align with
the handler convention) — or make `'guest'` the convention everywhere, but that's a wider
change.

## F5 · Harness doc overclaims reload resume — ⚠️ doc drift

[claude.Chat.md §6](../claude.Chat.md): "A dropped connection or page reload resumes the same
conversation and the same pending proposal." Server-side that's true (Redis `chat:{sid}` 7d +
`chat:{sid}:pending` 10m survive; session id survives in localStorage `chat-session-id`).
**UI-side it's false:** `useChatStore` is memory-only, there is no GET endpoint for history or
pending action — after reload the widget greets fresh and a live proposal card is unrecoverable.

**Options:** (a) add `GET /chat/history` (+ pending) and hydrate on open; (b) soften the
claude.Chat.md claim to "the model's memory resumes; the visible thread does not".

## F6 · Confirm card lost on network failure — ⚠️ UX

`respondToProposal` (`useChatStream.ts:150`) does `setProposal(null)` **before** the POST.
If `/chat/confirm` fails (network), the catch shows a system message but the card is gone —
while Redis still holds the pending action for up to 10 min. Customer must re-ask, creating a
*second* pending action.

**Suggested fix:** clear the proposal only on response (success or definitive rejection);
keep the card with buttons re-enabled on network error.

## F7 · No rate limit on a paid endpoint — 🚨 cost

`/chat` costs 1–6 Anthropic calls per request (loop cap 5 + possible summarization call).
Only `authMW` guards it (`main.go:280-284`); `middleware/ratelimit.go` exists but is not in
the chain. A scripted guest token (guest JWTs are mintable from any table QR / the public
online-guest endpoint) can burn API budget freely.

**Suggested fix:** wire the existing rate-limit middleware onto the chat group (per-token or
per-IP), tighter than normal routes.

## F8 · Guest confirm scoping = UUID secrecy — 💡 security note

`Confirm` checks `action.CallerID != in.CallerID` (`chat_service.go:266`), but every guest
JWT has `sub='guest'` → the check passes for *any* guest. Real isolation: attacker must know
both `session_id` (victim's localStorage) and `action_id` (victim's SSE stream) — unguessable
UUIDs. Acceptable for this threat model; just don't describe the check as per-customer auth.
No action needed unless threat model changes (e.g. chat exposed to staff writes).

## F9–F14 · Smaller items

- **F9** copy: `useChatStream.ts:73` — "Bạn cần quét mã QR trên bàn…" but any guest JWT works
  (menu page auto-mints online-guest tokens). Reword or auto-mint before chatting.
- **F10** perf: `queryClient.invalidateQueries()` with no key filter after confirm — consider
  scoping to order + menu keys.
- **F11** cleanup: `useChatStore.reset()` never called — delete or wire to a "clear chat" UI.
- **F12** cosmetic: `appendAssistant` merges each loop-iteration text with `\n` — fine for v1.
- **F13** doc: verify `CHAT_001` (503 disabled) · `CHAT_002` (confirm gate) · `CHAT_003`
  (AI failure/refusal) have rows in `docs/contract/ERROR_CONTRACT_v1.1.md`.
- **F14** by design: history stores plain text turns only — the model re-reads state via
  fresh tool calls each request. Keep; documented here so nobody "fixes" it.
