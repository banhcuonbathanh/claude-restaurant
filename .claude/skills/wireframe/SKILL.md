---
description: Scaffold a full wireframe folder for a FE page. Usage: /wireframe <page-folder-name>. Two-phase flow: Phase 1 collects page info and previews the plan, Phase 2 creates all files. Standard: docs/fe/wireframes/FOLDER_STANDARD.md
---

You are scaffolding a wireframe folder for the BanhCuon restaurant project.

The argument passed to this skill is the page folder name: **$ARGUMENTS**

Read `docs/fe/wireframes/FOLDER_STANDARD.md` now — it is the authoritative standard for every file you will create.

---

## PHASE 1 — Gather info and plan (always run first, always wait for approval)

### 1a — Ask for required inputs

If any of the following are missing from the conversation context, ask the user now (all in one message — do not ask one at a time):

| Input | Example |
|-------|---------|
| Page display name | "Client — Order History" |
| FE route | `/(shop)/order-history/page.tsx` |
| Spec reference | `Spec_3 §6` |
| Device type | `mobile` or `desktop` |
| Short description | "Shows past orders with reorder CTA" |

If `$ARGUMENTS` is empty, ask for the folder name too.

### 1b — Print the plan

Once you have all inputs, print this block (fill in real values):

```
📋 WIREFRAME SCAFFOLD PLAN — [page-folder-name]

Folder: docs/fe/wireframes/[page-folder-name]/

Files to create:
  1. [page-folder-name]_wireframe_v1.md   ← main spec (copy from _TEMPLATE.md structure)
  2. business_description.md              ← user-facing description (Vietnamese)
  3. tech_description.md                  ← architecture & patterns for developers
  4. how_to_use.md                        ← step-by-step guide per zone (Vietnamese)
  5. conccern.md                          ← open questions & raw notes
  6. recomment/recommend.md               ← UX/UI review template
  7. recomment/recomment_claude.md        ← Claude architectural guidelines

NOT created by this skill (run separately):
  • [page-folder-name].excalidraw         ← run /excalidraw [page-folder-name] after
  • [page-folder-name].png                ← export from Excalidraw after drawing

WIREFRAME_INDEX.md: will add 1 new row under Pages or Flows.

Page: [display name]
Route: [route]
Spec: [spec ref]
Device: [mobile | desktop]
```

### 1c — STOP and wait for approval

After printing the plan, write:

> **Waiting for approval.** Reply "ok" to create all files, or adjust any detail above first.

Do NOT proceed to Phase 2 until the user explicitly approves.

---

## PHASE 2 — Create all files

Only begin after the user approves the Phase 1 plan.

Use the exact folder name from `$ARGUMENTS` (or confirmed in Phase 1) for all paths.
Variables used below:
- `FOLDER` = the folder name (e.g. `client_order_history`)
- `PAGE` = display name (e.g. "Client — Order History")
- `ROUTE` = FE route (e.g. `/(shop)/order-history/page.tsx`)
- `SPEC` = spec reference (e.g. `Spec_3 §6`)
- `DEVICE` = `mobile` or `desktop`
- `DESC` = short description provided in Phase 1
- `DATE` = today's date in YYYY-MM-DD format

### Step 1 — Create the folder structure

Create:
- `docs/fe/wireframes/FOLDER/`
- `docs/fe/wireframes/FOLDER/recomment/`

### Step 2 — Create `FOLDER_wireframe_v1.md`

This is the main spec. Follow `_TEMPLATE.md` exactly. Pre-fill all known fields; leave zone-specific rows as `[TBD]` placeholders.

