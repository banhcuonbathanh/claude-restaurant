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
| admin_ingredients | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 3 | 6 | 9 | [EN](admin/admin_ingredients/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](admin/admin_ingredients/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](admin/admin_ingredients/COMPARISON_VISUAL_MOCKUP_VI.md) | **`_be.md` is highly source-faithful (all per-endpoint line-cites exact, all SQL bodies match); `admin_ingredients.md` (FE wireframe) drifted badly.** **🔴 #1 code bug:** the entire Nhập/Xuất stock-movement feature is **unreachable** — `StockMoveModal` (`page.tsx:28-104,218`) is gated on `modal==='move'` which nothing ever sets (only `'add'`/`'edit'` at `:182,204`); no Nhập/Xuất button in `IngredientTable` (props only `onEdit`/`onDelete` `:4-8`); own comment admits "outside main spec" (`:19`); `postStockMovement` + BE `POST /admin/stock-movements` therefore dead. **🔴 #2 doc drift:** table is **8 cols** (STT/Tên/Đơn vị/Số lượng tồn/Ngày nhập/Hạn SD/Trạng thái-badge/Thao tác `IngredientTable.tsx:57-64`) — doc ASCII draws 4 + no status badge. **🔴 #3 code bug:** `GET`/`PATCH /ingredients/:id` on missing id returns **500 not documented 404** — repo wraps `sql.ErrNoRows` with `%w` (`ingredient_repo.go:147`) but service tests `== sql.ErrNoRows` not `errors.Is` (`ingredient_service.go:69`), `handleServiceError` no ErrNoRows fallback (`respond.go:24-36`); DELETE OK (raw ErrNoRows `:216`). 🟡 FK is `ON DELETE CASCADE` not RESTRICT (`009_ingredients.sql:22-23,38`) **and** delete is soft `UPDATE deleted_at` → doc's "RESTRICT→1451→500" reasoning wrong; real risk = dangling `product_ingredients` refs, not a 500; route block `293-313→307-328`; `admIngR` sub-group also wraps `DELETE /training/guides/:id`; dead 409/422 toasts (BE emits neither). Screenshots ⏳ (stack down). |
| admin_summary | 2026-06-20 | experience_claude.md_system_1_test_iphon2_change_code | 0 | 5 | 40+ | [EN](admin/admin_summary/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](admin/admin_summary/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](admin/admin_summary/COMPARISON_VISUAL_MOCKUP_VI.md) | **No 🔴 — doc-set is a faithful mirror.** Every FE line-cite in `admin_summary.md`/`_loading.md`/`_crosspage_dataflow.md` matches `summary/page.tsx` exactly; all BE behavioural claims confirmed. Doc drift: `_be.md` route line-numbers stale ~13 lines (`adminR` at `main.go:307` not `:294`; `authMW` `:164` not `:151`); `admIngR` note omits 2nd DELETE (`DELETE /training/guides/:id`, `main.go:327`). Two doc-confirmed code-quality gaps (not drift): no `isError` on the 4 `useQuery` (skeleton hangs on error); raw `<a href="/admin/ingredients">` not `next/link` (`page.tsx:304`) |
| customer_product_detail | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 1 | 5 | 4 | [EN](customer/customer_product_detail/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](customer/customer_product_detail/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](customer/customer_product_detail/COMPARISON_VISUAL_MOCKUP_VI.md) | **🔴 code bug:** `CTAFooter` (`fixed bottom-0`, no z-index, `CTAFooter.tsx:12`) and shell `ClientBottomNav` (`fixed bottom-0 z-20`, `(shop)/layout.tsx:12`) collide on this route → nav paints over the CTA (ASCII draws them cleanly stacked). Doc drift: nav title "Chi tiết món"→**"Chi tiết sản phẩm"**; topping zone is a 2-col card grid + total line (not a checkbox list); unavailable CTA = **"Sản phẩm tạm hết"** not "Hết hàng"; `_be.md` `main.go` anchors stale (group `:180`/GET `:182` not `:167`/`:169`). Cross-page + loading + object-model docs ✅ accurate. `CTAFooter.loading?` prop dead. Screenshots ⏳ (stack down). |
| admin_overview | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 6 | 16 | ~30 | [EN](admin/admin_overview/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](admin/admin_overview/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](admin/admin_overview/COMPARISON_VISUAL_MOCKUP_VI.md) | **🔴 Zone B drawn wrong:** doc draws "TẤT CẢ đơn active (pending→delivered)" + `[Huỷ]` button, code (`WaitingSection.tsx:9,55`) shows **pending only**, no Huỷ. **🔴 delivered→cancelled 409 bug:** Huỷ button on `delivered` orders (`TableList.tsx:378-385`) → `handleAction(id,'cancelled')` → invalid BE transition (`order_service.go:524-529`). **🔴 dead WS branches** `order_updated`/`order_completed` (`useOverviewWS.ts:52,67`) BE never emits. **🔴 phantom `amount`** in `createPayment` (`admin.api.ts:181`, `TableList.tsx:292`) BE ignores. **🔴 dead props** `checkedTableIds`/`onToggleCheck` declared in `TableList` (`:246,248`) never destructured (`:254`). TableGrid missing pay/cancel (`page.tsx:381-390`). BE/loading/cross-component/cross-page docs **accurate** but all `file:line` stale (main.go routes +13) + provenance branch outdated. Screenshots ⏳ (stack down). |
| customer_table_qr | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 2 | 1 | 6 | [EN](customer/customer_table_qr/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](customer/customer_table_qr/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](customer/customer_table_qr/COMPARISON_VISUAL_MOCKUP_VI.md) | **Near-zero doc drift — most accurate set audited.** Both 🔴 are code/spec bugs the doc already flags, NOT doc errors: (1) `TABLE_HAS_ACTIVE_ORDER` dead in 3 FE files (`table/[tableId]/page.tsx:36`, `checkout/page.tsx:79`, `app/TableGrid.tsx:107`) — `ErrTableHasActiveOrder` (`errors.go:30`) never returned anywhere in `be/`; one-active-order rule (BUSINESS_RULES §2.3) unenforced (`order_service.go:256-275` + `order_handler.go:121` return 201+`table_busy`). (2) BUSINESS_RULES §5.2 rate-limit on `POST /auth/guest` not implemented (no middleware — `auth.go`/`metrics.go`/`rbac.go` only). 🟡 no axios timeout/abort → spinner can hang (`api-client.ts:6-9`, `page.tsx:16-44`). 🟢: storage-keys line refs (5→6, 4→3), `main.go` route refs ~+10-13 (158→171), stale provenance branch. Visual mockup: 2 zones (spinner+error) match exactly, screenshots ⏳ pending. |
| customer_order_list | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 4 | 7 | 22 | [EN](customer/customer_order_list/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](customer/customer_order_list/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](customer/customer_order_list/COMPARISON_VISUAL_MOCKUP_VI.md) | **One of the most code-accurate doc-sets in the repo** — almost every `file:line` in `_be.md`/`_crosspage_dataflow.md`/`_loading.md` is exact. **🔴 #1 DOC DRIFT:** Flag D stale — `order_items.filling` was **dropped** by migration `017_drop_order_item_filling.sql` (nhân backfilled into `toppings_snapshot`); gone from DB + serializer (`order_handler.go:358-370`) + FE type (`order.ts:15-27`); root `CLAUDE.md` OC-4 narrative also stale. **🔴 #2-4 CODE BUGS (doc already flags them, all re-verified):** `item_cancelled` SSE never handled FE-side (BE emits `order_service.go:642`, switch `useOrderSSE.ts:83-123` has no case); `isNotFound` returned (`useOrderSSE.ts:159`) but `OrderDetailSheet.tsx:45` never destructures it → 404 spins forever; `loadCachedOrders()` mount-only (`order/page.tsx:37-39`), overlay close (`:154`) doesn't re-scan → list cards stale after SSE update. 🟡 DishRow hides `toppings_snapshot`+`note` (`OrderDetailSheet.tsx:510-544`, **screenshot-proven**); overlay far richer (3 cards + 2 modals) than 1-line Zones entry; `OrderItem.flagged`/BE-only `item_status`+`created_by` mismatch; route-line offsets ~+13 (`main.go` group `:243-259`, `DELETE /orders/items/:id` `:264`); cart persist `version:5` (key keeps `cart-config-v3`). Screenshots ✅ captured. |
| customer_order_detail | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 2 | 8 | 5 | [EN](customer/customer_order_detail/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](customer/customer_order_detail/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](customer/customer_order_detail/COMPARISON_VISUAL_MOCKUP_VI.md) | **No 🔴 doc-vs-code contradiction — high-quality source-traced doc-set** (cross-page + loading + `_be.md` all accurate). Both 🔴 are CODE bugs the doc already documents (`ORDER_DETAIL_BUGS.md` Bug 1+2 · `_be.md` Flag 1-2): (1) `item_updated` published (`order_service.go:696`) but no case in `useOrderSSE` switch (`useOrderSSE.ts:83-123`) + dead `invalidateQueries(['order',id])` (`page.tsx:59`, no such `useQuery`) → quantity edits don't reflect live; (2) `item_cancelled` (`order_service.go:642`) + `items_added` (`:516`) same gap. `useOrderMonitorSSE` handles all three (`useOrderMonitorSSE.ts:84-86`) — gap is `useOrderSSE`-specific. **Dead code confirmed:** `order_init` SSE case (`useOrderSSE.ts:84-85`, no publisher emits it) + `row.notes` collected never rendered (`page.tsx:35,111,127-128`). **Doc drift confined to `.md` wireframe (Area 1):** nav draws `[StatusBadge]` but code shows LIVE/MẤT KẾT NỐI pill (StatusBadge is in order card `page.tsx:308`); order-card header omits `total_amount`+`Ẩn/Hiện`+"Mang về"; DishRow renders topping chips + `tổng/ra/còn`, NOT per-dish "· filling"; summary header "Chi tiết món" not "Tổng hợp món"; "Theo dõi bàn" button undrawn. **Model gap (🟡):** `filling` column dropped (016→017), FE `OrderItem` has none (`types/order.ts:24`); nhân backfilled into `toppings_snapshot`, canh-rau in `note` — same as `customer_order_list` 🔴 #1. Screenshots ⏳ (stack down). |
| customer_tracking | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 3 | 7 | 7 | [EN](customer/customer_tracking/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](customer/customer_tracking/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](customer/customer_tracking/COMPARISON_VISUAL_MOCKUP_VI.md) | **Textual doc-set (`_be.md`/`_loading.md`/`_crosscomponent`/`TRACKING_BUGS.md`) unusually accurate — drift is concentrated in the `customer_tracking.md` ASCII wireframe.** **🔴 (doc)** `OrderDetailCard` ASCII draws per-item cooking progress `ra 1/2`/`còn 1`; code renders priced line-items + total footer, **no progress** (`OrderDetailCard.tsx:36-64,67-74`). **🔴 (doc)** `WholeFloorPrepList` ASCII draws `▓▓▓▓░░` progress bars + a `Mang về` row; code renders position# + `tableLabel` + `StatusBadge` + order-number suffix, header "Hàng chờ phục vụ" + "{N} bàn" (`WholeFloorPrepList.tsx:27-82`). **🔴 (code bug, doc-confirmed)** live status badge dead: FE listens `case 'order.status'` (`useOrderMonitorSSE.ts:67`), BE only publishes `order_status_changed` (`order_service.go:552,:745`) — `order.status` exists only in a comment (`monitor_handler.go:17`) → badge falls back to last `GET /orders/:id` (`page.tsx:44`). **NEW this refresh:** `ServiceQueueList.tsx`+`ServiceQueueItem.tsx` are dead (0 external imports — superseded by `WholeFloorPrepList`). Also dead: `tableStatuses`/`reconnect()`/`RECONNECT.showBannerAfter` (`useOrderMonitorSSE.ts:11,82,120`). Screenshots ⏳ (stack down). |
| customer_favourites | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 2 | 7 | 6 | [EN](customer/customer_favourites/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](customer/customer_favourites/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](customer/customer_favourites/COMPARISON_VISUAL_MOCKUP_VI.md) | **All drift is in the one hand-drawn `customer_favourites.md`; the 4 behavioural docs (`_crosscomponent`/`_crosspage`/`_loading`/`_be`) are a near-perfect source-traced mirror.** 🔴 #1 wireframe's `[+ Giỏ]` per-card add-to-cart (`customer_favourites.md:20-21,53`) does **not** exist — `FavouriteItemCard.tsx:8-12` has only `onRemove`+`onQtyChange`; cart add is bulk-only (`page.tsx:97-122`). 🔴 #2 both footers `fixed bottom-0 z-20` (`FavouritesFooter.tsx:12`, `save/page.tsx:103`) collide with shell `ClientBottomNav` (`fixed bottom-0 z-20`, `ClientBottomNav.tsx:48`) → nav paints over the list CTA + the entire save footer (same root as customer_product_detail 🔴; wireframe hides it, `customer_favourites.md:32-34`). 🟡 TopNav titles/filter labels/`SetCard` actions ("Áp dụng" not "Thêm vào giỏ"; rename omitted)/`_be.md` `main.go` route lines stale (`:167-168`→`:180-181`, `:215-216`→`:228-229` — service/handler cites all correct). Dead: `useFavouritesStore.addItem` (0 callers; `toggleFav` is the API). Screenshots ⏳ (stack down). |
| admin_toppings | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 0 | 3 | 7 | [EN](admin/admin_toppings/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](admin/admin_toppings/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](admin/admin_toppings/COMPARISON_VISUAL_MOCKUP_VI.md) | **No 🔴 — faithful, source-accurate doc-set.** Every endpoint/handler/service/repo/SQL/migration line in `_be.md` matches Go **exactly** (handler `product_handler.go:57,253,277,298,316`; service `product_service.go:432,452,467,486`; SQL `products.sql:64-91`; migration `002_products.sql:41-60`). Doc's `Flags` already document every real code gap: dead 409 branch (`toppings.name` has **no unique key** `002_products.sql:41-52`, `CreateTopping` no dup-check → BE never sends 409, `ToppingFormModal.tsx:55-57`); raw-SQL `UpdateToppingAvailability` (`product_repo.go:156-159`, bypasses sqlc); stale `product:<id>` (topping writes Del only `toppings:list`+`products:list`, **not** `product:<id>` — `product_service.go:719-721` vs key `:213`) → customer product-detail stale ≤5min; no in-use delete guard. **Drift:** `main.go` route block stale ~+13 (toppings group `:200-212→:213-225`; `/products/all` `:173→:186`, `prodR` `:167→:180`); `_loading.md:193` links a non-existent `_crosscomponent_dataflow.md`; ASCII abbreviations ("SP"→"sản phẩm", unrendered "Hành động" header `ToppingTable.tsx:36`). Screenshots ⏳ (stack down). |
| admin_products | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 4 | 36 | 85+ | [EN](admin/admin_products/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](admin/admin_products/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](admin/admin_products/COMPARISON_VISUAL_MOCKUP_VI.md) | **3 doc-drift 🔴 + 1 code-bug 🔴.** 🔴 Wireframe (`admin_products.md:18-23`) omits the whole **Topping** column (`ProductsTable.tsx:37,67-83`) + labels status "Còn hàng" vs code "Trạng thái" (`:39`). 🔴 Modal wireframe (`admin_products.md:26`) draws a "công tắc còn hàng" that **does not exist** (`ProductFormModal.tsx` — no `is_available` in schema `:15-22`/payload `:104`). 🔴 `_loading.md:88-91`+Flag 3 & `_crosscomponent.md:423-426` claim the modal lazy-loads on open, but `page.tsx:130-135` renders it **unconditionally** → chunk + 2 sub-queries (`ProductFormModal.tsx:39-48`) fire on page mount. 🔴 **Bug 1 (code)**: availability badge always 400s — `main.go:189`→`UpdateProduct` (requires name/price/category_id); `ToggleProductAvailability` (`products.sql.go:667-676`)+repo (`product_repo.go:82-84`) unwired. Bug 2 (`is_available` dropped on create, `products.sql.go:82-83`) + Bug 3 (no DELETE active-order guard → dead FE 409 `page.tsx:36-37`) re-confirmed. **Combined insight:** no working UI path to set availability (broken badge + no modal switch). Behavioural docs (`_be`/`_crosscomponent`/`_crosspage`/`_loading`) otherwise accurate; only `main.go` route lines stale (~+13). Screenshots ⏳ (stack down). |
| admin_staff | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 0 | 8 | 47+ | [EN](admin/admin_staff/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](admin/admin_staff/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](admin/admin_staff/COMPARISON_VISUAL_MOCKUP_VI.md) | **No 🔴 — FE & BE agree on every route, shape, and guard.** All guards confirmed: manager+ group, admin-only `DELETE`, create/update role-hierarchy, self-deactivation block, last-admin guard, `Del(auth:staff:<id>)` lockout; `performance_score: 0` is a hardcoded stub (`staff_handler.go:250`, no column — Flag 8 holds). **Genuine visual drift (doc fix):** `admin_staff.md` ASCII draws StatsBar as 5 role cards (code renders **4**, role folded into "Theo vai trò" subLabel `StaffStatsBar.tsx:31-50`) + row actions as 4 grouped emoji (code = text buttons + separate toggle column `StaffTable.tsx:123-159`). BE line-cites stale (`main.go` group `:280→:293`, DELETE sub-group `:287-290→:300-304`; `staff_service` `:203→:204`, `:236-238→:237-239`; repo `CountAdmins`↔`SoftDeleteStaff` transposed). Doc-confirmed code gap (not drift): `StaffDetailDrawer` has no `isError` branch (`:54-66`). |
| customer_settings | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 1 | 4 | 4 | [EN](customer/customer_settings/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](customer/customer_settings/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](customer/customer_settings/COMPARISON_VISUAL_MOCKUP_VI.md) | **Low-drift; doc-set is a single file (`customer_settings.md`).** **🔴 doc drift (NOT a code bug):** Key Interactions claims Lưu "navigates back" — `handleSave` (`menu/settings/page.tsx:14-19`) only writes the store + shows "Đã lưu!" toast for 2s; **no navigation** (back arrow `page.tsx:26` is the only `router.back()`). ASCII copy stale: name label "Tên của bạn"→**"Tên hiển thị"** (`page.tsx:39`); save "💾 Lưu"→**"Lưu cài đặt"**/"Đã lưu!" (`page.tsx:74`); ASCII omits both helper-texts (`page.tsx:49,65`) + the saved-state toggle. Bottom-nav "Cài Đặt" tab ✅ (`ClientBottomNav.tsx:91-98`); no BE calls ✅; store persisted via `CUSTOMER_SETTINGS='customer-settings'` ✅. Areas 4 (loading) + 5 (FE⇄BE) N/A. Screenshots ⏳ (stack down). |
| customer_profile | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 1 | 5 | 3 | [EN](customer/customer_profile/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](customer/customer_profile/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](customer/customer_profile/COMPARISON_VISUAL_MOCKUP_VI.md) | **Near-zero doc drift — exemplary, honest doc-set (like combo_detail/table_qr).** The lone 🔴 is a **CODE bug the doc already documents correctly**, re-verified by grep: `GET`/`PUT /customer/profile` **do not exist** — no `/customer` group in `main.go:161` (mounts only auth…ws `:167-350`), grep `customer/profile`/`profile` in `be/` = none (only staff `auth/me`). Page ships looking functional but every save 404s + toast mislabels it "kiểm tra kết nối". Areas 2 & 3 N/A (no shared store, no outliving write — `setCustomerName` exists `settings.ts:17` but gated behind dead PUT). Doc drift = minor only: `_be.md` `main.go` cites stale (v1 `:148→:161`, children `:154-311→:167-350`, omits `files`/`ws` groups); `SCENARIO` metrics-mw `:117,126→:118,:121`; Zone B ASCII draws avatar+name side-by-side (code = vertical centered `ProfileAvatarHeader.tsx:12,37`); Zone A title centered not left (`CustomerTopNav.tsx:23`). No fixed-footer collision (SaveCTABar in-flow — contrast product_detail). Screenshots ⏳ (stack down). |
| admin_combos | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 0 | 3 | ~8 | [EN](admin/admin_combos/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](admin/admin_combos/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](admin/admin_combos/COMPARISON_VISUAL_MOCKUP_VI.md) | **No 🔴 doc-vs-code contradiction — high-fidelity, source-traced set (peer of customer_combo_detail/admin_summary).** Doc accurately describes the code *including* its bugs. **4 CODE bugs re-confirmed (doc already documents them, NOT drift):** (1) admin list available-only — service `ListCombos` calls `ListCombosAvailable` (`product_service.go:505`), unfiltered `ListCombos` query DEAD (`products.sql:107`), no `/combos/all` endpoint; (2) `PATCH /combos/:id` nulls `image_path`+`category_id` every edit — handler struct omits both (`product_handler.go:400-406`), service omits `ImagePath` + `category_id=""→NULL` (`product_service.go:603-610`), SQL sets both (`products.sql:132-135`); (3) item inserts non-tx + swallow FK errors (`product_service.go:563,618`); (4) `POST` validation looser than `PATCH` (price min=0/no item-min vs min=1/min=2, `product_handler.go:359-365`). **Dead BE query** `ListCombos` (`products.sql:107`), **dead response field** `is_available` (returned, never rendered/toggled), **dead service param** `UpdateComboInput.CategoryID`. Doc drift = provenance only: `providers.tsx` real path `fe/src/lib/` not `fe/src/app/` (🟡, value 60s/line right); `main.go` route lines stale ~+13 (combos group `:215-227→:228-240`, GET `:216→:229`, `/products/all` `:173→:186`); `product_name:''` `:143→:142`; stale branch in all 6 headers. Screenshots ⏳ (stack down). |

