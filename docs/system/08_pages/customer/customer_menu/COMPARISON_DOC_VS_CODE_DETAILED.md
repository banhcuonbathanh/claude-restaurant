# Customer Menu — Detailed Doc vs. Code Comparison (5 Areas)

> **Scope:** deep audit of the `customer_menu` doc-set against the real `/menu` code across 5 axes:
> (1) component visuals · (2) cross-component Zustand dataflow · (3) cross-page Zustand dataflow ·
> (4) loading behaviour · (5) FE⇄BE data model. **Read-only — no code or docs changed.**
> Produced by 4 parallel Sonnet agents; the 🔴 items were re-verified by hand (greps cited inline).
> Excluded from area 1 by request: `DrinkCustomize`, `OrderNote`.
> Date: 2026-06-20.

> ⚠️ **DESIGN UPDATE (2026-06-23):** This comparison now treats **DESIGN_PROMPT.md** (the new design) as the spec/doc side. The real FE code still implements the OLD design — all changed zones below are **GAPS the code must close (pending rebuild).**

---

## Executive Summary

| Area | Verdict | 🔴 | 🟡 | 🟢 |
|---|---|---|---|---|
| 1 · Component visuals | **8 zones are rebuild gaps** (new design vs old code) — spec is DESIGN_PROMPT.md | 7 | 1 | 1 |
| 2 · Cross-component dataflow | Header rebuild resolves the store-source gap; 1 note gap remains | 1 | 1 | many ✅ |
| 3 · Cross-page dataflow | Big flows right; 201 handoff wrong; QR→header sync resolved by rebuild | 1 | 1 | many ✅ |
| 4 · Loading | **Essentially perfect** — 2 cosmetic doc nits | 0 | 0 | 2 |
| 5 · FE⇄BE data model | Accurate; flags still valid; 3 undocumented extras | 0 | 6 | several ✅ |

**🔴 NEW DESIGN REBUILD GAPS (code must close these — spec = DESIGN_PROMPT.md):**
1. **Header rebuild:** remove pill bar, login button, table label from MenuHeader; replace with photo banner + Playfair title only. Move "Bàn 04" pill (spinning orange ring) into OrderSummary header.
2. **Category tabs → scroll-spy nav:** replace filter tabs with sticky scroll-spy anchor nav; all sections render simultaneously; IntersectionObserver drives active highlight.
3. **ComboCard nhân multi-select:** switch combo nhân pills from single-select to multi-select (both selected by default, ≥1 always required).
4. **Checkout control redesign:** replace full-width CartBottomBar (with total) with two stacked floating pill buttons (cart pill + "Thanh toán" pill, no total).
5. **Remove "Gọi thêm" badge** from OrderSummary.
6. **Pre-fill GHI CHÚ** with "Gia đình (mẹ + 2 người lớn + 2 trẻ)".
7. **FavouritesRail:** ✅ resolved (GAP-7-FAV) — rail existed; 3 fixes applied: card tap → item detail, orange heart, label heart icon. Note: heart color on ProductCard/ComboCard/ProductGridCard deferred to GAP-8.
8. **Worked example:** update to Bàn 04 family order (total 103.000 đ, badge = 13).

**🔴 PRE-EXISTING DOC/CODE ISSUES (still valid, carried forward):**
- **`TableConfirmModal` does NOT call `setActiveOrderId` on success.** It only `clearCart()` + `router.replace()` (`TableConfirmModal.tsx:48-50`). `customer_menu.md:210` ("201 ⇒ setActiveOrderId(id) → clearCart() → router.replace") is factually wrong. After `clearCart()`, `activeOrderId` is reset to `null`.
- **The documented `ToppingModal` flow does not exist.** `ToppingModal.tsx` has **zero imports** (dead code). Product nhân is picked via **inline pills** on `ProductCard`/`ProductGridCard`. The doc's "▢ ToppingModal (overlay opened from E/F)" block describes a flow that isn't wired.
- **`OrderSummary` is far more than "preview + note".** Code renders canh steppers, a collapsible "Tổng số món" dish table, per-group qty steppers and a save-state note — none of which appears in the old I-zone ASCII.

**Dead/unreachable components found (beyond DrinkCustomize/OrderNote):**
- `ToppingModal` — zero imports (fully dead).
- `ComboModal` — imported & rendered by `ComboCard` but `setModalOpen(true)` is never called (`ComboCard.tsx:75,182` only set `false`) → unreachable UI.

---

## Area 1 — Component Visuals

**Verdict:** the new design (DESIGN_PROMPT.md) is now the spec. The FE code still implements the old design across the 8 changed zones — each is a rebuild gap. Unchanged zones remain accurate.

