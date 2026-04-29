# Phase 5.4 — KDS Kitchen Display Screen
> Dependency: Task 4.4 WebSocket hub ✅

## Paste These Docs

- [ ] `CLAUDE.md`
- [ ] `MASTER_v1.2.docx` §2 §5.1 (design tokens, WS config)
- [ ] `contract/ERROR_CONTRACT_v1.1.docx`
- [ ] `fe/spec/Spec_4_Orders_API.docx` (KDS FE sections)
- [ ] `claude/CLAUDE_FE.docx`
- [ ] `contract/API_CONTRACT_v1.1.docx` §10.1

---

## Prompt

```
You are the FE Dev for the BanhCuon system.

I have pasted CLAUDE.md, MASTER §2+§5.1, ERROR_CONTRACT, Spec_4_Orders (KDS FE sections),
CLAUDE_FE.docx, and API_CONTRACT §10.1 above.

## Task: Build KDS full-screen kitchen display (Task 5.4)

### fe/src/app/(dashboard)/kds/page.tsx

Layout:
- Full-screen, background #0A0F1E (bg-[#0A0F1E]), NO navbar, NO footer
- Role guard: RequireRole(2) = Chef+ only
- Grid of order cards, each card draggable or scrollable

WebSocket connection:
- Connect to WS /api/v1/ws/kds?token={accessToken}
- accessToken from Zustand store — NOT localStorage
- WS reconnect: same WS_RECONNECT config as SSE (maxAttempts:5, baseDelay:1000ms, maxDelay:30s)
- Show ConnectionErrorBanner after 3 failed reconnects

Each order card shows:
- Table name / order number
- Timestamp + elapsed time (recalculate every minute)
- List of order_items — show COMBO SUB-ITEMS only (not the combo header row)
  Hint: filter out items where combo_ref_id IS NULL AND combo_id IS NOT NULL (header rows)
- Each item: name + toppings_snapshot summary + qty indicator

Card color coding (Tailwind border):
- Elapsed < 10 min → card bg-gray-800 (#1F2937), no border highlight
- Elapsed 10-20 min → border-2 border-yellow-300 (#FCD34D)
- Elapsed > 20 min OR item flagged → border-2 border-red-300 (#FC8181)
Recalculate elapsed time every 60s with setInterval.

Item interactions:
- Click item → PATCH /orders/:id/items/:itemId/status → cycle pending→preparing→done
  Optimistic update: update local state immediately, revert on error
- Flag button on item → PATCH /orders/:id/items/:itemId/flag → toggle flagged state

WS events to handle:
- new_order: add new order card to grid
- item_updated: update specific item in specific order card
- order_cancelled: remove order card from grid

Sound alert on new_order:
Use Web Audio API (not an audio file — no external deps):
  const ctx = new AudioContext()
  const osc = ctx.createOscillator()
  // brief 200ms beep at 440Hz

## Definition of Done
- [ ] Full-screen layout, no navbar, background #0A0F1E
- [ ] WS connects with ?token= query param (NOT Authorization header)
- [ ] Color coding changes correctly as elapsed time increases
- [ ] Click item → status cycles → optimistic UI update
- [ ] Combo header rows filtered out — only sub-items shown
- [ ] Sound plays on new_order WS event
- [ ] ConnectionErrorBanner after 3 WS reconnect failures
- [ ] Chef role guard — non-chef roles see 403
- [ ] npx tsc --noEmit passes
```
