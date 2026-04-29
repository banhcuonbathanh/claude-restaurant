# Phase 6 — DevOps / Infrastructure
> Can run in PARALLEL with Phase 4. Start Dockerfiles while BE is being built.
> Dependency: Phase 3 scaffolding complete ✅

## Paste These Docs

- [ ] `CLAUDE.md`
- [ ] `MASTER_v1.2.docx` §1 §9 (tech stack versions, all env vars)
- [ ] `contract/ERROR_CONTRACT_v1.1.docx`
- [ ] `claude/CLAUDE_DEVOPS.docx`
- [ ] `qui_trinh/BanhCuon_Project_Checklist.md` (Phase 6 section)

---

## Task 6.1 Prompt — Dockerfiles + docker-compose + Caddyfile

```
You are the DevOps engineer for the BanhCuon system.

I have pasted CLAUDE.md, MASTER §1+§9, ERROR_CONTRACT, CLAUDE_DEVOPS.docx, 
and the Project Checklist Phase 6 section above.

## Task 6.1: Docker stack

### Dockerfile.be (Go multi-stage)
Stage 1 — builder:
  FROM golang:1.22-alpine AS builder
  WORKDIR /app
  COPY go.mod go.sum ./
  RUN go mod download
  COPY . .
  RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

Stage 2 — runner (distroless for security):
  FROM gcr.io/distroless/static-debian12
  COPY --from=builder /app/server /server
  EXPOSE 8080
  CMD ["/server"]

### Dockerfile.fe (Next.js multi-stage)
Stage 1 — deps:     FROM node:20-alpine, npm ci
Stage 2 — builder:  npm run build (requires output: 'standalone' in next.config.js)
Stage 3 — runner:   copy .next/standalone + .next/static, EXPOSE 3000, CMD ["node","server.js"]

### docker-compose.yml (5 services with healthchecks)
Services:
  mysql:    image: mysql:8.0
            healthcheck: mysqladmin ping -h localhost --silent
  redis:    image: redis/redis-stack:latest
            healthcheck: redis-cli ping
  backend:  build: { context: ./be, dockerfile: Dockerfile.be }
            depends_on: mysql (condition: healthy), redis (condition: healthy)
            env_file: .env
  frontend: build: { context: ./fe, dockerfile: Dockerfile.fe }
            depends_on: [backend]
            env_file: ./fe/.env.local
  caddy:    image: caddy:2-alpine
            ports: 80:80, 443:443
            volumes: ./Caddyfile:/etc/caddy/Caddyfile

### Caddyfile
banhcuon.vn {
    handle /api/* {
        reverse_proxy backend:8080
    }
    handle /webhooks/* {
        reverse_proxy backend:8080
    }
    handle {
        reverse_proxy frontend:3000
    }
}

## Definition of Done
- [ ] docker-compose up -d starts all 5 services without error
- [ ] docker-compose logs backend shows server started
- [ ] GET http://localhost/health returns 200
- [ ] GET http://localhost/api/v1/health returns 200
- [ ] Backend waits for MySQL and Redis to be healthy before starting
- [ ] .env file is NOT baked into Docker image (env_file reference, not COPY .env)
```

---

## Task 6.2 Prompt — .env.example + migrate.sh + CI/CD + README

```
You are the DevOps engineer for the BanhCuon system.
Task 6.1 (Docker stack) is complete.

I have pasted CLAUDE.md, MASTER §1+§9, CLAUDE_DEVOPS.docx, and Project Checklist above.

## Task 6.2: .env.example + scripts + CI/CD pipeline

### .env.example (all vars with REPLACE placeholders + comments)
Include every env var from MASTER §9:
  DB_DSN, REDIS_URL, JWT_SECRET, JWT_ACCESS_TTL, JWT_REFRESH_TTL,
  STORAGE_BASE_URL, STORAGE_BUCKET,
  VNPAY_TMN_CODE, VNPAY_HASH_SECRET, VNPAY_URL,
  MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY, MOMO_ENDPOINT,
  ZALOPAY_APP_ID, ZALOPAY_KEY1, ZALOPAY_KEY2, ZALOPAY_ENDPOINT,
  WEBHOOK_BASE_URL, CORS_ORIGINS, PORT
🔴 NEVER commit .env — only .env.example with REPLACE values

### scripts/migrate.sh
#!/bin/sh
until mysqladmin ping -h mysql --silent; do
  echo "Waiting for MySQL..."
  sleep 2
done
goose -dir /migrations mysql "$DB_DSN" up
exec /app/server

### .github/workflows/deploy.yml
Trigger: push to main branch
Steps:
  1. Checkout
  2. Build Docker images (backend + frontend)
  3. Push to container registry
  4. SSH to VPS
  5. docker-compose pull && docker-compose up -d --no-build
  6. Rollback step: if deploy fails → docker-compose up -d {previous-image-tag}
Use GitHub Secrets for SSH key, registry credentials, VPS host.

### README.md
Include:
  - Local dev: docker-compose up -d
  - Port map: BE=8080, FE=3000, MySQL=3306, Redis=6379
  - Manual migrations: goose -dir migrations mysql "$DB_DSN" up
  - How to regenerate sqlc: sqlc generate && go build ./...
  - Environment variables: see .env.example

## Definition of Done
- [ ] .env.example has ALL vars from MASTER §9 — no missing vars
- [ ] All secrets in .env.example use REPLACE placeholder (not real values)
- [ ] .github/workflows/deploy.yml triggers on push to main
- [ ] migrate.sh waits for MySQL before running goose
- [ ] README.md covers local dev setup completely
- [ ] .gitignore includes: .env, node_modules/, dist/, *.exe, be/server
```