| customer_welcome | 2026-06-22 | experience_claude.md_system_1_test_iphon2_change_code | 0 | 1 | 9 | [EN](customer/customer_welcome/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](customer/customer_welcome/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](customer/customer_welcome/COMPARISON_VISUAL_MOCKUP_VI.md) | **No 🔴, no code bug — one of the most accurate doc-sets in the repo (peer of customer_table_qr/customer_profile).** Fully static Server Component (`fe/src/app/welcome/page.tsx`, 256 lines): no store, no persist, no loading, no BE → Areas 2-5 genuinely N/A (doc-set says so). **SCENARIO_WELCOME.md every `file:line` EXACT** (`:32,:9-25,:27-30,:45-50,:74-79,:80-85,:112-118,:131-150,:153-158,:180-185,:205-211,:228-233,:247-251`); "256 lines" correct. Tracker's standing question resolved: **signature dishes are the static `dishes` const (`page.tsx:9-25`), NOT `GET /products`.** Lone 🟡: ASCII rounds **both** hours closings to "21h" but weekend closes **21:30** (`page.tsx:29`). 🟢: headline "—" is a `<br/>` (`:62-66`); dish names abbreviated; ASCII omits section Badge/h2/sub-`<p>` per zone; footer "Chính Sách"→`/privacy-policy` + "Điều Khoản"→`/terms` both **exist**; `/introduction` correctly absent (doc marks 🔮 PLANNED); SCENARIO provenance branch stale (`..._system_1` vs `..._test_iphon2_change_code`). Screenshots ⏳ (stack down). |

