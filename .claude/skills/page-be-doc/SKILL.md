---
name: page-be-doc
description: Generate (or refresh) the Backend View doc for one FE page — a `<page>_be.md` like docs/system/08_pages/customer/customer_menu_be.md: every BE endpoint the page calls, traced handler → service → repository → SQL, with auth, caching, errors, and flags. Every claim MUST be traced to Go source (code wins), then cross-checked against ALL relevant docs/system files. On completion, sync any new/changed fact back into those docs/system files and update README.md + PAGES_INDEX.md. Usage: /page-be-doc <page-folder-or-name>. Model: customer_menu_be.md.
---

Build the **Backend View** (`<page>_be.md`) for one FE page so the owner and you share one
accurate picture of "which endpoints this page hits, and exactly what the BE does for each" —
traced from real Go source, then reconciled with the rest of the handbook so nothing in
`docs/system/` is left stale.

The argument is: $ARGUMENTS — a page identifier: a folder/file name under
`docs/system/08_pages/` (e.g. `customer_menu`, `staff_kds`, `admin_overview`) or a route
(e.g. `/menu`, `/pos`).

**The canonical output to copy the shape from:**
`docs/system/08_pages/customer/customer_menu_be.md`

**Golden rule — code is the source of truth.** Every endpoint row, file:line, cache key, auth
note, and field name is a claim about the running Go code on the current branch. **Read the
source, do not recall it.** If a fact cannot be confirmed from a file, write `❓ UNVERIFIED` —
a short honest doc beats a complete wrong one. When source and any `docs/system` file disagree,
**the code wins**: fix the doc and log the drift (Step 6).

**Two jobs, not one.** This skill (1) WRITES the page's `_be.md` and (2) UPDATES `docs/system`
so the new facts are reflected everywhere. Do not skip job 2 — that is the whole point of the
request ("ensure update all information and data in docs/system").

---

## Step 0 — Read the tracker, then resolve the page and its neighbours

0. **Read the tracker** `docs/system/08_pages/BE_DOC_TRACKER.md`. Find this page's row — note prior
   status/concerns (a ✅ row means this is a refresh). If the page has no row, add one. If the row
   is ❌ (PLANNED) or N/A (no BE calls), respect it: STOP and confirm with the owner before writing.
1. Find the page in [`docs/system/08_pages/PAGES_INDEX.md`](../../../docs/system/08_pages/PAGES_INDEX.md) →
   get its route and its FE doc file (`08_pages/<page>.md`). If the page is not in the index,
   STOP and ask the owner which route/page they mean.
2. Read the **FE sibling doc** `08_pages/<page>.md` in full — its Zones table tells you which
   components call which endpoints, and its Object Model / Flags sections must stay consistent
   with what you write. The `_be.md` is the BE twin of this file and links back to it.
3. Locate the page's real FE code: `fe/src/app/.../<page>/page.tsx` and the components/hooks it
   renders. You need these only to enumerate **which endpoints the page actually calls** (the BE
   tracing happens in Go).

If the page has no `page.tsx` yet (🔮 PLANNED) → STOP and tell the owner the BE doc would be
speculative; offer to base it on the planned spec, clearly labelled `(planned, not yet coded)`.

## Step 1 — Enumerate the endpoints this page calls

From the FE sibling doc + the page's hooks/mutations/`lib/api-client.ts` calls, list **every**
endpoint the page hits (reads and writes). For each, capture the method + path (e.g.
`GET /products`, `POST /orders`, `POST /orders/:id/items`). This list becomes the rows of the
**Endpoints Used by This Page** table. Do not add endpoints the page never calls.

## Step 2 — Trace each endpoint through the Go source (source of truth)

For every endpoint, open the real Go files and record the chain with `file:line`:

1. **Route registration + middleware** → `be/cmd/server/main.go` (route group, `authMW`,
   role gates like `AtLeast("manager")`). Record auth model per endpoint.
2. **Handler** → `be/internal/handler/<domain>_handler.go` — binding, query params actually
   read (note any the FE sends that the handler ignores → a Flag), the serializer used.
3. **Service** → `be/internal/service/<domain>_service.go` — business logic, cache get/set,
   snapshotting, combo expansion, total recalc, etc.
4. **Repository / sqlc query** → the exact query name (`ListProductsAvailable`, tx inserts…).
5. **Redis cache** → key name + TTL + invalidation trigger, if any.

Keep a `file:line` for every non-trivial claim. Anything you cannot pin to a line → `❓ UNVERIFIED`.

## Step 3 — Cross-check every claim against docs/system (required)

Before writing, reconcile each part of the doc against the handbook file that owns that fact.
For each row below: if the doc and the code **agree**, cite the doc as the deep-dive link; if they
**disagree**, the code wins — note the mismatch for Step 6 sync.

