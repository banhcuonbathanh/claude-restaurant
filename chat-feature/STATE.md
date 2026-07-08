# CHAT Feature — Durable State (checkpoint log)

> Resume point for any session. Newest checkpoint on top. Update before ending a session.

## Checkpoint 2026-07-08 (d) — CHAT-8 ✅ docs/contract sync (pulled forward; no key needed)

- CHAT-8 done ahead of CHAT-6 (owner-directed): the API surface is frozen in PLAN.md, so the
  contract sync never depended on the live E2E. **CHAT-6 remains the only key-blocked task.**
- 4 doc files updated, all copied from PLAN.md §API contract (nothing invented):
  API_CONTRACT_v1.2.md §14 (endpoints + bodies + SSE payloads) · ERROR_CONTRACT_v1.1.md §2
  (+3 CHAT_00x rows) · openapi.yaml (Chat tag + both paths, `/chat` responds
  `text/event-stream`) · MASTER_TASK.md (new `## Phase CHAT`, ONE epic row → PROGRESS.md).
- All 3 gated table edits were shown as exact rows and OK'd by the owner in-session before editing.
- Accuracy note worth keeping: CHAT_001/CHAT_003 are **SSE `error` events** (HTTP 200 —
  headers already sent, `chat_handler.go:72-77`); only CHAT_002 is a real HTTP status
  (404/403/400 from `/chat/confirm`). The contract docs say so explicitly.
- Receipts in VERIFICATION.md §2026-07-08 (c): YAML parses (17 paths, both chat paths + tag),
  greps show the new rows/sections in all 3 markdown docs.
- Remaining: CHAT-6 (blocked on `ANTHROPIC_API_KEY`) → CHAT-9 → CHAT-10 (optional) → CHAT-11.

## Checkpoint 2026-07-08 (c) — CHAT-7b ✅ system prompt moved to editable chat_context.md

- Owner request: "a context .md file the model reads on every client question, teaching it
  the project and how to fetch data". Implemented the honest version: the model can't read
  repo files at runtime, so the file IS the system prompt — NEW
  `be/internal/service/chat_context.md`, embedded via `//go:embed` into `chatSystemPrompt`
  (chat_service.go). Sent to the model on EVERY /chat request, before per-session context.
- Content: identity · project overview (QR flow, products/combos, order fields) ·
  question→tool routing table · per-question-type procedure · the 6 original rules verbatim ·
  example dialogues. Owner edits the .md → `docker compose up -d --build be` → behavior changes.
- Receipts: VERIFICATION.md §2026-07-08 (b) — go build clean, all 7 chat tests green.
- CHAT-6 still the only key-blocked task; CHAT-11 (prompt tuning) now happens in
  chat_context.md instead of Go source.

## Checkpoint 2026-07-08 (b) — CHAT-7 ✅ approval-gate unit tests (done out of order, no key needed)

- Same session as the CHAT-6 attempt below: since CHAT-7 only depends on CHAT-3 and needs
  no API key, it was pulled forward. **CHAT-6 remains the only key-blocked task.**
- New file (only file touched): `be/internal/service/chat_service_test.go` — 7 tests /
  9 assertion groups, all green. Covers: read tool inline · write tool → pending proposal
  (CreateOrder NOT called) · confirm approve/reject · wrong action_id / caller / session →
  CHAT_002 without consuming or executing the pending · compaction >20 turns → summarize()
  + last-12 kept · AI-down fallback → hard cap 20, summary preserved.
- Test technique worth keeping: fake `ChatAI` responses are built by `json.Unmarshal` of
  raw API-shaped JSON into `anthropic.Message` — the only way the SDK's respjson metadata
  (`v.JSON.Input.Raw()`, `ToParam()`) is populated outside a real HTTP response.
- Receipts in VERIFICATION.md §2026-07-08. `go build ./...` clean; whole service package
  passes (no regressions).

## Checkpoint 2026-07-08 — CHAT-6 attempted, still BLOCKED on API key

- Session was told the key is "already set in .env" — it is NOT. Verified exhaustively:
  root `.env` (last modified Jun 22, pre-dates the chat feature), `.env.bak.dev`,
  `be/.env.local`, shell env, `.claude/settings*.json`, and the running `be` container
  env are all empty; the only `sk-ant` string in the repo is the placeholder in
  `PROMPTS.md`. BE startup log confirms: `AI chat disabled: ANTHROPIC_API_KEY not set`.
- No live E2E possible → no receipts faked. CHAT-6 stays ⬜, blocker unchanged.
- **Next action (owner):** add `ANTHROPIC_API_KEY=sk-ant-...` to root `.env`
  (compose maps it at `docker-compose.yml:67`), then `docker compose up -d --build be`,
  confirm log says "AI chat enabled", and rerun the CHAT-6 prompt from PROMPTS.md.