| customer_checkout | 2026-06-22 | experience_claude.md_system_1_test_iphon2_change_code | 3 | 5 | 6 | [EN](customer/customer_checkout/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](customer/customer_checkout/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](customer/customer_checkout/COMPARISON_VISUAL_MOCKUP_VI.md) | **Source-faithful doc-set — it documents the code *including* its bugs (peer of combo_detail/order_detail/admin_combos). The only doc-vs-code CONTRADICTION is the footer.** **🔴 #1 (NEW, undocumented code bug + doc drift):** submit bar `fixed bottom-0` **no z-index** (`checkout/page.tsx:203`) under shell `ClientBottomNav` `fixed bottom-0 z-20` rendered as later sibling (`ClientBottomNav.tsx:48`, `(shop)/layout.tsx:12`) → nav paints over the "Đặt hàng" CTA; wireframe draws them cleanly stacked (`customer_checkout.md:43-45`). **Same class as customer_product_detail + customer_favourites.** **🔴 #2 (code bug, doc-documented):** `payment_method` collected (radio writes `cart.setPaymentMethod` `page.tsx:47` + Zod `page.tsx:19`) but absent from POST payload (`page.tsx:49-56`), no `orders` column, **0 grep hits** in handler/service → radio cosmetic. **🔴 #3 (code bug, doc-documented):** `ErrTableHasActiveOrder` defined (`errors.go:30`) but **returned nowhere in be/** (grep); `CreateOrder` sets `tableBusy` informational (`order_service.go:270-275`), returns `201 {id,table_busy}` (`order_handler.go:121`); FE `onError` branch (`page.tsx:79-84`) dead **and** `onSuccess` never reads `table_busy` → **silent duplicate order** (no notice, unlike menu `TableConfirmModal`). 🟡 Bug 3 latent online 403 (`order_service.go:116-119`, NULL table); dead `setPaymentMethod` write (`page.tsx:47`); name/phone/note not server-validated (`order_handler.go:62-64`); payment-zone vertical list w/ Cash LAST not 2×2 (`page.tsx:24-29`); `CART_CONFIG='cart-config-v3'` vs persist `version:5`. 🟢 `_be.md` `main.go` lines stale `:230-237→:243-249`, combo header `:398-412→:402-411`, off-by-one `page.tsx:79-83→:79-84` / `order_service.go:116-120→:115-120`, stale provenance branch. Area 2 N/A (single page.tsx). `GetOrder` uses `errors.Is(sql.ErrNoRows)` `:109` — NOT the admin_ingredients 404→500 trap. Screenshots ⏳ (stack down). |
| admin_categories | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 1 | 3 | 13 | [EN](admin/admin_categories/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](admin/admin_categories/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](admin/admin_categories/COMPARISON_VISUAL_MOCKUP_VI.md) | **No 🔴 doc-vs-code contradiction — low-drift, source-faithful set (peer of admin_summary/admin_staff/admin_combos).** The lone 🔴 is a **FE CODE bug the doc already documents** (`CATEGORIES_BUGS.md` Bug 1 · `admin_categories.md` Flag 7 · `_be.md` Flag 7 · `SCENARIO` 09:38): manager sees red **"Xóa"** (`page.tsx:131-136`, no role check) but `DELETE /categories/:id` is admin-only (`AtLeast("admin")` `main.go:207-210`) → 403 → `onError` catch-all `'Không thể xóa danh mục'` (`page.tsx:69-76`, only 409 special-cased) → silent, mislabelled. Same class as A12 Training Bug 2 + A3 Products. **Area-5 agent's 3 raw 🔴 downgraded** (FE `Category` omits `description`+`is_active`; `createCategory`/`updateCategory` never send `description`) — by-design, doc-accurate Flags 1+3, not contradictions. **All FE line-cites EXACT** (menu `:52-56`, POS `:39-43`, ProductFormModal `:39-43`, AuthGuard `:23`, RoleGuard `:16-20`, page query `:22-26`); cosmetic-tabs concern re-confirmed (`ListProducts` `product_handler.go:42-43` reads no `category_id`). Doc drift: `main.go` route block stale **+14** (`catR` `:184→:198`, DELETE sub-group `:193-196→:207-210`) across `_be.md`/`admin_categories.md`/`CATEGORIES_BUGS.md`/`crosspage`/`SCENARIO`; stale provenance branch on all 6 files; off-by-1 (`:99-107→:98-107`, handler serialise `:187→:188`). Screenshots ⏳ (stack down). |

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
  **customer_profile note:** the `setCustomerName(result.name)` writer at `useCustomerProfile.ts:51`
  lives inside `useUpdateProfile.onSuccess`, which **never runs** — the `PUT /customer/profile` it
  guards always 404s (no `/customer` BE group, `main.go:161`). So profile's intended cross-page write
  to `settings.customerName` is **dead today**; `customer_settings` remains the only live writer of the
  store. Re-check when/if the customer-profile backend is built. **Code bug (documented), not doc
  drift** — logged in `customer_profile/COMPARISON_DOC_VS_CODE_DETAILED.md` headline #1.
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
  headline #1. Re-check on staff_pos future run. **customer_checkout run (2026-06-22) re-confirmed the
  grep (sole hit = the `errors.go:30` definition) and added a sharper angle:** on `/checkout` the dead
  branch is *doubly* harmful — `onError` (`page.tsx:79-84`) can never fire **and** `onSuccess`
  (`page.tsx:61-76`) never reads `table_busy` from the `201` body, so checkout **silently creates a
  duplicate order with no notice** (the menu `TableConfirmModal` at least toasts). Logged as
  `customer_checkout` 🔴 #3.
