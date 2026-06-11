# System Handbook — Hệ Thống Quản Lý Quán Bánh Cuốn

> **TL;DR:** This folder is the **single entry point** to understand the whole system — both FE and BE —
> in under 30 minutes, then start developing a new page or endpoint that fits the existing design,
> shared components, and data flow. Every file starts with its own TL;DR; read those first.
> The folder structure itself is a **reusable template** for other projects → see
> [05_dev_guide/FOLDER_TEMPLATE.md](05_dev_guide/FOLDER_TEMPLATE.md).

---

## What This System Is (30 seconds)

A restaurant management system for a Vietnamese bánh cuốn shop:

- **Customers** scan a table QR → browse menu → order → track live status → pay (cash / VNPay / MoMo)
- **Staff** run KDS (kitchen display), POS, confirm/cancel orders, take payment
- **Admin/owner** manage products, staff, tables/QR, live floor overview, marketing

**Stack:** Go 1.25 + Gin + sqlc + MySQL 8 + Redis Stack (BE) · Next.js 14 App Router + TypeScript + Tailwind + Zustand + TanStack Query (FE) · SSE/WS realtime · Docker Compose + Caddy.

---

## Folder Map — Read in This Order

| # | Folder | What's inside | Read when |
|---|---|---|---|
| `00_overview/` | [SYSTEM_OVERVIEW](00_overview/SYSTEM_OVERVIEW.md) · [TECH_STACK](00_overview/TECH_STACK.md) | What the system does, actors, architecture diagram, stack tables | **Always first** — 10 min |
| `01_flow/` | [FLOW_INDEX](01_flow/FLOW_INDEX.md) · [CLIENT_FLOW](01_flow/CLIENT_FLOW.md) · [STAFF_FLOW](01_flow/STAFF_FLOW.md) · [ORDER_STATE_MACHINE](01_flow/ORDER_STATE_MACHINE.md) · [PAYMENT_FLOW](01_flow/PAYMENT_FLOW.md) | How every journey works end-to-end, with sequence/state diagrams | Before touching any feature in that flow |
| `02_spec/` | [API_SPEC](02_spec/API_SPEC.md) · [DB_SCHEMA](02_spec/DB_SCHEMA.md) · [ERROR_SPEC](02_spec/ERROR_SPEC.md) · [BUSINESS_RULES](02_spec/BUSINESS_RULES.md) | Contracts: every endpoint, every table, every error code, every rule | While coding — keep open as reference |
| `03_be/` | [BE_TECH_SUMMARY](03_be/BE_TECH_SUMMARY.md) · [BE_CODE_SUMMARY](03_be/BE_CODE_SUMMARY.md) · [REDIS_CACHE](03_be/REDIS_CACHE.md) · [REALTIME_SSE](03_be/REALTIME_SSE.md) | BE layers, route map, caching strategy, SSE/WS architecture | Any BE task |
| `04_fe/` | [FE_TECH_SUMMARY](04_fe/FE_TECH_SUMMARY.md) · [FE_CODE_SUMMARY](04_fe/FE_CODE_SUMMARY.md) · [STATE_MANAGEMENT](04_fe/STATE_MANAGEMENT.md) · [LOADING_PATTERNS](04_fe/LOADING_PATTERNS.md) · [DESIGN_SYSTEM](04_fe/DESIGN_SYSTEM.md) · [DATA_COMMUNICATION](04_fe/DATA_COMMUNICATION.md) | FE conventions: state rules, loading UX, design tokens, shared components, data flow | Any FE task |
| `05_dev_guide/` | [NEW_PAGE_GUIDE](05_dev_guide/NEW_PAGE_GUIDE.md) · [FOLDER_TEMPLATE](05_dev_guide/FOLDER_TEMPLATE.md) | How to build a new page the right way · how to reuse this handbook structure in another project | Before starting a new page / new project |

---

## Reading Paths by Role

**"I'm new — just give me the picture" (15 min)**
1. [00_overview/SYSTEM_OVERVIEW.md](00_overview/SYSTEM_OVERVIEW.md)
2. [01_flow/FLOW_INDEX.md](01_flow/FLOW_INDEX.md) — look at the intersection map
3. Skim the TL;DR blocks of every other file

**"I'm building a new FE page" (the most common task)**
1. [04_fe/DESIGN_SYSTEM.md](04_fe/DESIGN_SYSTEM.md) — tokens + shared component catalog (reuse, never re-style)
2. [04_fe/STATE_MANAGEMENT.md](04_fe/STATE_MANAGEMENT.md) — where each piece of state lives (strict rules)
3. [04_fe/DATA_COMMUNICATION.md](04_fe/DATA_COMMUNICATION.md) — how the page talks to BE and other pages
4. Follow [05_dev_guide/NEW_PAGE_GUIDE.md](05_dev_guide/NEW_PAGE_GUIDE.md) step by step

**"I'm building/changing a BE endpoint"**
1. [03_be/BE_TECH_SUMMARY.md](03_be/BE_TECH_SUMMARY.md) — layer rules (handler → service → repository → sqlc)
2. [02_spec/API_SPEC.md](02_spec/API_SPEC.md) + [02_spec/ERROR_SPEC.md](02_spec/ERROR_SPEC.md) — match existing contracts
3. [03_be/BE_CODE_SUMMARY.md](03_be/BE_CODE_SUMMARY.md) — "add a new endpoint" checklist
4. Touching cached data? → [03_be/REDIS_CACHE.md](03_be/REDIS_CACHE.md) — invalidation triggers

**"I'm touching orders / payment / cancel"**
1. [01_flow/ORDER_STATE_MACHINE.md](01_flow/ORDER_STATE_MACHINE.md) — transitions + who is allowed
2. [02_spec/BUSINESS_RULES.md](02_spec/BUSINESS_RULES.md) — the rules summary
3. The relevant flow doc in `01_flow/`

---

## Non-Negotiable Rules (apply to every page, every endpoint)

1. **Same design everywhere** — new pages use the tokens + shared components in [DESIGN_SYSTEM.md](04_fe/DESIGN_SYSTEM.md). No one-off colors, no inline hex.
2. **Strict state homes** — server data → TanStack Query · cross-page → Zustand · component-local → useState · forms → RHF+Zod. See [STATE_MANAGEMENT.md](04_fe/STATE_MANAGEMENT.md).
3. **Strict BE layers** — handler → service → repository → db (sqlc). No layer skipping. See [BE_TECH_SUMMARY.md](03_be/BE_TECH_SUMMARY.md).
4. **One write path for orders** — all order POSTs go through `fe/src/lib/order-payload.ts`.
5. **localStorage keys** only in `fe/src/lib/storage-keys.ts`.
6. **Errors** follow [ERROR_SPEC.md](02_spec/ERROR_SPEC.md) format on BE and the code→message mapping on FE.
7. **Cache invalidation** — any BE write to cached data must trigger the invalidation listed in [REDIS_CACHE.md](03_be/REDIS_CACHE.md).

---

## How This Handbook Stays Useful

- Every file is a **summary that links to its deep-dive sources** (original specs, contracts, code). When summary and code disagree → **the code wins**; fix the summary.
- Update the relevant file here whenever a flow, contract, or convention changes — it's the first thing the next developer reads.
- Reusing this structure for a new project → [05_dev_guide/FOLDER_TEMPLATE.md](05_dev_guide/FOLDER_TEMPLATE.md).
