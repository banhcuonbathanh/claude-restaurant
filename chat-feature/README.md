# chat-feature/ — Management Folder for the AI Chat Feature

> Harness spec (10 primitives + intentions): [`../claude.Chat.md`](../claude.Chat.md)
> Read that first; this folder is the working surface it points to.

| File | Primitive | Purpose |
|---|---|---|
| [PLAN.md](PLAN.md) | Context Delivery | Architecture, drawings, API contract, file map |
| [TASKS.md](TASKS.md) | Orchestration | CHAT-0…CHAT-6 task list + statuses |
| [STATE.md](STATE.md) | Durable State | Checkpoint log — resume point for any session |
| [SKILLS.md](SKILLS.md) | Skills & Procedures | Playbooks: add a tool, change prompt/model, test confirm gate |
| [SCENARIOS.md](SCENARIOS.md) | Instruction / Verification | Client conversation scripts (tools · gate · edge cases) for UAT + prompt tuning |
| [HISTORY.md](HISTORY.md) | Durable State | How conversation history is saved: Redis keys, JSON format, compaction lifecycle, inspect/export commands |
| [PROGRESS.md](PROGRESS.md) | Orchestration | Session-sized task rows (done + remaining) + session log — the live tracker |
| [PROMPTS.md](PROMPTS.md) | Orchestration | Copy-paste prompt per remaining task — one prompt = one fresh session |
| [VERIFICATION.md](VERIFICATION.md) | Verification | Receipts: build output, curl transcripts, screenshots |
| [fe.md](fe.md) | Context Delivery | FE view — widget wireframe, zones, SSE pipeline, store, flags (customer_menu.md style) |
| [be.md](be.md) | Context Delivery | BE view — endpoints traced handler → service → tools, Redis state, flags (customer_menu_be.md style) |

## Rules for working here

1. Start every session by reading `STATE.md` (resume point) then `TASKS.md` (what's next).
2. No task is `✅` without a receipt logged in `VERIFICATION.md`.
3. Write tools stay confirm-gated — this invariant may not be relaxed without owner approval.
4. Update `STATE.md` before ending a session (checkpoint discipline).
