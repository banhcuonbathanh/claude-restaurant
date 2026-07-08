# AI Chat — Backend View

> **TL;DR:** the two BE endpoints behind the chat widget, traced handler → service →
> (Anthropic model ⇄ tools) → existing service layer, with auth, Redis state and error
> behaviour. Traced from source on branch `docs/customer-menu-alignment` (verified 2026-07-08).
> Sources: `be/cmd/server/main.go` (routes + DI) · `be/internal/handler/chat_handler.go` ·
> `be/internal/service/chat_service.go` · `be/internal/service/chat_tools.go` ·
> `be/internal/ai/client.go`.
>
> FE view (widget, zones, SSE consumption) → [fe.md](fe.md) ·
> Harness spec (the 10 primitives) → [../claude.Chat.md](../claude.Chat.md) ·
> Order write pipeline the confirm path reuses → `docs/system/02_spec/object/OBJECT_MODEL_ORDER.md`

---

## Endpoints

| # | Endpoint | Auth | Handler | Service | Response |
|---|---|---|---|---|---|
| 1 | `POST /chat` | authMW (guest JWT OK) | `chatH.Chat` | `ChatService.Chat` | **SSE stream** — events `text · proposal · done · error` |
| 2 | `POST /chat/confirm` | authMW (guest JWT OK) | `chatH.Confirm` | `ChatService.Confirm` | JSON `ConfirmResult` |

Route registration: `be/cmd/server/main.go:280-284` — group `v1.Group("/chat")` with `authMW`
on both routes. DI wiring `main.go:99-107`: `ai.NewClientFromEnv()` returns **nil when
`ANTHROPIC_API_KEY` is unset** → chat runs "disabled" (every `/chat` call answers `CHAT_001`).
Model comes from `AI_CHAT_MODEL` (default `claude-opus-4-8`, `ai/client.go:15`); the `ai`
package is the only place that touches the Anthropic SDK.

## Auth Model

- Both routes sit behind `authMW` — **any valid JWT passes**: QR guest (`sub='guest'`,
  carries `table_id`), online guest (table-less), or staff. No RBAC gate.
- The handler copies `claims.Subject`/`claims.Role` into `ChatContext.CallerID`/`CallerRole`
  (`chat_handler.go:61-70`); every tool execution is scoped by that context — `get_my_order`
  and both confirm executors call the existing `OrderService` with the caller's id+role, so
  the same ownership rules apply as on the normal order routes.
- ⚠ All guest JWTs share `sub='guest'`, so the `Confirm` ownership check
  (`action.CallerID != in.CallerID`, `chat_service.go:266`) does not discriminate *between*
  guests — real isolation rests on the unguessable `session_id` + `action_id` UUIDs (flag §4).
- `ANTHROPIC_API_KEY` lives only in BE env (compose service `be`); it never reaches the FE.

## Endpoint 1 · `POST /chat` — the agent loop (SSE)

Request body (`chatRequest`, `chat_handler.go:25-30`):
`{ session_id?, message (required), table_id?, order_id? }`. Empty `session_id` → service
mints a new UUID; the FE learns it from the `done` event and persists it.

The handler switches the response to `text/event-stream` (`X-Accel-Buffering: no` for
Caddy/nginx) and hands the service an `emit(event, payload)` closure. Loop
(`chat_service.go:142-251`), capped at **5 tool iterations**, `max_tokens 1024`:

```
load history (Redis chat:{sid}) ─→ rebuild messages (plain text turns only)
system = frozen chatSystemPrompt + per-request context (table_id · order_id · role)
       + rolling summary (if any)          ← context appended AFTER the frozen part
loop ≤5:
  CreateMessage(system, msgs, chatToolDefs())
  ├─ text block      → emit("text") + accumulate for history
  ├─ tool_use READ   → executeReadTool() inline → tool_result → next iteration
  └─ tool_use WRITE  → savePending (Redis, 10 min) → emit("proposal") →
                        append history → emit("done") → RETURN (loop suspended)
  stop_reason ≠ tool_use → break
append history → emit("done")
```

- **Write tools never execute inside the loop** — that is the approval-gate invariant
  (claude.Chat.md §4/§7). A write `tool_use` becomes a `pendingAction` in Redis and the
  request ends; execution happens only in endpoint 2.
- `proposalSummary()` (`chat_tools.go:165`) resolves product/combo ids to real names via
  `GetProductSnapshot`/`GetComboSnapshot` so the FE ActionCard shows "Tạo đơn: 2× Bánh cuốn…",
  not UUIDs.
- Model refusal (`stop_reason=refusal`) → `422 CHAT_003`; API error → `502 CHAT_003`.

### Tool registry (`chat_tools.go`)

