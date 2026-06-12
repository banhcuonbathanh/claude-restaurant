# 06_test_build/menu_page — docs/system Structure Test (P-SYSTEST-1)

> **TL;DR:** A from-scratch **reference rebuild** of the `/menu` page — FE + BE — written using
> only the docs/system handbook + the `client_menu_page_v2` wireframe folder.
> **It is NOT wired into the app**: no `package.json`, no `go.mod`, nothing imports these files.
> Purpose: test whether the handbook structure alone is enough to drive a clean, spec-exact build.
> Production code in `fe/src/` and `be/internal/` was **not touched**.

---

## What's here

| File | Role |
|---|---|
| **`DEV_PLAN.md`** | ⭐ The visual build plan — drawn BEFORE coding: zone layout, component tree, build order, data flow. This is the artifact the NEW_PAGE_GUIDE was missing. |
| **`DIFF_VS_CURRENT.md`** | Honest test results: where the handbook+spec sufficed, where I was forced to read production source (= handbook gaps), and doc drift found along the way. |
| `fe/` | Reference FE code — page shell, 17 zone components, 3 stores, lib, types. Mirrors `fe/src/` layout. |
| `be/` | Reference BE menu slice — handler → service → repository for the 4 catalog reads + the 1 order write. Mirrors `be/internal/` layout. |

## Build inputs (what the test allowed)

1. `docs/system/` handbook (all 6 folders)
2. The `/menu` page wireframe folder (`client_menu_page_v2`) — `menu_spec.md` (canonical) + `menu_spec_v3_visual.md` (2026-06-11, code-verified); folder layout standard: `../../05_dev_guide/WIREFRAME_STANDARD.md`
3. Production source **only where the docs were ambiguous or stale** — every such read is logged in `DIFF_VS_CURRENT.md` as a handbook gap

## Conflict rule used

Where `menu_spec.md` (last touched 2026-06-08) and `menu_spec_v3_visual.md` (2026-06-11) disagree,
**v3 wins** — it is the file re-verified against code after the TOP epic (nhân = topping,
`filling` dropped, `table_busy` contract, MenuHeader redesign).
