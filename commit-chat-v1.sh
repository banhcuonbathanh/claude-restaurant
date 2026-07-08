#!/bin/sh
# Commit the CHAT v1 feature (chat files ONLY — leaves the FAV changeset untouched).
# Run from repo root: ./commit-chat-v1.sh
set -e

git add \
  claude.Chat.md \
  chat-feature/ \
  be/internal/ai/ \
  be/internal/service/chat_service.go \
  be/internal/service/chat_tools.go \
  be/internal/handler/chat_handler.go \
  be/cmd/server/main.go \
  go.mod go.sum \
  .env.example docker-compose.yml \
  fe/src/store/chat.ts \
  fe/src/hooks/useChatStream.ts \
  fe/src/features/chat/ \
  fe/src/lib/storage-keys.ts \
  "fe/src/app/(shop)/layout.tsx" \
  commit-chat-v1.sh

git commit -m "feat(chat): AI chat v1 — tool-calling assistant with confirm-gated order writes (CHAT-0..5)

- claude.Chat.md harness spec (10 primitives) + chat-feature/ management folder
- BE: internal/ai Anthropic client, chat service (SSE loop, Redis history,
  proposal/confirm gate), tools get_menu/get_my_order/create_order/cancel_order
- FE: floating ChatWidget in (shop) layout, useChatStream SSE hook, chat store,
  ActionCard confirm flow with query invalidation
- env: ANTHROPIC_API_KEY + AI_CHAT_MODEL (.env.example, docker-compose)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"

echo "Committed CHAT v1."
