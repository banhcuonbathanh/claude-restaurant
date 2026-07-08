# CHAT Epic — Session Prompts

> One prompt per remaining task in [PROGRESS.md](PROGRESS.md). Paste ONE prompt into a
> fresh Claude Code session; the durable-state files carry all the context, so the
> prompt stays short. Run them **in order** (CHAT-6 first — it unblocks the rest).
>
> Every prompt ends with the same closing ritual on purpose: receipts → VERIFICATION.md,
> checkpoint → STATE.md, row flip → PROGRESS.md. That is what lets the NEXT session resume.

---

## Prompt CHAT-6 — Live E2E with real API key

> Prerequisite (you, before the session): put `ANTHROPIC_API_KEY=sk-ant-...` and
> `AI_CHAT_MODEL=claude-haiku-4-5` in `.env`.

```
This session works on the CHAT feature and is governed by claude.Chat.md (NOT CLAUDE.md).
Read claude.Chat.md, then chat-feature/STATE.md and chat-feature/PROGRESS.md, and do task CHAT-6:

Live end-to-end verification with the real API key (already set in .env).
1. docker compose up -d --build be, confirm the BE log says "AI chat enabled".
2. Run the confirm-gate playbook in chat-feature/SKILLS.md via curl: send "cho tôi 2 bánh
   cuốn thịt" as a guest of Bàn 01, capture the SSE transcript, and PROVE with a MySQL
   query that no order row exists until POST /chat/confirm approves — then prove the row
   exists with the returned order_number.
3. In the browser (Playwright) on localhost:3000/menu: open the widget, hold a real
   conversation covering SCENARIOS.md scenarios 1 (menu question) and 2 (order + Xác nhận
   ActionCard), screenshot the ActionCard and the success message.
4. Verify chat:{session_id} now exists in Redis and matches chat-feature/HISTORY.md format.
Close ritual: paste all receipts into chat-feature/VERIFICATION.md, add a checkpoint to
chat-feature/STATE.md, flip CHAT-6 to ✅ in chat-feature/PROGRESS.md (+ session log row).
Do not change any application code in this session — verification only; if you find a bug,
log it as a new row in PROGRESS.md instead of fixing it inline.
```

## Prompt CHAT-7 — Unit tests for the approval gate

```
This session works on the CHAT feature and is governed by claude.Chat.md (NOT CLAUDE.md).
Read claude.Chat.md, then chat-feature/STATE.md and chat-feature/PROGRESS.md, and do task CHAT-7:

Write be/internal/service/chat_service_test.go testing the approval-gate invariant with a
fake ChatAI (the interface in chat_service.go) and fake/miniature redis. Follow the style
of the existing service tests (see order_service_test.go and be/internal/testhelper).
Required cases:
1. Model returns a get_menu tool_use → executed inline, loop continues, no pending saved.
2. Model returns a create_order tool_use → a "proposal" event is emitted, pending action
   saved in redis, and OrderService.CreateOrder is NOT called.
3. Confirm with approve=true → order created via the service, pending consumed, result has
   status "executed" and data_updated true.
4. Confirm with approve=false → status "rejected", pending consumed, nothing created.
5. Confirm with wrong action_id or wrong caller → CHAT_002 error, pending NOT executed.
6. History compaction: >20 turns triggers summarize(); on AI error it falls back to the
   hard cap without losing the last turns.
Verify with: go test ./be/internal/service/ -run TestChat (all green) and go build ./...
Close ritual: receipts (test output) into chat-feature/VERIFICATION.md, checkpoint into
chat-feature/STATE.md, flip CHAT-7 in chat-feature/PROGRESS.md. Touch ONLY the new test
file — if a production bug blocks a test, log it in PROGRESS.md, don't fix it here.
```

## Prompt CHAT-8 — Docs & contract sync

```
This session works on the CHAT feature and is governed by claude.Chat.md (NOT CLAUDE.md).
Read claude.Chat.md, then chat-feature/STATE.md, chat-feature/PROGRESS.md and
chat-feature/PLAN.md (§API contract), and do task CHAT-8:

Sync the chat endpoints into the project's contract docs. The API surface is already
frozen in chat-feature/PLAN.md — copy from there, do not invent.
1. docs/contract/API_CONTRACT_v1.2.md: add a §Chat section row for POST /api/v1/chat (SSE)
   and POST /api/v1/chat/confirm. SHOW ME the exact rows and WAIT for my OK before editing
   (table edits require owner confirmation).
2. docs/contract/ERROR_CONTRACT_v1.1.md: add CHAT_001 / CHAT_002 / CHAT_003 the same way —
   show first, wait for OK.
3. docs/api/openapi.yaml: add both paths (chat responds text/event-stream).
4. docs/tasks/MASTER_TASK.md: register the CHAT epic as one row (status ✅ through CHAT-7,
   remaining rows referenced to chat-feature/PROGRESS.md) — show first, wait for OK.
Close ritual: receipts into chat-feature/VERIFICATION.md, checkpoint into STATE.md, flip
CHAT-8 in PROGRESS.md. Touch only the 4 files listed.
```

