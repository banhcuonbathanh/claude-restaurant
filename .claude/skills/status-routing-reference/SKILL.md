---
name: status-routing-reference
description: Generate (or refresh) a "Status Routing Reference" doc for an FE page — the canonical table that maps every entity status to the zone/component that renders it, plus action buttons, per-zone rules, a live page snapshot, and the page's data flow (what it fetches/sends to BE + cross-page state). Every cell MUST be traced to current code, never guessed. Usage: /status-routing-reference <page-folder-name>. Model: Admin_Overview_Status_Routing_Reference.md.
---

Build a **Status Routing Reference** for one FE page so the owner and you share one accurate
picture of "which status shows up where, with which button, under which rule" — **plus** a live
snapshot of the running page and how it moves data (fetch from BE · send to BE · cross-page state).

The argument is: $ARGUMENTS — a wireframe page folder name (e.g. `admin_overview`, `kds`,
`client_menu_page`) or a path under `docs/fe/wireframes/`.

**Golden rule — accuracy over completeness:** every cell is a claim about the running code.
Read the code, do not recall it. If a fact cannot be confirmed from a file, write `❓ UNVERIFIED`
in that cell instead of guessing. A short honest table beats a complete wrong one.

The canonical example to copy the shape from:
`docs/fe/wireframes/admin_main/admin_overview/Admin_Overview_Status_Routing_Reference.md`

The progress tracker — read it before starting, update it after finishing:
`docs/fe/status-routing-reference/TRACKER.md`

---

## Step 0 — Read the tracker

Open `docs/fe/status-routing-reference/TRACKER.md`. Find the row for this page.
- If it is `N/A` → the page has no entity-status routing. **Do NOT skip it** — still produce the
  doc as a **data-flow reference**: open it with a banner that says "This page has NO
  entity-status routing", omit the status matrix / action-button / DB-status sections, and keep
  the Live Snapshot + Data Flow + Cross-Page sections (Steps 1b, 2.5). Keep the tracker row `N/A`.
- If it already exists → this is a refresh; note prior concerns.
- If the page is missing → add a row.

---

## Step 1 — Locate the real code (source of truth)

Resolve the page to its actual files. Do not proceed until all are found.

1. **Page entry:** the page's `page.tsx` under `fe/src/app/.../<page>/page.tsx`.
2. **Components:** every section/component the page renders (the "zones"). Open `page.tsx`
   and follow each imported child component.
3. **Status enums (BE = source of truth):**
   - Entity statuses (order / table / payment …) → `docs/be/be_code_summary/DB_SCHEMA_SUMMARY.md`
     and the FE type that mirrors them (`fe/src/types/` or `fe/src/lib/`).
   - Never invent a status value. Use the exact strings from the schema.
4. **Query hooks / stores:** the `useQuery`/Zustand selectors that feed each zone
   (`fe/src/hooks/`, `fe/src/store/`) — these reveal the *filter* that decides which
   statuses a zone shows.
5. **Data layer (for the Data Flow sections — always trace these):**
   - **Reads:** every `useQuery` on the page — query key, endpoint, params, `staleTime`,
     `enabled` gating. The **exact fields** returned come from `fe/src/types/`.
   - **Writes:** every `useMutation` / API call — endpoint, the literal request body, and the
     payload-builder it uses (e.g. `fe/src/lib/order-payload.ts`). Note success/error handling.
   - **Cross-page state:** which Zustand stores it reads/writes (`fe/src/store/`), their
     localStorage keys + `partialize`/`persist` config, and any `localStorage` handoffs.

If you cannot find the page's code (page not built yet) → STOP and tell the owner the doc
would be speculative; offer to base it on the wireframe folder instead, clearly labelled
`(from wireframe, not yet coded)`.

## Step 1b — Capture the live page (browser snapshot)

Run the page in the browser (Playwright MCP) and record what actually renders, so the doc
opens with ground truth, not just code reading:

