#!/bin/sh
# CHAT-7 — approval-gate unit tests + chat-feature tracker updates. Run from repo root.
set -e
git add be/internal/service/chat_service_test.go \
        chat-feature/VERIFICATION.md \
        chat-feature/STATE.md \
        chat-feature/PROGRESS.md
git commit -m "test(chat): CHAT-7 approval-gate unit tests (fake ChatAI, 7 tests green)

- read tool executes inline, write tool held as pending proposal (never executed)
- confirm approve/reject; wrong action_id/caller/session -> CHAT_002 guards
- history compaction >20 turns + AI-down hard-cap fallback
- receipts in chat-feature/VERIFICATION.md; CHAT-7 flipped in PROGRESS.md"
