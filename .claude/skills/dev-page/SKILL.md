---
description: Build FE components and verify BE endpoints for a page from its wireframe folder. Usage: /dev-page <page-folder-name>. Three phases: (1) Audit — diff wireframe spec vs. existing code; (2) Gap Fill — build only what is missing; (3) Integration — wire zones into page.tsx and verify ACs.
---

You are a senior co-developer building or completing a page from its wireframe spec.

The argument passed to this skill is: **$ARGUMENTS**
- First token = page folder name under `docs/fe/wireframes/` (required)
  Examples: `client_menu_page`, `admin_main/admin_main_staff`

---

## PHASE 0 — Locate the wireframe folder (always first)

### 0a — Resolve the folder path

- Look for `docs/fe/wireframes/$ARGUMENTS/`
- If not found, search: `find docs/fe/wireframes -type d -name "$ARGUMENTS"`
- If multiple matches → ask the user which one. Do not proceed with ambiguity.
- If none found → STOP. Output: `🔴 STOP: No wireframe folder found for "$ARGUMENTS". Run /wireframe first.`

### 0b — Identify the spec file

Look for these files inside the resolved folder, in priority order:
1. `menu_spec.md` (or any `*_spec.md`)
2. `*_wireframe_v*.md`
3. `business_description.md` + `tech_description.md` combined

If no spec file found → STOP. Output: `🔴 STOP: No spec file found in folder. Run /wireframe first to scaffold the spec.`

Set `SPEC_FILE` = the resolved spec path.

---

## PHASE 1 — Audit (read-only, always run before writing any code)

### 1-pre — Read the graph index, then load only what the audit needs

**Step 1 — Read `docs/graphs/GRAPHS_INDEX.md`.**
Scan the Decision Table. For a `/dev-page` FE+BE audit the table says: read `FE_STRUCTURE.md` (for 1a–1c) and `BE_STRUCTURE.md` (for 1d). Read both now, in parallel.

**Step 2 — Read `docs/graphs/FE_STRUCTURE.md`.**
Extract these three sections (they replace multiple tool calls in 1a–1c):
- **Folder Tree** → used in 1a instead of `find`/`ls`
- **Store Fields** → used in 1b instead of opening individual store files
- **Storage Keys** → used in 1c instead of grepping `storage-keys.ts`

**Step 3 — Read `docs/graphs/BE_STRUCTURE.md`.**
Extract the handler file list (used in 1d instead of grepping `be/internal/handler/`).

**Step 4 — Freshness check.**
Check the `> last updated` date at the top of both files. If either is older than 7 days, add one line to the audit report: `⚠️ [FE|BE]_STRUCTURE.md may be stale — run /codebase-graph [fe|be] to refresh.` Then proceed; do not block the audit.

Only open additional graph files if the GRAPHS_INDEX Decision Table says to — do not speculatively read files not listed for this task type.

Read `SPEC_FILE` and extract:

1. **Route** — the Next.js route (`app/(shop)/menu/page.tsx` etc.)
2. **Component Map** — table of Zone → Component → File path
3. **Task Breakdown** — task rows with Status (✅ / 🔄 / ⬜)
4. **Stores required** — which Zustand stores and which fields each zone reads/writes
5. **API endpoints** — which `GET/POST` endpoints the page calls
6. **Acceptance Criteria** — the AC list

Then for each item, check the disk:

### 1a — Component file audit

For every component in the Component Map:
- Look up the file path in the **Folder Tree** section of `FE_STRUCTURE.md` (already read in 1-pre)
- Only fall back to a `find` call if the path is ambiguous or not listed
- Mark: ✅ exists / ❌ missing / ⚠️ exists-but-check (file exists but task is still 🔄)

### 1b — Store field audit

For every store field the spec requires:
- Look up the store in the **Store Fields** table of `FE_STRUCTURE.md` (already read in 1-pre)
- Does the required field appear in the State fields column?
- Mark: ✅ exists / ❌ missing
- Only open the actual store file if the table entry says "open file for fields" or the store is not listed

### 1c — `storage-keys.ts` audit

- Check the **Storage Keys** table in `FE_STRUCTURE.md` (already read in 1-pre) — no need to open `storage-keys.ts`
- Grep for raw `localStorage` string literals only in files the spec says this page touches (not the whole codebase)
- Mark violations as: ⚠️ HARDCODED KEY: `[key]` in `[file]`

### 1d — BE endpoint audit

For every endpoint the page calls:
- Look up the handler file in `BE_STRUCTURE.md` (already read in 1-pre)
- Only fall back to `grep be/internal/handler/` if the handler is not listed or the domain is ambiguous
- Mark: ✅ handler exists / ❌ missing

### 1e — Output the Audit Report

