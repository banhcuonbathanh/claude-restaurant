# Current Task

> **One task at a time.** Fill this in at session START. Clear or update at session END.
> **No active task?** → Open `MASTER_TASK.md`, find next `⬜` task where all `Deps` are ✅.
> **Task rules** → `GUIDE_TASK.md` · **All tasks** → `MASTER_TASK.md`

---

## Active Task

**P-MON — Client Order Monitoring Page**
- Phase registered in MASTER_TASK.md (2026-05-29)
- 9 sub-tasks: BE-1 → BE-2 → BE-3 → FE-1 → FE-2 → FE-3 → FE-4 → FE-5 → FE-6
- Next: **P-MON-BE-1** — `ListActiveQueueOrders` SQL + `GetOrderWithTableLabel` SQL + `sqlc generate` + repo methods

**Other queued tasks (after P-MON):**
1. **P-WIRE-ORDER-4** — Client Order Page wireframe (parked, see below)
2. **Phase 7-7** — Payment sandbox (VNPay + MoMo via ngrok)

---

## Parked Task (resume after P-GRAPH-ENRICH-1 + ENRICH-2)

**ID:** P-WIRE-ORDER-4
**Phase:** P-WIRE-ORDER — Client Order Page Wireframe
**Status:** ⬜ NOT STARTED — ready to begin when P-GRAPH-ENRICH done

Context is fully preserved in git. When resuming, re-read the pre-computed facts section from the previous CURRENT_TASK snapshot (reproduced below for reference):

- Route: `/(shop)/order/[id]` · Pattern B · Mobile 420px · Guest (no auth)
- 8 Zones: Nav · C1 · 1–6 · 2 Modals (A=OrderConfirmed, B=CancelConfirm)
- DO NOT re-parse excalidraw — all zone details are in `client_order_page_wireframe_v1.md`

---

*Updated: 2026-05-28 — P-GRAPH-ENRICH complete (ENRICH-1 + ENRICH-2 ✅); P-WIRE-ORDER-4 parked*
