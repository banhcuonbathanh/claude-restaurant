#!/usr/bin/env python3
"""PANEL 5 — Cross-Page Dataflow (read-only consumer).
SOURCE NOTE: customer_tracking_crosspage_dataflow.md does not exist (by design — page
hands nothing off). Built from _crosscomponent §5 + SCENARIO_TRACK_ORDER.md §B durability matrix."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_tracking/customer_tracking.excalidraw"
ex.reset("p5")
E = []
X, Y = 740, 620
E += ex.panel_header(X, Y, "PANEL 5 · Cross-Page Dataflow — read-only downstream consumer",
                     "no dedicated crosspage file (by design) · from _crosscomponent §5 + SCENARIO §B · /tracking writes NOTHING")
L = "#1e293b"

# journey chain
chain = ["/table/:id", "/menu", "/tracking"]
cx = X
for i, p in enumerate(chain):
    c = ex.C_VIOLET if p == "/tracking" else ex.C_SLATE
    E.append(ex.rect(cx, Y + 60, 150, 40, bg=ex.L_NEUTRAL, stk=c, sw=2))
    E.append(ex.text(cx + 12, Y + 72, p, fs=12, color=L))
    if i < 2:
        E.append(ex.arrow(cx + 150, Y + 80, cx + 200, Y + 80, stk=ex.MUTED, sw=2))
    cx += 200
E.append(ex.text(X + 420, Y + 72, "QR scan → guest JWT → order created → observe", fs=10, color="#94a3b8"))

# what it receives
E.append(ex.text(X, Y + 120, "What /tracking RECEIVES (never sends):", fs=12, color=L))
rows = [
    ("activeOrderId", "set by /menu after POST /orders → useCartStore (partialize → STORAGE_KEYS.CART_CONFIG)", "survives F5 ✅", ex.C_ZUS),
    ("guest accessToken", "from /table/:id QR scan → useAuthStore (memory only)", "dies on F5 ❌ → re-fetch /auth/me", ex.C_RED),
    ("floor queue / table status", "BE SSE initial snapshot + live pub/sub", "session only ❌", ex.C_CYAN),
]
for i, (k, v, dur, c) in enumerate(rows):
    yy = Y + 146 + i * 50
    E.append(ex.rect(X, yy, 980, 44, bg=ex.L_NEUTRAL, stk=c, sw=2))
    E.append(ex.text(X + 10, yy + 6, k, fs=11, color=L))
    E.append(ex.text(X + 10, yy + 24, v, fs=9, color="#475569"))
    E.append(ex.text(X + 980 - 220, yy + 13, dur, fs=10, color="#7c2d12"))

E.append(ex.text(X, Y + 300, "Full order lifecycle/handoff owner: ../customer_menu/customer_menu_crosspage_dataflow.md", fs=9, color="#94a3b8"))

print("PANEL 5:", ex.append(FP, E), "total elements")
