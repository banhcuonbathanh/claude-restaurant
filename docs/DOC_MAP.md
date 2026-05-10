# DOC_MAP.md — Document Reference Map

> **Purpose:** Tell Claude (and developers) exactly WHEN, WHY, and WHAT each doc is for.
> **Rule:** When in doubt about which doc to open, start here.
> **Version:** v1.0 · 2026-05-10

---

## Decision Procedure — Which Doc to Read First?

```
START: I need to build / modify a feature
        │
        ▼
Does a Spec file exist for this domain?  (see Tier 2 below)
        │
       YES ──────────────────────────────► Read the domain Spec → PLAN
        │                                   If spec covers it: follow spec exactly.
        │                                   If spec doesn't cover it → go to NO path.
        │
        NO
        │
        ▼
Read SRS (BanhCuon_SRS_v1.md)           ← WHAT the system must do
        │
        ▼
Read FSD (BanhCuon_FSD_v1.md)           ← HOW each feature is designed to work
        │
        ▼
Still unclear? Read BRD (business context) and flag ❓ CLARIFY with user
```

**For cross-cutting concerns (always applies):**

| Need | Go to |
|---|---|
| Business rules (order flow, cancel, payment) | `MASTER_v1.2.md §4` |
| RBAC roles + hierarchy | `MASTER_v1.2.md §3` |
| JWT / auth rules | `MASTER_v1.2.md §6` |
| Realtime (SSE/WS config) | `MASTER_v1.2.md §5` |
| Design tokens (colors, fonts) | `MASTER_v1.2.md §2` |
| Error codes + format | `ERROR_CONTRACT_v1.1.md` |
| API endpoint signatures | `API_CONTRACT_v1.2.md` |
| DB field names (single source) | `BanhCuon_DB_SCHEMA_SUMMARY.md` |

---

## Tier 0 — Session Control (read every session)

| File | Description | When to use |
|---|---|---|
| `CLAUDE.md` | Project map · phase status · current work · commands | Session start · pick next task |
| `docs/TASKS.md` | Master task list with status (⬜/✅/🔴) | Find next task · update after every task |
| `docs/IMPLEMENTATION_WORKFLOW.md` | 7-step workflow (READ→PLAN→ALIGN→IMPLEMENT→SELF-REVIEW→TEST→DONE) + spec gate rule | Before starting any task |

---

## Tier 1 — Requirements (read when feature has no spec or spec is incomplete)

| File | Type | Description | When to use |
|---|---|---|---|
| `docs/qui_trinh/BanhCuon_SRS_v1.md` | SRS | WHAT the system must do — functional requirements per IEEE 830. Covers all 6 modules: Customer Portal, QR Ordering, KDS, POS, Dashboard, Infra. | Feature not in any spec → check here for functional requirement |
| `docs/qui_trinh/BanhCuon_SRS_NFR_v1.1.md` | NFR | Non-functional requirements — performance targets, security constraints, availability, scalability | Performance/security decisions · load estimates |
| `docs/qui_trinh/BanhCuon_BRD_v1.md` | BRD | WHY the system exists — business problem, project scope, stakeholder goals | Understanding business intent · resolving ambiguous requirements |
| `docs/qui_trinh/BanhCuon_FSD_v1.md` | FSD | HOW each feature works — data flows, DB structure, API logic, FE components, AC. Bridges SRS → code. | Feature design gap · how a flow was intended to work |
| `docs/qui_trinh/BanhCuon_UXUI_Design_v1.md` | UX/UI | UX flows, screen layouts, color system, component guidelines | New FE screen with no wireframe · visual design decisions |
| `docs/SYSTEM_DESCRIPTION_v1.md` | Overview | Full system architecture, project layout, tech stack description for AI/dev onboarding | Onboarding to the project · architecture questions |

---

## Tier 2 — Domain Specs (read when working in that domain — spec gate)

> These are the most detailed per-feature implementation specs. Read BEFORE planning.

| File | Domain | What it covers |
|---|---|---|
| `docs/spec/Spec1_Auth_Updated_v2.md` | Auth | Login, JWT access+refresh, token rotation, is_active check, RBAC guard, guest JWT |
| `docs/spec/Spec_2_Products_API_v2_CORRECTED.md` | Products | CRUD categories/products/toppings/combos, Redis cache, image upload, sqlc queries |
| `docs/spec/Spec_3_Menu_Checkout_UI_v2.md` | Menu/Checkout FE | /menu · /checkout · /order/[id] · Zustand cart · ToppingModal · ComboModal · SSE hook |
| `docs/spec/Spec_4_Orders_API.md` | Orders | State machine, combo expansion, 1-table-1-order rule, SSE pub/sub, WS KDS broadcast |
| `docs/spec/Spec_5_Payment_Webhooks.md` | Payment | VNPay/MoMo/ZaloPay HMAC, COD, POS UI, webhook idempotency, amount verification |
| `docs/spec/Spec_6_QR_POS.md` | QR + POS | QR code scan flow, /table/[id] page, POS order creation, cashier UI |
| `docs/spec/Spec_7_Staff_Management.md` | Staff | Staff CRUD, role assignment, is_active toggle, manager-only access |
| `docs/spec/Spec_9_Admin_Dashboard_Pages.md` | Admin Dashboard | Overview page (live floor + Kiểm tra), Marketing (QR codes), revenue reports |
| `docs/spec/Spec_Admin_Categories.md` | Admin Categories | Category management page |

