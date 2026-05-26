---
description: Scaffold a full wireframe folder for a FE page. Usage: /wireframe <page-folder-name> [excalidraw-path]. Two flows: (A) excalidraw-first — read existing .excalidraw and build all files from it; (B) spec-first — collect info, create placeholder files, run /excalidraw after. Standard: docs/fe/wireframes/FOLDER_STANDARD.md
---

You are scaffolding a wireframe folder for a FE page.

The argument passed to this skill is: **$ARGUMENTS**
- First token = page folder name (required)
- Second token = path to existing excalidraw file (optional)

Read `docs/fe/wireframes/FOLDER_STANDARD.md` now — it is the authoritative standard for every file you will create.

---

## PHASE 0 — Detect excalidraw (always run first, takes < 1 min)

### 0a — Parse arguments

Extract:
- `FOLDER` = first token of `$ARGUMENTS` (e.g. `admin_main/admin_main_staff`)
- `EXCALIDRAW_PATH` = second token if provided (e.g. `docs/fe/wireframes/admin_main/admin_main_staff/admin-main-staff.excalidraw`)

If `EXCALIDRAW_PATH` was not in `$ARGUMENTS`, auto-detect:
- Check if any `*.excalidraw` file exists inside `docs/fe/wireframes/FOLDER/`
- If not found at that direct path, search recursively: `find docs/fe/wireframes -type d -name "FOLDER_NAME"` where FOLDER_NAME is the last segment of FOLDER (e.g. `admin_main_combos`). Use the first match as the resolved folder path.
- If exactly one excalidraw found → set `EXCALIDRAW_PATH` to that file
- If multiple found → ask the user which one to use (pick one — do not proceed with ambiguity)
- If none found → set `EXCALIDRAW_PATH = none` → go to **Flow B** below

### 0b — Choose flow based on whether excalidraw exists

| | Flow A — excalidraw-first | Flow B — spec-first |
|---|---|---|
| **When** | `EXCALIDRAW_PATH` is set | `EXCALIDRAW_PATH = none` |
| **Phase 1** | Read excalidraw → extract zones → ask only for missing info | Ask all 9 questions from scratch |
| **Phase 2 content** | Real zone names, real Vietnamese copy, real components | [TBD] placeholders |
| **Post-scaffold** | Files are dev-ready | User must run `/excalidraw FOLDER` next |

---

## FLOW A — Excalidraw-first

### Phase 1A — Read and extract

**Step 1A-1: Read the excalidraw file**

Read `EXCALIDRAW_PATH` and extract the following. Excalidraw files are JSON — look at `elements` array for text, rectangles, frames, and groups:

| What to extract | How to find it |
|-----------------|----------------|
| Page title / display name | Largest or topmost text element; frame labels |
| Zone labels | Letter-labeled frames or groups (A, B, C…); text near zone boundaries |
| Zone names (Vietnamese/English) | Text inside or adjacent to each zone frame |
| Sticky zones | Zones labeled "sticky", "top-0", "z-20", or similar annotation |
| Modals | Frames labeled "Modal", "Popup", "M1", "M2", etc. |
| UI components visible | Button labels, table headers, form fields, tab names |
| Vietnamese copy | Any Vietnamese text — capture verbatim for how_to_use.md |
| Device target | Labels "Mobile", "Desktop", "375px", "1280px", etc. |
| FE route | Text containing `/admin/`, `/(shop)/`, `/staff/`, etc. |

Synthesise a `SPEC_SUMMARY` (5–8 bullet points) from what you extracted.

**Step 1A-2: Complexity assessment**

Count zones + modals:

| Complexity | Criteria | Session estimate |
|---|---|---|
| Simple | ≤ 4 zones, 0–1 modals, ≤ 3 data sources | 1 session |
| Medium | 5–6 zones, 1–2 modals, 4–6 data sources | 1 session (tight) |
| Complex | ≥ 7 zones OR ≥ 3 modals OR 7+ data sources OR 3+ TypeScript interfaces | Break into sub-tasks |

If **Complex**, print a breakdown plan and wait for the user to confirm which sub-tasks to run now:

