# CHAT Feature — Verification Receipts

> Primitive 10: no claim without a receipt. Every ✅ in TASKS.md must point here.

## 2026-07-08 (c) — CHAT-8: docs/contract sync (4 doc files, owner OK'd each table edit in-session)

API surface copied from the frozen contract in `chat-feature/PLAN.md §API contract` — nothing invented.
Error-code HTTP mapping cross-checked against code before writing: `chat_handler.go:72-77`
(headers already sent → CHAT_001/CHAT_003 travel as SSE `error` events, HTTP stays 200) and
`chat_service.go` Confirm (CHAT_002 → real HTTP 404/403/400).

Files touched (exactly the 4 in scope + the 3 ritual files):
1. `docs/contract/API_CONTRACT_v1.2.md` — new §14 AI Chat: 2 endpoint rows + request-body tables + SSE payload block
2. `docs/contract/ERROR_CONTRACT_v1.1.md` — 3 rows appended to §2 mapping table (CHAT_001/002/003)
3. `docs/api/openapi.yaml` — `Chat` tag + `/api/v1/chat` (200 → text/event-stream) + `/api/v1/chat/confirm`
4. `docs/tasks/MASTER_TASK.md` — new `## Phase CHAT` section, single epic row, detail delegated to PROGRESS.md

```
$ python3 -c "import yaml; d=yaml.safe_load(open('docs/api/openapi.yaml')); ..."
YAML OK; paths: 17 ; chat paths: ['/api/v1/chat', '/api/v1/chat/confirm'] ; Chat tag: True

$ grep -c "CHAT_00" docs/contract/ERROR_CONTRACT_v1.1.md
3
$ grep -n "Section 14 — AI Chat\|/api/v1/chat" docs/contract/API_CONTRACT_v1.2.md | head -3
535:# Section 14 — AI Chat (NEW)
541:| POST | /api/v1/chat | Chat 1 lượt với trợ lý AI — SSE stream: events text · proposal · done · error | Customer+ |
542:| POST | /api/v1/chat/confirm | Xác nhận / từ chối pending action do AI đề xuất | Customer+ |
$ grep -n "Phase CHAT" docs/tasks/MASTER_TASK.md
516:## Phase CHAT — AI Chat Assistant (customer widget)
```

Owner approvals: all 3 gated table edits (API_CONTRACT §14 · ERROR_CONTRACT rows · MASTER row)
shown as exact rows and OK'd before editing, per the table-edit rule.

## 2026-07-08 (b) — CHAT-7b: chatSystemPrompt → embedded chat_context.md

Files touched: NEW `be/internal/service/chat_context.md` (full system prompt: identity +
project guide + question→tool table + rules kept verbatim + example dialogues) ·
`chat_service.go` (const removed, `//go:embed chat_context.md` var + `_ "embed"` import).

```
$ go build ./...
# exit 0, clean

$ go test ./be/internal/service/... -run TestChat -v
--- PASS: TestChat_ReadToolExecutesInline
--- PASS: TestChat_WriteToolBecomesPendingProposal
--- PASS: TestChatConfirm_ApproveExecutes
--- PASS: TestChatConfirm_RejectClearsPending
--- PASS: TestChatConfirm_InvalidRequestsRejected (3 subtests)
--- PASS: TestChatSaveHistory_CompactionSummarizes
--- PASS: TestChatSaveHistory_CompactionFallbackOnAIError
PASS  ok  banhcuon/be/internal/service  2.246s
```

Behavior note: the file is embedded at COMPILE time — editing chat_context.md requires
`docker compose up -d --build be` to take effect. All 6 original rules preserved word-for-word.

## 2026-07-06 — CHAT-1/2/3 (BE) + CHAT-4/5 (FE) build receipts

### Go build (whole repo, includes new chat domain)

```
$ go build ./...
GO BUILD OK          # exit 0, no output = clean compile
```

Files covered: `be/internal/ai/client.go`, `be/internal/service/chat_service.go`,
`be/internal/service/chat_tools.go`, `be/internal/handler/chat_handler.go`,
`be/cmd/server/main.go` (DI + routes).

### FE typecheck

```
$ cd fe && npx tsc --noEmit
src/__tests__/staff-order-flow.test.ts(328,13): error TS2352 ...  ← PRE-EXISTING
src/__tests__/staff-order-flow.test.ts(329,13): error TS2352 ...  ← PRE-EXISTING
```

