# Customer Menu (`/menu`) — Folder Index

> **Purpose of this file:** a single map of every doc + asset in this folder — what each one holds,
> what it is the source of truth for, and whether it is currently **aligned with the live code**.
> Use it to decide *which doc to trust* when updating `/menu` code.
>
> **Branch traced:** `experience_claude.md_system_1_test_iphon2_change_code` ·
> **Last index refresh:** 2026-06-24 (code state verified by grep, see §4).
>
> ⚠️ **The single biggest thing to know before reading any doc here:** the *spec* side of this folder
> is the **new design** ([DESIGN_PROMPT.md](DESIGN_PROMPT.md)). The entire new design is now **built**
> in code (GAP-1 Header done 2026-06-24; GAP-5,6,7,8,9,10 already done). Remaining = **cleanup only**
> (GAP-3/GAP-4 dead/unreachable components). But several docs still carry stale
> *"⚠️ NEW DESIGN — code pending rebuild"* markers for zones that are already done — see
> [§3 Alignment audit](#3--alignment-audit-doc-vs-doc--doc-vs-code).

---

## 1 · Read order (fastest path to "what do I change?")

| # | Read this | To answer |
|---|---|---|
| 1 | [DESIGN_PROMPT.md](DESIGN_PROMPT.md) | What the page is *supposed* to look like (new design = spec). |
| 2 | [COMPARISON_DISCUSSION.md](COMPARISON_DISCUSSION.md) | The **decision log** — what was changed, what's done, what's left. *Most current file.* |
| 3 | [customer_menu.md](customer_menu.md) | Zones, wireframe, object model, key interactions. |
| 4 | [customer_menu_be.md](customer_menu_be.md) | Endpoints + auth + caching the page calls. |
| 5 | the dataflow + loading docs | How state moves on-page, across pages, and while loading. |
| 6 | [COMPARISON_DOC_VS_CODE_DETAILED.md](COMPARISON_DOC_VS_CODE_DETAILED.md) | Deep 5-area audit — *but see §3, it lags the decision log.* |

---

## 2 · Every file, described

### Core page doc-set (6-file gold standard)

| File | What it holds | Source of truth for | Aligned w/ code? |
|---|---|---|---|
| [customer_menu.md](customer_menu.md) | ASCII wireframe, per-zone data sources, Zones table, Key Interactions, **Object Model** (Category/Topping/Product/Combo/Cart, §1–§6) | Page zones + FE⇄BE⇄DB object shapes | 🟡 **partly stale** — zones C/D/E/I still tagged "code pending rebuild" but are **done** (§3-A) |
| [customer_menu_be.md](customer_menu_be.md) | 6 endpoints traced handler→service→repo→SQL, auth model, Redis caching (5 min TTL), error behaviour, BE flags | BE behaviour of `/menu` | ✅ accurate |
| [customer_menu_crosscomponent_dataflow.md](customer_menu_crosscomponent_dataflow.md) | The 9-step "11:40 Bàn 01" order — how widgets share `useCartStore` with no prop-drilling; store shape; one-builder payload | On-page (cross-**component**) state flow | ✅ accurate · 🟡 uses Suất Giò = **21.000đ** (conflicts DESIGN_PROMPT 25k, §3-E) |
| [customer_menu_crosspage_dataflow.md](customer_menu_crosspage_dataflow.md) | After POST: `order_cache_<id>` + `activeOrderId` + URL id, status lifecycle, SSE/WS fan-out, cancellation 8a/8b, durability matrix | Cross-**page** order state (`/menu`→order/tracking/admin) | ✅ accurate · 🟡 one diagram still shows old "Bàn 03 / 105.000đ" (§3-F) |
| [customer_menu_loading.md](customer_menu_loading.md) | 3 loading layers, 4 queries (only `products` skeletons), main-content 4-state branch, search gating | Loading behaviour | ✅ accurate (2 cosmetic nits only) |
| [SCENARIO_LUNCH_RUSH.md](SCENARIO_LUNCH_RUSH.md) | Narrative of one lunch hour using seed data (orders/staff/tables/ingredients) | Animates the object models end-to-end | ⚠️ **provenance** — this is a copy of the global `02_spec/object/` scenario; its sibling links (`MENU_CATALOG.md`, `OBJECT_MODEL_*.md`) are **broken here** (§3-G) |

### Design + comparison docs

| File | What it holds | Aligned? |
|---|---|---|
| [DESIGN_PROMPT.md](DESIGN_PROMPT.md) | The new-design build prompt (visual system, layout 1–9, favourite behaviour, confirm modal). The artifact `claude_design/.../Menu Ban Cuon.dc.html` is its source of truth. | ✅ = the spec |
| [COMPARISON_DOC_VS_CODE_DETAILED.md](COMPARISON_DOC_VS_CODE_DETAILED.md) | Deep 5-area audit (visuals/cross-component/cross-page/loading/data-model), exec summary, consolidated action list | 🔴 **lags decision log** — still lists GAP-5/6/8 as "pending rebuild" & GAP-2 as "code wrong" (§3-B) |
| [COMPARISON_DOC_VS_CODE_DETAILED_VI.md](COMPARISON_DOC_VS_CODE_DETAILED_VI.md) | Vietnamese mirror of the above | 🔴 same staleness as its EN twin (§3-B) |
| [COMPARISON_VISUAL_MOCKUP_VI.md](COMPARISON_VISUAL_MOCKUP_VI.md) | Per-zone **① doc ② real code ASCII ③ fix** + real screenshots + feedback slots | 🟡 zone headings B/E/I/J still tagged 🔴 "chờ rebuild" though done (§3-C) |
| [COMPARISON_DISCUSSION.md](COMPARISON_DISCUSSION.md) | **Decision log** GAP-1…GAP-10: proposal → owner decision → status → MASTER row | ✅ **most current** — treat as the truth for gap status |

### Assets (not docs)

| Asset | What it is |
|---|---|
| `customer_menu.excalidraw` | 8-panel doc knowledge map (wireframe + dataflow + BE + object model + loading + scenario + flags). `excalidraw.md` is its plan. `.bak` = previous version. |
| `excalidraw.md` | Plan/notes for the excalidraw map — ⚠️ its PANEL 1 self-describes as **old-design / pending update**. |
| `claude_design/` | The new-design HTML+Tailwind artifact (`Combo card with favorites and toppings/Menu Ban Cuon.dc.html`) + `header-example.jpg`. **Visual source of truth.** |
| `screenshots/*.png` | Real-app captures (2026-06-20) of the **old** design — do NOT use as reference for changed zones. |
| `Untitled-2026-05-03-2145.png` | Stray 14 MB image — provenance unclear (candidate for cleanup). |

---

## 3 · Alignment audit (doc vs doc · doc vs code)

> These are the inconsistencies to resolve so the folder is internally consistent and matches code.
> Severity: 🔴 contradicts code/another doc · 🟡 minor / cosmetic.

**A — 🔴 `customer_menu.md` stale "code pending rebuild" markers.**
Zones **A (Header)**, **C (CategoryTabs)**, **D (FavouritesRail)**, **E (ComboSection)**, **I (OrderSummary)**
are still tagged *"⚠️ NEW DESIGN — code pending rebuild"* (wireframe, Zones table, Key Interactions), but
GAP-1/5/6/7/8 are **all done** in code now (GAP-1 Header completed 2026-06-24). Zone J is already correctly
marked done. → Update markers to ✅ for A/C/D/E/I (no zone is pending anymore).

**B — 🔴 `COMPARISON_DOC_VS_CODE_DETAILED.md` (+ VI) one revision behind `COMPARISON_DISCUSSION.md`.**
Its exec summary ("8 zones are rebuild gaps", 🔴=7) and Area 1 still mark CategoryTabs / ComboCard /
OrderSummary / FavouritesRail as 🔴 pending. It also still states *"TableConfirmModal does NOT call
setActiveOrderId — customer_menu.md:210 is factually wrong"* (GAP-2), which is **no longer true**:
the order-recovery feature now **does** call `setActiveOrderId(id)` and `clearCart()` keeps identity
(confirmed in discussion + dataflow docs). → Re-sync exec summary counts, Area 1/3, and the action list
to the discussion log.

**C — 🟡 `COMPARISON_VISUAL_MOCKUP_VI.md` zone headings stale.** Zone B / E / I / J headings still read
🔴 "Code chờ rebuild" though built. (Zone C correctly ✅.) → Flip to ✅ + note rebuilt.

**D — verified code state** (grep, 2026-06-24) — see §4 for the authoritative gap table.

**E — 🟡 Suất Giò price conflict.** `crosscomponent_dataflow` uses **21.000đ**; `DESIGN_PROMPT §5` and
`customer_menu.md` OrderSummary example use **25.000đ**. → Pick one (seed catalog wins) and align.

**F — 🟡 `crosspage_dataflow` old-design leftover.** One snapshot diagram still shows `table_name:"03"`
and `total_amount:105000` (old example) while the folder standard is the **Bàn 04** order (103.000đ).

**G — ⚠️ `SCENARIO_LUNCH_RUSH.md` provenance + broken links.** It is a copy of the global
`docs/system/08_pages/customer/02_spec/object/SCENARIO_LUNCH_RUSH.md`; its links to `MENU_CATALOG.md`,
`OBJECT_MODEL_ORDER.md`, etc. resolve to siblings that **don't exist in this folder**. Also
`crosscomponent_dataflow.md` links to the `02_spec/object/` copy while `crosspage_dataflow.md` links to
the local copy — inconsistent. → Decide: keep one copy (fix links) or replace with a pointer.

---

## 4 · Current code-update state (the "what to change" table)

> Authoritative gap status — reconciled from [COMPARISON_DISCUSSION.md](COMPARISON_DISCUSSION.md) and
> re-verified against the live `fe/src/features/menu/components/` on 2026-06-24.

| Gap | Scope | Code state (verified) | Files |
|---|---|---|---|
| **GAP-1** | MenuHeader → photo banner only ("Bàn 04" pill already moved to OrderSummary in GAP-5) | ✅ **done (2026-06-24)** — `MenuHeader.tsx` rebuilt: `h-[196px]` photo banner + `next/image` + gradient + Playfair title; login + table label removed; pill not duplicated; lint + build pass | `MenuHeader.tsx`, `fe/public/header-example.jpg` |
| GAP-2 | Order-recovery: `setActiveOrderId(id)` after POST; `clearCart()` keeps identity | ✅ done | `TableConfirmModal.tsx`, `cart.ts`, `ActiveOrderRecoveryBanner.tsx` |
| GAP-3 | Dead `ToppingModal.tsx` (0 imports) | 🟠 **dead code remains** (verified 0 imports) | `ToppingModal.tsx` (delete) |
| GAP-4 | `ComboModal` unreachable | 🟠 **still imported** by `ComboCard.tsx:201` but never opened | `ComboCard.tsx`, `ComboModal.tsx` |
| GAP-5 | OrderSummary new design (table pill ring, nhân captions, "Chi tiết" toggle) | ✅ done (note pre-fill = kept empty by owner; per-subitem nhân = SKIP) | `OrderSummary.tsx` |
| GAP-6 | Category tabs → scroll-spy nav | ✅ done — new `MenuCategoryNav.tsx` + `MenuSections.tsx` (verified) | `MenuCategoryNav.tsx`, `MenuSections.tsx`, `menu/page.tsx` |
| GAP-7 | FavouritesRail align (tap→detail, orange heart, label icon) | ✅ done | `FavouritesRail.tsx` |
| GAP-8 | ComboCard nhân multi-select + orange hearts | ✅ done (FE-only; BE unchanged — nhân via `toppings_snapshot`) | `ComboCard.tsx`, `ProductCard.tsx`, `ProductGridCard.tsx` |
| GAP-9 | CartBottomBar → 2 floating pills, no total | ✅ done (verified `fixed bottom … flex-col` pills) | `CartBottomBar.tsx` |
| GAP-10 | Remove "Gọi thêm" badge | ✅ no-op (grep 0 match — never existed) | — |
| (extra) | Dead `DrinkCustomize.tsx` / `OrderNote.tsx` | 🟠 present, excluded from audit by request | cleanup candidates |
| (BE) | `GET /products` ignores `category_id`/`search` params | 🟡 known flag — tabs/search are BE no-ops (scroll-spy/search handled FE-side) | `product_handler.go` |

**Net for a code-update session:** all new-design builds are now done (GAP-1 Header completed 2026-06-24).
The only remaining work is **cleanup** (GAP-3 dead `ToppingModal`, GAP-4 unreachable `ComboModal`, dead
`DrinkCustomize`/`OrderNote`) — both GAP-3 & GAP-4 await your delete-vs-keep decision.

---

## 5 · Source-of-truth map (one fact, one home)

| Fact | Home |
|---|---|
| Visual / design intent | `DESIGN_PROMPT.md` + `claude_design/…/Menu Ban Cuon.dc.html` |
| Gap status / decisions | `COMPARISON_DISCUSSION.md` |
| Page zones + object model | `customer_menu.md` |
| BE endpoints / auth / cache | `customer_menu_be.md` |
| On-page state flow | `customer_menu_crosscomponent_dataflow.md` |
| Cross-page order state | `customer_menu_crosspage_dataflow.md` |
| Loading behaviour | `customer_menu_loading.md` |
| Order write pipeline (full) | `../../../02_spec/object/OBJECT_MODEL_ORDER.md` |
| Business rules (canh, combo, cancel) | `../../../07_business_logic/LOGIC_FE.md` · `LOGIC_BE.md` |
</content>
</invoke>