```
⚠️ COMPLEXITY WARNING — this folder is too large for 1 session.

Proposed sub-tasks:
  Sub-task A1: [FOLDER]_wireframe_v1.md + zone mapping tables
  Sub-task A2: business_description.md + how_to_use.md
  Sub-task A3: tech_description.md + TypeScript contracts + query hooks
  Sub-task A4: conccern.md + recomment/recommend.md + recomment/recomment_claude.md

Which sub-tasks should I run now? (default: A1 only, run the rest in follow-up sessions)
```

Do not proceed past this point until the user responds.

**Step 1A-3: Ask for missing inputs**

If any of the following could NOT be extracted from the excalidraw, ask now (in one message):

| Input | Extracted? | Ask if missing |
|-------|------------|----------------|
| Page display name | From frame title / text | ✅ / ❓ |
| FE route | From route text in drawing | ✅ / ❓ |
| Device type | From labels | ✅ / ❓ |
| Business rules / constraints | Usually NOT in excalidraw | Always ask |
| Edge cases to handle | Usually NOT in excalidraw | Always ask |

**Step 1A-4: Print the plan**

```
📋 WIREFRAME SCAFFOLD PLAN (excalidraw-first) — [FOLDER]

Source: [EXCALIDRAW_PATH]
Folder: docs/fe/wireframes/[FOLDER]/

Extracted from excalidraw:
  Page: [display name]
  Route: [route]
  Device: [mobile | desktop]
  Zones found: [A — name], [B — name], [C — name], …
  Modals found: [M1 — name], [M2 — name], …

Spec Summary (derived from excalidraw):
  • [bullet 1]
  • [bullet 2]
  • [bullet 3]
  • [bullet 4]
  • [bullet 5]

Files to create:
  1. [FOLDER]_wireframe_v1.md      ← full spec with real zone content
  2. business_description.md       ← Vietnamese user-facing description
  3. tech_description.md           ← architecture & patterns
  4. how_to_use.md                 ← step-by-step guide (Vietnamese)
  5. conccern.md                   ← open questions & risks
  6. recomment/recommend.md        ← UX/UI review
  7. recomment/recomment_claude.md ← Claude implementation guidelines

WIREFRAME_INDEX.md: will add 1 new row.
```

**Step 1A-5: STOP and wait for approval**

> **Waiting for approval.** Reply "ok" to create all files, or correct any detail above first.

Do NOT proceed to Phase 2 until the user explicitly approves.

---

## FLOW B — Spec-first (no excalidraw)

### Phase 1B — Gather info from scratch

Ask all of the following in one message if not already in context:

| Input | Example |
|-------|---------|
| Page display name | "Admin — Staff Management" |
| FE route | `/admin/staff/page.tsx` |
| Device type | `mobile` or `desktop` |
| Short description | "CRUD table for staff accounts with role assignment" |
| Who uses this page? | "Admin, Manager" |
| Main user actions | "View list, create staff, edit role, deactivate" |
| Data this page needs | "Staff list, roles, department" |
| Business rules / constraints | "Only Admin can deactivate staff; Manager can only edit own department" |
| Edge cases to handle | "Empty staff list, network error, duplicate email" |

Synthesise a `SPEC_SUMMARY` (3–5 bullets) from the answers.

Print the plan:

```
📋 WIREFRAME SCAFFOLD PLAN (spec-first) — [FOLDER]

Folder: docs/fe/wireframes/[FOLDER]/

Files to create:
  1. [FOLDER]_wireframe_v1.md      ← spec with [TBD] zone placeholders
  2. business_description.md
  3. tech_description.md
  4. how_to_use.md
  5. conccern.md
  6. recomment/recommend.md
  7. recomment/recomment_claude.md

NOT created by this skill (run separately):
  • [FOLDER].excalidraw             ← run /excalidraw [FOLDER] after
  • [FOLDER].png                    ← export from Excalidraw

WIREFRAME_INDEX.md: will add 1 row.

Page: [display name]
Route: [route]
Device: [mobile | desktop]

Spec Summary:
  • [bullet 1]
  • [bullet 2]
  • [bullet 3]
```

