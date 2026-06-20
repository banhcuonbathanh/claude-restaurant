# Customer Menu — Detailed Doc vs. Code Comparison (5 Areas)

> **Scope:** deep audit of the `customer_menu` doc-set against the real `/menu` code across 5 axes:
> (1) component visuals · (2) cross-component Zustand dataflow · (3) cross-page Zustand dataflow ·
> (4) loading behaviour · (5) FE⇄BE data model. **Read-only — no code or docs changed.**
> Produced by 4 parallel Sonnet agents; the 🔴 items were re-verified by hand (greps cited inline).
> Excluded from area 1 by request: `DrinkCustomize`, `OrderNote`.
> Date: 2026-06-20.

---

## Executive Summary

| Area | Verdict | 🔴 | 🟡 | 🟢 |
|---|---|---|---|---|
| 1 · Component visuals | **Doc significantly stale** — code is richer than drawn | 4 | 5 | 4 |
| 2 · Cross-component dataflow | Mostly accurate; 1 hard error | 1 | 1 | many ✅ |
| 3 · Cross-page dataflow | Big flows right; the 201 handoff is wrong | 2 | 1 | many ✅ |
| 4 · Loading | **Essentially perfect** — 2 cosmetic doc nits | 0 | 0 | 2 |
| 5 · FE⇄BE data model | Accurate; flags still valid; 3 undocumented extras | 0 | 6 | several ✅ |

**🔴 RAISE-MY-VOICE headline findings (hand-verified):**
1. **`MenuHeader` does NOT read `useCartStore.tableName`.** It reads `useSettingsStore().tableLabel` (`MenuHeader.tsx:11,28`). The QR scan writes `setTableName` into the *cart* store — which never reaches the header. The doc's A-zone is wrong, and there is a real product gap: after a QR scan the header label can be blank.
2. **`TableConfirmModal` does NOT call `setActiveOrderId` on success.** It only `clearCart()` + `router.replace()` (`TableConfirmModal.tsx:48-50`). `customer_menu.md:210` ("201 ⇒ setActiveOrderId(id) → clearCart() → router.replace") is factually wrong. After `clearCart()`, `activeOrderId` is reset to `null`.
3. **The documented `ToppingModal` flow does not exist.** `ToppingModal.tsx` has **zero imports** (dead code). Product nhân is picked via **inline pills** on `ProductCard`/`ProductGridCard`; combo nhân via inline pills on `ComboCard`. The doc's "▢ ToppingModal (overlay opened from E/F)" block describes a flow that isn't wired.
4. **`OrderSummary` is far more than "preview + note".** Code renders canh steppers, a collapsible "Tổng số món" dish table, per-group qty steppers and a save-state note — none of which appears in the I-zone ASCII.

**Dead/unreachable components found (beyond DrinkCustomize/OrderNote):**
- `ToppingModal` — zero imports (fully dead).
- `ComboModal` — imported & rendered by `ComboCard` but `setModalOpen(true)` is never called (`ComboCard.tsx:75,182` only set `false`) → unreachable UI.

---

## Area 1 — Component Visuals

**Verdict:** the doc is outdated in several meaningful places. The codebase renders richer UI than
the ASCII shows: inline nhân pickers (not a modal), auth button in the header, a full order-summary
table, extra drawer actions, and different modal copy.

