# Comparison Doc Tracker — Doc vs. Code

> One row per page that has a `/comparison-doc` set. Every 🔴 finding and every cross-page concern from
> a run MUST land here — no finding may live only inside a comparison file. **Code wins**; these are
> read-only audits, not fixes. The set per page = 3 files in the page folder:
> `COMPARISON_DOC_VS_CODE_DETAILED.md` (EN) · `..._DETAILED_VI.md` (VI mirror) ·
> `COMPARISON_VISUAL_MOCKUP_VI.md` (per-zone ①②③ + 📷 + 💬).
>
> Built by `/comparison-doc <page-folder-name>` — see `.claude/skills/comparison-doc/SKILL.md`.

| Page | Last Run | Branch | 🔴 | 🟡 | 🟢 | Files | Headline drift / concerns |
|---|---|---|---|---|---|---|---|
| customer_menu | 2026-06-20 | experience_claude.md_system_1_test_iphon2_change_code | 7 | 13 | 10 | [EN](customer/customer_menu/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](customer/customer_menu/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](customer/customer_menu/COMPARISON_VISUAL_MOCKUP_VI.md) | `MenuHeader` reads `useSettingsStore().tableLabel`, not `useCartStore.tableName` → table label blank after QR scan (real code bug); `TableConfirmModal` 201 handoff does **not** call `setActiveOrderId` (doc wrong); `ToppingModal` is dead code (0 imports) — nhân picked via inline pills; `ComboModal` rendered but unreachable; `OrderSummary` far richer than the I-zone ASCII (canh steppers + dish table + save-state note) |
| customer_combo_detail | 2026-06-20 | experience_claude.md_system_1_test_iphon2_change_code | 0 | 3 | 6 | [EN](customer/customer_combo_detail/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](customer/customer_combo_detail/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](customer/customer_combo_detail/COMPARISON_VISUAL_MOCKUP_VI.md) | **No 🔴 doc-vs-code contradiction — low-drift, source-traced doc-set.** Two CODE bugs re-confirmed (doc already documents them): unavailable-combo UI dead (`page.tsx:122-126,180-185`, BE filters `is_available=1`); sub-item shows raw UUID when sub-product unavailable (`page.tsx:45`). Doc drift: `_be.md` route lines stale — `GET /products` `:168→:181`, `GET /combos` `:216→:229`, combo writes `:215-227→:230-239`; Zone B ASCII draws price inline (code: separate line `page.tsx:129`); CTA copy "Thêm vào giỏ" vs real "Thêm vào giỏ hàng" |
| admin_summary | 2026-06-20 | experience_claude.md_system_1_test_iphon2_change_code | 0 | 5 | 40+ | [EN](admin/admin_summary/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](admin/admin_summary/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](admin/admin_summary/COMPARISON_VISUAL_MOCKUP_VI.md) | **No 🔴 — doc-set is a faithful mirror.** Every FE line-cite in `admin_summary.md`/`_loading.md`/`_crosspage_dataflow.md` matches `summary/page.tsx` exactly; all BE behavioural claims confirmed. Doc drift: `_be.md` route line-numbers stale ~13 lines (`adminR` at `main.go:307` not `:294`; `authMW` `:164` not `:151`); `admIngR` note omits 2nd DELETE (`DELETE /training/guides/:id`, `main.go:327`). Two doc-confirmed code-quality gaps (not drift): no `isError` on the 4 `useQuery` (skeleton hangs on error); raw `<a href="/admin/ingredients">` not `next/link` (`page.tsx:304`) |
| customer_product_detail | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 1 | 5 | 4 | [EN](customer/customer_product_detail/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](customer/customer_product_detail/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](customer/customer_product_detail/COMPARISON_VISUAL_MOCKUP_VI.md) | **🔴 code bug:** `CTAFooter` (`fixed bottom-0`, no z-index, `CTAFooter.tsx:12`) and shell `ClientBottomNav` (`fixed bottom-0 z-20`, `(shop)/layout.tsx:12`) collide on this route → nav paints over the CTA (ASCII draws them cleanly stacked). Doc drift: nav title "Chi tiết món"→**"Chi tiết sản phẩm"**; topping zone is a 2-col card grid + total line (not a checkbox list); unavailable CTA = **"Sản phẩm tạm hết"** not "Hết hàng"; `_be.md` `main.go` anchors stale (group `:180`/GET `:182` not `:167`/`:169`). Cross-page + loading + object-model docs ✅ accurate. `CTAFooter.loading?` prop dead. Screenshots ⏳ (stack down). |
| admin_overview | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 6 | 16 | ~30 | [EN](admin/admin_overview/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](admin/admin_overview/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](admin/admin_overview/COMPARISON_VISUAL_MOCKUP_VI.md) | **🔴 Zone B drawn wrong:** doc draws "TẤT CẢ đơn active (pending→delivered)" + `[Huỷ]` button, code (`WaitingSection.tsx:9,55`) shows **pending only**, no Huỷ. **🔴 delivered→cancelled 409 bug:** Huỷ button on `delivered` orders (`TableList.tsx:378-385`) → `handleAction(id,'cancelled')` → invalid BE transition (`order_service.go:524-529`). **🔴 dead WS branches** `order_updated`/`order_completed` (`useOverviewWS.ts:52,67`) BE never emits. **🔴 phantom `amount`** in `createPayment` (`admin.api.ts:181`, `TableList.tsx:292`) BE ignores. **🔴 dead props** `checkedTableIds`/`onToggleCheck` declared in `TableList` (`:246,248`) never destructured (`:254`). TableGrid missing pay/cancel (`page.tsx:381-390`). BE/loading/cross-component/cross-page docs **accurate** but all `file:line` stale (main.go routes +13) + provenance branch outdated. Screenshots ⏳ (stack down). |
| customer_table_qr | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 2 | 1 | 6 | [EN](customer/customer_table_qr/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](customer/customer_table_qr/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](customer/customer_table_qr/COMPARISON_VISUAL_MOCKUP_VI.md) | **Near-zero doc drift — most accurate set audited.** Both 🔴 are code/spec bugs the doc already flags, NOT doc errors: (1) `TABLE_HAS_ACTIVE_ORDER` dead in 3 FE files (`table/[tableId]/page.tsx:36`, `checkout/page.tsx:79`, `app/TableGrid.tsx:107`) — `ErrTableHasActiveOrder` (`errors.go:30`) never returned anywhere in `be/`; one-active-order rule (BUSINESS_RULES §2.3) unenforced (`order_service.go:256-275` + `order_handler.go:121` return 201+`table_busy`). (2) BUSINESS_RULES §5.2 rate-limit on `POST /auth/guest` not implemented (no middleware — `auth.go`/`metrics.go`/`rbac.go` only). 🟡 no axios timeout/abort → spinner can hang (`api-client.ts:6-9`, `page.tsx:16-44`). 🟢: storage-keys line refs (5→6, 4→3), `main.go` route refs ~+10-13 (158→171), stale provenance branch. Visual mockup: 2 zones (spinner+error) match exactly, screenshots ⏳ pending. |
| customer_order_list | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 4 | 7 | 22 | [EN](customer/customer_order_list/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](customer/customer_order_list/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](customer/customer_order_list/COMPARISON_VISUAL_MOCKUP_VI.md) | **One of the most code-accurate doc-sets in the repo** — almost every `file:line` in `_be.md`/`_crosspage_dataflow.md`/`_loading.md` is exact. **🔴 #1 DOC DRIFT:** Flag D stale — `order_items.filling` was **dropped** by migration `017_drop_order_item_filling.sql` (nhân backfilled into `toppings_snapshot`); gone from DB + serializer (`order_handler.go:358-370`) + FE type (`order.ts:15-27`); root `CLAUDE.md` OC-4 narrative also stale. **🔴 #2-4 CODE BUGS (doc already flags them, all re-verified):** `item_cancelled` SSE never handled FE-side (BE emits `order_service.go:642`, switch `useOrderSSE.ts:83-123` has no case); `isNotFound` returned (`useOrderSSE.ts:159`) but `OrderDetailSheet.tsx:45` never destructures it → 404 spins forever; `loadCachedOrders()` mount-only (`order/page.tsx:37-39`), overlay close (`:154`) doesn't re-scan → list cards stale after SSE update. 🟡 DishRow hides `toppings_snapshot`+`note` (`OrderDetailSheet.tsx:510-544`, **screenshot-proven**); overlay far richer (3 cards + 2 modals) than 1-line Zones entry; `OrderItem.flagged`/BE-only `item_status`+`created_by` mismatch; route-line offsets ~+13 (`main.go` group `:243-259`, `DELETE /orders/items/:id` `:264`); cart persist `version:5` (key keeps `cart-config-v3`). Screenshots ✅ captured. |
| customer_order_detail | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 2 | 8 | 5 | [EN](customer/customer_order_detail/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](customer/customer_order_detail/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](customer/customer_order_detail/COMPARISON_VISUAL_MOCKUP_VI.md) | **No 🔴 doc-vs-code contradiction — high-quality source-traced doc-set** (cross-page + loading + `_be.md` all accurate). Both 🔴 are CODE bugs the doc already documents (`ORDER_DETAIL_BUGS.md` Bug 1+2 · `_be.md` Flag 1-2): (1) `item_updated` published (`order_service.go:696`) but no case in `useOrderSSE` switch (`useOrderSSE.ts:83-123`) + dead `invalidateQueries(['order',id])` (`page.tsx:59`, no such `useQuery`) → quantity edits don't reflect live; (2) `item_cancelled` (`order_service.go:642`) + `items_added` (`:516`) same gap. `useOrderMonitorSSE` handles all three (`useOrderMonitorSSE.ts:84-86`) — gap is `useOrderSSE`-specific. **Dead code confirmed:** `order_init` SSE case (`useOrderSSE.ts:84-85`, no publisher emits it) + `row.notes` collected never rendered (`page.tsx:35,111,127-128`). **Doc drift confined to `.md` wireframe (Area 1):** nav draws `[StatusBadge]` but code shows LIVE/MẤT KẾT NỐI pill (StatusBadge is in order card `page.tsx:308`); order-card header omits `total_amount`+`Ẩn/Hiện`+"Mang về"; DishRow renders topping chips + `tổng/ra/còn`, NOT per-dish "· filling"; summary header "Chi tiết món" not "Tổng hợp món"; "Theo dõi bàn" button undrawn. **Model gap (🟡):** `filling` column dropped (016→017), FE `OrderItem` has none (`types/order.ts:24`); nhân backfilled into `toppings_snapshot`, canh-rau in `note` — same as `customer_order_list` 🔴 #1. Screenshots ⏳ (stack down). |
| customer_tracking | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 3 | 7 | 7 | [EN](customer/customer_tracking/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](customer/customer_tracking/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](customer/customer_tracking/COMPARISON_VISUAL_MOCKUP_VI.md) | **Textual doc-set (`_be.md`/`_loading.md`/`_crosscomponent`/`TRACKING_BUGS.md`) unusually accurate — drift is concentrated in the `customer_tracking.md` ASCII wireframe.** **🔴 (doc)** `OrderDetailCard` ASCII draws per-item cooking progress `ra 1/2`/`còn 1`; code renders priced line-items + total footer, **no progress** (`OrderDetailCard.tsx:36-64,67-74`). **🔴 (doc)** `WholeFloorPrepList` ASCII draws `▓▓▓▓░░` progress bars + a `Mang về` row; code renders position# + `tableLabel` + `StatusBadge` + order-number suffix, header "Hàng chờ phục vụ" + "{N} bàn" (`WholeFloorPrepList.tsx:27-82`). **🔴 (code bug, doc-confirmed)** live status badge dead: FE listens `case 'order.status'` (`useOrderMonitorSSE.ts:67`), BE only publishes `order_status_changed` (`order_service.go:552,:745`) — `order.status` exists only in a comment (`monitor_handler.go:17`) → badge falls back to last `GET /orders/:id` (`page.tsx:44`). **NEW this refresh:** `ServiceQueueList.tsx`+`ServiceQueueItem.tsx` are dead (0 external imports — superseded by `WholeFloorPrepList`). Also dead: `tableStatuses`/`reconnect()`/`RECONNECT.showBannerAfter` (`useOrderMonitorSSE.ts:11,82,120`). Screenshots ⏳ (stack down). |
| admin_staff | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 0 | 8 | 47+ | [EN](admin/admin_staff/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](admin/admin_staff/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](admin/admin_staff/COMPARISON_VISUAL_MOCKUP_VI.md) | **No 🔴 — FE & BE agree on every route, shape, and guard.** All guards confirmed: manager+ group, admin-only `DELETE`, create/update role-hierarchy, self-deactivation block, last-admin guard, `Del(auth:staff:<id>)` lockout; `performance_score: 0` is a hardcoded stub (`staff_handler.go:250`, no column — Flag 8 holds). **Genuine visual drift (doc fix):** `admin_staff.md` ASCII draws StatsBar as 5 role cards (code renders **4**, role folded into "Theo vai trò" subLabel `StaffStatsBar.tsx:31-50`) + row actions as 4 grouped emoji (code = text buttons + separate toggle column `StaffTable.tsx:123-159`). BE line-cites stale (`main.go` group `:280→:293`, DELETE sub-group `:287-290→:300-304`; `staff_service` `:203→:204`, `:236-238→:237-239`; repo `CountAdmins`↔`SoftDeleteStaff` transposed). Doc-confirmed code gap (not drift): `StaffDetailDrawer` has no `isError` branch (`:54-66`). |
| customer_settings | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 1 | 4 | 4 | [EN](customer/customer_settings/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](customer/customer_settings/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](customer/customer_settings/COMPARISON_VISUAL_MOCKUP_VI.md) | **Low-drift; doc-set is a single file (`customer_settings.md`).** **🔴 doc drift (NOT a code bug):** Key Interactions claims Lưu "navigates back" — `handleSave` (`menu/settings/page.tsx:14-19`) only writes the store + shows "Đã lưu!" toast for 2s; **no navigation** (back arrow `page.tsx:26` is the only `router.back()`). ASCII copy stale: name label "Tên của bạn"→**"Tên hiển thị"** (`page.tsx:39`); save "💾 Lưu"→**"Lưu cài đặt"**/"Đã lưu!" (`page.tsx:74`); ASCII omits both helper-texts (`page.tsx:49,65`) + the saved-state toggle. Bottom-nav "Cài Đặt" tab ✅ (`ClientBottomNav.tsx:91-98`); no BE calls ✅; store persisted via `CUSTOMER_SETTINGS='customer-settings'` ✅. Areas 4 (loading) + 5 (FE⇄BE) N/A. Screenshots ⏳ (stack down). |

