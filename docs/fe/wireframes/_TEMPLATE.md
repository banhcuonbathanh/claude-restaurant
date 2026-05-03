---
page: [page-name]
route: /[route]
spec_ref: Spec_X §Y
created: YYYY-MM-DD
---

# Wireframe — [Page Name]

## Data Sources

| Zone | Source | Update mechanism |
|---|---|---|
| [ZoneA] | `GET /api/v1/...` | TanStack Query, refetch on focus |
| [ZoneB] | SSE / WebSocket | real-time push |
| [ZoneC] | Zustand store | in-memory client state |

## Layout

```
┌─────────────────────────────────────────────────────────┐
│  [ZoneA — PageHeader]                                    │
│  title + breadcrumbs                                     │
├──────────────────────────┬──────────────────────────────┤
│  [ZoneB — LeftPanel]     │  [ZoneC — RightPanel]        │
│  data: GET /...          │  data: derived from ZoneB    │
│  interactions: ...       │  interactions: ...           │
├──────────────────────────┴──────────────────────────────┤
│  [ZoneD — ActionBar]                                     │
│  buttons → PATCH /...                                    │
└─────────────────────────────────────────────────────────┘
```

## Components

| Zone | Component | spec_ref | Notes |
|---|---|---|---|
| ZoneA | `PageHeader` | Spec_X §Y.1 | shared component |
| ZoneB | `LeftPanel` | Spec_X §Y.2 | page-specific |
| ZoneC | `RightPanel` | Spec_X §Y.3 | page-specific |
| ZoneD | `ActionBar` | Spec_X §Y.4 | page-specific |

## Task Rows (copy into TASKS.md)

| ID | Domain | Task | Status | spec_ref | draw_ref |
|---|---|---|---|---|---|
| X-1 | FE | `LeftPanel` component | ⬜ | Spec_X §Y.2 | wireframes/[page].md zone-B |
| X-2 | FE | `RightPanel` component | ⬜ | Spec_X §Y.3 | wireframes/[page].md zone-C |
| X-3 | FE | `ActionBar` component | ⬜ | Spec_X §Y.4 | wireframes/[page].md zone-D |
| X-4 | FE | `[page]/page.tsx` — assemble | ⬜ | Spec_X §Y | wireframes/[page].md |
