#!/usr/bin/env python3
"""PANEL 6 — Loading States. From customer_tracking_loading.md."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_tracking/customer_tracking.excalidraw"
ex.reset("p6")
E = []
X, Y = 40, 1000
E += ex.panel_header(X, Y, "PANEL 6 · Loading States",
                     "from _loading.md · no tracking loading.tsx — page owns its skeleton · SSE non-blocking")
L = "#1e293b"

# 5 layers
layers = [
    "1  route (shop) spinner — shared, not tracking-specific",
    "2  NO tracking-level loading.tsx — inline skeleton instead",
    "3  orderId gate (Zustand, synchronous) — no-order fallback",
    "4  query branches (first match wins)",
    "5  SSE layer — parallel, non-blocking",
]
for i, t in enumerate(layers):
    yy = Y + 60 + i * 30
    E.append(ex.rect(X, yy, 620, 24, bg=ex.L_NEUTRAL, stk=ex.L_BORDER, sw=1))
    E.append(ex.text(X + 8, yy + 5, t, fs=10, color=L))

# branch priority table
by = Y + 220
E.append(ex.text(X, by, "Branch priority (page.tsx) — first match wins:", fs=12, color=L))
branches = [
    ("1", "!orderId", "no-order guard fallback", ex.C_SLATE),
    ("2", "isError && !order", "404 card", ex.C_RED),
    ("3", "isUnauthorized (SSE)", "401 session-expired card", ex.C_RED),
    ("4", "isLoading && !order", "animate-pulse skeleton (3 cards)", ex.C_AMBER),
    ("5", "otherwise", "LIVE content", ex.C_TAN),
]
for i, (p, cond, render, c) in enumerate(branches):
    yy = by + 26 + i * 28
    E.append(ex.rect(X, yy, 30, 24, bg=c, stk=c))
    E.append(ex.text(X + 9, yy + 5, p, fs=11, color="#0a0a0a"))
    E.append(ex.text(X + 40, yy + 5, cond, fs=10, color=L))
    E.append(ex.text(X + 300, yy + 5, render, fs=10, color="#475569"))

# partial-data note
ny = by + 180
E.append(ex.rect(X, ny, 620, 84, bg="#eef2ff", stk=ex.C_CYAN, sw=2))
E.append(ex.text(X + 10, ny + 8, "Partial-data window (order + SSE run in parallel):", fs=11, color=L))
E.append(ex.text(X + 10, ny + 28, "order ✓ / sseConnected ✗ → live content + ErrorBanner;", fs=10, color="#475569"))
E.append(ex.text(X + 10, ny + 44, "  TableInfoBanner queuePosition=null; FloorList HIDDEN until first queue.update.", fs=10, color="#475569"))
E.append(ex.text(X + 10, ny + 62, "background refetch uses isFetching (not isLoading) → skeleton never re-flashes.", fs=10, color="#7c2d12"))

print("PANEL 6:", ex.append(FP, E), "total elements")