**STOP and wait for approval.**

> **Waiting for approval.** Reply "ok" to create all files, or adjust any detail above first.

---

## PHASE 2 — Create all files

Only begin after the user approves the Phase 1 plan.

Variables used below:
- `FOLDER` = folder path (e.g. `admin_main/admin_main_training`)
- `FOLDER_NAME` = last segment (e.g. `admin_main_training`)
- `PAGE` = display name (e.g. "Admin — Staff Training")
- `ROUTE` = FE route
- `SPEC_SUMMARY` = bullet list synthesised in Phase 1
- `DEVICE` = `mobile` or `desktop`
- `DATE` = today in YYYY-MM-DD
- `FLOW` = `A` (excalidraw-first) or `B` (spec-first)

**For Flow A**: pre-fill all zone-specific rows with real data extracted from the excalidraw. Do NOT leave zone names or component names as [TBD].
**For Flow B**: leave zone rows as [TBD] placeholders; the user will fill them after running /excalidraw.

---

### Step 1 — Create folder structure

Create:
- `docs/fe/wireframes/FOLDER/`
- `docs/fe/wireframes/FOLDER/recomment/`

---

### Step 1b — Component Reuse Audit (required before writing any file)

**Do this before Step 2. Never skip.**

1. Read `docs/fe/wireframes/shared/_INDEX_SHARING_COMPONENT.md` in full.
2. Compile the full component list for this page:
   - **Flow A**: extract every component name visible in the excalidraw (zone components + modals + nav).
   - **Flow B**: derive from the spec discussion — list every component mentioned.
3. For each component, check every tier in the index:
   - Found in index → classify as `✅ reuse`
   - Not found, clearly page-specific (e.g. `CategoryPageHeader`) → classify as `new (local)`
   - Not found, but could logically serve multiple pages (e.g. a nav bar, a status chip) → classify as `new (shared)`
4. Print the classification table before proceeding:

```
🔍 Component Reuse Audit — FOLDER

| Component | Reuse? | Reason |
|-----------|--------|--------|
| `AdminTopNav` | ✅ reuse | Found in Tier 2 shared index |
| `CategoryTable` | new (local) | Page-specific CRUD table |
| `PageActionBar` | new (shared) | Could serve other admin list pages |
```

5. For each `new (shared)` component: decide which tier it belongs to (Tier 1 atom / Tier 2 shared / Tier 3 feature / Tier 4 guard).
6. Keep this table — you will use it to fill the `Reuse?` column in Step 2 and update the index in Step 9b.

---

### Step 2 — Create `FOLDER_NAME_wireframe_v1.md`

Follow `_TEMPLATE.md` exactly. For **Flow A**, the ASCII wireframe and all tables must use real zone names, real copy, and real component names from the excalidraw.
Use the Reuse Audit from Step 1b to fill the `Reuse?` column — do not re-derive it.