## Checkpoint 2026-07-07 (c) — progress tracker + per-session prompts

- `PROGRESS.md` added: all rows CHAT-0…CHAT-11, each sized to one session; CHAT-0…5c ✅ with
  receipts; remaining CHAT-6 (live E2E, blocked on API key) → 7 (unit tests) → 8 (contract
  sync) → 9 (UX polish) → 10 (streaming, optional) → 11 (scenario UAT).
- `PROMPTS.md` added: one copy-paste prompt per remaining task for fresh sessions + a
  generic resume prompt. Each prompt enforces the close ritual (receipts → VERIFICATION,
  checkpoint → STATE, row flip → PROGRESS).
- **PROGRESS.md is now the live task tracker; TASKS.md is the frozen v1 plan.**

## Checkpoint 2026-07-07 (b) — rolling-summary memory + scenarios

- History upgrade in `chat_service.go`: TTL 30 min → **7 days** (Redis `redis_data` volume
  = on disk); >20 turns → compaction: old turns summarized (≤120 từ VN, one `chatSummaryMax`
  call) into `chatHistory.Summary`, last 12 turns kept verbatim; summary injected into the
  system prompt. Legacy bare-array sessions still load. Fallback to hard cap if AI is down.
- `SCENARIOS.md` added — 6 client conversation scripts (menu Q&A, order+gate, status,
  cancel, injection refusal, returning customer with summary).
- Receipts: `go build ./...` clean; `docker compose up -d --build be` exit 0.

## Checkpoint 2026-07-07 — v1 runtime-verified on docker stack (all but the API key)

- Containers rebuilt with chat code; curl smoke passed: 401 unauth · SSE headers correct ·
  `CHAT_001` error event without key · `CHAT_002` on bogus confirm (receipts in VERIFICATION.md).
- Widget verified in browser: FAB + panel render on /menu, message send → BE SSE error event
  rendered as system line. Screenshot: `chat-widget-open.png` (repo root).
- ONLY remaining for CHAT-6: owner sets `ANTHROPIC_API_KEY` in `.env`, rebuild be, run the
  confirm-gate playbook (SKILLS.md) for a real conversation receipt.
- Commit script ready + executable: `./commit-chat-v1.sh` (stages chat files only).

## Checkpoint 2026-07-06 — v1 implemented, compile-verified, NOT yet run E2E

**Done**
- `claude.Chat.md` (root) — harness spec, 10 primitives mapped to this feature.
- `chat-feature/` — this management folder (README, PLAN, TASKS, SKILLS, VERIFICATION, STATE).
- BE: `internal/ai/client.go` (Anthropic Go SDK, model via `AI_CHAT_MODEL`, nil when no key),
  `service/chat_tools.go` (get_menu, get_my_order read; create_order, cancel_order confirm-gated),
  `service/chat_service.go` (tool loop, Redis history `chat:{sid}` 30m, pending `chat:{sid}:pending` 10m,
  deterministic Confirm), `handler/chat_handler.go` (SSE `POST /chat`, JSON `POST /chat/confirm`),
  routes + DI in `cmd/server/main.go`, env in `.env.example` + `docker-compose.yml`.
- FE: `store/chat.ts`, `hooks/useChatStream.ts` (SSE fetch-reader + invalidateQueries on data_updated,
  sets `activeOrderId` after create), `features/chat/` (Widget FAB left · MessageList · Input · ActionCard),
  `STORAGE_KEYS.CHAT_SESSION`, widget mounted in `(shop)/layout.tsx`.
- Receipts: go build clean, tsc clean for chat files (see VERIFICATION.md).

**Decisions taken**
- Confirm executes deterministically (no second model round-trip) — cheap + predictable.
- Only plain-text turns persisted across requests; tool blocks live within one request only.
- SSE transport, but per-block (not token-level) streaming in v1.
- Default model `claude-opus-4-8`, overridable via `AI_CHAT_MODEL` (owner did not pick — flag cost).

**Next (in order)**
1. CHAT-6 E2E: owner puts `ANTHROPIC_API_KEY` in `.env` → `docker compose up -d --build be fe`
   → run the confirm-gate playbook (SKILLS.md) → paste receipts into VERIFICATION.md.
2. Owner decisions still open: cheaper default model (haiku/sonnet)? API_CONTRACT table rows
   (needs explicit owner OK before editing that doc).
3. Commit: run `./commit-chat-v1.sh` (git is blocked for Claude in this repo).

**Known gaps / risks**
- No service-level unit test yet for the proposal gate (fake ChatAI) — good CHAT-6 companion task.
- SSE via Caddy in prod: verify buffering is off for `/api/v1/chat` (X-Accel-Buffering header is set).
- The repo has a large uncommitted FAV changeset on `docs/customer-menu-alignment`;
  chat files are separate but will mix in `git add -A` — commit script stages chat paths only.