| Component | Doc says | Code reality (file:line) | Sev | Solution |
|---|---|---|---|---|
| **MenuHeader** | Right slot shows table name from `useCartStore.tableName` | Right slot = **login/logout button** (`useAuthStore`); table label is a **subtitle** from `useSettingsStore().tableLabel` (`MenuHeader.tsx:11,28-30`) | 🔴 | Redraw A-zone: auth button right; table label = subtitle; fix the data source. |
| **ProductCard / ProductGridCard** | `[+]` opens **▢ ToppingModal** to pick nhân | **Inline nhân pills** on the card; `ToppingModal` never imported (`ProductCard.tsx:131-147`, `ProductGridCard.tsx:94-110`) | 🔴 | Remove ToppingModal from the F flow; document inline pills. Flag ToppingModal as dead. |
| **ComboCard** | Simple `[+]` add button | `[–] qty [+]` stepper + inline nhân pills + fav heart; renders `ComboModal` but it's **unreachable** (`ComboCard.tsx:139-183`; `setModalOpen(true)` never called) | 🔴 | Redraw combo card; flag `ComboModal` as dead/unreachable. |
| **OrderSummary (I)** | "Đơn của bạn (preview)" + note field; shakes if canh missing | Collapsible "Tóm tắt đơn hàng": COMBO/MÓN LẺ groups w/ steppers + delete, **canh stepper section**, **"Tổng số món" dish table** (dish×nhân×qty×giá), note w/ "Đã lưu" (`OrderSummary.tsx:140-310`) | 🔴 | Rewrite I-zone ASCII to show steppers, canh section, dish table, collapse toggle. |
| **TableConfirmModal** | Title "Xác nhận đơn Bàn 03"; button "Xác nhận gọi món"; `201 ⇒ setActiveOrderId(id)` | Title **"Xác nhận đặt hàng"**; confirm **"Đặt hàng"**; has inline **"Ghi chú cho bếp"** textarea; success = `clearCart()`+`router.replace` only (`TableConfirmModal.tsx:48-103`) | 🔴(copy)🟡 | Fix title/button copy; add note textarea to visual; remove the `setActiveOrderId` claim. |
| **MiniCartStrip** | `🛒 3 món · 105.000đ [Xem giỏ →]` | Scrolling row of item-name chips between count and total; whole strip is one tap target; no 🛒, no "Xem giỏ →" (`MiniCartStrip.tsx:18-38`) | 🟡 | Redraw with chip row; drop the button label. |
| **CartDrawer** | Title + items `[–]qty[+] 🗑` + total + `[Thanh toán]` | Also: name/table subtitle, conditional "Xem đơn hàng" (when `activeOrderId`), collapsible combo dish list, "Tiếp tục chọn món" footer, add-to-order button variant "Thêm vào đơn hàng" (`CartDrawer.tsx:73-229`) | 🟡 | Expand drawer ASCII with these states. |
| **AddToOrderBanner** | `▸ Đang thêm món vào đơn #123 [Xem đơn]` | Text "Chọn món để thêm vào đơn hàng hiện tại" + PlusCircle icon; order id not shown (`AddToOrderBanner.tsx:14-16`) | 🟡 | Update banner copy. |
| **page error/empty placement** | error/empty implied inside ProductList | Rendered at **page level**; `OrderSummary` renders **regardless** of error/loading (`page.tsx:144-183`); error copy "⚠ Kết nối mạng yếu" | 🟡 | Note OrderSummary is always present; fix error copy. |
| **SearchBar** | Placeholder `🔍 Tìm món...` | "Tìm món nhanh..." (no emoji), clear-X, 1-char hint "Nhập ít nhất 2 ký tự", 300ms debounce (`SearchBar.tsx:26,38-40`) | 🟢 | Update placeholder + note hint/clear/debounce. |
| **FavouritesRail (D)** | `♥ ... ▸ ▸ ▸`; renders if favourites exist | Cards link to `/menu/favourites`; heart always filled-red; hidden also when a category tab is selected (`page.tsx:108`, `FavouritesRail.tsx:71,84-90`) | 🟢 | Note link target + always-filled heart + category-hide. |
| **CartBottomBar (J)** | `count · total [Thanh toán]`; dimmed blocks | Layout = [count badge][Thanh toán][total]; dimmed still **fires** onCheckout to show the warn-toast (`CartBottomBar.tsx:19-28`, `page.tsx:187`) | 🟢 | Fix layout order; clarify dim = warn-on-click, not blocked. |

**Verified-matching:** CategoryTabs, RestaurantBanner, ComboSection (gating), ProductList (skeleton/grid/empty).

---

## Area 2 — Cross-Component Dataflow (Zustand)