- **Recurring `_be.md` route-line drift in `be/cmd/server/main.go`** — **customer_combo_detail**
  (`GET /products` `:168→:181`, `GET /combos` `:216→:229`), **admin_summary** (`adminR` block
  `:294→:307`, `authMW` `:151→:164`), **customer_product_detail** (`/products` group
  `:167→:180`, `GET /:id` `:169→:182`), **customer_table_qr** (`/auth/guest` route
  `:158→:171`, `protected` group `:159-164→:173-177`, CORS `:126→:133`), and now **admin_staff**
  (`/staff` group `:280-281→:293-294`, admin `DELETE` sub-group `:287-290→:300-304`; plus
  `staff_service.go` `:203→:204`/`:236-238→:237-239` and the **transposed** repo pair
  `CountAdmins`↔`SoftDeleteStaff` `:240`/`:253`), and now **admin_combos** (combos group
  `:215-227→:228-240`, GET `/combos` `:216→:229`, POST/PATCH sub `:218-222→:231-235`, admin DELETE sub
  `:223-227→:237-239`, products group `:167-182→:180-195`, `/products/all` `:173→:186`) and now **admin_categories** (`catR` group `:184→:198`, manager POST/PATCH `:188-191→:201-205`, admin `DELETE` sub-group `:193-196→:207-210`) and now **admin_toppings** (toppings group `:200-212→:213-225`, `/products/all` `:173→:186`, `prodR` `:167→:180`) and now **admin_ingredients** (route block `:293-313→:307-328`; `adminR` group `:307`, ingredient routes `:312-318`, admin DELETE sub-group `admIngR` `:323-328`) and now **customer_checkout** (`/orders` group `:230-237→:243-249`: group `:243`, `authMW` `:244`, `POST "" :245`, `GET /:id :249`; plus `order_service.go` combo header `:398-412→:402-411` and off-by-one `:116-120→:115-120`) all cite stale `main.go`/Go line numbers because the
  files grow above their route block over time. **Doc drift, not a code bug** — but a systematic one: any page
  whose `_be.md` cites `main.go` route lines should re-verify them on each run. Consider citing the
  route *group* + handler name instead of an absolute `main.go` line where possible.
