#!/usr/bin/env python3
"""PANEL 13 — Failure / Edge Map.
Sourced from _loading.md (conflation), _be.md (Redis fail-open, error), _crosspage (prune), _crosscomponent gotchas."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_favourites/customer_favourites.excalidraw"
ex.reset("p13")
E = []

X, Y = 1900, 5800
E.append(ex.rect(1880, Y - 20, 1540, 1020, bg="#0b1220", stk="#0b1220"))
E += ex.panel_header(X, Y, "PANEL 13 · Failure / Edge Map",
                     "every unhappy path — all soft, all silent (no error UI on the suite)",
                     color=ex.LIGHT, sub_color=ex.MUTED)

edges = [
    ("Redis down", ex.C_BE,
     "getCacheJSON/setCacheJSON swallow errors → fall through to MySQL.\nResult: suite SURVIVES — slower, no user-visible failure."),
    ("both queries fail", ex.C_RED,
     "queries default to [] → resolvedItems=[] → EmptyState \"Nhấn ♥…\".\nNETWORK FAILURE IS SILENT — same surface as 'no favourites yet'."),
    ("favourite product removed server-side", ex.C_AMBER,
     "absent from cached payload → flatMap drops + useEffect removeItem + toast.\nPull + 5-min TTL, no push → up to ~10min stale before prune."),
    ("combo references a dead product", ex.C_CYAN,
     "GET /combos ids only; product lookup misses →\n'Món không rõ tên' (list) / raw id (sets). Cosmetic, not an error."),
    ("save empty set mid-load", ex.C_VIOLET,
     "[Lưu set này] gated on RHF isValid (name only), NOT query state →\na set typed before queries resolve captures items that show empty."),
    ("apply set after items[] changed", ex.C_SLATE,
     "addSet froze [...items] at save → apply uses the snapshot, not live store.\nIntentional: sets are saved states, not live views."),
    ("apply two sets / add-all twice", ex.C_ORD,
     "addItem is ADDITIVE (dedup by id → qty bump). cart accumulates —\nno replace. product key encodes sorted toppingIds → diff toppings = diff line."),
]

cy = Y + 60
for title, accent, body in edges:
    h = 74
    E.append(ex.rect(1900, cy, 1480, h, bg=ex.CARD_BG, stk=accent, sw=2))
    E.append(ex.rect(1900, cy, 8, h, bg=accent, stk=accent))
    E.append(ex.text(1918, cy + 8, title, fs=12, color=ex.LIGHT))
    E.append(ex.text(1918, cy + 30, body, fs=9, color=ex.MUTED, ff=3))
    cy += h + 10

ex.append(FP, E)
print(f"PANEL 13: {len(E)} elements")
