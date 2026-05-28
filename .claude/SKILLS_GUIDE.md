# Skills Guide — BanhCuon Project

All skills live in `.claude/skills/`. Each is a markdown file Claude reads and applies.

---

## Two types of skills

| Type | How it activates | When to use |
|---|---|---|
| **Auto-triggered** | Claude applies it automatically when the topic is relevant | Domain knowledge — you never need to call these manually |
| **Explicit command** | You type `/skill-name [args]` | Workflows with steps — Claude runs them on demand |

---

## Auto-triggered skills (no invocation needed)

These activate silently when you work in the relevant domain. Claude reads them and applies the rules without you asking.

---

### `/backend-go`
**Triggers when:** You write or ask about Go code — handlers, services, repos, middleware, tests.

**What it enforces:**
- Layer boundaries: handler → service → repository → db (no skipping)
- Always use `respondError()` — never raw `gin.H{}`
- `binding:"min=0"` not `binding:"required,min=0"` on numeric fields
- Correct DB field names (`price` not `base_price`, `image_path` not `image_url`, etc.)
- `recalculateTotalAmount` after every `order_items` mutation
- Middleware must receive dependencies explicitly (compile-time safety)
- WebSocket auth via `?token=` query param (not Authorization header)
- Context timeout on every DB call

---

### `/frontend-nextjs`
**Triggers when:** You write or ask about Next.js components, pages, hooks, stores, or API calls.

**What it enforces:**
- State ownership: TanStack Query (server) · Zustand (client) · RHF+Zod (forms) · `api-client.ts` (API)
- All IDs are `string` UUID — never `number`
- Design tokens only — never hardcoded hex or Tailwind color names (`bg-primary` not `bg-[#FF7A1A]`)
- `formatVND()` for all price display
- All localStorage keys through `src/lib/storage-keys.ts`
- Guest JWT exception in auth refresh interceptor
- Folder conventions: hooks → `src/hooks/`, stores → `src/store/`, shared → `src/components/shared/`

---

### `/order-flow`
**Triggers when:** You write or ask about order creation, status changes, cancellation, or payment on either BE or FE.

**What it enforces:**
- Exact state machine: `pending → confirmed → preparing → ready → delivered`
- Cancel threshold: `SUM(qty_served)/SUM(quantity) < 0.30` → use `422`, not `409`
- Payment only allowed when `order.status = 'ready'`
- Webhook: HMAC verify ALWAYS before any DB read; check idempotency before any write
- `item_status` is DERIVED from `qty_served` — no stored column, no migration
- 1 active order per table rule → `409 TABLE_HAS_ACTIVE_ORDER`
- `recalculateTotalAmount` after every `order_items` mutation

---

### `/db-migration`
**Triggers when:** You write a migration file, run goose, or run sqlc generate.

**What it enforces:**
- Mandatory sequence: write migration → `goose up` → `sqlc generate` → `go build ./...`
- Correct file naming: `NNN_description.sql` (current highest: `009`)
- Always write `-- +goose Down` section
- All IDs must be `CHAR(36)` UUID — never `INT AUTO_INCREMENT`
- Soft delete filter on every list query

---

## Explicit command skills (you invoke these)

---

### `/wireframe <page-folder-name> [excalidraw-path]`
**What it does:** Scaffolds a complete wireframe folder for a new FE page.

**Two flows:**
- **Flow A — excalidraw-first:** You already have a `.excalidraw` file → pass its path → Claude generates all spec files from it
- **Flow B — spec-first:** No drawing yet → Claude collects info → creates placeholder files → you run `/excalidraw` after

**Output:** A full wireframe folder under `docs/fe/wireframes/` with spec, AC, component list, and zone breakdown.

```
/wireframe checkout_page
/wireframe kds_page docs/fe/wireframes/kds.excalidraw
```

---

### `/excalidraw <page-name>`
**What it does:** Generates a `.excalidraw` wireframe drawing file for a FE page.

**Three phases:**
1. Plan zones and layout → show to you for approval
2. Draw the main page
3. Draw modals

**You must approve the plan before Claude draws anything.**

