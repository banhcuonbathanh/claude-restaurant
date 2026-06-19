#!/usr/bin/env python3
"""PANEL 13 — Failure / Edge Map (dark) for admin_summary.excalidraw.
Sourced from admin_summary_be.md §Error + §Flags + admin_summary_loading.md §Gaps."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_summary/admin_summary.excalidraw"
ex.reset("p13")
E = []

X, Y = 40, 4260
E += ex.panel_header(X, Y, "PANEL 13 · Failure / Edge Map",
                     "Every unhappy path on /admin/summary · source: admin_summary_be.md §Error + loading.md §Gaps",
                     color=ex.LIGHT, sub_color=ex.MUTED)
E.append(ex.rect(X - 20, Y - 20, 2400, 470, bg="#0b1220", stk="#1e293b", sw=1))

edges = [
    ("WRITE bind fail", "qty missing / not gt=0", "400 INVALID_INPUT → FE toast 'Có lỗi xảy ra khi nhập hàng'; modal stays open"),
    ("Bad movement type", "type ∉ {in,out,adjustment}", "400 INVALID_MOVEMENT_TYPE (svc:117-119) — page only sends 'in', so unreachable here"),
    ("Ingredient gone", "ingredient_id not found", "404 INGREDIENT_NOT_FOUND (svc:120-122) before any DB mutation"),
    ("Auth", "token missing/expired · role<manager", "401 (authMW) / 403 (AtLeast) — FE RoleGuard normally prevents the call"),
    ("Non-atomic write", "fail between INSERT and UPDATE", "movement logged but current_stock unchanged (no BEGIN, repo:221-248) — pre-existing risk"),
    ("No isError UI", "any read fetch fails", "no error surface — skeleton pulses forever (TanStack retries, then stuck) loading.md Gap1"),
    ("KPI undefined", "summary read exhausts retries", "SummaryKPICards shows four 0-value cards (no isError check) loading.md Gap4"),
    ("Redis-down", "N/A", "no Redis on any of the 5 endpoints → no cache-fallback branch exists"),
]
cw = 580
for i, (tag, cond, res) in enumerate(edges):
    col = i % 2
    row = i // 2
    bx = X + col * (cw + 30)
    by = Y + 55 + row * 100
    E.append(ex.rect(bx, by, cw, 88, bg="#1F2937", stk=ex.C_RED, sw=1.5))
    E.append(ex.rect(bx, by, cw, 26, bg=ex.C_RED, stk=ex.C_RED))
    E.append(ex.text(bx + 10, by + 6, tag, fs=12, color=ex.DARK))
    E.append(ex.text(bx + 12, by + 34, "when: " + cond, fs=9, color=ex.C_SLATE, ff=3))
    E.append(ex.text(bx + 12, by + 54, res, fs=9, color=ex.LIGHT, w=cw - 24, wrap=True))

n = ex.append(FP, E)
print(f"PANEL 13: added {len(E)} elements (file total {n})")
