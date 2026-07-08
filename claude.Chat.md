# claude.Chat.md — Harness Spec for the AI Chat Feature

> **Scope:** this file governs ONLY the AI Chat feature (CHAT epic).
> When working on chat, read THIS file instead of the root `CLAUDE.md`.
> Management folder (plan · tasks · state · verification): [`chat-feature/`](chat-feature/)

This feature is built — and maintained — using the 10 harness-engineering primitives.
Each section below states **the intention**: how that primitive is realized *inside the
feature itself* (the chat agent that serves customers) and *in the workflow* (how Claude
Code works on this feature).

---

## 1. Instruction — who the agent is

| Layer | Realization |
|---|---|
| Feature (runtime) | The chat agent's **system prompt** lives in `be/internal/service/chat_service.go` (`chatSystemPrompt`). It fixes identity (trợ lý quán bánh cuốn), language (Vietnamese), tone (short, friendly), and hard constraints: *never invent menu items, never execute a write without customer confirmation, never touch another table's order.* |
| Workflow (dev) | **This file** is the instruction layer for anyone (human or Claude) working on chat. Rules: BE follows `handler → service → repository` strictly; FE follows the store/hooks/features conventions; all write tools stay confirm-gated — that invariant is non-negotiable. |

## 2. Context Delivery — what the model gets

| Layer | Realization |
|---|---|
| Feature | Every `POST /api/v1/chat` request delivers concrete context to the model: the caller's `table_id` / `order_id`, and tool results (real menu rows from `ProductService`, real order state from `OrderService`). The model never guesses prices or order status — it reads them through tools. |
| Workflow | `chat-feature/PLAN.md` carries the architecture + sequence diagrams; code references in it are exact file paths so a fresh session can open precisely the right sources instead of grepping. |

## 3. Context Management — protecting attention

| Layer | Realization |
|---|---|
| Feature | Conversation history is stored in Redis (`chat:{session_id}`, TTL **7 days**, on disk via the `redis_data` volume). When it outgrows 20 turns it is **compacted, not dropped**: older turns fold into a rolling Vietnamese summary (one small model call) and the last 12 turns stay verbatim — the summary rides in the system prompt, so a returning customer's preferences/orders survive long conversations. Tool results are kept compact; the tool loop is capped at 5 iterations per request. |
| Workflow | The feature is self-contained: `chat-feature/` + this file are enough context to work on it — no need to load the whole `docs/` tree. `STATE.md` is the compaction target: finished work is summarized there and dropped from active context. |

## 4. Tool Interface — how the agent acts

Tools are defined with name + description + JSON schema (Anthropic tool use, Go SDK) in
`be/internal/service/chat_tools.go`:

| Tool | Kind | Backed by |
|---|---|---|
| `get_menu` | read | `ProductService.ListProducts` + `ListCombos` |
| `get_my_order` | read | `OrderService.GetOrder` (scoped to caller) |
| `create_order` | **write — confirm-gated** | `OrderService.CreateOrder` |
| `cancel_order` | **write — confirm-gated** | `OrderService.CancelOrder` |

Write tools are *promoted to dedicated tools* precisely so the harness can gate them:
the schema gives the BE a typed, auditable action it can hold for approval — a
free-text "do it" could not be gated.

## 5. Execution Environment — bounded reality

| Layer | Realization |
|---|---|
| Feature | Tools execute **inside the Go service layer** — never HTTP loopback, never raw SQL. Boundaries: scoped to the caller's JWT (guest token → `role=customer`), same validation and business rules as every other entry point, `ANTHROPIC_API_KEY` only lives in BE env (never reaches FE), model choice via `AI_CHAT_MODEL` env. The model cannot name a tool that isn't in the whitelist — unknown tool calls are rejected. |
| Workflow | Dev runs in Docker Compose (`docker compose up -d --build be fe`); verification runs against that stack. |

## 6. Durable State — the workbench

