#!/usr/bin/env python3
"""PANEL 3 — BE View for admin_summary.excalidraw.
Sourced from docs/system/08_pages/admin/admin_summary/admin_summary_be.md."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_summary/admin_summary.excalidraw"
ex.reset("p3")
E = []
T = ex.L_TEXT
B = ex.L_BORDER

X, Y = 2920, 40
E += ex.panel_header(X, Y, "PANEL 3 · BE View — 5 endpoints",
                     "ALL authMW · AtLeast('manager') · raw SQL · NO Redis (live MySQL) · source: admin_summary_be.md")

# endpoint table
ty = Y + 60
hdr = ["#", "Endpoint", "Handler → Service → Repo", "Returns"]
colw = [40, 360, 360, 320]
cx = X
E.append(ex.rect(X, ty, sum(colw), 30, bg="#1e293b", stk="#334155"))
for i, h in enumerate(hdr):
    E.append(ex.text(cx + 8, ty + 8, h, fs=11, color="#f1f5f9"))
    cx += colw[i]

rows = [
    ("1", "GET /admin/summary?range=", "analytics_handler:23 → svc:28 → repo:63", "{customers,dishes_sold,revenue,active_tables}"),
    ("2", "GET /admin/top-dishes?range=&limit=", "handler:39 → svc:32 → repo:109", "[{name,qty,revenue,pct}]"),
    ("3", "GET /admin/staff-performance?range=", "handler:62 → svc:36 → repo:158", "[{staff_id,full_name,role,orders_handled,revenue*}]"),
    ("4", "GET /admin/ingredients/low-stock", "ingredient_handler:70 → svc:63 → repo:120", "[Ingredient camelCase] (status computed on read)"),
    ("5", "POST /admin/stock-movements  (WRITE)", "ingredient_handler:172 → svc:116 → repo:221", "201 {id,...} snake_case · actor from JWT"),
]
for r, row in enumerate(rows):
    yy = ty + 30 + r * 40
    bg = "#ffffff" if r % 2 == 0 else ex.L_NEUTRAL
    if row[0] == "5":
        bg = "#fff7ed"
    E.append(ex.rect(X, yy, sum(colw), 40, bg=bg, stk="#e2e8f0", sw=1))
    cx = X
    for i, cell in enumerate(row):
        col = "#dc2626" if (i == 1 and row[0] == "5") else T
        E.append(ex.text(cx + 8, yy + 11, cell, fs=9, color=col, ff=3))
        cx += colw[i]

# notes blocks
ny = ty + 30 + len(rows) * 40 + 20
def note(x, y, w, h, title, lines, accent):
    out = [ex.rect(x, y, w, h, bg=ex.L_NEUTRAL, stk=accent, sw=1.5),
           ex.text(x + 12, y + 8, title, fs=12, color="#1e293b")]
    for i, ln in enumerate(lines):
        out.append(ex.text(x + 12, y + 30 + i * 17, ln, fs=10, color="#475569"))
    return out

E += note(X, ny, 540, 120, "Auth model — uniform", [
    "authMW (AuthRequired + is_active) + AtLeast('manager') on ALL 5",
    "manager + admin pass · chef/cashier/staff/customer → 403",
    "no guest/public path · FE /admin/* RoleGuard minRole=MANAGER too",
    "write attributes actor: StaffIDFromContext → CreatedBy (handler:183)"], "#6366f1")

E += note(X + 560, ny, 540, 120, "Caching & date range", [
    "NO Redis on any endpoint — analytics on 'do-not-cache' list",
    "client TanStack only: staleTime 60s reads / 120s low-stock",
    "range BE-side: today / last-7d (INTERVAL 6) / last-30d (29)",
    "unknown range → 'today' (validRange svc:19-26)"], "#10b981")

E += note(X, ny + 140, 1100, 70, "Error behaviour", [
    "write bind fail → 400 INVALID_INPUT · INVALID_MOVEMENT_TYPE 400 · INGREDIENT_NOT_FOUND 404 · 401 token / 403 role",
    "4 reads have NO business-error branch → data or 500; each section renders its own empty-state, never an error surface"], "#f87171")

E.append(ex.text(X, ny + 220, "* staff-performance OMITS revenue key when role=='chef' (handler:72-74) → JSON shape is role-dependent", fs=9, color="#dc2626"))

n = ex.append(FP, E)
print(f"PANEL 3: added {len(E)} elements (file total {n})")
