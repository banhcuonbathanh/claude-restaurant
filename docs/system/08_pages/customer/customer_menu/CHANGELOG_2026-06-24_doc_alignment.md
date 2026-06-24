# Change Log — customer_menu doc alignment + GAP-1

> **Date:** 2026-06-24 · **Branch:** `experience_claude.md_system_1_test_iphon2_change_code`
> **What this records:** every file I changed in this session — the GAP-1 header rebuild, the
> doc-status sync, the broken-link fixes, and the new `index.md`. Plus what is **not** done yet.

---

## 0 · Summary

| Category | Files touched | Status |
|---|---|---|
| Code (GAP-1 header rebuild) | `MenuHeader.tsx` + `header-example.jpg` | ✅ done (lint + build pass) |
| New file | `index.md` | ✅ created |
| GAP-1 status sync | `COMPARISON_DISCUSSION.md`, `index.md`, `customer_menu.md` | ✅ done |
| Broken relative-link fixes | `customer_menu.md`, `customer_menu_be.md`, `index.md`, `SCENARIO_LUNCH_RUSH.md` | ✅ done |
| Remaining gap-status markers (zones C/D/E/I + comparison files) | not yet touched | ⬜ pending your go-ahead |
| Suất Giò price conflict | flagged only — not edited | ⚠️ needs your decision |

---

## 1 · Code change (GAP-1) — done by spawned sub-agent, verified by me

### `fe/src/features/menu/components/MenuHeader.tsx` — fully rebuilt
- **Before:** sticky bar (`sticky top-0 z-20 … border-b`) with title + `tableName` subtitle + a
  login/logout button; imported `useRouter`, `LogIn/LogOut`, `useCartStore`, `useAuthStore`,
  `logout`, `Button`.
- **After:** a `h-[196px]` photo banner — `next/image` (`/header-example.jpg`, `fill`, `priority`,
  `sizes="100vw"`, `object-cover`) + gradient overlay `bg-gradient-to-b from-background/40 via-background/10 to-background/95`
  + Playfair title (`font-display text-[27px] text-white [text-shadow:…]`) at `top-[18px]`.
- **Removed:** login button, table label, pill bar. Header no longer reads any store.
- **Not duplicated:** the "Bàn XX" pill stays only in `OrderSummary.tsx:147-149` (moved there by GAP-5).
- **Verify:** `npm run lint` pass · `npm run build` pass (`/menu` compiled, 17.4 kB).

### `fe/public/header-example.jpg` — new asset
- Copied from `claude_design/Combo card with favorites and toppings/header-example.jpg` (≈293 KB).

> **Judgment call to confirm:** title sits at `top-[18px]` (per the HTML artifact) rather than
> vertically centered as the DESIGN_PROMPT prose says. Tell me if you want it centered.

---

## 2 · New file

### `index.md` — created
Folder map: read-order table, per-file description + alignment status, §3 alignment audit (A–G),
§4 current code-update gap table, §5 source-of-truth map.

---

## 3 · GAP-1 status sync (3 docs) — *source used: the code state above*

### `COMPARISON_DISCUSSION.md`
- GAP-1 section: status `⬜ chưa bàn` → `✅ xong (2026-06-24)`.
- Added a "🔗 Code (after)" line (photo banner, gradient, Playfair, pill not duplicated, asset path).
- "💬 Yêu cầu của bạn" → `✅ rebuild theo design mới (spawn agent)`.
- "🗣 Thảo luận" + "✅ Quyết định" filled in.
- Bottom tracker row GAP-1: `⬜` → `✅ (2026-06-24)`, description rewritten.
- Header count line: `⬜ 7 | 🔧 0 | ✅ 3` → `0 | 0 | 8 (✅) · 2 💬 (GAP-3, GAP-4)`.

### `index.md`
- §4 GAP-1 row: `🔴 PENDING` → `✅ done (2026-06-24)`.
- "Net for a code-update session" line: rewritten (all new-design builds done; only cleanup left).
- §3-A audit: added zone A to the now-done list.
- Top ⚠️ banner: "only Header pending" → "entire new design built; cleanup only".

### `customer_menu.md`
- Zone A heading: `⚠️ NEW DESIGN — code pending rebuild` → `✅ NEW DESIGN — rebuilt (GAP-1, 2026-06-24) …`.
- Wireframe ASCII annotation (banner line): `⚠️ NEW DESIGN — code pending rebuild` → `✅ NEW DESIGN — rebuilt (GAP-1)`.
- Zones table row A: `⚠️ NEW` → `✅ NEW (rebuilt GAP-1)`, data-source cell updated (`/header-example.jpg` via `next/image`).