Both errors are in the stale, never-run `fe/src/__tests__/` duplicates (known issue,
predates this feature). Zero errors in any chat file:
`store/chat.ts` · `hooks/useChatStream.ts` · `features/chat/*.tsx` ·
`(shop)/layout.tsx` · `lib/storage-keys.ts`.

### Dependency

```
$ go get github.com/anthropics/anthropic-sdk-go@latest   # added to go.mod/go.sum
```

## 2026-07-07 — Runtime receipts (docker stack, NO API key yet)

### Containers rebuilt with chat code

```
$ docker compose up -d --build be fe          # exit 0
$ docker ps → clauderestaurant-be-1 / fe-1 Up (fresh images)
```

### Endpoint smoke (curl)

```
GET  /health                          → {"status":"ok"}
POST /api/v1/chat  (no token)         → HTTP 401                        ✅ auth gate
POST /api/v1/auth/guest (Bàn 01 QR)   → 200, guest JWT (role=customer)  ✅
POST /api/v1/chat  (guest JWT)        → HTTP 200
     Content-Type: text/event-stream · Cache-Control: no-cache
     X-Accel-Buffering: no                                              ✅ SSE headers
     event: error
     data: {"code":"CHAT_001","message":"Trợ lý AI chưa được cấu hình"} ✅ no-key path
POST /api/v1/chat/confirm (bogus sid) → HTTP 404 {"error":"CHAT_002"}   ✅ pending guard
```

### Widget visual check (Playwright, http://localhost:3000/menu)

- FAB "Mở trợ lý AI" 💬 renders bottom-left, panel opens with header + empty state.
- Sent "cho tôi 2 bánh cuốn thịt" → user bubble rendered, BE answered over SSE,
  error event rendered as system line "Trợ lý AI chưa được cấu hình".
- **Receipt:** screenshot `chat-widget-open.png` (repo root) — proves the full
  FE → BE → SSE → render loop; only the API key is missing.

## 2026-07-08 — CHAT-7 unit tests for the approval gate

New file: `be/internal/service/chat_service_test.go` — fake `ChatAI` (scripted
`*anthropic.Message` built by unmarshalling raw API JSON so `JSON.Input.Raw()` /
`ToParam()` work), in-memory `fakeChatRedis`, `mockChatProductRepo`, and the
existing `mockOrderRepo`/`mockProductLookup` from order_service_test.go.

```
$ go test ./be/internal/service/ -run TestChat -v
--- PASS: TestChat_ReadToolExecutesInline                 (get_menu runs inline, tool_result with real menu row fed back, loop continues, NO pending)
--- PASS: TestChat_WriteToolBecomesPendingProposal        (create_order → proposal event, pending saved w/ matching action_id + caller + VN summary, CreateOrder NOT called, loop suspends after 1 model call)
--- PASS: TestChatConfirm_ApproveExecutes                 (approve → CreateOrder runs, status=executed, data_updated, order_number in result + history, pending consumed)
--- PASS: TestChatConfirm_RejectClearsPending             (reject → status=rejected, nothing created, pending consumed, refusal in history)
--- PASS: TestChatConfirm_InvalidRequestsRejected         (3 subtests)
    --- no_pending_action  → 404 CHAT_002
    --- wrong_action_id    → 403 CHAT_002, pending NOT consumed, NOT executed
    --- wrong_caller       → 403 CHAT_002, pending NOT consumed, NOT executed
--- PASS: TestChatSaveHistory_CompactionSummarizes        (25 turns → summarize() got exactly turns 1–13, Summary saved, last 12 kept verbatim)
--- PASS: TestChatSaveHistory_CompactionFallbackOnAIError (AI down → hard cap to last 20, old Summary preserved, newest turns never lost)
PASS   ok  banhcuon/be/internal/service   2.215s

$ go build ./...        # exit 0, clean
$ go test ./be/internal/service/        # whole package, no regressions
ok  banhcuon/be/internal/service  5.459s
```

## Outstanding (CHAT-6 remainder — needs ANTHROPIC_API_KEY)

- [ ] Set `ANTHROPIC_API_KEY` in `.env` → `docker compose up -d --build be`
- [ ] Confirm-gate curl transcript (playbook in SKILLS.md) — proposal event, no order row until confirm
- [ ] Real conversation in widget: menu question + create_order ActionCard → Xác nhận → order_number
- [ ] Cross-view refresh: confirm an order in chat → order appears on tracking page
