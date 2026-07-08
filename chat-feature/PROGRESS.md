# CHAT Epic — Progress Tracker

> Every row sized to finish in ONE session (< 100k tokens).
> Rule: a row becomes ✅ only when its receipt exists in [VERIFICATION.md](VERIFICATION.md).
> New session? → read [`../claude.Chat.md`](../claude.Chat.md) → [STATE.md](STATE.md) → this file → run the matching prompt in [PROMPTS.md](PROMPTS.md).

## Done

| ID | Task | Receipt | Status |
|---|---|---|---|
| CHAT-0 | Harness spec (claude.Chat.md) + chat-feature/ folder | folder exists | ✅ |
| CHAT-1 | BE: `internal/ai` client + `/chat` SSE endpoint + routes + env | go build | ✅ |
| CHAT-2 | BE: read tools (get_menu, get_my_order) in agent loop | go build | ✅ |
| CHAT-3 | BE: write tools + proposal/confirm gate + `/chat/confirm` | go build + curl CHAT_002 | ✅ |
| CHAT-4 | FE: widget + useChatStream + store + mount in (shop) layout | tsc + screenshot | ✅ |
| CHAT-5 | FE: ActionCard confirm flow + query invalidation | tsc | ✅ |
| CHAT-5b | Rolling-summary memory (7-day TTL, compaction >20 turns) + HISTORY.md + SCENARIOS.md | go build + rebuild | ✅ |
| CHAT-5c | Runtime smoke without key: 401 / SSE headers / CHAT_001 / CHAT_002 + widget screenshot | VERIFICATION.md 2026-07-07 | ✅ |
| CHAT-7 | Unit tests for the gate: `chat_service_test.go` with fake ChatAI — read inline · write→pending not executed · confirm/reject · CHAT_002 guards · compaction + fallback | VERIFICATION.md 2026-07-08 (7 tests green) | ✅ |
| CHAT-7b | System prompt → editable context file: `be/internal/service/chat_context.md` (identity + project guide + fetch-data table + examples), embedded via `go:embed` as `chatSystemPrompt` | VERIFICATION.md 2026-07-08 (b) — go build + 7 tests green | ✅ |
| CHAT-8 | Docs/contract sync: §14 AI Chat in API_CONTRACT_v1.2.md + 3 CHAT_00x rows in ERROR_CONTRACT_v1.1.md + openapi.yaml Chat tag/paths (SSE) + `## Phase CHAT` epic row in MASTER_TASK.md — all copied from PLAN.md §API contract; 3 table edits owner-OK'd in-session | VERIFICATION.md 2026-07-08 (c) — YAML parse + greps | ✅ |

## Remaining (in order — deps flow downward)

| ID | Task | Scope (files) | Deps | Blocker | Status |
|---|---|---|---|---|---|
| CHAT-6 | **Live E2E with real API key**: run SKILLS.md confirm-gate playbook + real widget conversation; verify order row appears ONLY after Xác nhận; screenshot + transcript receipts | none (verification only) | CHAT-5c | owner puts `ANTHROPIC_API_KEY` in `.env` | ⬜ |
| CHAT-9 | **UX polish**: replace hardcoded gray/white classes with project theme tokens (dark mode); add "Đoạn chat mới" reset (clears CHAT_SESSION key + store); no-token state shows QR hint before typing | fe/src/features/chat/*, store/chat.ts | CHAT-6 | — | ⬜ |
| CHAT-10 | **Token-level streaming**: `Messages.NewStreaming` in ai client + per-chunk `text` SSE events + FE incremental bubble append | ai/client.go, chat_service.go, useChatStream.ts | CHAT-6 | — | ⬜ (optional) |
| CHAT-11 | **Prompt/model tuning UAT**: run all 6 SCENARIOS.md scripts on `claude-haiku-4-5`; log pass/fail per scenario; tune `chatSystemPrompt` if needed; decide final default model | chat_service.go (prompt only) | CHAT-6 | — | ⬜ |

## Session log

| Date | Session did | Rows moved |
|---|---|---|
| 2026-07-06 | Plan → full v1 implementation (BE+FE) + harness docs | CHAT-0…5 → ✅ |
| 2026-07-07 | Runtime smoke (no key) + rolling summary + scenarios + HISTORY.md + this tracker | CHAT-5b/5c → ✅ |
| 2026-07-08 | CHAT-6 attempted — API key NOT actually in `.env` (checked all env files, shell, running container; BE log: "AI chat disabled"). No receipts possible; blocker stands. See STATE.md 2026-07-08 checkpoint. Then pulled CHAT-7 forward (no key needed): approval-gate unit tests, 7 tests green. | CHAT-7 → ✅ |
| 2026-07-08 (b) | Owner asked for an editable "guideline file the model reads on every client question" → CHAT-7b: moved the hardcoded `chatSystemPrompt` const into `chat_context.md`, embedded with `go:embed`. All prior rules kept verbatim; added project overview, question→tool table, example dialogues. | CHAT-7b → ✅ |
| 2026-07-08 (c) | CHAT-8 pulled forward (API surface frozen in PLAN.md, no key needed): synced chat endpoints + CHAT_00x codes into API_CONTRACT §14, ERROR_CONTRACT §2, openapi.yaml, MASTER_TASK `## Phase CHAT`. All 3 gated table edits shown + owner-OK'd before editing. | CHAT-8 → ✅ |