```
/excalidraw checkout_page
```

---

### `/redraw <page-folder-path>`
**What it does:** Redraws an existing wireframe as a v2 `.excalidraw`, incorporating UX recommendations from `recommend.md`.

**Two phases:**
1. Audit old drawing + plan zone-level changes
2. Draw the improved v2 file

```
/redraw client_menu_page
/redraw admin_main/admin_main_product
```

---

### `/redraw-all`
**What it does:** Batch redraws all 9 wireframe pages that have a `recommend.md` file. Processes one page at a time — waits for your "continue" between pages. Resumes from where it left off.

```
/redraw-all
```

---

### `/dev-page <page-folder-name>`
**What it does:** Builds FE components for a page and verifies BE endpoints — driven by the wireframe spec.

**Three phases:**
1. **Audit** — diffs wireframe spec vs existing code, lists gaps
2. **Gap Fill** — builds only what is missing
3. **Integration** — wires zones into `page.tsx`, verifies ACs

```
/dev-page checkout_page
```

---

### `/design [subcommand]`
**What it does:** Manages the project's `DESIGN.md` — the machine-readable design system spec.

**Subcommands:**
- `scaffold` (default) — creates a new `DESIGN.md` from `globals.css` + `tailwind.config.ts`
- `lint` — checks `DESIGN.md` for missing or inconsistent tokens
- `export` — exports tokens in a consumable format
- `diff` — shows what changed since last scaffold

```
/design
/design lint
/design diff
```

---

### `/doc-check [task-id]`
**What it does:** Read-only audit of project docs mid-session. Scans `TASKS.md`, `CLAUDE.md`, and new files for staleness. Outputs a prioritized fix list — does NOT make edits.

Pass a task ID to scope the scan to one task.

```
/doc-check
/doc-check 4.1
```

---

### `/quality-check [n]`
**What it does:** Audits the quality of the last `n` sessions (default: 5). Checks code correctness, spec compliance, skipped workflow steps, commit hygiene, and CSS safety.

```
/quality-check
/quality-check 3
```

---

### `/handoff`
**What it does:** Closes a work session properly. Reads task statuses, edits stale docs (`TASKS.md`, `CLAUDE.md`, `LESSONS_LEARNED`), and prints a handoff summary.

**Run this at the end of every session.** Do not close without it.

```
/handoff
```

---

### `/codebase-graph [view]`
**What it does:** Scans the entire codebase and generates Mermaid knowledge graphs showing architecture, layer dependencies, and FE↔BE connections. Output is written to `docs/graphs/CODEBASE_GRAPH.md` — open with VSCode Markdown Preview (`Cmd+Shift+V`) or push to GitHub to view.

**Views:**
- `arch` (default) — full system: clients → FE → BE → DB/Redis
- `be` — backend layer graph per domain (handler → service → repo → table)
- `fe` — frontend page graph (page → hook → store → API call)
- `api` — FE page ↔ BE endpoint connection map
- `all` — all four diagrams at once

```
/codebase-graph
/codebase-graph be
/codebase-graph api
/codebase-graph all
```

---

## Quick reference card

```
WRITING CODE
  Go backend          → auto (backend-go skill)
  Next.js frontend    → auto (frontend-nextjs skill)
  Order/payment logic → auto (order-flow skill)
  DB migration        → auto (db-migration skill)

WIREFRAMES
  New page drawing    → /excalidraw <page-name>
  New page folder     → /wireframe <page-folder-name>
  Improve existing    → /redraw <page-folder-path>
  Improve all pages   → /redraw-all

BUILDING PAGES
  Build from spec     → /dev-page <page-folder-name>

DESIGN SYSTEM
  Manage tokens       → /design [scaffold|lint|export|diff]

CODEBASE EXPLORATION
  Architecture graph  → /codebase-graph
  Backend layers      → /codebase-graph be
  Frontend pages      → /codebase-graph fe
  API connections     → /codebase-graph api
  All views           → /codebase-graph all

QUALITY / DOCS
  Mid-session audit   → /doc-check [task-id]
  Session quality     → /quality-check [n]
  Close session       → /handoff
```