## Cross-Page Concerns
<!-- findings that touch >1 page: a shared store field, a shared hook/SSE, a shared endpoint, or a bug root.
     Name the pages + the shared file:line + whether it's a doc drift or a code bug + where it's logged. -->

- **Shared settings store `settings.ts` — customer_settings is the ONLY writer, customer_menu is the
  reader (root of customer_menu 🔴 #1).** `useSettingsStore` (`store/settings.ts`, persisted via
  `CUSTOMER_SETTINGS='customer-settings'`) holds `customerName` + `tableLabel`. The **customer_settings**
  page is the sole place that calls `setTableLabel` (`menu/settings/page.tsx:15`); `setCustomerName` is
  also called by `useCustomerProfile.ts:51` (from a profile fetch) but `tableLabel` is **never set
  automatically** — grep confirms `setTableLabel` has no other caller. Readers: **customer_menu**
  `MenuHeader.tsx:28` (`tableLabel`) + `CartDrawer.tsx:77-79` (`customerName`+`tableLabel`). This is
  exactly why customer_menu's 🔴 #1 holds — `MenuHeader` shows `tableLabel` from this store, which stays
  **blank after a QR scan** because nothing but this manual settings page ever fills it. **No drift on
  customer_settings; the shared-store coupling is the root cause logged in customer_menu's headline #1.**
  Re-check on customer_menu + customer_checkout future runs.