## Prompt CHAT-9 — UX polish (theme + reset + no-token hint)

```
This session works on the CHAT feature and is governed by claude.Chat.md (NOT CLAUDE.md).
Read claude.Chat.md, then chat-feature/STATE.md and chat-feature/PROGRESS.md. Also read the
frontend-nextjs skill index and its 02-design rule (project rule: no hardcoded colors).
Do task CHAT-9, three small changes in fe/src/features/chat/ + fe/src/store/chat.ts:
1. Replace hardcoded bg-white / gray-* / text-white classes with the project's theme
   tokens from tailwind.config.ts so the widget follows dark/light mode properly.
2. Add a "Đoạn chat mới" button in the panel header: clears STORAGE_KEYS.CHAT_SESSION from
   localStorage and resets the chat store (reset() already exists).
3. When there is no auth token, show the QR hint ("Bạn cần quét mã QR...") as a persistent
   notice above the input instead of only after sending a message.
Verify: cd fe && npx tsc --noEmit (only pre-existing src/__tests__ errors allowed), then
docker compose up -d --build fe and screenshot the widget on localhost:3000/menu in BOTH
themes via Playwright.
Close ritual: receipts into chat-feature/VERIFICATION.md, checkpoint into STATE.md, flip
CHAT-9 in PROGRESS.md. Touch only the chat FE files listed.
```

## Prompt CHAT-10 — Token-level streaming (optional)

```
This session works on the CHAT feature and is governed by claude.Chat.md (NOT CLAUDE.md).
Read claude.Chat.md, then chat-feature/STATE.md, PROGRESS.md, and PLAN.md (Backlog), and do
task CHAT-10:

Upgrade the chat to token-level streaming for a typing effect:
1. be/internal/ai/client.go: add a streaming method using the SDK's Messages.NewStreaming
   with an accumulator, invoking a callback per text delta.
2. chat_service.go: emit each delta as event "text" (payload {"text": chunk, "delta": true})
   while keeping the final accumulated message for history/tool handling unchanged. The
   approval gate and tool loop behaviour MUST NOT change.
3. fe/src/hooks/useChatStream.ts + store/chat.ts: append delta chunks into the current
   assistant bubble instead of adding separate messages.
Verify: go build + go test ./be/internal/service/ + tsc, then a real conversation in the
widget showing incremental text (needs ANTHROPIC_API_KEY set).
Close ritual: receipts into chat-feature/VERIFICATION.md, checkpoint into STATE.md, flip
CHAT-10 in PROGRESS.md.
```

## Prompt CHAT-11 — Prompt/model tuning UAT

```
This session works on the CHAT feature and is governed by claude.Chat.md (NOT CLAUDE.md).
Read claude.Chat.md, then chat-feature/STATE.md, PROGRESS.md, and SCENARIOS.md, and do task
CHAT-11 (needs ANTHROPIC_API_KEY; model claude-haiku-4-5):

Run all 6 scenarios from chat-feature/SCENARIOS.md against the live widget/API and grade
each PASS/FAIL with evidence (transcript or screenshot). Pay special attention to:
scenario 2 (correct product_ids and prices in the proposal), scenario 5 (injection refused
AND blocked), scenario 6 (summary actually used after >20 turns — you may script the turns
via curl to reach compaction).
If a scenario fails: tune ONLY chatSystemPrompt in chat_service.go (show me before/after
per chat-feature/SKILLS.md), rebuild, re-run that scenario. If Haiku still fails scenario 2
or 5 after tuning, recommend claude-sonnet-5 with your evidence.
Close ritual: a scenario scorecard + final model recommendation into
chat-feature/VERIFICATION.md, checkpoint into STATE.md, flip CHAT-11 in PROGRESS.md.
```

---

## Generic resume prompt (any session, when unsure where things stand)

```
This session works on the CHAT feature and is governed by claude.Chat.md (NOT CLAUDE.md).
Read claude.Chat.md → chat-feature/STATE.md → chat-feature/PROGRESS.md, tell me exactly
where the feature stands (what is ✅ with receipts, what is next and why), and wait for my
go-ahead before doing anything.
```