```markdown
---
page: FOLDER_NAME
route: ROUTE
created: DATE
status: Draft
---

# Page: PAGE
**Route:** `ROUTE`
**Version:** v1
**Status:** Draft

## Spec Summary

SPEC_SUMMARY

---

## 📐 Visual Wireframe

[Flow A: Draw ASCII layout with real zone labels from excalidraw. Use real Vietnamese copy, not placeholders. Show sticky z-index annotations.]
[Flow B: Leave placeholder boxes labeled [A], [B], [C] with note "Fill after /excalidraw"]

---

## 🗺️ Zone Mapping

| Zone | Component | Visibility Condition | Sticky / Position |
|------|-----------|---------------------|-------------------|
[Flow A: one real row per zone + modal found in excalidraw]
[Flow B: rows for A, B, C with [ComponentName] placeholders]

---

## 📊 Data Sources & State Management

| Zone | Data Source | Update Mechanism | Query Key | Notes |
|------|-------------|------------------|-----------|-------|
[Flow A: real data sources per zone based on component types found in excalidraw]
[Flow B: [TBD] rows]

---

## 🧩 Component Specifications

> Before filling this table: read `docs/fe/wireframes/shared/_INDEX_SHARING_COMPONENT.md`.
> Mark each row with one of: `✅ reuse` · `new (local)` · `new (shared)`

| Zone | Component | Reuse? | File | Props / Interface |
|------|-----------|--------|------|-----------------|
[Flow A: real rows — check _INDEX_SHARING_COMPONENT.md for each component; mark reuse status]
[Flow B: [TBD] rows with `new (local)` placeholder in Reuse? column]

---

## 👨‍💻 Developer Implementation Details

### TypeScript Contracts

[Flow A: write real interfaces for all data shapes inferred from excalidraw (tables, forms, cards)]
[Flow B: stub with // [add fields from spec] placeholder]

### Query Configuration

[Flow A: real query hooks for each data source]
[Flow B: stub template]

---

## ⚠️ Edge Cases & Fallbacks

| Scenario | Detection | Dev Action | UX Fallback |
|----------|-----------|------------|-------------|
[Flow A: include all edge cases visible in excalidraw + standard ones (offline, empty, 403)]
[Flow B: standard rows only]

---

## 🧪 Testing & QA Checklist

### Functional Tests
[Flow A: one test per zone, using real zone names]
[Flow B: [Zone A], [Zone B] placeholders]

### Edge Case Tests
- [ ] [standard tests]

### Accessibility Tests
- [ ] All interactive elements have `min-h-[44px] min-w-[44px]`
- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Focus visible on all interactive elements

### Cross-Device Tests
- [ ] Mobile viewport (375px)
- [ ] Tablet viewport (768px)
- [ ] Desktop (1280px+)

---

## 📋 Task Rows

| ID | Owner | Task | Status | Draw Ref |
|----|-------|------|--------|----------|
| [X]-1 | FE | Wireframe + zone table | ✅ | wireframes/FOLDER/FOLDER_NAME_wireframe_v1.md |
[Flow A: one row per component found]
[Flow B: rows for main component + page assembly]

---

## 📝 Changelog

**v1 (DATE)**
- Initial scaffold[Flow A: add "based on [excalidraw filename]" + list zones and modals documented]

---

*Last Updated: DATE*
*Approved by: —*
*Next Review: [Flow A: After zone content reviewed with owner | Flow B: After excalidraw zones confirmed]*
```

---

### Step 3 — Create `business_description.md`

Audience: end users and restaurant owner. **Vietnamese.** No technical terms.

**Flow A**: Write real copy using the Vietnamese text, button labels, and flows found in the excalidraw. Describe actual features visible in the drawing.

**Flow B**: Use the DESC from Phase 1B as context; leave zone-specific details for after /excalidraw.

Template structure:
```markdown
> Dành cho: Khách hàng cuối, onboarding, FAQ. Không dùng thuật ngữ kỹ thuật.

---

### PAGE — Dành cho [người dùng]

[1 câu mô tả trang làm gì từ góc độ người dùng.]

#### Bạn sẽ thích ngay khi sử dụng:

1. **[Lợi ích 1]** — [mô tả ngắn]
2. **[Lợi ích 2]** — [mô tả ngắn]
3. **[Lợi ích 3]** — [mô tả ngắn]

#### Trải nghiệm được tối ưu:
- Giao diện [mobile/desktop], thao tác chuẩn 44px
- Dữ liệu lưu tự động
- Minh bạch thông tin

#### Quy trình [N] bước:
`Bước 1` → `Bước 2` → `Bước 3`
```

---

### Step 4 — Create `tech_description.md`

Audience: developers. Include stack, patterns, file org.

**Flow A**: Write real zone count, real store names, real query resource names, real file org tree.

**Flow B**: Use [TBD] stubs for zone-specific content; fill tech stack from project defaults.