- **Shared admin-only DELETE sub-group `admIngR` (`main.go:323-328`) wraps TWO routes across two pages.**
  Despite the `admIngR` name it gates both `DELETE /admin/ingredients/:id` (**admin_ingredients** endpoint 6)
  and `DELETE /admin/training/guides/:id` (**admin_training**). **admin_summary** already noted its `_be.md`
  omits the 2nd DELETE; **admin_ingredients**'s `_be.md` implies the sub-group is ingredient-only. **Doc
  drift, not a code bug** — re-verify the sub-group membership on the admin_training run; consider renaming
  the var or documenting both members.
- **Root error-mapping pattern: `%w`-wrapped `sql.ErrNoRows` + service `== sql.ErrNoRows` (not `errors.Is`)
  silently downgrades 404→500 (code bug, likely repo-wide).** On **admin_ingredients**, `GetIngredientByID`
  wraps with `fmt.Errorf("...: %w", err)` (`ingredient_repo.go:147`) but `IngredientService.GetIngredient`
  tests `err == sql.ErrNoRows` (`ingredient_service.go:69`); since `handleServiceError`
  (`be/internal/handler/respond.go:24-36`) only maps `*service.AppError` via `errors.As` and has **no
  `sql.ErrNoRows` fallback**, a wrapped not-found returns `500 COMMON_002` instead of the documented `404`
  (DELETE escapes it — `SoftDeleteIngredient` returns raw `sql.ErrNoRows`, `ingredient_repo.go:216`). The
  `==`-vs-`errors.Is` comparison against a wrapped sentinel is a pattern to grep for on every other admin
  CRUD page (**admin_categories**, **admin_toppings**, **admin_combos**, **admin_products**): any `_repo.go`
  that wraps `sql.ErrNoRows` while its `_service.go` checks it with `==` shares this 404→500 bug. Logged in
  `admin_ingredients/COMPARISON_DOC_VS_CODE_DETAILED.md` headline #3.