```markdown
---
page: FOLDER
route: ROUTE
spec_ref: SPEC
created: DATE
status: Draft
---

# Page: PAGE
**Route:** `ROUTE`
**Spec Ref:** `SPEC`
**Version:** v1
**Status:** Draft

---

## 📐 Visual Wireframe

> Draw this in Excalidraw: run `/excalidraw FOLDER` to generate the visual file.
> Once drawn, paste the ASCII zone layout here.

```text
┌─────────────────────────────────────────────────────────┐
│  [A] [Zone name — fill after /excalidraw]               │
├─────────────────────────────────────────────────────────┤
│  [B] [Zone name]                                        │
├─────────────────────────────────────────────────────────┤
│  [C] [Zone name]                                        │
└─────────────────────────────────────────────────────────┘
```

---

## 🗺️ Zone Mapping

| Zone | Component | Visibility Condition | Sticky / Position |
|------|-----------|---------------------|-------------------|
| **A** | `[ComponentName]` | Always | `top-0 z-20` |
| **B** | `[ComponentName]` | [condition] | Scrollable |
| **C** | `[ComponentName]` | [condition] | Scrollable |

---

## 📊 Data Sources & State Management

| Zone | Data Source | Update Mechanism | Query Key | Notes |
|------|-------------|------------------|-----------|-------|
| **A** | `[store].[field]` | Zustand | N/A | |
| **B** | `GET /api/v1/[resource]` | TanStack Query | `['[resource]']` | `staleTime: 5min` |
| **C** | `[store].[field]` | Zustand (computed) | N/A | |

---

## 🧩 Component Specifications

| Zone | Component | File | Spec Ref | Props / Interface |
|------|-----------|------|----------|------------------|
| **A** | `[Component]` | `[path]/page.tsx` | `SPEC.1` | Inline |
| **B** | `[Component]` | `components/FOLDER/[Component].tsx` | `SPEC.2` | `[Component]Props` |
| **C** | `[Component]` | `components/FOLDER/[Component].tsx` | `SPEC.3` | `[Component]Props` |

---

## 👨‍💻 Developer Implementation Details

<!-- Fill after zones are finalized. Skip for simple/static pages. -->

### TypeScript Contracts

```typescript
// types/FOLDER.ts

export interface [Entity] {
  id: string; // UUID — NEVER number
  // [add fields from spec]
}
```

### Query Configuration

```typescript
// hooks/use[PAGE]Queries.ts

import { useQuery } from '@tanstack/react-query';