Template structure:
```markdown
## Technical Architecture — PAGE

### Page Structure
- Zones: [list real zones for Flow A | A–C (fill after /excalidraw) for Flow B]
- Device target: DEVICE
- Sticky zones: [list sticky zones | TBD]
- Modals: [list modals | TBD]

### Tech Stack
React (Next.js App Router)
├── State: Zustand ([store names]) + localStorage persistence
├── Data: TanStack Query ([resource names])
├── Styling: Tailwind CSS (DEVICE layout)
└── Types: TypeScript interfaces for all components

### Key Implementation Patterns
[1. Component Architecture, 2. State Management (with interface), 3. Data Fetching, 4. Performance, 5. Edge Cases]

### Rendering Strategy

| Layer | What | Why |
|---|---|---|
| **ISR** (`revalidate: [N]s`) | [Flow A: list query keys from Data Sources table that are shared/non-user-specific · Flow B: [TBD]] | Data changes at admin cadence, not per request |
| **RSC** | `page.tsx` only — prefetch + HydrationBoundary | No per-user server data needed |
| **Client** (`'use client'`) | [Flow A: list zones by letter · Flow B: [TBD]] | Zustand / localStorage / user interaction |

> Gap: [any data source not prefetched server-side → causes loading wait; add `prefetchQuery` on hover/focus to fix]

[Flow A: decide which queries are ISR candidates (stable, shared) vs. client-only (user-specific, real-time). If all data is user-specific → use Pattern B (full client). See `docs/fe/wireframes/shared/_INDEX_RENDERING_STRATEGY.md` for pattern definitions.]
[Flow B: fill after zones and data sources are confirmed in the wireframe]

Register this page in `docs/fe/wireframes/shared/_INDEX_RENDERING_STRATEGY.md` after implementing.

### File Organization
[tree matching actual FE folder structure]

### Critical Notes
[Flow A: derive from excalidraw content | Flow B: UUID rule + project defaults]
```

---

### Step 5 — Create `how_to_use.md`

Audience: end users. **Vietnamese.** Zone-by-zone guide.

**Flow A**: Write using real zone names and real Vietnamese copy from the excalidraw. Every zone must appear.

**Flow B**: Write with [Zone A — TBD], [Zone B — TBD] stubs per zone.

Template structure:
```markdown
> Dành cho: Khách hàng, onboarding in-app, FAQ hỗ trợ.

---
# Hướng dẫn sử dụng: PAGE

[1 câu về nguyên tắc thiết kế.]

## Bước 1: [Tên nhóm zone] (Zone A, B)
| Vùng | Chức năng | Cách dùng |
...

## Bước 2: [Tên nhóm zone] (Zone C, D)
...

## Mẹo & Hỗ trợ đặc biệt
| Tình huống | Cách hệ thống xử lý | Gợi ý cho khách |
...

## Luồng chuẩn
[ASCII flow]
```

---

### Step 6 — Create `conccern.md`

Audience: owner + developer scratchpad. Raw questions, not a formal doc.

**Flow A**: Open questions derived from what was ambiguous or missing in the excalidraw (e.g., missing API endpoint for a form, unclear pagination strategy, undocumented modal close behaviour).

**Flow B**: Generic open questions from Phase 1B inputs.

```markdown
> Scratchpad: open questions, risks, undecided items for PAGE.

---

## Open Questions
- [ ] [Question 1]
- [ ] [Question 2]
- [ ] [Question 3]

## Risks
- [Risk 1]

## Undecided
- [Item 1]

## Resolved
*(Move items here once decided)*

---
*Created: DATE*
```

---

### Step 7 — Create `recomment/recommend.md`

Audience: developer + designer doing UX review.

**Flow A**: Reference specific zones found in excalidraw; note alignment gaps between excalidraw visuals and spec. Recommendations should be concrete (e.g., "Zone B tab bar: add count badge — not shown in excalidraw but spec requires it").

**Flow B**: Generic UX review template with [TBD] zone references.