| Layer | Realization |
|---|---|
| Feature | Redis holds two durable keys per chat session: `chat:{id}` (history) and `chat:{id}:pending` (the proposed-but-unconfirmed action). A dropped connection or page reload resumes the same conversation and the same pending proposal. Orders themselves are the ultimate durable state — MySQL via the existing order pipeline. |
| Workflow | `chat-feature/STATE.md` (checkpoint log: what is done, what is next, decisions taken) and `chat-feature/TASKS.md` (CHAT-0…CHAT-6 statuses). Any session — after a crash, compaction, or handoff — resumes from these files, not from memory. |

## 7. Orchestration — lifecycle of the work

| Layer | Realization |
|---|---|
| Feature | The BE chat loop **is** the orchestrator: it runs the model→tool→model cycle, enforces the iteration cap, and implements the **approval gate** — a write tool_use suspends the loop, emits a `proposal` SSE event, and waits for the human (`POST /chat/confirm`). Confirm executes deterministically and emits `data_updated`; reject clears the pending action. Errors surface as an `error` SSE event, never a dead stream. |
| Workflow | Work moves CHAT-0 → CHAT-6 in `TASKS.md`; each task ends with a verification receipt before the next starts; git commits are handed to the owner as scripts (commits are blocked for Claude in this repo). |

## 8. Sub-agents — narrower attention

| Layer | Realization |
|---|---|
| Feature | v1 deliberately has **one** runtime agent — a restaurant chat doesn't need delegation. The seam exists though: `chat_tools.go` is a registry, so a future specialized flow (e.g. an allergy/ingredient checker with its own context) plugs in as a tool rather than bloating the main prompt. |
| Workflow | Big, separable dev jobs on this feature (e.g. generating the customer_chat page-doc set, deep code review) are delegated to sub-agents/skills (`/page-doc-set`, `/code-review`) so the main session's context stays on implementation. |

## 9. Skills & Procedures — reusable playbooks

| Layer | Realization |
|---|---|
| Feature | The system prompt encodes the *service playbook* (greet → understand → check menu → propose → confirm). Recurring mechanical procedures are code, not prompt: payload building reuses the order pipeline; SSE event shapes are fixed constants. |
| Workflow | `chat-feature/SKILLS.md` holds the checklists: **how to add a new tool** (schema → executor → whitelist → test → doc row), **how to change the model/prompt safely**, **how to verify the confirm gate**. Follow them; don't re-derive. |

## 10. Verification — receipts, not claims

| Layer | Realization |
|---|---|
| Feature | The agent's answer about an order is grounded in a tool result (receipt from the DB), and every write returns the real `order_number` the customer can see on the tracking page — the UI refresh via `data_updated` + existing SSE is itself the visible proof the write happened. |
| Workflow | Nothing in `TASKS.md` is marked done without a receipt in `chat-feature/VERIFICATION.md`: `go build ./...` output, `tsc --noEmit` output, and (when the stack is up) a curl transcript of `/chat` + `/chat/confirm` and a screenshot of the widget. A confident "it works" does not count. |

---

## Quick reference

```
BE  be/internal/ai/client.go            ← Anthropic Go SDK wrapper (model from AI_CHAT_MODEL)
    be/internal/handler/chat_handler.go ← POST /api/v1/chat (SSE) · POST /api/v1/chat/confirm
    be/internal/service/chat_service.go ← loop, history, proposal gate, system prompt
    be/internal/service/chat_tools.go   ← tool registry (schemas + executors)
FE  fe/src/features/chat/               ← ChatWidget · ChatMessageList · ChatInput · ChatActionCard
    fe/src/hooks/useChatStream.ts       ← SSE consume + query invalidation
    fe/src/store/chat.ts                ← Zustand: open state, messages, pending proposal
ENV ANTHROPIC_API_KEY · AI_CHAT_MODEL (default claude-opus-4-8)
SSE events: text · proposal · data_updated · done · error
```