**Verdict:** store shape, action names, selector formulas, the canh gate and the "no zone→zone props"
rule all match exactly. One hard error (MenuHeader source) + one note gap.

| Topic | Doc says | Code reality (file:line) | Sev | Solution |
|---|---|---|---|---|
| MenuHeader data source | reads `useCartStore.tableName` | reads `useSettingsStore().tableLabel` (`MenuHeader.tsx:11`) — cart store not used | 🔴 | Correct the doc; see Area 1 / headline #1. (`OrderSummary.tsx:47` *does* read cart `tableName`.) |
| TableConfirmModal note | drains store `orderNote` | uses its **own local** `useState` note; POST sends `note: note.trim()\|\|null`; store `orderNote` never read (`TableConfirmModal.tsx:15-16,23`) | 🟡 | Doc: QR path collects a separate note; store `orderNote` only used by the online `/checkout` path. |
| `addItem` dedup, `total()`/`itemCount()` selectors, `setCanhQty` signature, `clearCart` field list, single `buildOrderItemsPayload` builder for all 3 POST paths, canh gate `id.startsWith('canh_')` | as documented | confirmed at `cart.ts:51-59,124-125,35/97,89` · `order-payload.ts` · `page.tsx:40` | 🟢 | No action — all correct. |

---

## Area 3 — Cross-Page Dataflow (Zustand)

**Verdict:** the big flows (persist whitelist, order_cache scan, SSE stop conditions, admin isolation,
add-to-order re-entry) are accurate. The **201 success handoff is documented wrong**.

| Topic | Doc says | Code reality (file:line) | Sev | Solution |
|---|---|---|---|---|
| 201 handoff write ② | `setActiveOrderId("<id>")` stamped on success | **not called**; only `clearCart()` (resets `activeOrderId`→null) + `router.replace` (`TableConfirmModal.tsx:48-50`; `checkout/page.tsx` same) | 🔴 | Remove write ② from the handoff sequence/diagram. `activeOrderId` is set later by the "Theo dõi" button (`order/[id]/page.tsx:564`). |
| QR scan → MenuHeader sync | `setTableName` (QR) → MenuHeader re-renders | `/table/[tableId]/page.tsx:31` writes cart `tableName`, but MenuHeader reads `settings.tableLabel`; QR page never calls `setTableLabel` → header label blank after scan | 🔴 | Two different fields in two stores, unsynced. Either point MenuHeader at cart `tableName`, or have the QR page set `tableLabel`. (Product bug, not just a doc bug.) |
| `/tracking` data source | only `useOrderMonitorSSE` | also runs `useQuery(GET /orders/:id)` as the snapshot source; SSE patches deltas (`tracking/page.tsx:21-34`) | 🟡 | Note the dual source. |
| partialize = `{orderNote, activeOrderId}`; items/tableId/tableName session-only; `order_cache_<id>` 3 writers; `/order` list scans cache keys; "Xoá lịch sử"; SSE stop on cancelled/completed; admin isolation; add-to-order re-entry; CART_CONFIG=`cart-config-v3` v5 | as documented | confirmed at `cart.ts:153,129` · `storage-keys.ts:6` · `order/page.tsx` · `useOrderSSE.ts` · `order/[id]/page.tsx:575` | 🟢 | No action — all correct. |

---

## Area 4 — Loading Behaviour

**Verdict:** essentially perfect. Two cosmetic doc nits, zero behavioural drift.

| Topic | Doc says | Code reality (file:line) | Sev | Solution |
|---|---|---|---|---|
| Query declaration order | categories → all-products → combos → products | actual: categories(52) → all-products(59) → products(65) → combos(79) | 🟢 | Reorder the doc table (cosmetic). |
| `min-h-[44px]` location | on the error container div | on the **Thử lại `<Button>`** (`page.tsx:147`), not the wrapper | 🟢 | Reattribute in doc. |
| staleTime 5m on all 4 · search enabled gate (0 or ≥2) · products-only isLoading/isError/refetch · error copy + button · mobile 5×h-24 / desktop 8×aspect-square grid · both empty messages + trigger · Suspense no-fallback · combos hidden until non-empty · categories/combos fail silently to [] · route spinner shape | as documented | all confirmed (`page.tsx:52-83,144-169,201-207`; `(shop)/loading.tsx`) | ✅ | No action. |