```markdown
> UX/UI review for PAGE. [Flow A: filled from excalidraw review | Flow B: fill after /excalidraw]

---

## ✅ UX Strengths
1. [Strength 1]
2. [Strength 2]
3. [Strength 3]

---

## ⚠️ UX Recommendations
| Area | Observation | Recommendation |
...

---

## 🎨 UI & Visual Recommendations
| Element | Issue | Fix |
...

---

## 🔍 Spec vs. Excalidraw Alignment
| Zone | Spec Says | Excalidraw Shows | Action |
...

---

## ♿ Accessibility & Edge Cases
- [ ] Touch targets ≥ 44px
- [ ] Screen reader labels on icons
- [ ] Keyboard: Tab → Enter → Esc
- [ ] `prefers-reduced-motion` respected

---

## 🚀 Recommended Next Steps
1. [Action 1]
2. [Action 2]
3. [Action 3]

---
*Review date: DATE*
*Reviewed by: —*
```

---

### Step 8 — Create `recomment/recomment_claude.md`

Audience: developer team. Claude's architectural analysis for implementing this page.

**Flow A**: Derive shared component reuse, state strategy, and non-obvious implementation notes from what you read in the excalidraw (modals, forms, real-time data, etc.).

**Flow B**: Generic template with [TBD] stubs.

```markdown
# Claude Guidelines — PAGE

> Read this before implementing PAGE.

---

## Spec Summary
SPEC_SUMMARY

Key constraint: [Flow A: derive from excalidraw content | Flow B: derive from SPEC_SUMMARY]

---

## Shared Components — Reuse Checklist

> Copy all rows marked `new (shared)` from the Component Specifications table above.
> These must be registered in `docs/fe/wireframes/shared/_INDEX_SHARING_COMPONENT.md` before implementation starts.

| Component | Tier | File | Register in Index? |
|-----------|------|------|--------------------|
[Flow A: list each `new (shared)` component with its intended tier (UI atom / shared / feature / guard)]
[Flow B: [TBD] — fill after Zone Mapping is confirmed]

---

## State Strategy
| Data type | Where it lives | Why |
...

---

## Performance Checklist
- [ ] Code split: App Router automatic per page
- [ ] Images: `next/image` only
- [ ] Lists > 20: virtualization or pagination
- [ ] API calls: TanStack Query — no useEffect+fetch combos
- [ ] Animations: `prefers-reduced-motion` check

---

## Cross-Page Notes
- State shared with other pages: [TBD]
- Navigation from this page: [TBD]
- Navigation to this page: [TBD]

---

## Non-Obvious Implementation Notes
[Flow A: list non-obvious things derived from excalidraw — modals with complex state, real-time data, optimistic updates, etc.]
[Flow B: [Note 1], [Note 2] stubs]

---
*Created: DATE*
```

---

### Step 9 — Update `docs/fe/wireframes/WIREFRAME_INDEX.md`

Add one new row to the Pages table:

```
| [next number] | PAGE | [FOLDER_NAME_wireframe_v1.md](FOLDER/FOLDER_NAME_wireframe_v1.md) |
```

---

### Step 9b — Update `docs/fe/wireframes/shared/_INDEX_SHARING_COMPONENT.md`

Two updates in the same file:

**9b-1 — Register `new (shared)` components (if any from Step 1b)**

For each component classified `new (shared)` in the Reuse Audit:
- Add a row to the correct tier table (Tier 1–4, Order Domain, or Stores).
- Fill: Component name · File · Key Props · When to use · `Used by: FOLDER_NAME`

If there are no `new (shared)` components, skip 9b-1.

**9b-2 — Add a row to the Page Directory table (always)**

Add one row at the bottom of the `## 📋 Page Directory` table:

```
| PAGE | `ROUTE` | [FOLDER_NAME_wireframe_v1.md](../FOLDER/FOLDER_NAME_wireframe_v1.md) | [list all ✅ reuse components from Step 1b, separated by ·] | [list all new (local) components from Step 1b, separated by ·] |
```

This step is mandatory even when there are zero `new (shared)` components — the Page Directory must always be kept current.

---

### Step 9c — Update `docs/fe/wireframes/shared/_INDEX_STATE_MANAGEMENT.md`

Two updates in the same file:

**9c-1 — Register new stores and query keys (if any)**

From the Data Sources & State Management table you filled in Step 2, check each item against the index:

- **New Zustand store** (not already in `## Global Zustand Stores`): add a row with `Store · File · What it owns · Used by`
- **New TanStack Query key** (not already in `## Server Cache Keys`): add a row with `Query Key · Endpoint · staleTime · Used by · Notes`

