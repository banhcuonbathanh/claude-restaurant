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
| admin_staff | 2026-06-21 | experience_claude.md_system_1_test_iphon2_change_code | 0 | 8 | 47+ | [EN](admin/admin_staff/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](admin/admin_staff/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](admin/admin_staff/COMPARISON_VISUAL_MOCKUP_VI.md) | **No 🔴 — FE & BE agree on every route, shape, and guard.** All guards confirmed: manager+ group, admin-only `DELETE`, create/update role-hierarchy, self-deactivation block, last-admin guard, `Del(auth:staff:<id>)` lockout; `performance_score: 0` is a hardcoded stub (`staff_handler.go:250`, no column — Flag 8 holds). **Genuine visual drift (doc fix):** `admin_staff.md` ASCII draws StatsBar as 5 role cards (code renders **4**, role folded into "Theo vai trò" subLabel `StaffStatsBar.tsx:31-50`) + row actions as 4 grouped emoji (code = text buttons + separate toggle column `StaffTable.tsx:123-159`). BE line-cites stale (`main.go` group `:280→:293`, DELETE sub-group `:287-290→:300-304`; `staff_service` `:203→:204`, `:236-238→:237-239`; repo `CountAdmins`↔`SoftDeleteStaff` transposed). Doc-confirmed code gap (not drift): `StaffDetailDrawer` has no `isError` branch (`:54-66`). |

## Cross-Page Concerns
<!-- findings that touch >1 page: a shared store field, a shared hook/SSE, a shared endpoint, or a bug root.
     Name the pages + the shared file:line + whether it's a doc drift or a code bug + where it's logged. -->

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
- **Order status machine `validTransitions` (`order_service.go:524-529`)** is the single source for
  every status-button gate across **admin_overview** (Zone B/D), **staff_kds**, **staff_pos** and
  customer tracking. **admin_overview** ships a real bug against it: a **Huỷ** button on `delivered`
  orders (`TableList.tsx:378-385`) that the machine rejects (`delivered: {paid}` only) → guaranteed
  `409`. Any other page offering a `delivered → cancelled` action shares this bug. Logged in
  `admin_overview/COMPARISON_DOC_VS_CODE_DETAILED.md` headline #2.

---

## Pages — Copy-Paste Queue

> Every page folder under `08_pages/`. Copy the command, paste it, run. Mark **Status** ✅ when its
> 3-file set is done (and add its row to the table above). 33 pages · 3 done · 30 to go.

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
| ⬜ | customer_order_list | `/comparison-doc customer_order_list` |
| ⬜ | customer_order_detail | `/comparison-doc customer_order_detail` |
| ⬜ | customer_tracking | `/comparison-doc customer_tracking` |
| ⬜ | customer_profile | `/comparison-doc customer_profile` |
| ⬜ | customer_settings | `/comparison-doc customer_settings` |

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