- **Shared cart→order builder `order-payload.ts:27-58`** (`buildOrderItemsPayload`) — used by both
  **customer_combo_detail** (combo handoff) and **customer_menu** (CartDrawer/checkout). It is the
  single converter; a combo added on `/menu/combo/:id` rides it unchanged. **No drift** — both pages'
  docs describe it correctly; flagged here only because it's a shared dependency to re-check on either
  page's future runs.
- **Shared cart store `cart.ts` `partialize:153`** — persists only `orderNote` + `activeOrderId`;
  `items[]` is session-only. Affects **customer_combo_detail** (combo lost on F5 before submit) and
  **customer_menu** (same), and **customer_table_qr** (the airlock writes `tableId`/`tableName` here —
  also excluded from `partialize`, so an F5 anywhere downstream severs the QR session, by design).
  Doc-accurate on all three. Note the harmless mismatch: `STORAGE_KEYS.CART_CONFIG
  = 'cart-config-v3'` (`storage-keys.ts:6`) vs persist `version: 5` (`cart.ts:129`) — a frozen literal,
  not a code bug.
- **Dead `TABLE_HAS_ACTIVE_ORDER` error code + unenforced one-active-order rule (code bug, root)** —
  `ErrTableHasActiveOrder` (`be/internal/service/errors.go:30`) is defined but **never returned
  anywhere in `be/`** (grep → only the definition). Three FE files special-case it and are therefore
  **all dead**: **customer_table_qr** (`table/[tableId]/page.tsx:36`, re-scan never rejoins existing
  order), **customer_checkout** (`(shop)/checkout/page.tsx:79`), and the POS table grid
  (`app/TableGrid.tsx:107`). `CreateOrder` (`order_service.go:256-275`) treats a busy table as an
  informational `tableBusy` flag and returns `201`+`table_busy` (`order_handler.go:121`), so multiple
  concurrent orders per table are allowed — BUSINESS_RULES §2.3 is **unenforced in code**. **Code bug
  needing a product decision** (BE auto-rejoin vs. FE delete dead branches); logged in
  `customer_table_qr/TABLE_QR_BUGS.md` Bug 1 + `customer_table_qr/COMPARISON_DOC_VS_CODE_DETAILED.md`
  headline #1. Re-check on customer_checkout + staff_pos future runs.