| Component | NEW spec (DESIGN_PROMPT.md) | OLD code reality (file:line) | Sev | Solution |
|---|---|---|---|---|
| **MenuHeader** | Photo banner + Playfair "Quán Bánh Cuốn" title only — no pill bar, no table label, no login below the banner; "Bàn 04" pill lives in the order-summary header (spinning orange light ring) | Right slot = **login/logout button** (`useAuthStore`); table label = subtitle from `useSettingsStore().tableLabel` (`MenuHeader.tsx:11,28-30`); pill bar visible below banner | 🔴 **GAP — code pending rebuild** | Remove login button and pill bar from header zone; move "Bàn 04" pill into OrderSummary header with animated conic-gradient ring. |
| **CategoryTabs** | Sticky scroll-spy nav — all sections always render; tapping a tab scrolls to its section; scrolling auto-highlights active tab (orange text + underline + glow); tabs: Tất cả · Suất · Trứng · Bánh Cuốn · Giò · Canh | **Filter tabs** — tapping hides/shows product groups; not scroll-spy; active style differs | 🔴 **GAP — code pending rebuild** | Replace filter-tab logic with scroll-spy anchor nav; ensure all sections render simultaneously; wire IntersectionObserver for auto-highlight. |
| **FavouritesRail (D)** | Renders whenever ≥1 favourite regardless of tab; tapping a fav card opens that item's detail | `FavouritesRail.tsx` EXISTS (store `favourites.ts`, heart toggles on cards, wired in `page.tsx`). Three new-design divergences now FIXED: (1) card tap → `/menu/product/${id}` · `/menu/combo/${id}` (was `/menu/favourites`); (2) heart recolored `fill-primary` (was `fill-red-500`); (3) section label includes small Heart icon. Rail renders regardless of section (scroll-spy); only hidden while searching (`!searching`), which matches spec — the old "hidden when category tab selected" claim was stale (filter-tab era). | ✅ **resolved** | Three fixes applied to `FavouritesRail.tsx` (GAP-7-FAV). Heart color on `ProductCard`/`ComboCard`/`ProductGridCard` still red — deferred to GAP-8 / global design-token pass. |
| **ComboCard (SUẤT section)** | Full product-card treatment — favourite heart + MULTI-select nhân pill group ("Nhân thịt" / "Nhân thịt mộc nhĩ", both selectable, both selected by default, min 1 must stay selected); single-select nhân pills remain only on bánh-cuốn & trứng items | Stepper `[–] qty [+]` + inline nhân pills + fav heart; `ComboModal` imported but **unreachable** (`ComboCard.tsx:139-183`; `setModalOpen(true)` never called); nhân pills are single-select on combos | 🔴 **GAP — code pending rebuild** | Switch combo nhân pills to multi-select (both on by default, enforce ≥1 selected); remove unreachable `ComboModal`; keep single-select on bánh-cuốn & trứng cards only. |
| **CartBottomBar / Checkout control** | TWO stacked floating pill buttons bottom-right (cart pill 🛒 + round orange count badge ABOVE orange "Thanh toán" pill); appear only when cart non-empty; NO total shown; "Thanh toán" dims when soup missing | Full-width orange bottom bar with count badge + "Thanh toán" + **TOTAL** (`CartBottomBar.tsx:19-28`); dimmed still fires onCheckout to show warn-toast | 🔴 **GAP — code pending rebuild** | Replace CartBottomBar with two stacked pill buttons pinned bottom-right; remove total from buttons; keep dim+warn-toast behaviour for missing soup. |
| **"Gọi thêm" badge** | REMOVED — no "Gọi thêm" tag anywhere in the order summary | "Gọi thêm" badge rendered in order summary | 🔴 **GAP — code pending rebuild** | Delete "Gọi thêm" badge from OrderSummary. |
| **OrderNote pre-fill** | GHI CHÚ textarea pre-filled with "Gia đình (mẹ + 2 người lớn + 2 trẻ)" | Textarea blank / not pre-filled | 🔴 **GAP — code pending rebuild** | Pre-fill the GHI CHÚ textarea with "Gia đình (mẹ + 2 người lớn + 2 trẻ)". |
| **Worked example (Bàn 04 order)** | COMBO = 1 Suất Đầy Đủ Trứng Chín + 2 Suất Giò (80.000 đ); MÓN LẺ = 2 Bánh Trứng Vàng + 2 Bánh Chay + 4 Canh có rau + 2 Canh không rau (23.000 đ); Tổng cộng 103.000 đ; floating cart count badge = 13 | Worked example references "Bàn 03" with different item set and totals | 🟡 **GAP — doc updated to new example** | Update all example order references to the Bàn 04 family order; count badge = 13; total = 103.000 đ. |
| **ProductCard / ProductGridCard** | `[+]` opens **▢ ToppingModal** to pick nhân (old doc claim, unchanged in new design — inline pills are correct) | **Inline nhân pills** on the card; `ToppingModal` never imported (`ProductCard.tsx:131-147`, `ProductGridCard.tsx:94-110`) | 🔴 | Remove ToppingModal from the F flow; document inline pills. Flag ToppingModal as dead. |
| **OrderSummary (I)** | "Đơn của bạn (preview)" + note field; shakes if canh missing (old doc claim) | Collapsible "Tóm tắt đơn hàng": COMBO/MÓN LẺ groups w/ steppers + delete, **canh stepper section**, **"Tổng số món" dish table** (dish×nhân×qty×giá), note w/ "Đã lưu" (`OrderSummary.tsx:140-310`) | 🔴 | Rewrite I-zone ASCII to show steppers, canh section, dish table, collapse toggle. |
| **TableConfirmModal** | Title "Xác nhận đặt hàng"; button "Đặt hàng"; inline "Ghi chú cho bếp" textarea; success = `clearCart()`+`router.replace` | Title "Xác nhận đơn Bàn 03" and button "Xác nhận gọi món" in old doc; OLD doc claim of `setActiveOrderId` also wrong | 🔴(copy)🟡 | Code already correct — old doc was wrong; remove the `setActiveOrderId` claim from docs. |
| **MiniCartStrip** | (unchanged by new design) `🛒 3 món · 105.000đ [Xem giỏ →]` | Scrolling row of item-name chips between count and total; whole strip is one tap target; no 🛒, no "Xem giỏ →" (`MiniCartStrip.tsx:18-38`) | 🟡 | Redraw with chip row; drop the button label. |
| **CartDrawer** | (unchanged by new design) Title + items `[–]qty[+] 🗑` + total + `[Thanh toán]` | Also: name/table subtitle, conditional "Xem đơn hàng" (when `activeOrderId`), collapsible combo dish list, "Tiếp tục chọn món" footer, add-to-order button variant "Thêm vào đơn hàng" (`CartDrawer.tsx:73-229`) | 🟡 | Expand drawer ASCII with these states. |
| **AddToOrderBanner** | (unchanged) `▸ Đang thêm món vào đơn #123 [Xem đơn]` | Text "Chọn món để thêm vào đơn hàng hiện tại" + PlusCircle icon; order id not shown (`AddToOrderBanner.tsx:14-16`) | 🟡 | Update banner copy. |
| **page error/empty placement** | (unchanged) error/empty implied inside ProductList | Rendered at **page level**; `OrderSummary` renders **regardless** of error/loading (`page.tsx:144-183`); error copy "⚠ Kết nối mạng yếu" | 🟡 | Note OrderSummary is always present; fix error copy. |
| **SearchBar** | (unchanged) Placeholder `🔍 Tìm món...` | "Tìm món nhanh..." (no emoji), clear-X, 1-char hint "Nhập ít nhất 2 ký tự", 300ms debounce (`SearchBar.tsx:26,38-40`) | 🟢 | Update placeholder + note hint/clear/debounce. |

