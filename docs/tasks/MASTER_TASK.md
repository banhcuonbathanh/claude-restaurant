# Master Task List — Hệ Thống Quản Lý Quán Bánh Cuốn

> **Single source of truth** for all tasks.
> **Rule:** Update status here after every completed task. Never let this go stale.
> **Status codes:** ⬜ not started · 🔄 in progress · ✅ done · 🔴 blocked
> **Active task:** `docs/tasks/CURRENT_TASK.md` · **Task rules:** `docs/tasks/GUIDE_TASK.md`
> **Completed phase detail:** `docs/tasks/ARCHIVE_TASKS.md`

---

## Phase Overview

| Phase | Owner | Status | Sessions Left | Next task |
|---|---|---|---|---|
| P0 — Docs & Architecture | BA | ✅ COMPLETE | 0 | — |
| P1 — DB Migrations | DevOps | ✅ COMPLETE | 0 | — |
| P2 — Feature Specs | BA | ✅ COMPLETE | 0 | — |
| P3 — sqlc + Project Setup | BE | ✅ COMPLETE | 0 | — |
| P4 — Backend | BE | ✅ COMPLETE | 0 | — |
| P5 — Frontend | FE | ✅ COMPLETE | 0 | — |
| P6 — DevOps | DevOps | ✅ COMPLETE | 0 | — |
| P7 — Testing & Go-Live | BE+FE+QA | 🔄 IN PROGRESS | ~5 | P7-5.4 (Playwright E2E) |
| P8 — Admin Dashboard | BE+FE | ✅ COMPLETE | 0 | — |
| P9 — Overview Real API | FE | ✅ COMPLETE | 0 | — |
| P10 — Summary Dashboard | BE+FE | ✅ COMPLETE | 0 | — |
| P-UX — Customer Flow | FE | ✅ COMPLETE | 0 | — |
| P-PD — Product Detail Page | FE | ✅ COMPLETE | 0 | — |
| P-UX2 — Customer UX Enhancements | FE | ✅ COMPLETE | 0 | — |
| P-DIAGRAM — Full System Interaction Map | Docs | ✅ COMPLETE | 0 | — |
| P-MENU — Menu Page Wireframe + Grid Redesign | FE | 🔄 IN PROGRESS | ~1 | P-MENU-2 |
| P11 — Add Items to Existing Order | Full | ✅ COMPLETE | 0 | — |
| P-ORDER-TOPPING — Order Page Topping Display | FE+BE | ✅ COMPLETE | 0 | — |
| P-FIX-MOCK — Fix order_service_test mockOrderRepo | BE | ✅ COMPLETE | 0 | — |
| P-ARCH — FE Architecture Groundwork | FE+Docs | ✅ COMPLETE | 0 | — |
| P-TRAINING — Admin Staff Training Page | BE+FE | ✅ COMPLETE | 0 | — |
| P-WIRE-ORDER — Client Order Page Wireframe | Docs | 🔄 IN PROGRESS | 1 | P-WIRE-ORDER-4 (conccern + recomment) |
| P-GRAPH-ENRICH — Enrich Codebase Graphs for /dev-page | Docs | ✅ COMPLETE | 2 | — |
| P-MON — Client Order Monitoring Page | BE+FE | ⬜ NOT STARTED | 9 | P-MON-BE-1 |

---

## Completed Phases Summary

All individual tasks for completed phases are recorded in `docs/TASKS.md` (historical record).
Task-level detail for phases completed 2026-05 onward → `docs/tasks/ARCHIVE_TASKS.md`.

| Phase | Completed | Key deliverables |
|---|---|---|
| P0 — Docs & Architecture | 2026-04 | BE_SYSTEM_GUIDE, FE_SYSTEM_GUIDE, all index docs |
| P1 — DB Migrations | 2026-04 | Migrations 001–008, all tables + indexes |
| P2 — Feature Specs | 2026-04 | Spec1–Spec7, Spec9, Spec10 written |
| P3 — sqlc + Project Setup | 2026-04 | sqlc generated, field names verified |
| P4 — Backend | 2026-04 | Auth · Products · Orders · WS Hub · Payments · Remaining endpoints |
| P5 — Frontend | 2026-04 | Auth · Menu/Cart · Checkout/SSE · KDS · POS/Payment |
| P6 — DevOps | 2026-04 | .env.example · migrate.sh · Caddyfile · compose · CI/CD · README |
| P8 — Admin Dashboard | 2026-05 | FE admin pages (8-1→8-17) · BE staff endpoints (8-9→8-13) |
| P10 — Summary Dashboard | 2026-05 | BE analytics · FE components (10-1→10-14) |
| P-UX — Customer Flow | 2026-05 | Add-item flow · activeOrderId store · table_name display (UX-1→3) |
| P9 — Overview Real API | 2026-05 | Real WS + component extraction (P9-1→P9-8) |
| P-PD — Product Detail Page | 2026-05 | HeroImage + ToppingSelector + QtyStepper + CTA (P-PD-1→5) |
| P-UX2 — Customer UX | 2026-05 | Favourites · Combo detail · Settings page (P-UX2-1→3) |
| P11 — Add Items to Order | 2026-05 | `POST /orders/:id/items` BE+FE (P11-1→6) |
| P-ARCH — FE Arch Groundwork | 2026-05 | storage-keys.ts + wireframe path fixes (P-ARCH-1→2) |
| P-DIAGRAM — System Map | 2026-05 | 4-lane swimlane excalidraw |
| P-FIX — Modal Wiring | 2026-05 | ToppingModal + ComboModal wired (P-FIX-1→2) |
| P-ORDER-TOPPING | 2026-05 | Topping name/price in order page (P-ORDER-TOPPING-1→2) |
| P-FIX-MOCK | 2026-05 | mockOrderRepo AppendOrderItems stub |
| P-GRAPH-ENRICH | 2026-05 | BE + FE codebase graphs enriched |