If every store and query key already exists in the index, skip 9c-1.

**9c-2 — Add a row to the Page Directory table (always)**

Add one row at the bottom of the `## 📋 Page Directory` table:

```
| PAGE | `ROUTE` | [FOLDER_NAME_wireframe_v1.md](../FOLDER/FOLDER_NAME_wireframe_v1.md) | [global stores used, separated by ·] | [TanStack query keys used, separated by ·] | [local useState items, separated by ·] |
```

This step is mandatory — the Page Directory must always be kept current.

---

### Step 9d — Update `docs/fe/wireframes/shared/_INDEX_RENDERING_STRATEGY.md`

Add one row to the `## 📋 Page Directory` table:

```
| PAGE | `ROUTE` | [Pattern A / B / C] | [revalidate seconds or N/A] | [query keys passed to prefetchQuery, separated by ·] | [zone letters, separated by ·] | [✅ / ❌] | [FOLDER_NAME_wireframe_v1.md](../FOLDER/FOLDER_NAME_wireframe_v1.md) |
```

How to fill each column:
- **Pattern** — A (ISR + RSC), B (Full Client), or C (SSR per request). See the Pattern Library in the index.
- **ISR revalidate** — seconds set in `export const revalidate = N`. Write `N/A` for Pattern B/C.
- **RSC prefetches** — exact TanStack Query keys passed to `prefetchQuery` in `page.tsx`. Write `none` for Pattern B/C.
- **Client zones** — zone letters where `'use client'` components live (usually all zones).
- **Skeleton defined?** — ✅ if a `<Skeleton />` component is built for the loading state. Required for Pattern B.

If this page introduces a new loading gap (e.g. a tab-change that causes a loading wait not covered by prefetch), also add a row to the `## Known Gaps` table.

This step is mandatory — the index must stay current so devs can see at a glance which pattern every page uses.

---

### Step 10 — Print completion summary

```
✅ /wireframe FOLDER — scaffold complete

Flow: [A — excalidraw-first | B — spec-first]
[Flow A only: Source: EXCALIDRAW_PATH]

Files created (7):
  docs/fe/wireframes/FOLDER/FOLDER_NAME_wireframe_v1.md
  docs/fe/wireframes/FOLDER/business_description.md
  docs/fe/wireframes/FOLDER/tech_description.md
  docs/fe/wireframes/FOLDER/how_to_use.md
  docs/fe/wireframes/FOLDER/conccern.md
  docs/fe/wireframes/FOLDER/recomment/recommend.md
  docs/fe/wireframes/FOLDER/recomment/recomment_claude.md

Updated:
  docs/fe/wireframes/WIREFRAME_INDEX.md        ← added row [N]
  shared/_INDEX_SHARING_COMPONENT.md           ← Page Directory row added [always]; [N new (shared) component rows | none]
  shared/_INDEX_STATE_MANAGEMENT.md            ← Page Directory row added [always]; [N new stores/query keys | none]
  shared/_INDEX_RENDERING_STRATEGY.md          ← Page Directory row added [always]; [Pattern A/B/C · gaps noted | none]

Next steps:
[Flow A:]
  1. Review the files and fill any [TBD] gaps (mostly in conccern.md and recomment/)
  3. Add task rows from FOLDER_NAME_wireframe_v1.md to docs/tasks/MASTER_TASK.md
  4. Export a PNG from the excalidraw → save as FOLDER_NAME.png
  5. Run /doc-check after filling content

[Flow B:]
  1. Run `/excalidraw FOLDER` → draw the visual wireframe
  2. Paste the ASCII zone layout into FOLDER_NAME_wireframe_v1.md §📐 Visual Wireframe
  3. Fill Zone Mapping, Data Sources, and Component tables (include Reuse? column)
  4. Register any `new (shared)` components in shared/_INDEX_SHARING_COMPONENT.md
  5. Fill business_description.md and how_to_use.md with real copy
  6. Add at least 3 items to conccern.md before design review
  7. Run /doc-check after filling content
```
