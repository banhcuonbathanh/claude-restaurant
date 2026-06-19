# Excalidraw-Map Tracker

> Progress for `/excalidraw-map <page-folder>` — the multi-panel doc knowledge map.
> One row per page doc-set under `docs/system/08_pages/`. Update this after each page.
> Model / reference build: **customer_menu** (15 panels, 1661 elements).

**Status legend:** ✅ done · 🔄 in progress · ⬜ not started · ⚠️ blocked (thin/missing docs)

**Progress: 1 / 29 done**

---

## Customer (1 / 10)

| Status | Page | Run | Findings |
|---|---|---|---|
| ✅ | customer_menu | — (reference build) | 15 panels, 1661 elements. Source for `excalib.py` + PANEL_CATALOG. |
| ⬜ | customer_checkout | `/excalidraw-map customer_checkout` | |
| ⬜ | customer_combo_detail | `/excalidraw-map customer_combo_detail` | |
| ⬜ | customer_favourites | `/excalidraw-map customer_favourites` | |
| ⬜ | customer_order_detail | `/excalidraw-map customer_order_detail` | |
| ⬜ | customer_order_list | `/excalidraw-map customer_order_list` | |
| ⬜ | customer_product_detail | `/excalidraw-map customer_product_detail` | |
| ⬜ | customer_profile | `/excalidraw-map customer_profile` | |
| ⬜ | customer_table_qr | `/excalidraw-map customer_table_qr` | |
| ⬜ | customer_tracking | `/excalidraw-map customer_tracking` | |

## Staff (0 / 5)

| Status | Page | Run | Findings |
|---|---|---|---|
| ⬜ | staff_login | `/excalidraw-map staff_login` | |
| ⬜ | staff_register | `/excalidraw-map staff_register` | |
| ⬜ | staff_kds | `/excalidraw-map staff_kds` | |
| ⬜ | staff_pos | `/excalidraw-map staff_pos` | |
| ⬜ | staff_cashier_payment | `/excalidraw-map staff_cashier_payment` | |

## Admin (0 / 12)

| Status | Page | Run | Findings |
|---|---|---|---|
| ⬜ | admin_overview | `/excalidraw-map admin_overview` | |
| ⬜ | admin_summary | `/excalidraw-map admin_summary` | |
| ⬜ | admin_products | `/excalidraw-map admin_products` | |
| ⬜ | admin_categories | `/excalidraw-map admin_categories` | |
| ⬜ | admin_combos | `/excalidraw-map admin_combos` | |
| ⬜ | admin_toppings | `/excalidraw-map admin_toppings` | |
| ⬜ | admin_ingredients | `/excalidraw-map admin_ingredients` | |
| ⬜ | admin_staff | `/excalidraw-map admin_staff` | |
| ⬜ | admin_marketing | `/excalidraw-map admin_marketing` | |
| ⬜ | admin_task_board | `/excalidraw-map admin_task_board` | |
| ⬜ | admin_todo_list | `/excalidraw-map admin_todo_list` | |
| ⬜ | admin_training | `/excalidraw-map admin_training` | |

## Public (0 / 1)

| Status | Page | Run | Findings |
|---|---|---|---|
| ⬜ | public_landing | `/excalidraw-map public_landing` | |

---

## Findings log
> Note doc-vs-code drift, missing doc-set files, or panels skipped — discovered while building. One line per finding.

- _(none yet — reference page customer_menu was hand-built before the skill existed)_

## How to refresh this list
```bash
# pages that HAVE a full doc-set (one *_be.md = ready to map):
find docs/system/08_pages -name "*_be.md" | sort
# pages that already HAVE a map built:
find docs/system/08_pages -name "*.excalidraw" ! -name "* copy*" ! -name "*.bak" | sort
```
