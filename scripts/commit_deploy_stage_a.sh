#!/bin/sh
# Owner-run commit script — Phase DEPLOY Stage A (2026-06-11).
# Claude cannot commit in this environment; run this once, review with `git diff --staged` first.
set -e
cd "$(dirname "$0")/.."

git add .gitignore be/Dockerfile be/entrypoint.sh docker-compose.yml Caddyfile \
  monitoring/loki-config.yml scripts/smoke_test.sh \
  docs/devops/DEPLOY_RUNBOOK.md docs/GOLIVE_RUNBOOK.md \
  docs/tasks/MASTER_TASK.md docs/tasks/CURRENT_TASK.md

git status --short
printf '\nPress Enter to commit, Ctrl-C to abort: '
read _

git commit -m "deploy(stage-a): Mac LAN test server — auto-migrations, Caddy fixes, runbook (D-1..D-5)

- be/entrypoint.sh + Dockerfile: goose migrations auto-run before server start
- compose: mysql healthcheck uses \${MYSQL_PASSWORD}; caddy gets CADDY_HOST/ACME_EMAIL env
- Caddyfile: /uploads/* route; non-empty email fallback (fixes caddy crash-loop)
- loki: WAL dir inside volume (fixes crash-loop)
- smoke_test.sh: drop curl -f (corrupted status), valid-length bad-creds password
- docs: DEPLOY_RUNBOOK.md (new), GOLIVE_RUNBOOK NEXT_PUBLIC_API_URL must end /api/v1
- tasks: Phase DEPLOY registered, D-1..D-5 done"
echo "Done. Push when ready: git push"