---

## Phase 7 — Testing & Go-Live

> **Owner:** BE (unit/integration) · FE (store tests) · QA (UAT) · DevOps (go-live)
> **Dependency:** P4 ✅ · P5 ✅
> **Completed sub-tasks:** P7-1, P7-2, P7-3, P7-4, P7-5.1–5.3, P7-6, P7-E2E-0, P7-E2E-1, P7-9 → see `ARCHIVE_TASKS.md`

### P7-5.4 — Playwright E2E (Full Browser Flows)

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-5.4 | FE+QA | Playwright E2E — full browser flows: QR scan→menu→checkout→KDS→payment for each role (guest/cashier/chef/manager) | P7-5.1 ✅ · P7-3 ✅ | 2 | ⬜ | Needs docker compose up (full stack); set BASE_URL=http://localhost:3000 |

### P7-7 — Payment Sandbox

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-7 | BE | VNPay + MoMo via ngrok: full QR flow + signature rejection + double-webhook idempotency + amount mismatch rejection | P7-3 ✅ | 1 | ⬜ | Spec5 §7 |

### P7-8 — UAT Plan

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-8 | QA | `docs/UAT_Plan.md` — test cases per spec, stakeholder sign-off checklist, bug severity P0/P1/P2 definitions | P7-5 ✅ | 1 | ⬜ | — |

### P7-10 — Go-Live

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-10 | DevOps | DNS A record → VPS IP · Caddy SSL auto-cert · prod env vars · `goose up` · seed · smoke test | P7-5 ✅ · P7-7 ✅ | 1 | ⬜ | — |

### P7-11 — Monitoring

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-11 | DevOps | Error rate alert >5% · response time alert >500ms · log aggregation (Docker logs → Loki or CloudWatch) | P7-10 ✅ | 1 | ⬜ | — |

### P7-12 — Rollback Plan

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-12 | DevOps | Document rollback: `docker pull {previous-tag} && docker compose up -d` · post-launch SLA: P0=4h, P1=24h, P2=72h | P7-10 ✅ | 1 | ⬜ | — |

---

## Phase P-MENU — Menu Page Wireframe + Grid Redesign

> **Owner:** FE
> **Dependency:** P5 ✅ · Spec_3 §4 verified
> **Spec:** `docs/spec/Spec_3_Menu_Checkout_UI_v2.md §4`
> **Wireframe:** `docs/fe/wireframes/menu.excalidraw` · `docs/fe/wireframes/menu.md`
> **Added:** 2026-05-17

| ID | Owner | Task | Deps | Sessions | Status | spec_ref | draw_ref |
|---|---|---|---|---|---|---|---|
| P-MENU-1 | FE | Wireframe + zone table (menu.excalidraw + menu.md) | — | 1 | ✅ | `Spec_3 §4` | `wireframes/menu.excalidraw` |
| P-MENU-2 | FE | `ProductGridCard` component + update menu/page.tsx to 2-col grid | P-MENU-1 ✅ | 1 | ⬜ | `Spec_3 §4.1 §4.3` | `wireframes/menu.md Zone E` |

---

## Phase P-WIRE-ORDER — Client Order Page Wireframe

> **Owner:** Docs
> **Dependency:** excalidraw `order_ver2.excalidraw` ✅
> **Source:** `docs/fe/wireframes/client_order_page/order_ver2.excalidraw`
> **Order:** A1 → A2 → A3 → A4 (strict)

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P-WIRE-ORDER-1 | Docs | `client_order_page_wireframe_v1.md` — full zone tables from excalidraw; update WIREFRAME_INDEX.md | — | 1 | ✅ | All 8 zones + 2 modals documented |
| P-WIRE-ORDER-2 | Docs | `business_description.md` + `how_to_use.md` — Vietnamese copy, zone-by-zone user guide | P-WIRE-ORDER-1 ✅ | 1 | ✅ | Every zone covered; standard 4-step flow |
| P-WIRE-ORDER-3 | Docs | `tech_description.md` — RBAC, Pattern B, TypeScript interfaces, query hook stubs, file org tree | P-WIRE-ORDER-1 ✅ | 1 | ✅ | Pattern B declared; skeleton defined; query keys registered |
| P-WIRE-ORDER-4 | Docs | `conccern.md` + `recomment/recommend.md` + `recomment/recomment_claude.md`; update `_INDEX_SHARING_COMPONENT.md` | P-WIRE-ORDER-1 ✅ | 1 | ⬜ | ≥ 5 open questions in conccern; UX recommendations table filled |