- **Recurring `_be.md` route-line drift in `be/cmd/server/main.go`** — **customer_combo_detail**
  (`GET /products` `:168→:181`, `GET /combos` `:216→:229`), **admin_summary** (`adminR` block
  `:294→:307`, `authMW` `:151→:164`), **customer_product_detail** (`/products` group
  `:167→:180`, `GET /:id` `:169→:182`), **customer_table_qr** (`/auth/guest` route
  `:158→:171`, `protected` group `:159-164→:173-177`, CORS `:126→:133`), and now **admin_staff**
  (`/staff` group `:280-281→:293-294`, admin `DELETE` sub-group `:287-290→:300-304`; plus
  `staff_service.go` `:203→:204`/`:236-238→:237-239` and the **transposed** repo pair
  `CountAdmins`↔`SoftDeleteStaff` `:240`/`:253`) all cite stale `main.go`/Go line numbers because the
  files grow above their route block over time. **Doc drift, not a code bug** — but a systematic one: any page
  whose `_be.md` cites `main.go` route lines should re-verify them on each run. Consider citing the
  route *group* + handler name instead of an absolute `main.go` line where possible.
- **Shared customer shell `(shop)/layout.tsx:11-12` renders `ClientBottomNav` (`fixed bottom-0 z-20`)
  on EVERY `(shop)` route** — affects **customer_product_detail** (a 🔴: the page's own `CTAFooter`
  is also `fixed bottom-0` with no z-index, `CTAFooter.tsx:12`, so the nav overlaps the CTA) and
  potentially any other shop page that adds its own fixed bottom bar. **Code bug on
  customer_product_detail; a layout invariant to check** on every shop page whose comparison run finds
  a sticky footer (checkout, order detail). Logged in
  `customer_product_detail/COMPARISON_DOC_VS_CODE_DETAILED.md` headline #1.
