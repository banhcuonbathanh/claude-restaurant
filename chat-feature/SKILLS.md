# CHAT Feature — Playbooks (Skills & Procedures)

## Add a new tool to the chat agent

1. **Schema** — add an `anthropic.ToolParam` in `be/internal/service/chat_tools.go`
   (`chatToolDefs`). Name in `snake_case`; description says *when* to call it, not just what it does.
2. **Executor** — add a case in the tool dispatch (`executeReadTool` for reads; for writes
   add the tool name to `writeTools` so it is confirm-gated automatically).
3. **Scope check** — executor must take `callerID/callerRole` and call an existing
   service method. Never raw SQL, never skip the service layer.
4. **Test** — service-level test: fake AI client returns a tool_use for the new tool;
   assert read executes / write becomes a pending proposal.
5. **Doc** — add a row to the tool table in `../claude.Chat.md` §4 and PLAN.md.

## Change the model or system prompt safely

1. Model comes from `AI_CHAT_MODEL` env — change compose/env, not code. Valid IDs only
   (e.g. `claude-opus-4-8`, `claude-sonnet-5`, `claude-haiku-4-5`).
2. Prompt edits: keep the three hard constraints (no invented menu items, confirm-gated
   writes, own-table only). Show the owner a before/after diff of the prompt.
3. Re-run the confirm-gate check (below) after any prompt change.

## Verify the confirm gate (the invariant)

```bash
# 1. get a guest token
TOKEN=$(curl -s -X POST localhost:8080/api/v1/auth/guest -H 'content-type: application/json' \
  -d '{"qr_token":"<token>"}' | jq -r .access_token)

# 2. ask for an order — expect a `proposal` event, and NO new row in orders yet
curl -N -X POST localhost:8080/api/v1/chat -H "Authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' \
  -d '{"message":"cho tôi 2 bánh cuốn thịt","table_id":"<table-uuid>"}'

# 3. confirm — only NOW the order row appears
curl -s -X POST localhost:8080/api/v1/chat/confirm -H "Authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' \
  -d '{"session_id":"<sid>","action_id":"<aid>","approve":true}'
```

Receipt = the SSE transcript + the confirm JSON with `order_number` → paste into VERIFICATION.md.

## Resume a session (durable state)

1. Read `STATE.md` → last checkpoint + next action.
2. Read `TASKS.md` → statuses.
3. Do not re-plan from scratch; continue from the checkpoint.
