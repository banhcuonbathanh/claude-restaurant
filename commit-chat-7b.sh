#!/bin/bash
# CHAT-7b: system prompt → editable chat_context.md (go:embed). Stages chat files only.
set -e
cd "$(dirname "$0")"
git add \
  be/internal/service/chat_context.md \
  be/internal/service/chat_service.go \
  chat-feature/PROGRESS.md \
  chat-feature/STATE.md \
  chat-feature/VERIFICATION.md
git commit -m "feat(chat): move system prompt into editable chat_context.md via go:embed (CHAT-7b)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
