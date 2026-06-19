#!/usr/bin/env python3
"""Generate PANEL 10 for customer_menu.excalidraw.

Four "lens" phone mockups (Loading / Cross-Component / Cross-Page / Backend)
each annotating the /menu component stack, plus a final COMBINED phone that
overlays all four lenses (colour-coded chips per component).
Matches Panel 9's dark theme.
"""
import json, copy

FP = "docs/system/08_pages/customer/customer_menu/customer_menu.excalidraw"

# ---- palette (from Panel 9) ----
PHONE_BG   = "#000000"
PHONE_STK  = "#0f172a"
CARD_BG    = "#1F2937"
CARD_STK   = "#2D3748"
ORANGE     = "#FF7A1A"
LIGHT      = "#F9FAFB"
MUTED      = "#9CA3AF"
PANEL_TXT  = "#0f172a"

# lens accent colours
L_LOAD = "#F59E0B"   # amber
L_COMP = "#22D3EE"   # cyan
L_PAGE = "#A78BFA"   # violet
L_BE   = "#22C55E"   # green

UPDATED = 1746316800000

_idc = [0]
_idx = [0]
def nid():
    _idc[0] += 1
    return f"p10-{_idc[0]:04d}"
def nidx():
    v = _idx[0]; _idx[0] += 1
    return f"d{v:04d}"

def rect(x, y, w, h, bg=CARD_BG, stk=CARD_STK, sw=1, round_=True, fill="solid"):
    return {
        "id": nid(), "type": "rectangle", "x": x, "y": y, "width": w, "height": h,
        "angle": 0, "strokeColor": stk, "backgroundColor": bg, "fillStyle": fill,
        "strokeWidth": sw, "strokeStyle": "solid", "roughness": 0, "opacity": 100,
        "groupIds": [], "roundness": {"type": 3} if round_ else None,
        "seed": 1, "version": 1, "versionNonce": 1, "isDeleted": False,
        "boundElements": [], "updated": UPDATED, "index": nidx(),
        "link": None, "locked": False, "frameId": None,
    }

def text(x, y, s, fs=11, color=LIGHT, align="left", w=None):
    lines = s.split("\n")
    maxlen = max((len(l) for l in lines), default=1)
    width = w if w is not None else int(maxlen * fs * 0.58) + 4
    height = int(len(lines) * fs * 1.25) + 2
    return {
        "id": nid(), "type": "text", "x": x, "y": y, "width": width, "height": height,
        "angle": 0, "strokeColor": color, "backgroundColor": "transparent",
        "fillStyle": "solid", "strokeWidth": 1, "strokeStyle": "solid", "roughness": 0,
        "opacity": 100, "groupIds": [], "roundness": None, "seed": 1, "version": 1,
        "versionNonce": 1, "isDeleted": False, "boundElements": [], "updated": UPDATED,
        "index": nidx(), "link": None, "locked": False, "frameId": None, "text": s,
        "fontSize": fs, "fontFamily": 2, "textAlign": align, "verticalAlign": "top",
        "containerId": None, "originalText": s, "autoResize": True, "lineHeight": 1.25,
    }

E = []  # output elements

# ============================================================ component data
# (label shown in card, mock value line)
COMPS = [
    ("MenuHeader",     "Quán Bánh Cuốn · Bàn 03"),
    ("MiniCartStrip",  "3 món · 105.000đ  [Xem giỏ]"),
    ("SearchBar",      "🔍  Tìm món…"),
    ("CategoryTabs",   "Tất cả · Bánh cuốn · Combo"),
    ("FavouritesRail", "❤  Yêu thích"),
    ("ComboSection",   "🍱  Combo Đầy Đặn"),
    ("ProductList",    "🍜  Danh sách món"),
    ("OrderSummary",   "Tóm tắt đơn + ghi chú"),
    ("CartBottomBar",  "total() / itemCount()  [Thanh toán]"),
]

# per-lens one-line note per component (index aligned to COMPS)
LOAD = [
    "instant — local, no query",
    "instant — local selectors",
    "instant; 1-char gate disables products query",
    "silent · ['categories'] stale 5m · [] until ready",
    "silent · ['products-all'] stale 5m",
    "silent · ['combos'] 5m · hidden until length>0",
    "⏳ SKELETON 5/8 cards · ['products',cat,q] 5m",
    "instant — local",
    "instant — local",
]
COMP = [
    "reads useCartStore.tableName",
    "reads total() / itemCount()",
    "local useState search → products query",
    "local useState activeCategory → filters list",
    "reads catalog (favStore) — display only",
    "reads combos · writes addItem()",
    "reads products · writes addItem()/setCanhQty()",
    "reads items[] · canh gate · orderNote",
    "reads total()/itemCount() · canh gate dims btn",
]
PAGE = [
    "tableName from QR seed · ?add_to_order=<id>=append",
    "shows activeOrderId badge if tracked order",
    "none — local only",
    "none — local UI state",
    "favorites from BE — not order-dependent",
    "POST → ?add_to_order=<id> if append mode",
    "POST to existing order if add_to_order, else new",
    "shows order_cache_<id>.total_amount (append)",
    "POST→writes order_cache_<id>·setActiveOrderId·\nclears memory cart·replace(/order/<id>)",
]
BE = [
    "UI only (uses categories)",
    "no BE — reads cart store",
    "GET /products  ⚠ search ignored on BE",
    "GET /api/v1/categories  (public)",
    "no BE call — store/local",
    "GET /api/v1/combos  (public)",
    "GET /api/v1/products  (public)",
    "no BE — cart store + snapshot",
    "POST /api/v1/orders | /orders/:id/items  authMW",
]

