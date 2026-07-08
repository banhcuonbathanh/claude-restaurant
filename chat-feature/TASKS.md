# CHAT Epic — Task List (Orchestration)

> ⚠️ Superseded as the live tracker by [PROGRESS.md](PROGRESS.md) (2026-07-07).
> This file is the frozen v1 plan; new work is tracked and prompted from PROGRESS.md + PROMPTS.md.

> Rule: a task is ✅ only when its receipt exists in [VERIFICATION.md](VERIFICATION.md).

| ID | Task | Files | Deps | Status |
|---|---|---|---|---|
| CHAT-0 | Harness spec + management folder (this folder + claude.Chat.md) | claude.Chat.md, chat-feature/* | — | ✅ |
| CHAT-1 | BE: `internal/ai` client + chat service/handler skeleton + routes + env | 5 files | CHAT-0 | ✅ (go build receipt) |
| CHAT-2 | BE: read tools (`get_menu`, `get_my_order`) in agent loop | chat_tools.go | CHAT-1 | ✅ (go build receipt) |
| CHAT-3 | BE: write tools + proposal/confirm gate + `POST /chat/confirm` | chat_service.go, chat_handler.go | CHAT-2 | ✅ (go build receipt) |
| CHAT-4 | FE: widget UI + `useChatStream` + store + storage key + mount | 7 files | CHAT-1 | ✅ (tsc receipt) |
| CHAT-5 | FE: ActionCard confirm flow + query invalidation | (in CHAT-4 files) | CHAT-3, CHAT-4 | ✅ (tsc receipt) |
| CHAT-6 | End-to-end verify against docker stack + doc sync (API contract rows — owner approval needed for table edits) | — | CHAT-5 | ⬜ |

## Legend
⬜ not started · 🔄 in progress · ✅ done (receipt logged)
