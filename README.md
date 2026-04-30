# Hệ Thống Quản Lý Quán Bánh Cuốn

QR ordering · Kitchen Display (KDS) · POS · Payment webhooks

---

## Stack

| Layer | Tech |
|---|---|
| Backend | Go 1.25 · Gin · sqlc · MySQL 8.0 · Redis Stack 7 · Goose |
| Frontend | Next.js 14 App Router · TypeScript · Tailwind v3 · Zustand · TanStack Query v5 |
| Infra | Docker Compose · Caddy (auto TLS) · GitHub Actions |

**Ports:** BE=8080 · FE=3000 · MySQL=3306 · Redis=6379

---

## Quick Start (local dev)

```bash
cp .env.example .env
openssl rand -hex 32   # paste into JWT_SECRET in .env
docker compose up -d
docker compose ps      # all services should show running
```

Full local dev guide → [`docs/DOCKER_GUIDE.md`](docs/DOCKER_GUIDE.md)

---

## Documentation — 3 Layers

### Layer 1 — WHY & WHAT (goals, requirements, rules)
> Read this to understand what we're building and why decisions were made.

| Doc | Purpose |
|---|---|
| [`docs/qui_trinh/BanhCuon_BRD_v1.md`](docs/qui_trinh/BanhCuon_BRD_v1.md) | Business requirements |
| [`docs/qui_trinh/BanhCuon_SRS_v1.md`](docs/qui_trinh/BanhCuon_SRS_v1.md) | System requirements |
| [`docs/qui_trinh/BanhCuon_FSD_v1.md`](docs/qui_trinh/BanhCuon_FSD_v1.md) | Functional spec |
| [`docs/qui_trinh/BanhCuon_UXUI_Design_v1.md`](docs/qui_trinh/BanhCuon_UXUI_Design_v1.md) | UX/UI design |
| [`docs/MASTER_v1.2.md`](docs/MASTER_v1.2.md) | RBAC · business rules · JWT · realtime · design tokens |
| [`docs/contract/API_CONTRACT_v1.2.md`](docs/contract/API_CONTRACT_v1.2.md) | All API endpoints |
| [`docs/contract/ERROR_CONTRACT_v1.1.md`](docs/contract/ERROR_CONTRACT_v1.1.md) | Error codes + format |

### Layer 2 — HOW (technical guides for active development)
> Read this when you're coding. Start with your role's system guide.

| Doc | Audience |
|---|---|
| [`docs/be/BE_SYSTEM_GUIDE.md`](docs/be/BE_SYSTEM_GUIDE.md) | Backend developer |
| [`docs/fe/FE_SYSTEM_GUIDE.md`](docs/fe/FE_SYSTEM_GUIDE.md) | Frontend developer |
| [`docs/devops/DEVOPS_SYSTEM_GUIDE.md`](docs/devops/DEVOPS_SYSTEM_GUIDE.md) | DevOps engineer |

### Layer 3 — NOW (onboarding — current state + first tasks)
> Read this on day 1. Gets you to your first task in 5 minutes.

| Doc | Audience |
|---|---|
| [`docs/onboarding/BE_DEV.md`](docs/onboarding/BE_DEV.md) | Backend developer |
| [`docs/onboarding/FE_DEV.md`](docs/onboarding/FE_DEV.md) | Frontend developer |
| [`docs/onboarding/DEVOPS.md`](docs/onboarding/DEVOPS.md) | DevOps engineer |
| [`docs/onboarding/LEAD.md`](docs/onboarding/LEAD.md) | Tech lead |

---

## Project Status

| Phase | Status |
|---|---|
| Phase 0 — Architecture & Docs | ✅ Complete |
| Phase 1 — DB Migrations | 🔄 87% (migration 008 pending) |
| Phase 2 — Feature Specs | ✅ Complete |
| Phase 3 — sqlc + Project Setup | ✅ Complete |
| Phase 4 — Backend | 🔄 ~15% (auth handler is next) |
| Phase 5 — Frontend | ⬜ Not started (blocked on Phase 4 auth) |
| Phase 6 — DevOps | 🔄 40% (Caddy + CI pending) |
| Phase 7 — Testing & Go-Live | ⬜ Not started |

Full task list → [`docs/TASKS.md`](docs/TASKS.md)

---

## New to the project?

1. Read your onboarding card (Layer 3 above)
2. Open your system guide (Layer 2)
3. Check [`docs/TASKS.md`](docs/TASKS.md) for your next task
4. Follow the 7-step workflow in [`docs/IMPLEMENTATION_WORKFLOW.md`](docs/IMPLEMENTATION_WORKFLOW.md)
