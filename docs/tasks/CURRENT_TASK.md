# Current Task

> **One task at a time.** Fill this in at session START. Clear or update at session END.
> **No active task?** → Open `MASTER_TASK.md`, find next `⬜` task where all `Deps` are ✅.
> **Task rules** → `GUIDE_TASK.md` · **All tasks** → `MASTER_TASK.md`

---

## Active Task

**ID:** P-WIRE-ORDER-4
**Phase:** P-WIRE-ORDER — Client Order Page Wireframe
**Owner:** Docs
**Status:** ⬜ NOT STARTED — ready to begin

**What to create (A4 this session):**
- `docs/fe/wireframes/client_order_page/conccern.md` — ≥ 5 open questions / implementation concerns
- `docs/fe/wireframes/client_order_page/recomment/recommend.md` — UX strengths + improvement recommendations (human perspective)
- `docs/fe/wireframes/client_order_page/recomment/recomment_claude.md` — Claude's architectural / technical recommendations
- Update `docs/fe/wireframes/shared/_INDEX_SHARING_COMPONENT.md` — Page Directory row already added in A1; verify it is still accurate after A3

**Source to read first:** `docs/fe/wireframes/client_order_page/client_order_page_wireframe_v1.md` (already produced in A1)
**DO NOT re-read excalidraw.**

**AC:** ≥ 5 open questions in conccern.md; UX strengths + recommendations table filled in recommend.md; shared component reuse table complete in recomment_claude.md; `_INDEX_SHARING_COMPONENT.md` Page Directory row is accurate.

---

## Pre-computed facts for A4 (use directly — do not re-derive)

**Route:** `/(shop)/order/[id]`
**Pattern:** B — Full Client
**Device:** Mobile 420px

**Open concerns to document (seed — expand with more):**
1. SSE reconnect gap — missed events between disconnect and reconnect; `refetchOnWindowFocus` is mitigation but not 100% reliable
2. iOS Safari kills EventSource on screen lock — needs `visibilitychange` reconnect handler
3. Qty stepper min/max bounds — min is 1 (can't go below), max not specified; what happens if guest tries to increase beyond kitchen capacity?
4. Cancel whole order at exactly 30% — is `progress < 30%` inclusive or exclusive? Race condition if two guests cancel simultaneously?
5. Guest token expiry while on page — redirect mid-session; UX is abrupt; consider grace period or soft-expiry warning
6. `còn×N` badge vs `✓ xong` — what if qtyServed > qtyOrdered (over-serve edge case)?
7. SSE event ordering — if `item_update` and `order_delivered` arrive in wrong order, the UI may flash "delivered" then revert
8. `tableLabel` is display-only — if table reassigned while order is active, label shown will be stale

**UX strengths to note in recommend.md:**
- Realtime SSE → no manual refresh needed
- Collapsible card + combo grouping reduces cognitive load for large orders
- Dual cancel (item-level + whole-order) with confirmation dialog prevents accidents
- còn×N badge gives precise kitchen queue visibility
- Money split (served vs remaining) removes payment surprise

**UX concerns to note in recommend.md:**
- No "last updated" timestamp — guest has no way to know how stale the data is after reconnect
- Progress bar % can jump backwards if an item is cancelled post-serve
- No sound/vibration when `order_confirmed` modal fires — easy to miss on noisy tables
- Zone 6 "Thêm món" disappears for takeaway — unintuitive; consider disabling + tooltip instead of hiding

**Technical recommendations for recomment_claude.md:**
- `useOrderTracking` should be a single hook (not split between page and useOrderSSE)
- `CancelTarget` union type forces discriminated union — avoids boolean flag + nullable id smell
- `comboCollapsed: Record<string, boolean>` initialised lazily (first interaction) — don't pre-populate on mount
- `OrderPageSkeleton` should match Zone 1 + Zone 2 + Zone 3 + Zone 6 shapes (as drawn in excalidraw)
- SSE event handler should be idempotent — duplicate events must not double-apply patches
- Consider `optimistic update` on cancel → rollback on API error (UX feels faster on mobile)

---

## Context Already Extracted (DO NOT re-read excalidraw — use CURRENT_TASK facts above)

**Source:** `docs/fe/wireframes/client_order_page/order_ver2.excalidraw`
**Page:** Theo Dõi Đơn Hàng (Order Tracking)
**Route:** `/(shop)/order/[id]`
**Device:** Mobile (420px)
**Auth:** None — guest page accessed via QR link

### Zones (8 total)

| Zone | Name | Visibility |
|------|------|------------|
| Nav | Order Tracking Nav | Always sticky top-0 |
| C1 | Connection Error Banner | SSE disconnected only |
| 1 | Order Card | Always (collapsible) |
| 2 | Dish Summary Table | Always |
| 3 | Money Summary Card | Always |
| 4 | Completed Banner | `status = delivered` only |
| 5 | Cancel Whole Order | `progress < 30% AND status = active` only |
| 6 | Add More Dishes | `table_id` exists (dine-in only) |

### Modals (2)
- Modal A — Order Confirmed (SSE `order_confirmed` push)
- Modal B — Cancel Confirm Dialog (item-level OR whole-order cancel)

---

## Previous Tasks in This Phase

| ID | Status | What |
|----|--------|------|
| P-WIRE-ORDER-1 | ✅ | `wireframe_v1.md` + WIREFRAME_INDEX.md update + `_INDEX_SHARING_COMPONENT.md` Page Directory row |
| P-WIRE-ORDER-2 | ✅ | `business_description.md` + `how_to_use.md` |
| P-WIRE-ORDER-3 | ✅ | `tech_description.md` + `_INDEX_STATE_MANAGEMENT.md` + `_INDEX_RENDERING_STRATEGY.md` updates |
| P-WIRE-ORDER-4 | ⬜ | `conccern.md` + `recomment/` (this task) |

---

*Created: 2026-05-27 — context extracted from order_ver2.excalidraw in same session*
*Do NOT re-parse the excalidraw — use the zone detail above.*