LENSES = [
    ("LOADING",          L_LOAD, LOAD,
     "L1 ShopLoading route spinner → L2 Suspense(MenuContent · useSearchParams)\n→ L3 four queries stale 5m.  ProductList = ONLY skeleton."),
    ("CROSS-COMPONENT",  L_COMP, COMP,
     "useCartStore singleton = HUB. No zone→zone arrows; every widget reads/\nwrites the store. total()/itemCount() derived from items[] each read → no drift."),
    ("CROSS-PAGE",       L_PAGE, PAGE,
     "Carriers: order_cache_<id> (LS ✅F5) · activeOrderId (Zustand persist ✅) ·\nURL /order/<id> & ?add_to_order ✅.  items/tableId/tableName = memory ❌dies F5."),
    ("BACKEND",          L_BE,   BE,
     "GET categories/products/combos = public · Redis 5m · fail-open.\nPOST orders / orders/:id/items / GET orders/:id = authMW guest JWT (sub=guest)."),
]

# ============================================================ layout constants
PANEL_X0 = 40
PANEL_Y0 = 4990          # title row (Panel 9 ends at 4927)
PHONE_Y  = PANEL_Y0 + 150
PHONE_W  = 300
STRIDE   = 380
CARD_X   = 14
CARD_W   = PHONE_W - 2*CARD_X
CARD_H   = 70
CARD_GAP = 8
TOP_PAD  = 16

# ---- Panel 10 title + intro ----
E.append(text(PANEL_X0, PANEL_Y0,
    "PANEL 10 · How every /menu component is wired — Loading · Cross-Component · Cross-Page · Backend  (annotated, dark theme)",
    fs=16, color=PANEL_TXT))
E.append(text(PANEL_X0, PANEL_Y0 + 26,
    "Each phone re-renders the SAME /menu stack through one lens. Read a column top-to-bottom to see how that concern flows through the 9 widgets. The 5th phone overlays all four.",
    fs=11, color="#475569"))

# colour legend
leg_y = PANEL_Y0 + 56
legend = [("⏳ Loading", L_LOAD), ("⇄ Cross-Component", L_COMP),
          ("⇋ Cross-Page", L_PAGE), ("◆ Backend", L_BE)]
lx = PANEL_X0
for lbl, col in legend:
    E.append(rect(lx, leg_y, 14, 14, bg=col, stk=col, round_=False))
    E.append(text(lx + 20, leg_y, lbl, fs=11, color="#475569"))
    lx += int(len(lbl) * 7) + 60

def draw_phone(px, py, accent, title, notes, summary, mode="lens"):
    """Draw one annotated phone mockup. mode 'lens' = single note per card."""
    # title bar above phone
    E.append(rect(px, py - 46, PHONE_W, 32, bg=accent, stk=accent))
    E.append(text(px + 12, py - 38, title + "  lens", fs=13, color="#0a0a0a"))
    # phone frame
    n = len(COMPS)
    phone_h = TOP_PAD*2 + n*(CARD_H + CARD_GAP)
    E.append(rect(px, py, PHONE_W, phone_h, bg=PHONE_BG, stk=PHONE_STK, sw=3))
    cy = py + TOP_PAD
    for i, (name, mock) in enumerate(COMPS):
        is_skel = (mode == "lens" and title == "LOADING" and name == "ProductList")
        cbg = "#3a2a18" if name in ("ComboSection",) else CARD_BG
        cstk = ORANGE if is_skel else CARD_STK
        E.append(rect(px + CARD_X, cy, CARD_W, CARD_H, bg=cbg, stk=cstk,
                      sw=2 if is_skel else 1))
        # component name + mock value
        E.append(text(px + CARD_X + 10, cy + 7, name, fs=11, color=LIGHT))
        E.append(text(px + CARD_X + 10, cy + 22, mock, fs=9, color=MUTED, w=CARD_W-20))
        # accent divider
        E.append(rect(px + CARD_X + 10, cy + 36, CARD_W - 20, 1, bg=accent, stk=accent, round_=False))
        # lens note
        E.append(text(px + CARD_X + 10, cy + 41, notes[i], fs=9, color=accent, w=CARD_W-20))
        cy += CARD_H + CARD_GAP
    # summary footer
    E.append(rect(px, cy + 6, PHONE_W, 64, bg="#0a0a0a", stk=accent, sw=2))
    E.append(text(px + 12, cy + 14, "▼ " + title + " architecture", fs=10, color=accent))
    E.append(text(px + 12, cy + 30, summary, fs=9, color=LIGHT, w=PHONE_W-24))
    return phone_h