---

## 4 · Broken relative-link fixes — *source used: the filesystem (`ls`)*

> Confirmed broken: from `…/customer_menu/`, `../../02_spec` resolves to the non-existent
> `docs/system/08_pages/02_spec`. Correct depth is `../../../`. The dataflow docs were already correct.

| File | Replacement | Count |
|---|---|---|
| `customer_menu.md` | `../../02_spec/` → `../../../02_spec/` | 12 |
| `customer_menu.md` | `../../07_business_logic/` → `../../../07_business_logic/` | 4 |
| `customer_menu_be.md` | `../../02_spec/` → `../../../02_spec/` | 2 |
| `index.md` | `../../02_spec/` → `../../../02_spec/` | 1 |
| `index.md` | `../../07_business_logic/` → `../../../07_business_logic/` | 1 |
| `SCENARIO_LUNCH_RUSH.md` | `../../04_fe/` → `../../../04_fe/` | 8 |
| `SCENARIO_LUNCH_RUSH.md` | `../../07_business_logic/` → `../../../07_business_logic/` | 1 |
| `SCENARIO_LUNCH_RUSH.md` | `../../09_devops/` → `../../../09_devops/` | 1 |
| `SCENARIO_LUNCH_RUSH.md` | `../../10_caching/` → `../../../10_caching/` | 1 |
| `SCENARIO_LUNCH_RUSH.md` | bare `](MENU_CATALOG.md)` → `](../../../02_spec/object/MENU_CATALOG.md)` | 1 |
| `SCENARIO_LUNCH_RUSH.md` | bare `](OBJECT_MODELS.md)` → `](../../../02_spec/object/OBJECT_MODELS.md)` | 1 |
| `SCENARIO_LUNCH_RUSH.md` | bare `](OBJECT_MODEL_COMBO.md)` → `…/02_spec/object/…` | 1 |
| `SCENARIO_LUNCH_RUSH.md` | bare `](OBJECT_MODEL_INGREDIENT.md)` → `…/02_spec/object/…` | 2 |
| `SCENARIO_LUNCH_RUSH.md` | bare `](OBJECT_MODEL_ORDER.md)` → `…/02_spec/object/…` | 2 |
| `SCENARIO_LUNCH_RUSH.md` | bare `](OBJECT_MODEL_STAFF.md)` → `…/02_spec/object/…` | 1 |
| `SCENARIO_LUNCH_RUSH.md` | bare `](OBJECT_MODEL_TABLE.md)` → `…/02_spec/object/…` | 2 |

All fixed targets verified to exist (`02_spec/object/*`, `04_fe/*`, `07_business_logic/*`, `09_devops/*`, `10_caching/*`).

---

## 5 · NOT changed yet (open items)

| Item | What it is | Why not done |
|---|---|---|
| `customer_menu.md` zones C/D/E/I | Still tagged "⚠️ NEW DESIGN — code pending rebuild" though built | awaiting your go-ahead on the methodology |
| `COMPARISON_DOC_VS_CODE_DETAILED.md` (+ VI) | Exec-summary counts, Area 1 statuses, GAP-2 `setActiveOrderId` correction, action list — one revision behind | same |
| `COMPARISON_VISUAL_MOCKUP_VI.md` | Zone headings B/E/I/J still 🔴 "chờ rebuild" | same |
| **Suất Giò price** | Repo-wide conflict: DESIGN_PROMPT + SEED_DATA = **25k / 4 bánh cuốn**; MENU_CATALOG + wireframes = **21k / 3 bánh cuốn** | needs your decision — won't guess |
| `SCENARIO_LUNCH_RUSH.md` duplication | This is a copy of the canonical `02_spec/object/SCENARIO_LUNCH_RUSH.md` (links now fixed, but two copies can drift) | consolidate-vs-keep is your call |
| `MASTER_TASK.md` row for GAP-1 | Never created | your call |

---

## 6 · ⚠️ Methodology note (your new ruling)

You stated: **"code is not true anymore — DESIGN_PROMPT is true; CLAUDE.md is wrong now."**
- Rows in **§3** above were written **code-first** (marked done because the code matches). They remain
  correct only because the rebuilt header also matches DESIGN_PROMPT §1 — but the *wording* ("verified
  in code") contradicts the new ranking and should be rephrased to read against DESIGN_PROMPT.
- Rows in **§4** (link fixes) are **ranking-neutral** (filesystem facts).
- The remaining work in **§5** will be redone **DESIGN_PROMPT-first** once you confirm.
</content>