- **Shared `staff` row + `GET /staff` list + `auth:staff:<id>` cache — admin_staff is the writer, 4
  surfaces are readers.** A write on **admin_staff** (`staff_service.go` endpoints 3-6) ripples to:
  (1) the **auth middleware** (`auth.go:55` → `IsStaffActive` `auth_service.go:315-334`) — a
  deactivate/delete `Del`s `auth:staff:<id>` for immediate lockout; (2) **login** (`GetStaffByUsername`
  + `is_active`); (3) the **admin_todo_list** (`TodoPageClient.tsx:37`) and **admin_task_board**
  (`CreateTaskModal.tsx:41`) assignee dropdowns (same `GET /staff`, filter `deleted_at IS NULL` only —
  so a *deactivated* staff is still assignable, doc Flag); (4) **admin_summary** staff-performance
  (different endpoint, same rows). **No drift — all doc-accurate**, but the `GET /staff` shape +
  `is_active`/`deleted_at` semantics are a shared contract to re-verify on admin_todo_list,
  admin_task_board, and staff_login future runs. Pull-only (no SSE/WS for staff).
- **Shared live-orders WS hub `useOverviewWS.ts` + `OrdersWSContext` (channel `orders:kds`)** — the
  same channel feeds **admin_overview** AND **staff_kds** (both subscribe `orders:kds`,
  `websocket/handler.go:23`). `useOverviewWS.ts:52,67` carry **dead branches** `order_updated` /
  `order_completed` that the BE never publishes (BE emits only `order_status_changed` /
  `order_cancelled` / `payment_success` / `item_*` — grep `order_service.go`/`payment_service.go`).
  **Code cleanup**, logged in `admin_overview/COMPARISON_DOC_VS_CODE_DETAILED.md` headline #3 — re-check
  when staff_kds gets its run (it may share the same dead-event assumption).