export const use[Resource] = () => {
  return useQuery({
    queryKey: ['[resource]'],
    queryFn: () => fetch('/api/v1/[resource]').then(res => res.json()),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
```

---

## ⚠️ Edge Cases & Fallbacks

| Scenario | Detection | Dev Action | UX Fallback |
|----------|-----------|------------|-------------|
| **Image fails to load** | `onError` on `<img>` | Show placeholder SVG | Gray block with icon |
| **Empty list** | `data.length === 0` | Show empty state | "[Empty state text]" + CTA |
| **Network offline** | `query.isError` | Show error banner | "Kết nối mạng yếu. Nhấn thử lại" |
| **No permission** | API returns 403 | Redirect or hide UI | Toast "Không có quyền truy cập" |
| **[page-specific case]** | [detection] | [dev action] | [UX fallback] |

---

## 🧪 Testing & QA Checklist

### Functional Tests
- [ ] **Zone A:** [describe expected behaviour]
- [ ] **Zone B:** [describe expected behaviour]
- [ ] **Zone C:** [describe expected behaviour]

### Edge Case Tests
- [ ] Image fails to load → placeholder shows
- [ ] Network offline → error banner appears
- [ ] Empty list → empty state shows correctly

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

| ID | Owner | Task | Status | Spec Ref | Draw Ref |
|----|-------|------|--------|----------|----------|
| [X]-1 | FE | Wireframe + zone table | ⬜ | SPEC | wireframes/FOLDER_wireframe_v1.md |
| [X]-2 | FE | [Main component] | ⬜ | SPEC | Zone B |
| [X]-3 | FE | `FOLDER/page.tsx` — assemble | ⬜ | SPEC | wireframes/FOLDER_wireframe_v1.md |

---

## 📝 Changelog

**v1 (DATE)**
- Initial scaffold

---

*Last Updated: DATE*
*Approved by: —*
*Next Review: After excalidraw zones confirmed*
```

### Step 3 — Create `business_description.md`

Audience: end users and restaurant owner. No technical terms. Write in Vietnamese. Use DESC as context.

```markdown
> Dành cho: Khách hàng cuối, onboarding, FAQ. Không dùng thuật ngữ kỹ thuật.

---

### PAGE — Dành cho khách hàng

[Viết 1 câu mô tả trang này làm gì từ góc độ người dùng.]

#### Bạn sẽ thích ngay khi sử dụng:

1. **[Lợi ích 1]**
   [Mô tả ngắn]

2. **[Lợi ích 2]**
   [Mô tả ngắn]

3. **[Lợi ích 3]**
   [Mô tả ngắn]

#### Trải nghiệm được tối ưu:
- Giao diện di động mượt mà, thao tác chạm chuẩn 44px
- Dữ liệu được lưu tự động
- Minh bạch thông tin

#### Quy trình [N] bước:
`Bước 1` → `Bước 2` → `Bước 3`

---
*[Gợi ý: điền nội dung thực sau khi excalidraw và spec zone đã xác nhận]*
```

### Step 4 — Create `tech_description.md`

Audience: developers. Include stack, patterns, file org.

```markdown
## Technical Architecture — PAGE

### Page Structure
- Zones: [A–?] (fill after excalidraw)
- Device target: DEVICE
- Conditional rendering: [TBD]
- Scrollable area: between [Zone ?] and [Zone ?]

### Tech Stack
```
React (Next.js App Router)
├── State: Zustand ([store names — TBD]) + localStorage persistence
├── Data: TanStack Query ([resource names — TBD])
├── Styling: Tailwind CSS (DEVICE layout)
└── Types: TypeScript interfaces for all components
```

### Key Implementation Patterns

**1. Component Architecture**
- [TBD — fill after zones confirmed]

**2. State Management**
```typescript
// [store-name]Store: {
//   [field]: [type]
//   // Actions: [TBD]
// }
```

**3. Data Fetching**
```typescript
// queryKey: ['[resource]', ...params]
// staleTime: 5 * 60 * 1000
```

**4. Performance**
- [TBD — debounce, optimistic updates, memoization as applicable]

**5. Edge Cases**
- Image fallback → placeholder SVG
- Network error → retry banner
- Empty state → contextual CTA

### File Organization
```
/(ROUTE_BASE)/
├── page.tsx
├── components/
│   └── [Component].tsx   ← [TBD]
└── hooks/
    └── use[PAGE]Queries.ts
```

### Critical Notes
- UUID for all entity IDs (never numeric)
- Price formatting client-side (raw numbers in state/API)
- [Add page-specific constraints after spec review]
```

### Step 5 — Create `how_to_use.md`

Audience: end users. Vietnamese. Zone-by-zone guide. Use DESC as context.

```markdown
> Dành cho: Khách hàng, onboarding in-app, FAQ hỗ trợ.

---
# Hướng dẫn sử dụng: PAGE

[1 câu về nguyên tắc thiết kế của trang này.]

## Bước 1: [Tên nhóm zone] (Zone A, B)

| Vùng | Chức năng | Cách dùng |
|------|-----------|-----------|
| **A – [Tên]** | [Chức năng] | [Cách dùng — điền sau khi zone xác nhận] |
| **B – [Tên]** | [Chức năng] | [Cách dùng] |

## Bước 2: [Tên nhóm zone] (Zone C, D)

| Vùng | Chức năng | Cách dùng |
|------|-----------|-----------|
| **C – [Tên]** | [Chức năng] | [Cách dùng] |
| **D – [Tên]** | [Chức năng] | [Cách dùng] |

## Mẹo & Hỗ trợ đặc biệt

| Tình huống | Cách hệ thống xử lý | Gợi ý cho khách |
|------------|---------------------|-----------------|
| Thoát app / Tải lại | Dữ liệu lưu tự động | Không lo mất thông tin |
| Mạng yếu / Offline | Hiện banner thử lại | Nhấn banner để tải lại |
| Không tìm thấy kết quả | Hiện trạng thái trống | Thử bộ lọc khác |

## Luồng chuẩn

```
Bước 1  →  Bước 2  →  Bước 3
```

---
*[Điền nội dung chi tiết sau khi zone layout được xác nhận từ excalidraw]*
```

### Step 6 — Create `conccern.md`

Audience: owner + developer scratchpad. Raw questions, not a formal doc.

```markdown
> Scratchpad: open questions, risks, undecided items for PAGE.
> Not a formal spec — write freely. Resolve items here before finalising the wireframe.

---

## Open Questions

- [ ] [Question 1 — e.g. "Can users edit after submitting?"]
- [ ] [Question 2 — e.g. "What is the max items per page? Pagination or infinite scroll?"]
- [ ] [Question 3 — e.g. "Does this page require auth? What happens if session expires mid-view?"]

## Risks

- [Risk 1 — e.g. "Zone layout on 375px may be too dense — test before finalising"]

## Undecided

- [Item 1 — e.g. "Empty state illustration: custom SVG or generic icon?"]

## Resolved

*(Move items here once decided — record the decision, not just the outcome)*

---
*Created: DATE*
```

### Step 7 — Create `recomment/recommend.md`

Audience: developer + designer doing UX review. Structured tables.

```markdown
> UX/UI review for PAGE. Fill after excalidraw is drawn and zones are confirmed.

---

## ✅ UX Strengths

1. [Strength 1 — what the current design does well]
2. [Strength 2]
3. [Strength 3]

---

## ⚠️ UX Recommendations

| Area | Observation | Recommendation |
|------|-------------|----------------|
| [Zone / Feature] | [What you noticed] | [What to change] |
| [Zone / Feature] | | |

---

## 🎨 UI & Visual Recommendations

| Element | Issue | Fix |
|---------|-------|-----|
| [Element] | [Issue] | [Fix] |

---

## 🔍 Spec vs. Excalidraw Alignment

| Zone | Spec Says | Excalidraw Shows | Action |
|------|-----------|-----------------|--------|
| [Zone] | [spec claim] | [what image shows] | [update doc / update drawing] |

---

## ♿ Accessibility & Edge Cases

- [ ] Touch targets ≥ 44px on all interactive elements
- [ ] Screen reader labels on all icons and buttons
- [ ] Keyboard navigation: Tab → Enter → Esc
- [ ] `prefers-reduced-motion` respected
- [ ] [page-specific a11y note]

---

## 🚀 Recommended Next Steps

1. [Action 1]
2. [Action 2]
3. [Action 3]

---
*Review date: DATE*
*Reviewed by: —*
```

### Step 8 — Create `recomment/recomment_claude.md`

Audience: developer team. Claude's analysis — cross-page architecture + what Claude needs to know before coding this page.

```markdown
# Claude Guidelines — PAGE

> Read this before implementing PAGE.
> Covers: shared components, state strategy, performance, and what is non-obvious from the main spec.

---

## Spec Summary (SPEC)

DESC

Key constraint: [read SPEC and note the single most important constraint for Claude — e.g. "auth required", "real-time SSE", "optimistic update pattern"]

---

## Shared Components — Reuse Checklist

Before building any new component, check these first:

| Component needed | Reuse from | Notes |
|------------------|-----------|-------|
| Page header | `components/shared/PageHeader.tsx` | Pass `title`, `tableLabel` props |
| Error banner | `components/shared/ErrorBanner.tsx` | Network error pattern |
| Empty state | `components/shared/EmptyState.tsx` | Pass `icon`, `message`, `cta` |
| Loading skeleton | `components/shared/Skeleton.tsx` | Match zone dimensions |
| [Page-specific] | [TBD] | |

---

## State Strategy

| Data type | Where it lives | Why |
|-----------|---------------|-----|
| [Server data] | TanStack Query | Cache + revalidation |
| [Cross-page state] | Zustand global store | Needed by [other pages] |
| [Page-local state] | `useState` inside page | Never leaves this page |
| [Persisted client state] | Zustand + `persist` middleware | Survives reload |

---

## Performance Checklist

- [ ] Code split: each page in `/(ROUTE_BASE)/` loads its own JS bundle (automatic via App Router)
- [ ] Images: use `next/image` — never raw `<img>` tags
- [ ] Lists > 20 items: add virtualization (`react-window`) or pagination
- [ ] API calls: use TanStack Query — no `useEffect` + `fetch` combos
- [ ] Animations: wrap in `prefers-reduced-motion` check

---

## Cross-Page Notes

- State shared with other pages: [TBD — list stores this page reads/writes]
- Navigation from this page: [TBD — list routes this page links to]
- Navigation to this page: [TBD — list what routes link here]

---

## Non-Obvious Implementation Notes

*(Fill after spec review — things not obvious from reading the wireframe)*

- [Note 1]
- [Note 2]

---
*Created: DATE*
```

### Step 9 — Update `docs/fe/wireframes/WIREFRAME_INDEX.md`

Add one new row to the Pages table. Use the display name and correct relative link:

```
| [next number] | PAGE | [FOLDER/FOLDER_wireframe_v1.md](FOLDER/FOLDER_wireframe_v1.md) |
```

### Step 10 — Print completion summary

```
✅ /wireframe FOLDER — scaffold complete

Files created (7):
  docs/fe/wireframes/FOLDER/FOLDER_wireframe_v1.md
  docs/fe/wireframes/FOLDER/business_description.md
  docs/fe/wireframes/FOLDER/tech_description.md
  docs/fe/wireframes/FOLDER/how_to_use.md
  docs/fe/wireframes/FOLDER/conccern.md
  docs/fe/wireframes/FOLDER/recomment/recommend.md
  docs/fe/wireframes/FOLDER/recomment/recomment_claude.md

Updated:
  docs/fe/wireframes/WIREFRAME_INDEX.md ← added row [N]

Next steps (in order):
  1. Run `/excalidraw FOLDER` → draw the visual wireframe
  2. Paste the ASCII zone layout into FOLDER_wireframe_v1.md §📐 Visual Wireframe
  3. Fill in Zone Mapping, Data Sources, and Component tables
  4. Fill in business_description.md and how_to_use.md with real copy
  5. Add at least 3 items to conccern.md before design review
  6. Run /doc-check after filling content to verify no stale placeholders
```
