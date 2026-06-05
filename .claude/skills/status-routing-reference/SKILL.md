---
name: status-routing-reference
description: Generate (or refresh) a "Status Routing Reference" doc for an FE page — the canonical table that maps every entity status to the zone/component that renders it, plus action buttons and per-zone rules. Every cell MUST be traced to current code, never guessed. Usage: /status-routing-reference <page-folder-name>. Model: Admin_Overview_Status_Routing_Reference.md.
---

Build a **Status Routing Reference** for one FE page so the owner and you share one accurate
picture of "which status shows up where, with which button, under which rule."

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
- If it is `N/A` → STOP and tell the owner this page has no entity-status routing; ask before proceeding.
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

If you cannot find the page's code (page not built yet) → STOP and tell the owner the doc
would be speculative; offer to base it on the wireframe folder instead, clearly labelled
`(from wireframe, not yet coded)`.

## Step 2 — Build each section, each cell traced to code

Produce these sections (omit one only if it genuinely does not apply to the page):

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
Zones:        <N>
Statuses:     <N>
❓ Unverified: <N>  (list them, or "none")
```
If there are any `❓ UNVERIFIED` cells, list each one so the owner can fill the gap.
