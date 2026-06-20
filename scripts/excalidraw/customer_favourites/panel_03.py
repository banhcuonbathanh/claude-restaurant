#!/usr/bin/env python3
"""PANEL 3 — BE View (2 public GETs, read-only suite).
Sourced from customer_favourites_be.md (endpoints table, auth model, caching, error behaviour)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_favourites/customer_favourites.excalidraw"
ex.reset("p3")
E = []

X, Y = 1800, 40
E += ex.panel_header(X, Y, "PANEL 3 · BE View",
                     "Read-only catalog consumer — 2 public GETs, ZERO writes · same cached reads as /menu")

def box(x, y, w, h, title, lines, accent, fs=10):
    out = [ex.rect(x, y, w, h, bg="#ffffff", stk=accent, sw=2),
           ex.rect(x, y, w, 26, bg=accent, stk=accent),
           ex.text(x + 10, y + 6, title, fs=12, color=ex.DARK),
           ex.text(x + 10, y + 34, lines, fs=fs, color=ex.L_TEXT, ff=3)]
    return out

cy = Y + 60
# Endpoint table
E += box(1800, cy, 1080, 150, "Endpoints used (both public · no authMW)",
         "# │ method path   │ handler→service→repo                    │ Redis\n"
         "1 │ GET /products │ ListProducts → ListProductsAvailable    │ products:list  TTL 5m\n"
         "  │               │ (handler:42 · service:164 · repo:173)   │\n"
         "2 │ GET /combos   │ ListCombos → ListCombosAvailable        │ combos:list   TTL 5m\n"
         "  │               │ (handler:327 · service:497 · repo:505)  │\n"
         "routes: main.go:167-168 (/products) · 215-216 (/combos) — bare .GET on group",
         ex.C_BE)

ay = cy + 170
E += box(1800, ay, 530, 130, "Auth model",
         "both endpoints FULLY public\nno authMW on either GET\nguest JWT never exercised here\n(first needed at POST /orders, checkout)\ncatalog mutations = staff-only (not\nreachable from this page)",
         ex.C_ORD)
E += box(2350, ay, 530, 130, "Caching & invalidation",
         "TTL = productCacheTTL 5min\nkeys: products:list · combos:list\npage NEVER writes → never invalidates\ninvalidation only via staff mutation\nRedis fail-open → MySQL fallback\nsuite survives a Redis outage",
         ex.C_TAN)

ey = ay + 150
E += box(1800, ey, 1080, 110, "Error behaviour (FE failure is soft)",
         "service err → handleServiceError → standard codes (400 essentially unreachable — no inputs to validate)\n"
         "FE: both queries default to []  (page.tsx:25,31)\n"
         "failed/empty fetch → renders EmptyState \"Nhấn ♥…\", NOT an error banner\n"
         "⇒ network failure is visually indistinguishable from \"no favourites yet\"  (see Panel 6/13)",
         ex.C_RED)

# combo->product join note
ny = ey + 130
E += box(1800, ny, 1080, 76, "Combo names resolved FE-side against /products",
         "GET /combos returns combo_items: [{id, product_id, quantity}] — IDS ONLY\n"
         "FE looks each product_id up in the products list → fallback 'Món không rõ tên' / raw id ⇒ both GETs always fetched together",
         ex.C_CYAN)

ex.append(FP, E)
print(f"PANEL 3: {len(E)} elements")