# ---- four lens phones in a row ----
for k, (title, accent, notes, summary) in enumerate(LENSES):
    px = PANEL_X0 + k * STRIDE
    draw_phone(px, PHONE_Y, accent, title, notes, summary)

# ============================================================ COMBINED phone
COMB_X = PANEL_X0
COMB_Y = PHONE_Y + (TOP_PAD*2 + len(COMPS)*(CARD_H+CARD_GAP)) + 170
COMB_W = 1480
ROW_H  = 84
ROW_GAP = 8

E.append(rect(COMB_X, COMB_Y - 46, COMB_W, 34, bg="#0a0a0a", stk=ORANGE, sw=2))
E.append(text(COMB_X + 12, COMB_Y - 38,
    "COMBINED · every concern on one /menu — each row shows ⏳Loading  ⇄Cross-Component  ⇋Cross-Page  ◆Backend together",
    fs=13, color=ORANGE))

n = len(COMPS)
comb_h = TOP_PAD*2 + n*(ROW_H + ROW_GAP)
E.append(rect(COMB_X, COMB_Y, COMB_W, comb_h, bg=PHONE_BG, stk=PHONE_STK, sw=3))

# column layout inside combined: [component | L | C | P | B]
col_comp_w = 250
col_w = (COMB_W - 2*CARD_X - col_comp_w - 16) // 4
col_x0 = COMB_X + CARD_X
col_specs = [("⏳ LOADING", L_LOAD, LOAD), ("⇄ CROSS-COMPONENT", L_COMP, COMP),
             ("⇋ CROSS-PAGE", L_PAGE, PAGE), ("◆ BACKEND", L_BE, BE)]

# header row for columns
hdr_y = COMB_Y + 4
for c, (clab, ccol, _) in enumerate(col_specs):
    cx = col_x0 + col_comp_w + 12 + c * col_w
    E.append(text(cx + 4, hdr_y, clab, fs=10, color=ccol))

cy = COMB_Y + TOP_PAD + 14
for i, (name, mock) in enumerate(COMPS):
    # component cell
    E.append(rect(col_x0, cy, col_comp_w, ROW_H, bg=CARD_BG, stk=CARD_STK))
    E.append(text(col_x0 + 10, cy + 10, name, fs=12, color=ORANGE))
    E.append(text(col_x0 + 10, cy + 30, mock, fs=9, color=MUTED, w=col_comp_w-20))
    # four lens chips
    for c, (clab, ccol, notes) in enumerate(col_specs):
        cx = col_x0 + col_comp_w + 12 + c * col_w
        E.append(rect(cx, cy, col_w - 8, ROW_H, bg="#0a0a0a", stk=ccol))
        E.append(rect(cx, cy, 5, ROW_H, bg=ccol, stk=ccol, round_=False))
        E.append(text(cx + 12, cy + 8, notes[i], fs=9, color=ccol, w=col_w-22))
    cy += ROW_H + ROW_GAP

# combined takeaway box
tk_y = COMB_Y + comb_h + 14
E.append(rect(COMB_X, tk_y, COMB_W, 92, bg="#ffffffcc", stk=ORANGE, sw=2))
E.append(text(COMB_X + 14, tk_y + 10, "★ One-screen mental model", fs=12, color=PANEL_TXT))
E.append(text(COMB_X + 14, tk_y + 32,
    "• Server data (TanStack, stale 5m) flows DOWN through public GET categories/products/combos — only ProductList shows a skeleton; everything else degrades to empty arrays.\n"
    "• Client state lives in the useCartStore HUB: widgets never talk to each other, they read/write the store; total()/itemCount() are derived so totals never drift.\n"
    "• Cross-page durability splits at F5: order_cache_<id> + activeOrderId + URL survive; the in-memory cart (items/tableId/tableName) dies. CartBottomBar's POST is the handoff to /order/<id>.",
    fs=10, color="#1f2937", w=COMB_W-28))

# ============================================================ write back
with open(FP) as f:
    doc = json.load(f)
doc["elements"].extend(E)
with open(FP, "w") as f:
    json.dump(doc, f, ensure_ascii=False, indent=2)
print(f"added {len(E)} elements; total now {len(doc['elements'])}")
