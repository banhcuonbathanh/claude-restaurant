---
name: devops
description: Apply whenever touching infra files — docker-compose.yml, Dockerfile, Caddyfile, .env.example, .github/workflows/, scripts/. Encodes the current stack layout, env-var sync rules, and the mistakes that break the running compose stack.
---

# DevOps Rules — BanhCuon Project

> Verified against the live repo 2026-07-07. Older narrative guide: `docs/claude/CLAUDE_DEVOPS.md` (v1.0 — partially stale; THIS file wins on conflict).

## The stack (docker-compose.yml — 10 services)

| Service | Image / build | Port(s) | Depends on |
|---|---|---|---|
| mysql | mysql:8.0 | 3306 | — |
| redis | redis/redis-stack:latest | 6379 · 8001 (RedisInsight) | — |
| be | build `context: .` + `dockerfile: be/Dockerfile` ⚠️ root context | 8080 | mysql+redis (healthy) |
| fe | build `context: ./fe` | 3000 | be |
| caddy | caddy:2-alpine | 80 · 443 | be, fe |
| swagger | swaggerapi/swagger-ui | 8090 | — |
| prometheus | prom/prometheus:v2.53.0 | 9090 | be |
| grafana | grafana/grafana:10.4.2 | 3001 | prometheus, loki |
| loki | grafana/loki:2.9.8 | 3100 | — |
| promtail | grafana/promtail:2.9.8 | — | loki |

- ⚠️ **BE build context is the repo root**, not `be/` — `be/Dockerfile` COPYs from root paths. FE context is `./fe`.
- New service → MUST have `restart: unless-stopped` + a healthcheck (or documented reason why not) — match existing services.
- After BE/FE code changes: `docker compose up -d --build be|fe`. Never `docker compose down -v` casually — **`-v` deletes mysql_data (all data)**. Backup first.

## Env vars — the 3-place sync rule

Adding/renaming an env var touches **all three, in the same change**:
1. `be/cmd/server/main.go` (or wherever `os.Getenv` reads it)
2. `docker-compose.yml` → `be.environment` (with `${VAR:-default}`; required secrets use `${VAR:?...}` like JWT_SECRET)
3. `.env.example` (placeholder value + one-line comment; real values NEVER committed — `.env` is gitignored)

- ⚠️ Known naming trap: `.env.example` documents `REDIS_ADDR` (host:port, no scheme — what main.go reads) while compose also sets `REDIS_URL`. Check `main.go` before touching either; do not "clean up" one without the other.
- Secrets only in server environment / `.env` — never in compose defaults, never in git.

## Caddyfile

- Listen address comes from `{$CADDY_HOST::80}` — `:80` local (HTTP), a bare domain in prod (auto-HTTPS). Don't hardcode a domain.
- `email {$ACME_EMAIL:noreply@example.invalid}` — the fallback is load-bearing: an empty email is a fatal parse error. Keep it.
- Route table (order matters): `/api/*`, `/webhooks/*`, `/health`, `/uploads/*` → `be:8080`; everything else → `fe:3000`. New BE route prefixes must be added here or they silently hit the FE.
- Validate after edits: `docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile` (or restart caddy and check logs).

## CI/CD + scripts

- `.github/workflows/deploy.yml` — deploy only when tests pass; rollback = pull previous image + `docker compose up -d`.
- `scripts/migrate.sh` — wait-for-db → `goose up` → exec server; runs as BE entrypoint. Migration file changes belong to the **db-migration skill**, not here.
- `scripts/smoke_test.sh` — run after any compose/Caddy change to prove the stack still serves.

## Ownership boundary

A DevOps task touches ONLY: `docker-compose.yml`, `be/Dockerfile`, `fe/Dockerfile`, `Caddyfile`, `.env.example`, `.github/workflows/`, `scripts/`, `monitoring/`. If you find yourself editing `be/` or `fe/` app source mid-devops-task → STOP, that's a scope change (CLAUDE.md scope contract).