| Part of the `_be.md` | Cross-check against (owner of that fact) |
|---|---|
| Endpoints table / route map | `02_spec/API_SPEC.md` · `03_be/BE_CODE_SUMMARY.md` (route map) |
| Auth model per endpoint (public / authMW / role) | `02_spec/BUSINESS_RULES.md` (RBAC) · `main.go` middleware |
| Request / response **key fields** | `02_spec/API_SPEC.md` (Key Request/Response Fields) |
| Field / column names | `02_spec/DB_SCHEMA.md` (single source of field names) |
| Caching keys, TTL, invalidation | `03_be/REDIS_CACHE.md` · `10_caching/CACHE_FLOW_E2E.md` |
| Error behaviour / codes | `02_spec/ERROR_SPEC.md` |
| Realtime (only if page uses SSE/WS) | `03_be/REALTIME_SSE.md` · relevant `01_flow/*` |
| Order write pipeline / snapshots / combo expansion | `02_spec/OBJECT_MODEL_ORDER.md` · `07_business_logic/LOGIC_BE.md` |
| Business rules (one-active-order, cancel, payment) | `02_spec/BUSINESS_RULES.md` · `07_business_logic/LOGIC_BE.md` |
| Layer rules (handler→service→repo→sqlc) | `03_be/BE_TECH_SUMMARY.md` |
| FE-side consistency (flags, object shapes) | the FE sibling `08_pages/<page>.md` |

Skip a row only if the page genuinely has nothing in that category (e.g. no realtime).

## Step 4 — Write the page `_be.md`

Path: `docs/system/08_pages/<same-folder-as-FE-doc>/<page>_be.md`
(e.g. FE doc `08_pages/customer/customer_menu.md` → BE doc `08_pages/customer/customer_menu_be.md`;
a flat FE doc `08_pages/staff_kds.md` → `08_pages/staff_kds_be.md`).

Mirror the section order of `customer_menu_be.md` exactly (omit a section only if it doesn't apply):

1. **H1 + TL;DR blockquote** — one-line purpose; a `Sources:` line listing the exact Go files
   traced; the branch name; and cross-links to the FE sibling doc + any object-model doc.
2. **`## Endpoints Used by This Page`** — the table: `# | Endpoint | Auth | Handler | Service |
   Repo / Query | Redis cache`. Follow with the route-registration `file:line`.
3. **`## Auth Model on This Page`** — public vs authMW vs role-gated, guest-JWT behaviour,
   `created_by` rules.
4. **`## Per-Endpoint Detail`** — one `### N · METHOD /path` block per endpoint, each citing
   `file:line` for handler/service/repo and describing cache + special logic.
5. **`## Caching & Invalidation`** — keys, TTL, write-triggered invalidation, failure behaviour.
6. **`## Error Behaviour`** — bind failures, service-error mapping, FE-visible states.
7. **`## Flags`** — numbered table of mismatches/gotchas (params ignored, response-only fields,
   missing middleware…). Cross-reference the FE sibling's flags where they match.

Use `---` separators between sections, matching the model file.

## Step 5 — Verification pass (do not skip)

Re-open each handler/service once more and confirm every cell. Any claim you could not pin to a
line → downgrade to `❓ UNVERIFIED`. Confirm the Endpoints table lists only endpoints the page
actually calls, and that each `file:line` still resolves.

## Step 6 — Sync docs/system (job 2 — required)

This is the "ensure update all information and data in docs/system" requirement. Propagate every
fact that the source proved but the handbook had wrong or missing. Make **minimal, surgical**
edits — fix only what the trace contradicted; do not rewrite unrelated prose.

1. **For each disagreement found in Step 3** → fix the owning `docs/system` file (e.g. correct a
   field name in `DB_SCHEMA.md`, an endpoint in `API_SPEC.md`, a cache key in `REDIS_CACHE.md`).
2. **Log the drift** in `07_business_logic/LOGIC_INDEX.md` Decision Log (the handbook rule:
   code wins → fix the summary AND log the drift). One line: date · what was stale · corrected to.
3. **`08_pages/PAGES_INDEX.md`** → add a link to the new `_be.md` next to the page's FE doc
   (e.g. `[customer_menu.md](menu/customer_menu.md) · [BE](menu/customer_menu_be.md)`).
4. **`docs/system/README.md`** → ensure the new BE doc is discoverable. If a "Per-Page Backend
   Docs" list/note does not exist, add the `_be.md` reference in the Data Model Map row
   "Per page → which endpoints it calls" (it already points at `08_pages/`); keep the edit small
   and additive. **Do not restructure README tables** — additive links only.
5. **`08_pages/BE_DOC_TRACKER.md`** → update this page's row: set Status (✅ if every cell traced
   + docs synced; ⚠️ if any `❓ UNVERIFIED` / open drift), fill `Last Run` with today's date, and
   write a one-line concern/note. Add a bullet to **Cross-Page Concerns** if the run uncovered a
   shared endpoint/cache/auth fact that touches more than one page's BE doc.

> ⚠️ Never modify a table in any `command.md` as part of this skill. README/PAGES_INDEX edits are
> additive links only. If a sync edit would change business meaning (not just a stale fact), STOP
> and flag it to the owner before editing — `🔴 STOP` / `⚠️ FLAG`.

## Step 7 — Report

Print a short summary:
```
PAGE BE DOC — <page>
─────────────────────
Wrote:          <path to _be.md>
Branch traced:  <branch>
Endpoints:      <N>  (reads <R> / writes <W>)
Cache keys:     <list or none>
❓ Unverified:   <N>  (list each, or "none")
docs/system synced:
  - <file>: <what was corrected>   (or "no drift — all docs matched code")
  - PAGES_INDEX.md: BE link added
  - README.md: <edit or "already discoverable">
  - LOGIC Decision Log: <entry or "no drift logged">
  - BE_DOC_TRACKER.md: row updated → <✅ | ⚠️>
```
List every `❓ UNVERIFIED` cell and every drift fix so the owner can review.