---

## Area 5 — Data Model FE⇄BE

**Verdict:** the Object Model matrices (§1–§6) and flags 1–4 are accurate and still true. Three
undocumented extras surfaced; the `filling` column is correctly described as absent (016 added, 017 dropped).

| Object.Attr | Doc says | Code reality (file:line) | Sev | Solution |
|---|---|---|---|---|
| Product.description / image_path | BE NULL→`""`; FE `string\|null` (Flag 2) | `enrichProduct` returns `""` (`product_service.go:628-635`); FE `=== null` never matches | 🟡 | Change FE type to `string` (or send `null` from BE). |
| Combo.category_id / description / image_path | same NULL→`""` mismatch (Flag 2) | `enrichCombo` collapses NULL→`""` (`product_service.go:663-675`) | 🟡 | Same fix as above. |
| `buildImageURL` | doc: "object path, NOT full URL" | function defined (`product_handler.go:32-37`) but **never called** — raw path shipped | 🟡 | Dead code: call it in serializers (and update FE `<img>`) or delete it. |
| Category.description / is_active | "sent but untyped" (Flag 3) | BE sends both (`product_handler.go:183,186`); FE `Category` omits | 🟢 | Add optional fields to FE type if ever needed. |
| OrderItemPayload | `product_id,combo_id,quantity,topping_ids,note?,combo_items?` | matches BE `createOrderItemReq` (`order_handler.go:33-40`); XOR enforced 77-86; JSON null id → Go `""` | 🟢 | Match confirmed. |
| top-level order `note` null vs "" | not documented | `TableConfirmModal` sends `note: ...\|\|null`; Go coerces null→`""` | 🟢 | Optional: note it, or send `""`. |
| `filling` column | "NO filling column" | 016 added, 017 dropped → absent; no code refs | 🟢 | Correct as-is. |

**Fully-matching objects:** Topping (all 4 attrs), ComboItem wire shape, OrderItemPayload field names/types, `filling` absence.

---

## Consolidated Action List (priority order)

| # | Type | Action | Target |
|---|---|---|---|
| 1 | 🔴 Code bug | QR scan table label never reaches `MenuHeader` (cart `tableName` vs settings `tableLabel`) — decide one source | `MenuHeader.tsx` / `table/[tableId]/page.tsx` |
| 2 | 🔴 Doc fix | Rewrite the 201 handoff: remove `setActiveOrderId` from success path | `customer_menu.md:210`, `customer_menu_crosspage_dataflow.md` |
| 3 | 🔴 Doc fix | Fix A-zone (MenuHeader source), I-zone (OrderSummary table/steppers), F-zone (inline pills, no ToppingModal), TableConfirmModal copy | `customer_menu.md` |
| 4 | 🔴 Code cleanup | Delete dead `ToppingModal.tsx`; resolve unreachable `ComboModal` (wire a trigger or delete) — plus earlier `DrinkCustomize.tsx`/`OrderNote.tsx` | `fe/src/features/menu/components/` |
| 5 | 🟡 Doc fix | MiniCartStrip chips, CartDrawer extra states, AddToOrderBanner/SearchBar copy, `/tracking` dual-source, TableConfirmModal local-note | doc-set |
| 6 | 🟡 Type fix | Align FE nullable types (`description`/`image_path`/combo `category_id`) to `string`, or send real `null` from BE | `fe/src/types/product.ts` / serializers |
| 7 | 🟡 Code cleanup | `buildImageURL` dead — call or delete | `product_handler.go` |
| 8 | 🟢 Doc nits | Loading query order + `min-h-[44px]` reattribution; Category untyped fields | doc-set |

> Per `CLAUDE.md` (MASTER-first + scope contract): the doc fixes are one task; each code change
> (#1, #4, #6, #7) must be registered in `MASTER_TASK.md` before any file is touched.