- **Shared public `GET /categories` + Redis `categories:list` — admin_categories is the WRITER, 3
  surfaces are readers.** Every category write on **admin_categories** (`product_service.go:365-427`)
  calls `invalidateProductCaches(ctx,"")` (`:709-717`) → `Del`s `categories:list` **and** `products:list`
  (the latter because each product embeds `category_name` via `enrichProduct` `:627-661`). Readers of the
  **same public `GET /categories`** (`main.go:199`, no auth): **customer_menu** CategoryTabs
  (`menu/page.tsx:52-56`, `staleTime 5m`), **staff_pos** CategoryTabs (`pos/page.tsx:39-43`, `5m`), and
  **admin_products** ProductFormModal dropdown (`ProductFormModal.tsx:39-43`, `60s`). No SSE/WS, no
  localStorage — downstream pages refill only on their own `staleTime` expiry. **No drift — all three
  pages' docs describe this correctly.** Note also the **cosmetic-tabs** concern intersects here:
  `GET /products` ignores `category_id` (`ListProducts` `product_handler.go:42-43` reads no params), so
  CategoryTabs filter client-side only (already logged in BE_DOC_TRACKER / customer_menu Flag 1). Shared
  catalog contract to re-verify on admin_products, customer_menu, staff_pos future runs.
