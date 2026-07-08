#!/bin/bash
# rule-reminder.sh — PreToolUse hook (Edit|Write)
# Maps the touched file path to its domain rule file and injects a reminder
# into Claude's context. Non-blocking: the edit always proceeds.
# Rule map lives here and is mirrored in CLAUDE.md §Rule Routing.

input=$(cat)
fp=$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.notebook_path // empty' 2>/dev/null)
[ -z "$fp" ] && exit 0

rule=""
domain=""
case "$fp" in
  # DB layer first — more specific than the general be/ match
  *"/be/migrations/"*|*"/be/queries/"*|*"sqlc.yaml")
    rule=".claude/skills/db-migration/SKILL.md"
    domain="DB migration / sqlc" ;;
  *"/be/"*.go)
    rule=".claude/skills/backend-go/SKILL.md"
    domain="Go backend" ;;
  *"/fe/src/"*)
    rule=".claude/skills/frontend-nextjs/SKILL.md"
    domain="Next.js frontend" ;;
  *"docker-compose"*|*"Dockerfile"*|*"Caddyfile"*|*".env.example"|*"/.github/workflows/"*|*"/scripts/"*)
    rule=".claude/skills/devops/SKILL.md"
    domain="DevOps / infra" ;;
esac
[ -z "$rule" ] && exit 0

# Order/payment/cancel logic has its own business-rule skill on top of the domain rule
extra=""
base=$(basename "$fp")
case "$base" in
  *[Oo]rder*|*[Pp]ayment*|*[Cc]ancel*|*[Cc]heckout*|*[Cc]art*)
    extra=" Business rules also apply: .claude/skills/order-flow/SKILL.md." ;;
esac

msg="📐 RULE CHECK [$domain] — editing $base. Read $rule (via the Read tool) before continuing if not already read this session; follow it exactly.$extra"
jq -n --arg ctx "$msg" '{hookSpecificOutput:{hookEventName:"PreToolUse",additionalContext:$ctx}}'