---

## Phase P-TRAINING — Admin Staff Training Page

> **Owner:** BE+FE
> **Dependency:** P8 ✅ · P-ARCH-1 ✅
> **Wireframe:** `docs/fe/wireframes/admin_main/admin_main_training/admin_staff_training_wireframe_v1.md`
> **Excalidraw:** `docs/fe/wireframes/admin_main/admin_main_training/admin-staff-training.excalidraw` ✅
> **Route:** `/admin/training/page.tsx`
> **Order:** P-TRAINING-1 ✅ → BE-1 → BE-2 → 2 → 3 → 4 → 5 → 6 → 7 (strict)
> **Added:** 2026-05-25

| ID | Owner | Task | Deps | Sessions | Status | spec_ref | draw_ref |
|----|-------|------|------|----------|--------|----------|----------|
| P-TRAINING-1 | FE | Wireframe + zone table + all scaffold files | — | 1 | ✅ | — | `admin_staff_training_wireframe_v1.md` |
| P-TRAINING-BE-1 | BE | `014_training.sql` migration (4 tables) + sqlc queries (`be/query/training.sql`) + `sqlc generate` | P-TRAINING-1 ✅ | 1 | ✅ | wireframe §Data Sources | — |
| P-TRAINING-BE-2 | BE | `training_handler.go` + `training_service.go` + `training_repo.go` + register routes in `main.go` | P-TRAINING-BE-1 ✅ | 1 | ✅ | wireframe §API endpoints | — |
| P-TRAINING-2 | FE | `types/training.ts` + `hooks/useTrainingQueries.ts` + `store/trainingStore.ts` + `RoleBadge.tsx` | P-TRAINING-BE-2 ✅ | 1 | ✅ | wireframe §TypeScript Contracts | Zone B |
| P-TRAINING-3 | FE | `JobGuideCard.tsx` + `JobGuideCardGrid.tsx` — cover img, role badge, KPI chips, YouTube link, 3-dot kebab, Draft overlay | P-TRAINING-2 ✅ | 1 | ✅ | wireframe §Zone C | Zone C |
| P-TRAINING-4 | FE | `RoleFilterTabs.tsx` (Zone B) + `CompletionTrackingTable.tsx` (Zone D) — paginated table, status badges | P-TRAINING-3 ✅ | 1 | ✅ | wireframe §Zone B §Zone D | Zone B + Zone D |
| P-TRAINING-5 | FE | `CreateEditGuideModal.tsx` — RHF + Zod, 10 fields, POST/PATCH mutation | P-TRAINING-4 ✅ | 1 | ✅ | wireframe §Modal 1 | Modal 1 |
| P-TRAINING-6 | FE | `TrainingProgressModal.tsx` — 3-step timeline, quiz attempts table, Manager Notes PATCH | P-TRAINING-5 ✅ | 1 | ✅ | wireframe §Modal 2 | Modal 2 |
| P-TRAINING-7 | FE | `app/admin/training/page.tsx` — assemble all zones, wire modals, RBAC gate, browser golden path test | P-TRAINING-6 ✅ | 1 | ✅ | wireframe all zones | all zones |

---

## Phase P-MON — Client Order Monitoring Page

> **Owner:** BE + FE
> **Dependency:** P5 ✅ · P4 ✅
> **Status:** ⬜ NOT STARTED — 9 sessions estimated

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P-MON-BE-1 | BE | TBD | — | — | ⬜ | — |

---

## Critical Rules (Never Forget)

| Rule | Detail |
|---|---|
| No localStorage for tokens | Access token in Zustand memory only. Refresh token in httpOnly cookie. |
| No hardcoded colors | Use Tailwind classes (`text-orange-500`) not `#FF7A1A` |
| No hardcoded env vars | Always `os.Getenv()` in Go, `process.env.` in Next.js |
| Verify HMAC first | Payment webhooks: signature check is FIRST operation, before any DB access |
| Idempotent webhooks | Check `payment.status` before updating — gateways call multiple times |
| UUID strings not integers | All IDs are `string` in TypeScript, `string` in Go (CHAR(36)) |
| Correct field names | `price` not `base_price` · `image_path` not `image_url` · `created_by` not `staff_id` · `gateway_data` not `webhook_payload` · payment status `completed` not `success` |
| total_amount drift | Call `recalculateTotalAmount()` after EVERY order_items mutation |
| No order_items.status column | Derive from `qty_served` (0=pending, 0<x<qty=preparing, x=qty=done) |
| Payment only when ready | POST /payments must reject if `order.status ≠ 'ready'` |
| 1 table 1 active order | Check before INSERT into orders |
| Soft delete everywhere | `deleted_at` — never hard DELETE. All queries: `WHERE deleted_at IS NULL` |
