---
page: [page-name]
route: /[route]
spec_ref: Spec_X §Y
created: YYYY-MM-DD
status: Draft | Approved for Development
---

# Page: [Page Name]
**Route:** `[route]/page.tsx`
**Spec Ref:** `Spec_X §Y`
**Version:** v1
**Status:** Draft

---

## 📐 Visual Wireframe

```text
┌─────────────────────────────────────────────────────────┐
│  [A] PageHeader                                          │  ← sticky top-0 z-20
├─────────────────────────────────────────────────────────┤
│  [B] SubHeader / Tabs / Filter                          │  ← sticky top-[52px] z-10
├──────────────────────────┬──────────────────────────────┤
│  [C] LeftPanel / Main    │  [D] RightPanel / Sidebar    │
│  data: GET /...          │  data: derived from C        │
│  interactions: ...       │  interactions: ...           │
├──────────────────────────┴──────────────────────────────┤
│  [E] ActionBar / FAB                                     │  ← fixed bottom-6 z-30
└─────────────────────────────────────────────────────────┘
```

---

## 🗺️ Zone Mapping

| Zone | Component | Visibility Condition | Sticky / Position |
|------|-----------|---------------------|-------------------|
| **A** | `PageHeader` | Always | `top-0 z-20` |
| **B** | `SubHeader` | Always | `top-[52px] z-10` |
| **C** | `MainPanel` | Always | Scrollable |
| **D** | `SidePanel` | [condition] | Scrollable |
| **E** | `ActionBar` | [condition] | `fixed bottom-6 z-30` |

---

## 📊 Data Sources & State Management

| Zone | Data Source | Update Mechanism | Query Key | Notes |
|------|-------------|------------------|-----------|-------|
| **A** | `[store].[field]` | Zustand (in-memory) | N/A | |
| **B** | `GET /api/v1/[resource]` | TanStack Query | `['[resource]']` | `staleTime: 5min` |
| **C** | `GET /api/v1/[resource]` | TanStack Query | `['[resource]', id]` | |
| **D** | `[store].[field]` | Zustand (computed) | N/A | |
| **E** | SSE / WebSocket | Real-time push | N/A | |

---

## 🧩 Component Specifications

| Zone | Component | File | Spec Ref | Props / Interface |
|------|-----------|------|----------|------------------|
| **A** | `PageHeader` | `[page]/page.tsx` | `Spec_X §Y.1` | Inline component |
| **B** | `SubHeader` | `components/[page]/SubHeader.tsx` | `Spec_X §Y.2` | `SubHeaderProps` |
| **C** | `MainPanel` | `components/[page]/MainPanel.tsx` | `Spec_X §Y.3` | `MainPanelProps` |
| **D** | `SidePanel` | `components/[page]/SidePanel.tsx` | `Spec_X §Y.4` | `SidePanelProps` |
| **E** | `ActionBar` | `components/[page]/ActionBar.tsx` | `Spec_X §Y.5` | `ActionBarProps` |

---

## 👨‍💻 Developer Implementation Details

<!-- Add TypeScript contracts, query hooks, and store slices for complex pages only.
     Skip for simple/static pages. -->

### TypeScript Contracts

```typescript
// types/[page].ts

export interface [Entity] {
  id: string; // UUID - NEVER number
  // ...
}
```

### Query Configuration

```typescript
// hooks/use[Page]Queries.ts

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
| **[page-specific case]** | `[detection]` | `[dev action]` | `[UX fallback]` |

---

## 🧪 Testing & QA Checklist

### Functional Tests
- [ ] **Zone A:** [describe expected behaviour]
- [ ] **Zone B:** [describe expected behaviour]
- [ ] **Zone C:** [describe expected behaviour]
- [ ] **Zone D:** [describe expected behaviour]
- [ ] **Zone E:** [describe expected behaviour]

### Edge Case Tests
- [ ] Image fails to load → placeholder shows
- [ ] Network offline → error banner appears
- [ ] Empty list → empty state shows correctly
- [ ] [page-specific edge case]

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
| X-1 | FE | Wireframe + zone table | ⬜ | Spec_X §Y | wireframes/[page].md |
| X-2 | FE | `[Component]` component | ⬜ | Spec_X §Y.2 | Zone C |
| X-3 | FE | `[page]/page.tsx` — assemble | ⬜ | Spec_X §Y | wireframes/[page].md |

---

## 📝 Changelog

**v1 (YYYY-MM-DD)**
- Initial wireframe

---

*Last Updated: YYYY-MM-DD*
*Approved by: —*
*Next Review: —*