1. `mcp__playwright__browser_navigate` to the page URL (e.g. `http://localhost:3000/menu`).
   If the dev server/stack is down → note that and skip this step (don't block the whole doc).
2. Take a full-page screenshot + an accessibility snapshot.
3. Record: the rendered zones, key data on screen (catalog items + prices, list rows, status
   chips), the empty/loading/error state shown, and any **console errors** (404s, etc.) — these
   become Concerns. Quote real values seen, not placeholders.

## Step 2 — Build each section, each cell traced to code

Produce these sections (omit one only if it genuinely does not apply to the page):

### `## Live Page Snapshot (<url>, <date>)`
The ground-truth render from Step 1b. Bullet list / small tables of what's actually on screen:
header, the catalog items or list rows with **real values + prices seen**, category tabs, which
zones are visible, the empty/loading/error state, and whether status-bearing zones (e.g. an
order-summary) are present. Note any console 404/errors here too. Omit only if the stack was down.

### `## Page Layout`
| Zone | Component | Title | When visible |
- Zone = a letter (A, B, C…) in render order.
- Component = the exact component name from `page.tsx`.
- Title = the literal heading string rendered in the JSX (Vietnamese, copied verbatim). `—` if none.
- When visible = the actual render condition (always / collapsible / gated on some state).

### `## <Entity> DB Statuses (`<table>.status`)`
| Status | Meaning |
- One row per enum value from the schema. Exact strings.

### `## <Entity> Statuses — Which Section Each Appears In`
A matrix: rows = each status, columns = each zone from Page Layout.
- Cell = ✅ / ❌ (add a short condition in parens if conditional, e.g. `✅ (if kiemTra active)`).
- A status appears in a zone **only if** the zone's query/filter includes it — verify against
  the hook/selector found in Step 1, not against intuition.
- Include a "Vietnamese label" column with the exact UI label for each status.

### `## <Component> — Action Buttons Per Status`
| Status | Button shown | Next status |
- One table per component that has status-changing buttons.
- Button label = literal JSX string. Next status = the value the mutation sends.
- Trace each row to the button's onClick → mutation → status payload.

### `## <Zone> — Rules`
Bullet list per zone that has non-obvious behaviour (sort order, date window, columns,
optimistic update, fields used). Each bullet must reflect code, e.g. "sorted by `updated_at DESC`"
only if the query actually orders by that.

## Step 2.5 — Data Flow sections (always include — this is what "manage data" means)

These three sections are **required on every page**, status-routed or not (they are the whole
point on an `N/A` page). Trace each from the data layer found in Step 1 item 5.

### `## What Information Comes FROM BE (reads)`
- A table of every `useQuery`: query key · endpoint · params · `staleTime` · `enabled` gating.
- Then the **exact fields received** per response type (from `fe/src/types/`) — list the field
  names, don't hand-wave "product data".
- Note any client-side enrichment/joins done after fetch (e.g. resolving combo item names).

### `## What Information Is SENT TO BE (writes)`
- One sub-section per mutation: endpoint + the **literal request body** (a JSON code block with
  the real field names + which builder produces it).
- The payload rules (e.g. how cart → `items[]`), and the success/error handling (redirects,
  toasts, error codes like `TABLE_HAS_ACTIVE_ORDER`).
- If the page sends nothing, say so explicitly.

### `## How It Manages Data CROSS-PAGE`
- Table of Zustand stores used: store · localStorage key · persisted? (`partialize`) · what it
  carries across pages · file.
- Any `localStorage` handoffs (e.g. `order_cache_<id>`), token storage rules, and axios
  interceptor behaviour relevant to this page.
- A one-line end-to-end loop: fetch → build in store → preview → send → handoff → navigate.

> If the page has a client-side summary/preview component (e.g. an order summary / cart), give it
> its own `## <Component> — full breakdown` section: every block, where each value comes from, and
> the non-obvious rules — each traced to `file:line`.

## Step 3 — Verification pass (do not skip)

Before writing the file, re-open each component and confirm every cell once more. For your own
check, keep a mental `file:line` for each non-trivial claim. Any claim you could not pin to a
line → downgrade to `❓ UNVERIFIED`.

## Step 4 — Write the file

- Path: `docs/fe/wireframes/<page-folder>/<PageName>_Status_Routing_Reference.md`
  (PascalCase with underscores, matching the Admin Overview file).
- H1: `# <Page Name> — Status Routing Reference`.
- Use `---` separators between sections, matching the model file.
- If the page is a "MUST READ before touching X" surface, tell the owner to add a row to
  the **Single Sources** table in `CLAUDE.md` (do not add it yourself without confirming).

## Step 5 — Update the tracker

In `docs/fe/status-routing-reference/TRACKER.md`:
- Set the page row's Status (✅ if every cell is traced; ⚠️ if any `❓ UNVERIFIED` remain),
  fill `Last Run` with today's date, and write a one-line concern/note.
- Append one row to the **Session Log** (append, never edit old rows).
- If you discovered a status enum / label / transition shared with other pages, update the
  relevant **Cross-Page Concerns** row.

## Step 6 — Report

Print a short summary:
```
STATUS ROUTING REFERENCE — <page>
─────────────────────────────────
Wrote: <path>
Live snapshot: <captured | stack down>
Zones:        <N>
Statuses:     <N>  (or "0 — N/A, data-flow reference")
GET reads:    <N>
POST/writes:  <N>
Stores:       <N>
❓ Unverified: <N>  (list them, or "none")
```
If there are any `❓ UNVERIFIED` cells, list each one so the owner can fill the gap.