- **TOP epic / migration `017_drop_order_item_filling.sql` made `order_items.filling` obsolete repo-wide
  (doc drift, root file affected).** The column was added by migration 016 (OC epic) then **dropped** by
  017, which backfills nhân (thịt/mộc nhĩ) into `toppings_snapshot` as a topping entry. **customer_order_list**
  Flag D + the **root `CLAUDE.md`** "OC-4 read views render filling" narrative both still describe the
  pre-017 world. All code layers are now consistent via `toppings_snapshot` (no `filling` in DB, serializer
  `order_handler.go:358-370`, or FE `order.ts:15-27`). Any order-related doc (`staff_kds`, `staff_pos`,
  `customer_tracking`, `customer_order_detail`) that mentions `filling` is stale — re-check on their runs.
  **Doc fix only**, not a code bug.
- **Shared SSE hook `useOrderSSE.ts` event-name contract is incomplete (code bug, root).** The FE switch
  (`useOrderSSE.ts:83-123`) handles `order_init` / `order_status_changed` / `order_cancelled` /
  `item_progress` / `order_completed`, but the BE also publishes **three more** the switch ignores:
  **`item_cancelled`** on `DELETE /orders/items/:id` (`order_service.go:642`), **`item_updated`** on
  `PATCH /orders/items/:id/quantity` (`:696`), and **`items_added`** on `POST /orders/:id/items` (`:516`)
  — so a cancelled item, a quantity edit, and added dishes all fail to reflect live (reconcile only on
  reload). `useOrderSSE` drives the **customer_order_detail** standalone page (its primary user — the
  stepper that fires `item_updated` is unique to it, `page.tsx:361,385`) **and** the **customer_order_list**
  overlay; the sibling **`useOrderMonitorSSE`** (customer_tracking) already handles all three
  (`useOrderMonitorSSE.ts:84-86`), so the gap is `useOrderSSE`-specific. `order_init` is also **dead** (no
  publisher emits it). The BE order-event vocabulary (`publishOrderEvent`, `order_service.go:806-819`) is
  the shared contract to re-verify. **One re-fetch-on-unhandled-event fix closes all three gaps on both
  pages.** Logged in `customer_order_list/COMPARISON_DOC_VS_CODE_DETAILED.md` headline #2 +
  `customer_order_detail/COMPARISON_DOC_VS_CODE_DETAILED.md` headlines #1-2 + `ORDER_DETAIL_BUGS.md`.
- **Order item serializer extras `item_status` + `created_by` + missing `flagged` (FE⇄BE contract drift).**
  The serializer (`order_handler.go:358-388`) emits `item_status` (`:367`, consumed by **staff_kds**, not by
  customer pages which re-derive via `deriveItemStatus()` `order.ts:9-13`) and `created_by` (`:384`), neither
  in FE `OrderItem`/`Order`; conversely FE `OrderItem.flagged` (`order.ts:27`) is **never emitted** by BE →
  always `undefined`. Touches every page that reads an order item (**customer_order_list**, **staff_kds**,
  **staff_pos**, **customer_tracking**). Reconcile the `OrderItem` type vs the serializer on a future run.
- **Order status machine `validTransitions` (`order_service.go:524-529`)** is the single source for
  every status-button gate across **admin_overview** (Zone B/D), **staff_kds**, **staff_pos** and
  customer tracking. **admin_overview** ships a real bug against it: a **Huỷ** button on `delivered`
  orders (`TableList.tsx:378-385`) that the machine rejects (`delivered: {paid}` only) → guaranteed
  `409`. Any other page offering a `delivered → cancelled` action shares this bug. Logged in
  `admin_overview/COMPARISON_DOC_VS_CODE_DETAILED.md` headline #2.
