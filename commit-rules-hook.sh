#!/bin/bash
# Commit script for P-RULES — rule-routing hook + devops skill
set -e
cd "$(dirname "$0")"

git add \
  .claude/hooks/rule-reminder.sh \
  .claude/settings.json \
  .claude/skills/devops/SKILL.md \
  .claude/SKILLS_GUIDE.md \
  CLAUDE.md \
  docs/tasks/MASTER_TASK.md

git commit -m "chore(tooling): enforce domain rules via PreToolUse hook + add devops skill (P-RULES)

- .claude/hooks/rule-reminder.sh: maps edited file path -> domain rule skill,
  injects reminder into context on every Edit/Write (non-blocking)
- .claude/settings.json: register PreToolUse hook (Edit|Write)
- .claude/skills/devops/SKILL.md: new infra rules verified against current
  10-service compose stack (BE root build context, 3-place env sync, Caddy routes)
- CLAUDE.md: Rule Routing table (planning-time mirror of the hook map)
- SKILLS_GUIDE.md + MASTER_TASK.md: registry updates

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"

echo "Committed. Files staged were limited to the P-RULES scope."
