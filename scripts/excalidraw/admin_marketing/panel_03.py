#!/usr/bin/env python3
"""PANEL 3 for admin_marketing.excalidraw — BE View.
Source: admin_marketing_be.md. 1 endpoint, read-only, fully hardcoded handler —
no service, no repo, no SQL, no Redis. Code: be/internal/handler/marketing_handler.go,
be/cmd/server/main.go:294-306."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_marketing/admin_marketing.excalidraw"
ex.reset("p3")
E = []

X, Y = 40, 1620
E += ex.panel_header(X, Y, "PANEL 3 · Backend View — 1 endpoint, read-only, fully hardcoded",
    "admin_marketing_be.md · GET /admin/marketing/spend · authMW + AtLeast(\"manager\") · NO service · NO repo · NO SQL · NO Redis · intentional pre-launch stub")

def lbl(x, y, s, fs=12, color=ex.L_TEXT, ff=2, w=None):
    E.append(ex.text(x, y, s, fs=fs, color=color, ff=ff, w=w))

# ---- endpoint pipeline (boxes left→right) ----
py = Y + 70
stages = [
    ("ENDPOINT", "GET /admin/marketing/spend\n?from=&to=", "#6366f1"),
    ("AUTH", "authMW +\nAtLeast(\"manager\")\nmain.go:294-295", ex.C_VIOLET),
    ("HANDLER", "marketingH.GetSpend\nmarketing_handler.go:19\nbuilds gin.H literal", ex.C_ORD),
    ("SERVICE", "∅  none", ex.C_SLATE),
    ("REPO / SQL", "∅  none", ex.C_SLATE),
    ("REDIS", "∅  none", ex.C_SLATE),
]
bw, bh, gap = 250, 90, 36
for i, (tag, body, col) in enumerate(stages):
    bx = X + i * (bw + gap)
    E.append(ex.rect(bx, py, bw, bh, bg=ex.L_NEUTRAL, stk=col, sw=2))
    E.append(ex.rect(bx, py, bw, 24, bg=col, stk=col))
    lbl(bx + 10, py + 5, tag, fs=11, color="#ffffff")
    lbl(bx + 10, py + 32, body, fs=10, ff=3, color=ex.L_TEXT)
    if i < len(stages) - 1:
        E.append(ex.arrow(bx + bw + 4, py + bh // 2, bx + bw + gap - 4, py + bh // 2,
                          stk=ex.L_BORDER, sw=2))

# ---- response shape ----
ry = py + bh + 40
lbl(X, ry, "RESPONSE SHAPE  (consumed by fe/src/types/marketing.ts · MarketingSpendResponse)", fs=12, color=ex.PANEL_TXT)
ry += 24
shape = (
"data: {\n"
"  date_range: { from, to }          ← ONLY place params land (echoed, never used to filter) mh.go:58\n"
"  summary:    { total_budget, total_spent, total_remaining, spent_pct, roi, roi_base }   mh.go:59-66\n"
"  items[5]:   { id, icon, name, sub_items[], budget, spent, remaining, progress_pct, color }  mh.go:23-54\n"
"  love_score: { cost_per_new_customer, target/current_customers, target/current_followers,\n"
"                follower_progress_pct, satisfaction_score, satisfaction_max }   mh.go:68-77\n"
"}")
E.append(ex.rect(X, ry, 1180, 150, bg="#0f172a", stk=ex.C_ORD, sw=2))
lbl(X + 14, ry + 12, shape, fs=11, ff=3, color="#E5E7EB")

# ---- auth + caching cards (right) ----
AX = X + 1220
ay = py
E.append(ex.rect(AX, ay, 460, 110, bg=ex.L_NEUTRAL, stk=ex.C_VIOLET, sw=2))
lbl(AX + 12, ay + 8, "AUTH MODEL", fs=12, color="#7c3aed")
for i, s in enumerate([
    "• manager OR admin pass · chef/cashier/customer 403",
    "• same gate as all /admin/* analytics routes",
    "• FE RoleGuard(minRole=MANAGER) redirects under-",
    "  privileged before GET fires · no ownership concept",
]):
    lbl(AX + 12, ay + 30 + i * 18, s, fs=10, color=ex.L_TEXT)

cy2 = ay + 130
E.append(ex.rect(AX, cy2, 460, 110, bg=ex.L_NEUTRAL, stk=ex.C_TAN, sw=2))
lbl(AX + 12, cy2 + 8, "CACHING", fs=12, color="#047857")
for i, s in enumerate([
    "• Server: NONE — handler stores nothing",
    "• Client: TanStack staleTime 5min · enabled:",
    "  !!from && !!to (useMarketingSpend.ts:14-15)",
    "• distinct keys per range, IDENTICAL payloads",
]):
    lbl(AX + 12, cy2 + 30 + i * 18, s, fs=10, color=ex.L_TEXT)

cy3 = cy2 + 130
E.append(ex.rect(AX, cy3, 460, 90, bg="#fff7ed", stk=ex.C_ORD, sw=2))
lbl(AX + 12, cy3 + 8, "ERROR BEHAVIOUR", fs=12, color="#b45309")
for i, s in enumerate([
    "• Cannot fail from input — no binding/validation/DB",
    "• DefaultQuery fallbacks → always 200",
    "• Only real failures: network, 401/403 (authMW)",
]):
    lbl(AX + 12, cy3 + 30 + i * 18, s, fs=10, color="#b45309")

ex.append(FP, E)
print(f"PANEL 3: added {len(E)} elements")
