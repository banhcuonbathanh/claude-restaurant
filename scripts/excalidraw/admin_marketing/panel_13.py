#!/usr/bin/env python3
"""PANEL 13 (dark) for admin_marketing.excalidraw — Failure / Edge Map.
Source: admin_marketing_be.md (Error Behaviour) + admin_marketing_loading.md (branches)
+ SCENARIO_MARKETING.md. Every unhappy path for a read-only, no-DB, no-validation endpoint."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_marketing/admin_marketing.excalidraw"
ex.reset("p13")
E = []

X, Y = 40, 6580
E += ex.panel_header(X, Y, "PANEL 13 · Failure / Edge Map — a read-only stub has few ways to fail",
    color=ex.PANEL_TXT)
E.append(ex.text(X, Y + 26,
    "No request body, no binding, no validation, no DB, no Redis → the endpoint cannot fail from input. Only auth + transport + null-data edges.",
    fs=10, color="#475569"))

y = Y + 64
COLW = 1500

def edge(y, accent, trigger, behaviour, src):
    h = 14 + 22 + 18 + 16
    E.append(ex.rect(X, y, COLW, h, bg=ex.CARD_BG, stk=accent))
    E.append(ex.rect(X, y, 8, h, bg=accent, stk=accent, round_=False))
    E.append(ex.text(X + 22, y + 10, trigger, fs=12, color=accent))
    E.append(ex.text(X + 22, y + 32, behaviour, fs=10, color="#E5E7EB", ff=3))
    E.append(ex.text(X + COLW - 360, y + 10, src, fs=9, color=ex.MUTED, ff=3))
    return h

edges = [
    (ex.C_RED, "401 / 403 — no/under-privileged JWT",
     "authMW + AtLeast(\"manager\") reject · FE RoleGuard redirects to /dashboard BEFORE GET fires (chef/cashier/customer).",
     "main.go:294-295"),
    (ex.C_RED, "Network down / non-2xx",
     "useMarketingSpend → isError=true → page-level red banner 'Không thể tải dữ liệu.' + Thử lại (refetch).",
     "page.tsx:46-53"),
    (ex.C_AMBER, "data.items empty (impossible w/ static)",
     "Zone D → EmptyState 🍜 'Chưa có hạng mục chi tiêu nào.' (guarded but never fires with constant payload).",
     "page.tsx:73-75"),
    (ex.C_AMBER, "summary / love_score null",
     "Zones C & E render NOTHING — no EmptyState, no message (silent blank). loading.md gap 2.",
     "page.tsx:62-64,92-94"),
    (ex.C_SLATE, "missing from / to query params",
     "c.DefaultQuery fallbacks ('2026-05-01' / '2026-05-31') → still 200. enabled guard defensive only (never empty in practice).",
     "mh.go:20-21 · uMS:15"),
    (ex.C_SLATE, "no validation / no tx / no rollback",
     "Handler does zero DB/Redis work — no unique-constraint retry, no tx, no Redis-down fallback to map. Nothing to roll back.",
     "marketing_handler.go"),
]
for col, t, b, s in edges:
    h = edge(y, col, t, b, s); y += h + 12

ex.append(FP, E)
print(f"PANEL 13: added {len(E)} elements")