| Tool | Kind | Input schema | Backed by |
|---|---|---|---|
| `get_menu` | read — inline | (none) | `ProductService.ListProducts` + `ListCombos` (both Redis-cached, 5 min) → compact pipe-delimited text: `id \| name \| price \| available` |
| `get_my_order` | read — inline | `order_id?` (falls back to `ChatContext.OrderID`) | `OrderService.GetOrder(orderID, callerID, callerRole)` → order JSON; no order id at all → friendly "chưa có đơn" text |
| `create_order` | **write — gated** | `items[{product_id\|combo_id, quantity, note}], note?` | `OrderService.CreateOrder` (on confirm only) |
| `cancel_order` | **write — gated** | `order_id` (falls back to pending action's `OrderID`) | `OrderService.CancelOrder` (on confirm only) |

`chatWriteTools` (`chat_tools.go:19`) is the gate whitelist; an unknown tool name from the
model → tool_result error `unknown tool`, never execution.

## Endpoint 2 · `POST /chat/confirm` — the human side of the gate

Request: `{ session_id, action_id, approve }` (all required; `approve` is `*bool` so an
explicit `false` binds). Flow (`chat_service.go:257-286`):

1. Load `chat:{sid}:pending` — missing/expired → `404 CHAT_002` ("không còn hành động…").
2. Check `action_id` + `caller_id` match → else `403 CHAT_002`.
3. **Single-shot:** the pending key is deleted *before* execution, approve or reject —
   a proposal can never run twice.
4. Reject → append "Khách đã từ chối: …" to history, return `{status:"rejected"}`.
5. Approve → deterministic execution, **no model round-trip**:
   - `create_order` → sanitizes items (skip empty ids, qty min 1), `source` = `qr` when the
     pending action carried a `table_id` else `online`, then `OrderService.CreateOrder` —
     same validation/snapshot/combo-expansion pipeline as `POST /orders`. Re-fetches the
     order for its `order_number`.
   - `cancel_order` → `OrderService.CancelOrder` with the caller's id+role (existing
     cancellation rules enforced there).
6. Success → confirmation line appended to history, response
   `{status:"executed", message, order_id, order_number?, data_updated:true}` — the FE uses
   `data_updated` to invalidate its query caches.

## Redis State & TTLs

| Key | Content | TTL | Notes |
|---|---|---|---|
| `chat:{session_id}` | `chatHistory{summary, turns[]}` — **plain text turns only**, tool blocks never persisted | 7 days | on the `redis_data` volume → survives restarts |
| `chat:{session_id}:pending` | `pendingAction{action_id, tool, input, summary, table/order/caller ids}` | 10 min | single pending action per session; overwritten by a newer proposal |

**Compaction, not truncation** (`saveHistory`, `chat_service.go:389-405`): past 20 turns,
everything older than the last 12 is folded into a rolling Vietnamese summary via one small
model call (`max_tokens 300`, prompt keeps: likes/dislikes, allergies, orders created or
cancelled + codes, special requests). The summary rides in the system prompt of every later
request. Summarization failure → silent fallback to a hard 20-turn cap. A legacy bare
`[]chatTurn` value still decodes (`loadHistory`).

All Redis write failures on history are swallowed (best-effort); only `savePending` failure
aborts the request — the gate must be durable or the proposal must not be shown.

## Error Behaviour

- Bind failures → `400 INVALID_INPUT` via `respondError()` (pattern →
  `docs/contract/ERROR_CONTRACT_v1.1.md`).
- On `/chat`, **once streaming starts the status is already 200** — service errors travel as
  a terminal `error` SSE event `{code, message}` (`chat_handler.go:71-78`), never a dead
  stream. Codes: `CHAT_001` = chat disabled (no API key) · `CHAT_003` = model/API failure or
  refusal.
- On `/chat/confirm`, errors are normal JSON via `handleServiceError` — `CHAT_002` for every
  gate violation (expired, wrong action id, wrong caller, unknown tool), plus whatever the
  order service raises (e.g. cancel rules, product not found).

## Flags

| # | Flag | Detail |
|---|---|---|
| 1 | **`table_busy` is discarded on the chat path** | `confirmCreateOrder` calls `orderID, _, err := s.orders.CreateOrder(…)` (`chat_service.go:320`) — the busy flag the normal `POST /orders` response surfaces (info-toast on FE) is dropped, so a chat customer is never told the table already has a live order. |
| 2 | **Chat orders can't carry `filling` or combo overrides** | The `create_order` tool schema (`chat_tools.go:42-64`) has no `filling` field and no `combo_items` overrides — the OC-epic contract of `POST /orders` is not reachable from chat; `order_items.filling` stays NULL and combos are always the stock template. |
| 3 | **`created_by` differs from the menu path** | Chat passes `CreatedBy:"guest"` for customers (`chat_service.go:315-318`) and the order service stores non-empty strings verbatim (`order_service.go:327,357`) → chat guest orders get `created_by='guest'` while widget/menu guest orders get NULL (`order_handler.go:94`). Harmless today, but any query keying on `created_by IS NULL` for "customer self-orders" splits into two conventions. |
| 4 | **Guest confirm scoping is by UUID secrecy, not identity** | All guest JWTs share `sub='guest'`, so the `CallerID` equality check in `Confirm` passes for *any* guest — isolation rests on nobody else knowing the `session_id` (localStorage) + `action_id`. Fine for this threat model; don't present the check as per-customer auth. |
| 5 | **No rate limit on a paid endpoint** | One `/chat` request costs 1–6 Anthropic calls (loop cap 5 + possible summarization). `authMW` is the only gate — `middleware/ratelimit.go` exists but is not wired here (same global-chain gap as the catalog routes). Cost exposure if a guest token is scripted. |
| 6 | **History is text-only by design** | Tool_use/tool_result blocks are rebuilt as nothing on the next request — the model re-reads menu/order state through fresh tool calls instead of stale results. Intentional (context management), but it means an answer mid-proposal ("what did you propose?") relies on the assistant's own text, not the tool trace. |
| 7 | **`CHAT_00x` codes are chat-local** | `CHAT_001/002/003` are minted in the chat service; check they are registered in `ERROR_CONTRACT_v1.1.md` before FE maps toasts by code. |