- **Shared Redis `toppings:list` + `products:list` + uncached `GET /products/all` — admin_toppings is a
  WRITER, customer/POS catalog pages are READERS, and `product:<id>` is the asymmetric stale outlier
  (code gap, doc-confirmed).** Every topping write on **admin_toppings**
  (`POST`/`PATCH`/`DELETE /toppings`) calls `invalidateToppingCaches` → `Del("toppings:list",
  "products:list")` (`product_service.go:719-721`) but **never** `Del`s `product:<id>` (the per-detail
  key built at `:213`, TTL `productCacheTTL=5m` `:21`). So a topping price/availability edit reaches
  **customer_menu** (C1) and **staff_pos** (S4) on next `GET /products` fetch, but **customer_product_detail**
  (C4, the only reader of `product:<id>`) serves a **stale topping for up to 5 min**. The product
  topping-picker on **admin_products** (A3) is the *other* writer that triggers the same staleness. Also
  shared: the **uncached manager+ N+1 `GET /products/all`** (`main.go:186`, `ListAllProducts`
  `product_service.go:194-209`) is fetched by **both admin_toppings** (to render the "Áp dụng cho sản
  phẩm" chips) **and admin_products**. **No drift — admin_toppings docs describe all of this correctly**
  (`_be.md` Flag 2 + `_crosspage_dataflow.md` §2.3); the `product:<id>` asymmetry is a **code-quality
  gap needing MASTER registration to fix** (Del `product:<id>` on topping writes). Re-check on
  customer_product_detail + admin_products future runs.
- **Admin-only `DELETE` button rendered to managers → silent mislabelled 403 (shared FE bug root).**
  **admin_categories** ships it (`page.tsx:131-136` renders "Xóa" with no role check; `DELETE
  /categories/:id` is `AtLeast("admin")` `main.go:207-210`; `onError` only handles 409 `page.tsx:69-76`)
  — **same class** as **admin_training** A12 Bug 2 and **admin_products** A3 (admin-only `DELETE` shown
  to manager+). One root, one fix pattern (hide/disable the destructive button for `role !== 'admin'`, or
  add an honest 403 branch). **Code bug** logged in `admin_categories/CATEGORIES_BUGS.md` Bug 1 +
  `COMPARISON_DOC_VS_CODE_DETAILED.md` headline #1; recommend bundling all three into one ALIGNed FE task.
- **Shared `combos:list` Redis cache + public `GET /combos` endpoint — admin_combos is the WRITER, the
  customer catalog pages are READERS.** Every combo write on **admin_combos**
  (`POST`/`PATCH`/`DELETE /combos`) calls `invalidateComboCaches` → `Del("combos:list")`
  (`product_service.go:723-724`), the **same** key + endpoint read by **customer_menu** ComboSection (C1)
  and **customer_combo_detail** (C5, which over-fetches the whole list and finds by id client-side). The
  list is rebuilt from `ListCombosAvailable` (`product_service.go:505`, `is_available=1` only) — so a
  combo admin_combos can't hide (Bug 1) is equally always-on at /menu. Pull-only, no SSE/WS. **No drift —
  all three docs describe this correctly**; flagged as a shared contract to re-verify on customer_menu's
  future run. The four combos **code bugs** (available-only list, PATCH nulling image/category,
  non-tx item inserts, create-validation gap) are logged in `admin_combos/COMBOS_BUGS.md` +
  `admin_combos/COMPARISON_DOC_VS_CODE_DETAILED.md` — already doc'd, need MASTER registration to fix.
- **Global TanStack `staleTime: 60s` lives at `fe/src/lib/providers.tsx:8`, NOT `fe/src/app/providers.tsx`
  (doc-citation drift, several pages).** `admin_combos`'s `_loading.md`/`_crosspage_dataflow.md`/`SCENARIO`
  cite `providers.tsx:8` (the SCENARIO spells the wrong dir `fe/src/app/providers.tsx:8`). The line + value
  are correct; only the directory is wrong. Any page-doc that cites `providers.tsx` for the global
  staleTime should point at `fe/src/lib/providers.tsx:8`. **Doc fix, not a code bug.**
- **Shared customer shell `(shop)/layout.tsx:11-12` renders `ClientBottomNav` (`fixed bottom-0 z-20`)
  on EVERY `(shop)` route** — affects **customer_product_detail** (a 🔴: the page's own `CTAFooter`
  is also `fixed bottom-0` with no z-index, `CTAFooter.tsx:12`, so the nav overlaps the CTA) and
  potentially any other shop page that adds its own fixed bottom bar. **Code bug on
  customer_product_detail; a layout invariant to check** on every shop page whose comparison run finds
  a sticky footer (checkout, order detail). Logged in
  `customer_product_detail/COMPARISON_DOC_VS_CODE_DETAILED.md` headline #1. **Second confirmed instance:
  customer_favourites** has TWO offending footers — list `FavouritesFooter.tsx:12` and save
  `save/page.tsx:103`, **both** `fixed bottom-0 z-20` (here the page footers DO set `z-20`, but the nav
  is the later sibling in `(shop)/layout.tsx:10-13`, so equal z-index → nav still paints over the list
  CTA "Thêm tất cả vào giỏ hàng" and the whole save button row). Logged in
  `customer_favourites/COMPARISON_DOC_VS_CODE_DETAILED.md` headline #2. **Third confirmed instance
  (customer_checkout run, 2026-06-22):** the checkout submit bar is `fixed bottom-0 left-0 right-0`
  with **no z-index at all** (`checkout/page.tsx:203`) — worse than favourites, which at least sets
  `z-20` — so the `z-20` nav (later sibling, `(shop)/layout.tsx:12`) unambiguously paints over the
  **"Đặt hàng · {total}" primary CTA**, a checkout-blocking bug. The checkout wireframe draws the two
  bars cleanly stacked (`customer_checkout.md:43-45`), so this is **both** a code bug and doc drift.
  Logged in `customer_checkout/COMPARISON_DOC_VS_CODE_DETAILED.md` headline #1. **Pattern:** any
  `(shop)` page with a `fixed bottom-0` bar must offset above the ~72px nav (`bottom-[72px]`)
  regardless of z-index. Re-check on customer_order_detail's future run (last sticky-footer shop page).
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
- **Admin product writes → customer `/menu` + staff `/pos` via Redis `products:list` eviction (no
  push).** **admin_products** is the writer: every create/update/delete calls `invalidateProductCaches`
  (`product_service.go:709-717`) Del'ing `products:list`/`categories:list`/`product:<id>`; the admin
  table itself is uncached (`ListAllProducts` `:194-209`). **customer_menu** + **staff_pos** are
  readers of the public `GET /products` (`ListProductsAvailable`, `is_available=1`,
  `products.sql.go:467-470`) — they pick changes up only on next fetch (staleTime 5 min). **No SSE/WS
  for catalog** (grep-confirmed). ⚠️ **Surfaced this run:** the customer menu runs a *secondary*
  `['products-all']` query (`menu/page.tsx:59-63`) fetching `/products` **without** the `is_available`
  filter that **no admin write invalidates** on the FE side — a silent staleness gap to re-check on
  customer_menu + staff_pos future runs. All doc-accurate otherwise.
- **`is_available` is unsettable from the UI (code bug root, admin_products).** Bug 1
  (`PATCH /products/:id/availability` → `UpdateProduct`, `main.go:189`) makes the table badge always
  400; the form modal has no availability control (`ProductFormModal.tsx`, no `is_available` in
  schema/payload). The fix-target query `ToggleProductAvailability` (`products.sql.go:667-676`) +
  repo wrapper (`product_repo.go:82-84`) are dead (no service caller). Because `is_available` gates the
  customer menu + POS visibility, a sold-out dish **cannot be hidden** without a seed-flow recreate or
  direct DB edit. Logged in `admin_products/PRODUCTS_BUGS.md` #1 + headline #4. **Code bug needing a
  MASTER row** before any fix.
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
| ✅ | customer_welcome | `/comparison-doc customer_welcome` |
| ✅ | customer_table_qr | `/comparison-doc customer_table_qr` |
| ⬜ | customer_introduction | `/comparison-doc customer_introduction` |
| ✅ | customer_product_detail | `/comparison-doc customer_product_detail` |
| ✅ | customer_combo_detail | `/comparison-doc customer_combo_detail` |
| ✅ | customer_favourites | `/comparison-doc customer_favourites` |
| ⬜ | customer_checkout | `/comparison-doc customer_checkout` |
| ✅ | customer_order_list | `/comparison-doc customer_order_list` |
| ✅ | customer_order_detail | `/comparison-doc customer_order_detail` |
| ✅ | customer_tracking | `/comparison-doc customer_tracking` |
| ✅ | customer_profile | `/comparison-doc customer_profile` |
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
| ✅ | admin_products | `/comparison-doc admin_products` |
| ✅ | admin_categories | `/comparison-doc admin_categories` |
| ✅ | admin_toppings | `/comparison-doc admin_toppings` |
| ✅ | admin_combos | `/comparison-doc admin_combos` |
| ✅ | admin_ingredients | `/comparison-doc admin_ingredients` |
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