**Verified-matching (unchanged by new design):** RestaurantBanner (photo banner itself), ProductCard nhân pills (inline, single-select on bánh-cuốn & trứng), OrderSummary COMBO/MÓN LẺ groups + canh steppers + "Tổng số món" table + "Đã lưu" note, ProductList (skeleton/grid/empty).

---

## Area 2 — Cross-Component Dataflow (Zustand)

**Verdict:** store shape, action names, selector formulas, the canh gate and the "no zone→zone props"
rule all match exactly. One hard error (MenuHeader source) + one note gap.

| Topic | Doc says | Code reality (file:line) | Sev | Solution |
|---|---|---|---|---|
| MenuHeader data source | NEW spec: no table label in the header at all — "Bàn 04" pill is in the order-summary header only | OLD code reads `useSettingsStore().tableLabel` (`MenuHeader.tsx:11`) for a subtitle; cart store not used in header | 🔴 **GAP — code pending rebuild** | Remove table-label logic from MenuHeader entirely; surface "Bàn 04" via order-summary header. (`OrderSummary.tsx:47` already reads cart `tableName` — reuse there.) |
| TableConfirmModal note | drains store `orderNote` | uses its **own local** `useState` note; POST sends `note: note.trim()\|\|null`; store `orderNote` never read (`TableConfirmModal.tsx:15-16,23`) | 🟡 | Doc: QR path collects a separate note; store `orderNote` only used by the online `/checkout` path. |
| `addItem` dedup, `total()`/`itemCount()` selectors, `setCanhQty` signature, `clearCart` field list, single `buildOrderItemsPayload` builder for all 3 POST paths, canh gate `id.startsWith('canh_')` | as documented | confirmed at `cart.ts:51-59,124-125,35/97,89` · `order-payload.ts` · `page.tsx:40` | 🟢 | No action — all correct. |

