---
tags: [docs]
---

# Docs — System Handbook (`docs/system/`)

Self-contained handbook of the whole system (Phase P-SYSDOC).

## Structure

| Folder | Contents |
|---|---|
| `00_overview/` | system overview |
| `01_flow/` | flows |
| `02_spec/` | specs |
| `03_be/` · `04_fe/` | BE/FE guides |
| `05_dev_guide/` | dev guides |
| `07_business_logic/` | **MANDATORY read before any logic/flow change** → [[Concept - Order Lifecycle]] |
| `08_pages/` | per-page doc-sets + ASCII wireframes (gold standard: `customer/customer_menu/` 6-file set) |
| `09_devops/` | → [[Architecture - Infrastructure]] |
| `10_caching/` | caching |
| `11_ai/` | → [[BE - Chat AI]] |

## Entry point for agents

`docs/system/AGENT_OS_check.md` — task type → READ / SKILL / VERIFY / UPDATE routing table.

## Page doc-sets (08_pages)

Model set: `docs/system/08_pages/customer/customer_menu/` — `<page>.md`, `<page>_be.md` (endpoint traced handler→service→repo→SQL), dataflow ×2, loading, scenario. Generated/refreshed by the `/page-doc-set` skill. Feeds [[FE - Customer Menu]], [[FE - Favourites]], etc.

## Known drift

Owner decisions logged as DRIFT (e.g. cancel-anytime) live here — doc-vs-code drift list is maintained in this handbook.
