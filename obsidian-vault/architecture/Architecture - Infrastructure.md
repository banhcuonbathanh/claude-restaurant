---
tags: [architecture, devops]
---

# Architecture — Infrastructure

**Stack:** Docker Compose · Caddy (reverse proxy) · GitHub Actions CI/CD

## Files (repo root)

- `docker-compose.yml` — full stack: BE, FE, MySQL, Redis Stack, Swagger UI
- `docker-compose.prod.yml` — production overrides
- `Caddyfile` — reverse proxy config
- `.github/workflows/` — CI/CD
- `scripts/` — migrate.sh and ops scripts
- `monitoring/` — monitoring setup (Phase 7)

## Ports

| Service | Port |
|---|---|
| BE (Go/Gin) | 8080 |
| FE (Next.js) | 3000 |
| MySQL | 3306 |
| Redis | 6379 |
| RedisInsight | 8001 |
| Swagger UI | 8090 |

## Key commands

```bash
docker compose up -d                 # full stack
docker compose up -d --build be|fe   # after code changes
docker compose logs -f be
```

## Related

- [[Architecture - Backend]] · [[Architecture - Frontend]]
- Realtime needs proxy config for SSE/WS → [[BE - Realtime & Jobs]]
- Rules: `.claude/skills/devops/SKILL.md` · `docs/claude/CLAUDE_DEVOPS.md`
- Deployment phase: DEPLOY rows in [[Docs - Task Management]]