---

## Area 3 — Cross-Page Dataflow (Zustand)

**Verdict:** the big flows (persist whitelist, order_cache scan, SSE stop conditions, admin isolation,
add-to-order re-entry) are accurate. The **201 success handoff is documented wrong**.

| Topic | Doc says | Code reality (file:line) | Sev | Solution |
|---|---|---|---|---|
| 201 handoff write ② | `setActiveOrderId("<id>")` stamped on success | **not called**; only `clearCart()` (resets `activeOrderId`→null) + `router.replace` (`TableConfirmModal.tsx:48-50`; `checkout/page.tsx` same) | 🔴 | Remove write ② from the handoff sequence/diagram. `activeOrderId` is set later by the "Theo dõi" button (`order/[id]/page.tsx:564`). |
| QR scan → MenuHeader sync | NEW spec: no table label in the header — "Bàn 04" surfaces in the order-summary header only, so this mismatch is resolved by the rebuild | OLD code: `/table/[tableId]/page.tsx:31` writes cart `tableName`, but MenuHeader reads `settings.tableLabel`; QR page never calls `setTableLabel` → header label blank after scan | 🔴 **GAP — resolved by header rebuild** | Removing the table label from MenuHeader eliminates this sync problem. Ensure `tableName` from the QR scan reaches the OrderSummary header "Bàn 04" pill instead. |
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

> **Context:** Items 1–8 below now reflect the new design (DESIGN_PROMPT.md) as spec. Code-rebuild gaps are marked NEW DESIGN GAP.

| # | Type | Action | Target |
|---|---|---|---|
| 1 | 🔴 NEW DESIGN GAP | Rebuild MenuHeader: photo banner + Playfair title only; remove pill bar, login button, table label | `MenuHeader.tsx` |
| 2 | 🔴 NEW DESIGN GAP | Replace CategoryTabs filter logic with scroll-spy anchor nav (IntersectionObserver); all sections always render | `CategoryTabs.tsx` / `page.tsx` |
| 3 | ✅ DONE (GAP-7-FAV) | FavouritesRail: component existed; 3 fixes applied — card tap → item detail, heart `fill-primary`, label Heart icon. Card-list heart color deferred to GAP-8. | `FavouritesRail.tsx` |
| 4 | 🔴 NEW DESIGN GAP | ComboCard nhân pills: switch to multi-select (both on by default, enforce ≥1); move "Bàn 04" pill (spinning ring) into OrderSummary header | `ComboCard.tsx` / `OrderSummary.tsx` |
| 5 | 🔴 NEW DESIGN GAP | Replace CartBottomBar (full-width bar) with two stacked floating pill buttons (cart pill + "Thanh toán" pill), no total shown | `CartBottomBar.tsx` / `page.tsx` |
| 6 | 🔴 NEW DESIGN GAP | Remove "Gọi thêm" badge from OrderSummary | `OrderSummary.tsx` |
| 7 | 🔴 NEW DESIGN GAP | Pre-fill GHI CHÚ textarea with "Gia đình (mẹ + 2 người lớn + 2 trẻ)" | `OrderSummary.tsx` / `TableConfirmModal.tsx` |
| 8 | 🔴 Doc fix | Rewrite the 201 handoff: remove `setActiveOrderId` from success path | `customer_menu.md:210`, `customer_menu_crosspage_dataflow.md` |
| 9 | 🔴 Doc fix | Fix I-zone (OrderSummary table/steppers), F-zone (inline pills, no ToppingModal), TableConfirmModal copy | `customer_menu.md` |
| 10 | 🔴 Code cleanup | Delete dead `ToppingModal.tsx`; resolve unreachable `ComboModal` (wire a trigger or delete) — plus earlier `DrinkCustomize.tsx`/`OrderNote.tsx` | `fe/src/features/menu/components/` |
| 11 | 🟡 Doc fix | MiniCartStrip chips, CartDrawer extra states, AddToOrderBanner/SearchBar copy, `/tracking` dual-source, TableConfirmModal local-note | doc-set |
| 12 | 🟡 Type fix | Align FE nullable types (`description`/`image_path`/combo `category_id`) to `string`, or send real `null` from BE | `fe/src/types/product.ts` / serializers |
| 13 | 🟡 Code cleanup | `buildImageURL` dead — call or delete | `product_handler.go` |
| 14 | 🟢 Doc nits | Loading query order + `min-h-[44px]` reattribution; Category untyped fields | doc-set |

> Per `CLAUDE.md` (MASTER-first + scope contract): the doc fixes are one task; each code change
> must be registered in `MASTER_TASK.md` before any file is touched.