---

## Tier 2 — Cross-cutting References (read when needed, per the table above)

| File | Description | When to use |
|---|---|---|
| `docs/MASTER_v1.2.md` | Central rules doc: §2 design tokens · §3 RBAC · §4 business rules · §5 realtime · §6 JWT | Any business rule, role, auth, or realtime question |
| `docs/contract/API_CONTRACT_v1.2.md` | All API endpoints — method, path, request body, response shape | Before writing any FE api call or BE handler |
| `docs/contract/ERROR_CONTRACT_v1.1.md` | All error codes + `respondError()` pattern | Before writing any error response (BE) or error toast (FE) |
| `docs/task/BanhCuon_DB_SCHEMA_SUMMARY.md` | DB field names — single source of truth for column names | Before writing any SQL query, sqlc annotation, or Go struct |
| `docs/api/openapi.yaml` | OpenAPI 3.0 spec (live via Swagger UI at :8090) | API shape verification · client code generation |

---

## Tier 3 — System Guides (entry point for BE / FE / DevOps sessions)

| File | Description | When to use |
|---|---|---|
| `docs/be/BE_SYSTEM_GUIDE.md` | PRIMARY BE guide — epic breakdown, all critical rules, code patterns, DI skeleton, per-domain reading list | Start of any BE task |
| `docs/fe/FE_SYSTEM_GUIDE.md` | PRIMARY FE guide — epic breakdown, state ownership rules, component patterns, per-domain reading list | Start of any FE task |
| `docs/devops/DEVOPS_SYSTEM_GUIDE.md` | DevOps guide — Docker Compose, Caddy, CI/CD, env vars, deploy procedures | Infra / Docker / CI tasks |
| `docs/base/LESSONS_LEARNED_v3.md` | Workflow guide + known weaknesses + anti-patterns + incident log | Something went wrong · reviewing workflow · session closing |
| `docs/base/BanhCuon_Project.md` | Project history, decisions, context log | Background research · why something was built a certain way |

---

## Tier 4 — Supporting Docs (rarely needed, context-specific)

| Folder / File | Description | When to use |
|---|---|---|
| `docs/fe/wireframes/` | ASCII + Excalidraw wireframes per FE page | FE Pre-Task Phase (Step 0b) · visual layout reference |
| `docs/onboarding/` | Role-specific onboarding: BE_DEV · FE_DEV · DEVOPS · LEAD | New team member joining · role-specific setup |
| `docs/pm/` | PM process: change requests, session guide, slash commands, AI management | Managing project process · change requests |
| `docs/case_study/` | Deep-dive case studies: Auth · Products · FE | Learning from past implementations · debugging similar issues |
| `docs/qui_trinh/BanhCuon_Project_Checklist.md` | Acceptance criteria per task | Verifying a task is fully complete |
| `docs/qui_trinh/BanhCuon_Diagrams_v1.md` | System diagrams (sequence, ER, flow) | Architecture visualization |
| `docs/doc_structure/` | Doc structure diagrams + decision workflow images | Understanding how the doc system itself is organized |
| `docs/TASK_READING_GUIDE.md` | Guide for reading and interpreting TASKS.md | Unclear task format · task row conventions |

---

## Folder Summary

```
docs/
├── DOC_MAP.md                  ← YOU ARE HERE — start here when lost
├── TASKS.md                    ← master task list (always update after every task)
├── IMPLEMENTATION_WORKFLOW.md  ← 7-step build process
├── MASTER_v1.2.md              ← cross-cutting rules (RBAC, business rules, JWT, realtime, tokens)
├── SYSTEM_DESCRIPTION_v1.md    ← full system architecture overview
│
├── spec/                       ← domain specs (Spec1–Spec9) — read BEFORE planning any domain task
├── contract/                   ← API_CONTRACT + ERROR_CONTRACT — read when writing handlers or API calls
├── qui_trinh/                  ← SRS + FSD + BRD + UX + checklists — read when spec is insufficient
├── task/                       ← DB schema + task-specific deep dives
│
├── be/                         ← BE_SYSTEM_GUIDE (primary BE entry point)
├── fe/                         ← FE_SYSTEM_GUIDE (primary FE entry point) + wireframes/
├── devops/                     ← DEVOPS_SYSTEM_GUIDE
│
├── base/                       ← LESSONS_LEARNED + project history
├── api/                        ← openapi.yaml
├── onboarding/                 ← role-based onboarding guides
├── pm/                         ← project management process docs
├── case_study/                 ← learning case studies
└── doc_structure/              ← diagrams of the doc system itself
```

---

*BanhCuon System · DOC_MAP · v1.0 · 2026-05-10*
