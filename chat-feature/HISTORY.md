# CHAT Feature — How Conversation History Is Saved

> Durable State primitive (claude.Chat.md §6). Code: `be/internal/service/chat_service.go`
> (`loadHistory` · `saveHistory` · `summarize`).

## Where it lives

| Key | Content | TTL | On disk? |
|---|---|---|---|
| `chat:{session_id}` | conversation history (JSON below) | **7 days** (refreshed on every save) | ✅ Redis persists to the `redis_data` docker volume |
| `chat:{session_id}:pending` | proposed-but-unconfirmed write action | 10 min | ✅ same volume |

`session_id` is a UUID minted by the BE on the first message and stored by the FE in
`localStorage["chat-session-id"]` (`STORAGE_KEYS.CHAT_SESSION`) — so the same browser
resumes the same history for up to 7 days.

## Stored format

```json
{
  "summary": "Khách dị ứng mộc nhĩ, thích ăn cay. Đã tạo đơn BC-0042 (2× Bánh Cuốn Thịt, 1× Giò). Hỏi nhiều về món chay.",
  "turns": [
    { "role": "user",      "text": "cho tôi 2 bánh cuốn thịt" },
    { "role": "assistant", "text": "Mình đã chuẩn bị đơn... bấm Xác nhận nhé!" },
    { "role": "assistant", "text": "Đã tạo đơn BC-0042. Bạn có thể theo dõi ở trang đơn hàng." }
  ]
}
```

- **`turns`** — plain text only. Tool_use/tool_result blocks are intentionally NOT
  persisted; they exist only inside one request's loop.
- **`summary`** — the rolling compaction target (see lifecycle). Injected into the
  system prompt on every request, so old context still shapes answers.
- Legacy shape (a bare `[...]` array from pre-summary sessions) still loads.

## Lifecycle

```
 customer message
       │
       ▼
 loadHistory(sid) ──► turns → model messages · summary → system prompt
       │
       ▼
 model loop runs (tools, proposal gate, answer)
       │
       ▼
 appendHistory: + user turn, + assistant turn
       │
       ▼
 saveHistory:
   len(turns) ≤ 20 ──────────────► save as-is, TTL 7d
   len(turns) > 20 (COMPACTION):
        turns[0 : len-12] ──► summarize() ──► new summary (≤120 từ VN,
        old summary folded in, keeps: allergies, preferences, orders ±)
        turns = last 12 verbatim ──► save, TTL 7d
        (AI down? → fallback: hard-cap to last 20, no summary change)

 confirm/reject of a proposal ──► appendAssistantLine("Đã tạo đơn BC-0042" / "Khách đã từ chối: ...")
```

Constants (chat_service.go): `chatHistoryTTL=7d` · `chatMaxTurns=20` · `chatKeepTurns=12`
· `chatSummaryMax=300 tokens`.

## Inspecting history (playbook)

```bash
# list all chat sessions
docker exec clauderestaurant-redis-1 redis-cli --scan --pattern 'chat:*'

# pretty-print one session's history
docker exec clauderestaurant-redis-1 redis-cli GET "chat:<session_id>" | python3 -m json.tool

# see the pending (unconfirmed) action, if any
docker exec clauderestaurant-redis-1 redis-cli GET "chat:<session_id>:pending" | python3 -m json.tool

# check remaining TTL (seconds)
docker exec clauderestaurant-redis-1 redis-cli TTL "chat:<session_id>"

# export ALL chat histories to one file (backup / analysis)
docker exec clauderestaurant-redis-1 sh -c \
  'redis-cli --scan --pattern "chat:*" | while read k; do echo "== $k"; redis-cli GET "$k"; done' \
  > chat-history-export.txt
```

## Design boundaries (v1)

- Redis is the single store — there is **no** `chat_messages` MySQL table. Orders created
  through chat are the durable business record; the transcript is operational state.
  If the owner ever wants permanent transcripts (analytics, audit), that's a new task:
  migration + write-through in `appendHistory` (register it in TASKS.md first).
- History is per browser (localStorage session id), not per customer account — guests
  have no account, so this is the strongest identity available.
- Wiping a conversation = FE clears `chat-session-id` from localStorage (a fresh UUID
  starts a fresh history); the old key simply expires after 7 days.