- **`order.status` SSE event type is never published — live status badge dead (code bug, root).** The
  monitor hook `useOrderMonitorSSE.ts:67` (driving **customer_tracking**) switches on
  `case 'order.status'`, but **no BE code emits that type** — every status transition publishes
  `type:"order_status_changed"` on `order:<id>` (`order_service.go:552,:745` via `publishOrderEvent`);
  `order.status` survives only as a stale doc-comment in `monitor_handler.go:17` (and the same wrong name
  in the FE-facing event list at `monitor_handler.go:17-19`). So `orderStatus` stays `null` and the badge
  silently falls back to the last `GET /orders/:id` snapshot (`page.tsx:44`), advancing only when an
  `items_*` event happens to force a refetch. The **same `/sse/order-monitor/:id` route is reused by the
  admin floor monitor** (`REALTIME_SSE.md:135`), and **customer_menu**'s
  `customer_menu_crosspage_dataflow.md:271,284` lists `order.status` as a real wire event — it documents
  the FE's broken expectation, not the wire. **Code bug, 1-line FE fix** (`case 'order_status_changed'`);
  logged in `customer_tracking/TRACKING_BUGS.md` Bug 1 +
  `customer_tracking/COMPARISON_DOC_VS_CODE_DETAILED.md` headline #3. Re-check on any future admin
  floor-monitor / staff_kds run that reuses the SSE monitor.

---

## Pages — Copy-Paste Queue

> Every page folder under `08_pages/`. Copy the command, paste it, run. Mark **Status** ✅ when its
> 3-file set is done (and add its row to the table above). 33 pages · 9 done · 24 to go.

### customer/ (13)

| Status | Page | Command |
|---|---|---|
| ✅ | customer_menu | `/comparison-doc customer_menu` |
| ⬜ | customer_welcome | `/comparison-doc customer_welcome` |
| ✅ | customer_table_qr | `/comparison-doc customer_table_qr` |
| ⬜ | customer_introduction | `/comparison-doc customer_introduction` |
| ✅ | customer_product_detail | `/comparison-doc customer_product_detail` |
| ✅ | customer_combo_detail | `/comparison-doc customer_combo_detail` |
| ⬜ | customer_favourites | `/comparison-doc customer_favourites` |
| ⬜ | customer_checkout | `/comparison-doc customer_checkout` |
| ✅ | customer_order_list | `/comparison-doc customer_order_list` |
| ✅ | customer_order_detail | `/comparison-doc customer_order_detail` |
| ✅ | customer_tracking | `/comparison-doc customer_tracking` |
| ⬜ | customer_profile | `/comparison-doc customer_profile` |
| ✅ | customer_settings | `/comparison-doc customer_settings` |

### staff/ (5)

| Status | Page | Command |
|---|---|---|
| ⬜ | staff_login | `/comparison-doc staff_login` |
| ⬜ | staff_register | `/comparison-doc staff_register` |
| ⬜ | staff_kds | `/comparison-doc staff_kds` |
| ⬜ | staff_pos | `/comparison-doc staff_pos` |
| ⬜ | staff_cashier_payment | `/comparison-doc staff_cashier_payment` |

### admin/ (13)

| Status | Page | Command |
|---|---|---|
| ✅ | admin_overview | `/comparison-doc admin_overview` |
| ✅ | admin_summary | `/comparison-doc admin_summary` |
| ⬜ | admin_products | `/comparison-doc admin_products` |
| ⬜ | admin_categories | `/comparison-doc admin_categories` |
| ⬜ | admin_toppings | `/comparison-doc admin_toppings` |
| ⬜ | admin_combos | `/comparison-doc admin_combos` |
| ⬜ | admin_ingredients | `/comparison-doc admin_ingredients` |
| ⬜ | admin_storage | `/comparison-doc admin_storage` |
| ✅ | admin_staff | `/comparison-doc admin_staff` |
| ⬜ | admin_task_board | `/comparison-doc admin_task_board` |
| ⬜ | admin_todo_list | `/comparison-doc admin_todo_list` |
| ⬜ | admin_training | `/comparison-doc admin_training` |
| ⬜ | admin_marketing | `/comparison-doc admin_marketing` |

### public/ (2)

| Status | Page | Command |
|---|---|---|
| ⬜ | public_landing | `/comparison-doc public_landing` |
| ⬜ | public_legal | `/comparison-doc public_legal` |

> **Run all in one go:** paste them in sequence, or batch via `/loop` —
> `/loop /comparison-doc <next ⬜ page>` and advance through the queue.