```
AUDIT REPORT — [page folder name]
══════════════════════════════════

COMPONENTS
  ✅ [Zone A] Header — inline in page.tsx
  ❌ [Zone B] SearchBar — components/menu/SearchBar.tsx MISSING
  ⚠️  [Zone D] FavouritesRail — file exists but task is 🔄
  ...

STORE FIELDS
  ✅ cart.ts → items, total, itemCount
  ❌ cart.ts → drinkConfig MISSING
  ❌ cart.ts → orderNote MISSING

STORAGE KEYS
  ⚠️  HARDCODED KEY: 'order_cache_' in menu/page.tsx:28

BE ENDPOINTS
  ✅ GET /categories → handler/product_handler.go
  ✅ GET /products   → handler/product_handler.go
  ✅ GET /combos     → handler/combo_handler.go

SUMMARY
  Components to build: [N]
  Store fields to add: [N]
  BE endpoints to add: [N]
  Keys to fix:         [N]
```

After printing the audit report → **STOP and ask the user**:

```
Audit complete. Found [N] gaps.
Shall I proceed with Phase 2 (Gap Fill)?
Reply YES to continue, or tell me which items to skip.
```

Do NOT write any code until the user confirms.

---

## PHASE 2 — Gap Fill (only after user confirms)

Work through gaps in this order:

### 2a — storage-keys.ts (if missing or incomplete)

If `src/lib/storage-keys.ts` does not exist:
- Create it with all keys the current codebase already uses (grep for `localStorage` across all files)
- Add any new keys required by this page's spec

If it exists but is missing keys:
- Add only the missing keys (never rewrite the whole file)

Format:
```typescript
// src/lib/storage-keys.ts
export const STORAGE_KEYS = {
  CART:         'cart-storage',
  ORDER_NOTE:   'order-note',
  FAVOURITES:   'favourites-storage',
  ORDER_CACHE:  'order_cache_',   // prefix — append orderId
} as const
```

### 2b — Store fields (add missing fields only)

For each missing store field:
- Read the existing store file first
- Add only the missing interface field + implementation
- Do NOT rewrite passing logic

Example: adding `drinkConfig` + `orderNote` to `cart.ts`:
- Read cart.ts → find the interface → add fields → find create() → add initial state + actions

### 2c — Missing components (build in Zone order A→J)

For each ❌ component:

**Step 1 — Read the spec** for that zone (AC, props interface, data source, visibility condition)

**Step 2 — Check for reuse**
- Does the spec mark this component as `✅ reuse → [shared/X]`?
  - If yes → check `components/shared/` first; if it exists, import it; don't rebuild
  - If no → build as a new file in the location the spec says

**Step 3 — Build the component** following these rules:
- TypeScript strict — use interfaces from spec (or `types/` if they exist)
- Tailwind only — no hardcoded hex; use design tokens (`bg-primary`, `text-muted-fg`, etc.)
- All IDs are `string` (UUID) — never `number`
- All prices formatted with `formatVND()` from `lib/utils.ts`
- All localStorage keys imported from `storage-keys.ts`
- All touch targets: `min-h-[44px] min-w-[44px]`
- Image fallback: `onError` → show `🍜` placeholder

**Step 4 — Verify against AC** for that zone before moving to the next

### 2d — Wire into page.tsx

After all components are built:
- Read the current `page.tsx`
- Add imports for each new component
- Add each zone to the JSX in the correct position (respect sticky z-index stack)
- Pass props from existing state (store reads, query data)
- Do NOT remove or rewrite any existing passing zone

### 2e — BE endpoints (if any were ❌ in audit)

For each missing endpoint:
- Read `docs/contract/API_CONTRACT_v1.2.md` for the endpoint spec
- Read `docs/be/BE_SYSTEM_GUIDE.md` for handler patterns
- Add: route → handler → service → repository (only what's missing in the chain)
- Register route in the router file

---

## PHASE 3 — Integration Check

Walk through each AC in the spec:

| AC | Check | Pass? |
|----|-------|-------|
| AC-01 | Does the file/logic exist that satisfies this? | ✅ / ❌ |
| ... | ... | ... |

For any ❌ AC: flag it as `⚠️ AC NOT COVERED: [AC text]` and implement the fix.

Then output a final summary:

```
DEV-PAGE COMPLETE — [page folder name]
═══════════════════════════════════════
Built:
  • [component name] → [file path]
  • ...

Updated:
  • [store file] — added [field names]
  • page.tsx — wired zones [list]

ACs covered: [N/total]
ACs NOT covered: [list or "none"]

Next: run /verify to confirm the page works in the browser.
```

---

## Rules (apply throughout all phases)

- **Surgical:** touch only what the audit identified as missing or broken. No adjacent cleanup.
- **Spec-first:** if a detail is not in the spec, use the simplest correct implementation — do not invent features.
- **No speculation:** do not add error handling, animations, or edge-case logic that is not in the spec's Edge Cases table.
- **One AC at a time:** build, verify that AC passes, then move to the next component.
- **Always stop at Phase 1** and wait for user confirmation before writing code.
