#!/usr/bin/env python3
"""Append PANELS 12–15 to customer_menu.excalidraw — the "under the hood" set.

  12 · DB ROW-LEVEL VIEW — the actual orders + order_items rows in MySQL
       (₫0 combo header + 2 children + món lẻ + canh), every column, plus the
       qty_served-derived status + chk_oi_item_type rules.
  13 · REALTIME FAN-OUT — one POST commit → Redis pub/sub → 5 channels →
       BE SSE/WS handlers → FE hooks → which OTHER screens light up.
  14 · FAILURE / EDGE MAP — every unhappy path: 400s, combo-not-in-combo,
       uq_orders_order_number retry, Redis-down fallback, tx defer-Rollback.
  15 · ONE FIELD, ALL LAYERS — the "nhân thịt" ₫0 topping traced tap → Zustand
       → payload → service snapshot → SQL JSON column → read-back → render.

APPEND-ONLY: reads the file, extends elements, writes back. Deletes nothing.
Traced from source on branch experience_claude.md_system_1:
  be/migrations/005_orders.sql · be/internal/service/order_service.go ·
  be/internal/sse/*.go · be/internal/websocket/handler.go ·
  fe/src/hooks/useOrderSSE|useAdminSSE|useOrderMonitorSSE.ts ·
  fe/src/lib/order-payload.ts.  Matches Panel 9–11 dark theme.
"""
import json

FP = "docs/system/08_pages/customer/customer_menu/customer_menu.excalidraw"

CARD_BG = "#1F2937"; CARD_STK = "#2D3748"; LIGHT = "#F9FAFB"; MUTED = "#9CA3AF"
DARK = "#0a0a0a"; PANEL_TXT = "#0f172a"; SUB = "#475569"
C_COMBO = "#FB923C"; C_MONLE = "#FBBF24"; C_CANH = "#34D399"
C_PAY = "#A78BFA"; C_BE = "#22C55E"; C_TAN = "#22D3EE"; C_RED = "#F87171"
UPDATED = 1746316800000

_idc = [0]; _idx = [0]
def nid():
    _idc[0] += 1; return f"p1215-{_idc[0]:04d}"
def nidx():
    v = _idx[0]; _idx[0] += 1; return f"g{v:04d}"

def rect(x, y, w, h, bg=CARD_BG, stk=CARD_STK, sw=1, round_=True):
    return {"id": nid(), "type": "rectangle", "x": x, "y": y, "width": w, "height": h,
        "angle": 0, "strokeColor": stk, "backgroundColor": bg, "fillStyle": "solid",
        "strokeWidth": sw, "strokeStyle": "solid", "roughness": 0, "opacity": 100,
        "groupIds": [], "roundness": {"type": 3} if round_ else None, "seed": 1,
        "version": 1, "versionNonce": 1, "isDeleted": False, "boundElements": [],
        "updated": UPDATED, "index": nidx(), "link": None, "locked": False, "frameId": None}

def text(x, y, s, fs=11, color=LIGHT, ff=2, align="left", w=None, wrap=False):
    lines = s.split("\n"); maxlen = max((len(l) for l in lines), default=1)
    cw = 0.6 if ff == 3 else 0.58
    width = w if w is not None else int(maxlen*fs*cw)+4
    if wrap and w:
        per = max(1, int(w / (fs * cw)))
        nrows = sum(max(1, -(-len(l)//per)) for l in lines)
    else:
        nrows = len(lines)
    return {"id": nid(), "type": "text", "x": x, "y": y,
        "width": width, "height": int(nrows*fs*1.25)+2, "angle": 0,
        "strokeColor": color, "backgroundColor": "transparent", "fillStyle": "solid",
        "strokeWidth": 1, "strokeStyle": "solid", "roughness": 0, "opacity": 100,
        "groupIds": [], "roundness": None, "seed": 1, "version": 1, "versionNonce": 1,
        "isDeleted": False, "boundElements": [], "updated": UPDATED, "index": nidx(),
        "link": None, "locked": False, "frameId": None, "text": s, "fontSize": fs,
        "fontFamily": ff, "textAlign": align, "verticalAlign": "top",
        "containerId": None, "originalText": s, "autoResize": (not wrap), "lineHeight": 1.25}

E = []
PANEL_X = 40
ROW_W = 2476
RIGHT = PANEL_X + ROW_W

def title(y, t, sub, accent=PANEL_TXT):
    E.append(text(PANEL_X, y, t, fs=16, color=PANEL_TXT))
    E.append(text(PANEL_X, y + 26, sub, fs=11, color=SUB, w=ROW_W, wrap=True))
    return y + 52

def db_table(x, y, tbl_title, cols, rows, accent=C_BE):
    """cols=[(label,width)]  rows=[(cells[], row_accent_or_None, note)] -> height."""
    tw = sum(w for _, w in cols) + 220       # +note column
    rh = 26
    # title bar
    E.append(rect(x, y, tw, 24, bg=accent, stk=accent))
    E.append(text(x + 10, y + 5, tbl_title, fs=12, color=DARK))
    hy = y + 24
    # header row
    E.append(rect(x, hy, tw, rh, bg="#111827", stk=CARD_STK))
    cx = x
    for lbl, w in cols:
        E.append(text(cx + 6, hy + 6, lbl, fs=9, color=accent, ff=3))
        E.append(rect(cx, hy, 1, rh, bg=CARD_STK, stk=CARD_STK, round_=False))
        cx += w
    E.append(text(cx + 6, hy + 6, "← row type / note", fs=9, color=accent, ff=3))
    ry = hy + rh
    for cells, racc, note in rows:
        rc = racc or CARD_STK
        E.append(rect(x, ry, tw, rh, bg="#0d1320", stk=CARD_STK))
        E.append(rect(x, ry, 5, rh, bg=rc, stk=rc, round_=False))
        cx = x
        for (val, (lbl, w)) in zip(cells, cols):
            col = "#6b7280" if val in ("NULL", "—") else "#e5e7eb"
            E.append(text(cx + 8, ry + 6, val, fs=9, color=col, ff=3, w=w-6))
            cx += w
        E.append(text(cx + 6, ry + 6, note, fs=9, color=rc, ff=3, w=210))
        ry += rh
    return (ry - y)

# =====================================================================
#  PANEL 12 · DB ROW-LEVEL VIEW
# =====================================================================
y = 9720
y = title(y,
    "PANEL 12 · DB row-level view — what the order PHYSICALLY becomes in MySQL  (1 orders row + 5 order_items rows)",
    "Panel 11 showed the INSERT/UPDATE SQL; this shows the resulting rows. The Suất Giò combo explodes into a ₫0 header + priced children; món lẻ & canh are standalone. total_amount = SUM(unit_price×quantity) — the header's 0 keeps it honest. Source: be/migrations/005_orders.sql.")

# --- orders table (1 row) ---
ord_cols = [("id",90),("order_number",150),("table_id",100),("status",80),
            ("source",60),("total_amount",100),("created_by",90),("created_at",130)]
ord_rows = [(["ord-7f3a…","ORD-20260619-0001","tbl-ban01…","pending","qr","56000","NULL","2026-06-19 11:40"],
             C_BE, "status DEFAULT 'pending'")]
h = db_table(PANEL_X, y, "TABLE  orders  — one row per order", ord_cols, ord_rows, accent=C_BE)
y += h + 14

# --- order_items table (5 rows) ---
oi_cols = [("id",70),("product_id",100),("combo_id",90),("combo_ref_id",95),
           ("name",120),("unit_price",80),("qty",46),("qty_served",78),("toppings_snapshot",250)]
oi_rows = [
 (["oi-01","NULL","combo-1","NULL","Suất Giò","0","1","0","[]"],
  C_COMBO, "COMBO HEADER (price 0)"),
 (["oi-02","p_gio…","NULL","oi-01","Giò","21000","1","0",'[{"id":"t_thit","name":"Nhân thịt","price":0}]'],
  "#9a5a2a", "combo child → header"),
 (["oi-03","p_banh…","NULL","oi-01","Bánh Cuốn","0","3","0",'[{"id":"t_thit",…,"price":0}]'],
  "#9a5a2a", "combo child → header"),
 (["oi-04","p_bct…","NULL","NULL","Bánh cuốn thịt","35000","1","0",'[{"id":"t_thit",…,"price":0}]'],
  C_MONLE, "STANDALONE (món lẻ)"),
 (["oi-05","p_canh…","NULL","NULL","Canh","0","1","0",'[{"id":"t_rau","name":"Rau mùi tàu","price":0}]'],
  C_CANH, "STANDALONE (canh → gate)"),
]
h = db_table(PANEL_X, y, "TABLE  order_items  — 5 rows (1 header + 2 children + món lẻ + canh)", oi_cols, oi_rows, accent=C_COMBO)
y += h + 14

# --- annotations box ---
ann_h = 132
E.append(rect(PANEL_X, y, ROW_W, ann_h, bg="#ffffffcc", stk=C_BE, sw=2))
E.append(text(PANEL_X + 14, y + 10, "★ Schema rules you can't see in the JSON (be/migrations/005_orders.sql)", fs=13, color=PANEL_TXT))
E.append(text(PANEL_X + 14, y + 34,
    "• NO status column on order_items — item status is DERIVED from qty_served:  0 = pending · 0<qty_served<quantity = preparing · qty_served==quantity = done.  (All 5 rows start qty_served=0.)\n"
    "• chk_oi_item_type CHECK enforces exactly 3 shapes:  standalone {product_id, combo_id NULL, combo_ref_id NULL} · header {product_id NULL, combo_id, combo_ref_id NULL} · child {product_id, combo_id NULL, combo_ref_id}.\n"
    "• combo_ref_id is a SELF-FK → order_items(id) ON DELETE CASCADE: delete the header row (oi-01) and its children (oi-02, oi-03) vanish automatically.\n"
    "• total_amount on orders is DENORMALIZED (DECIMAL(10,0)): 0 + 21000 + 0 + 35000 + 0 = 56000. RecalculateTotalAmount rewrites it after every item mutation; the header's 0 is what stops double-counting.\n"
    "• toppings_snapshot is JSON frozen at order time — nhân is a ₫0 topping here, NOT a 'filling' column (mig 016 added filling, 017 dropped it). created_by NULL = guest self-order.",
    fs=10, color="#1f2937", w=ROW_W - 28))
y += ann_h + 60

# =====================================================================
#  PANEL 13 · REALTIME FAN-OUT
# =====================================================================
y = title(y,
    "PANEL 13 · Realtime fan-out — one POST commit lights up FOUR other screens (Redis pub/sub, decoupled)",
    "After tx.Commit (Panel 11 B9) the service PUBLISHes to Redis; the guest already has their 201. Each channel has a BE SSE/WS subscriber that streams to a FE hook on a DIFFERENT page. The /menu page waits for none of this. Source: order_service.go publish* · be/internal/sse,websocket · fe/src/hooks.")

# hub box
hub_w = 300
hy0 = y
E.append(rect(PANEL_X, y, hub_w, 70, bg="#0a2a14", stk=C_PAY, sw=2))
E.append(text(PANEL_X + 14, y + 10, "tx.Commit ✓", fs=14, color="#ddd6fe"))
E.append(text(PANEL_X + 14, y + 32, "order_service.go:348\npublishOrderEvent +\nAdmin + go Monitor", fs=9, color="#a78bfa", ff=3))

# lane columns: channel | BE subscriber | FE hook | screen
LC1 = PANEL_X + hub_w + 30           # channel
LC1W = 360
LC2 = LC1 + LC1W + 24                # BE handler
LC2W = 540
LC3 = LC2 + LC2W + 24                # FE hook
LC3W = 360
LC4 = LC3 + LC3W + 24                # screen
LC4W = RIGHT - LC4
# column headers
E.append(text(LC1, y - 0, "", fs=9))
hdry = y - 22
for hx, ht in ((LC1,"Redis channel (PUBLISH)"),(LC2,"BE subscriber (SSE/WS)"),
               (LC3,"FE hook / endpoint"),(LC4,"Screen that re-renders")):
    E.append(text(hx, hdry, ht, fs=10, color=PANEL_TXT))

lanes = [
 ("order:<id>", "sse/handler.go:42\nGET /orders/:id/events", "useOrderSSE.ts",
  "Customer TRACKING page\n/order/:id — status flips\npending→confirmed live", C_CANH),
 ("orders:kds", "websocket/handler.go:67\nWS orders:kds", "(KDS WS client)",
  "KITCHEN DISPLAY\nnew ticket pops into\nthe pending column", C_TAN),
 ("orders:admin", "sse/admin_handler.go:26\nGET /sse/admin", "useAdminSSE.ts",
  "ADMIN OVERVIEW\nWaitingSection gains\nthe new order card", C_COMBO),
 ("queue:broadcast\n+ tables:broadcast\n(+ order:<id>)", "sse/monitor_handler.go:47\nGET /sse/order-monitor/:id", "useOrderMonitorSSE.ts",
  "ORDER MONITOR\nqueue depth + table map\nrecount (goroutine)", C_MONLE),
]
ly = y + 84
RH = 78
for ch, be, hook, screen, acc in lanes:
    # channel chip
    E.append(rect(LC1, ly, LC1W, RH, bg="#0d1320", stk=acc, sw=2))
    E.append(rect(LC1, ly, 6, RH, bg=acc, stk=acc, round_=False))
    E.append(text(LC1 + 14, ly + 10, "PUBLISH", fs=8, color=acc))
    E.append(text(LC1 + 14, ly + 24, ch, fs=11, color="#e5e7eb", ff=3, w=LC1W-20))
    E.append(text(LC1 + LC1W + 4, ly + RH//2 - 8, "→", fs=18, color=MUTED))
    # BE subscriber
    E.append(rect(LC2, ly, LC2W, RH, bg="#0d1320", stk=CARD_STK))
    E.append(text(LC2 + 12, ly + 12, be, fs=10, color="#cbd5e1", ff=3, w=LC2W-20))
    E.append(text(LC2 + LC2W + 4, ly + RH//2 - 8, "→", fs=18, color=MUTED))
    # FE hook
    E.append(rect(LC3, ly, LC3W, RH, bg="#0d1320", stk=CARD_STK))
    E.append(text(LC3 + 12, ly + 14, hook, fs=11, color=C_TAN, ff=3, w=LC3W-20))
    E.append(text(LC3 + 12, ly + 36, "fetchEventSource", fs=8, color=MUTED, ff=3))
    E.append(text(LC3 + LC3W + 4, ly + RH//2 - 8, "→", fs=18, color=MUTED))
    # screen
    E.append(rect(LC4, ly, LC4W, RH, bg="#101a10", stk=acc, sw=2))
    E.append(text(LC4 + 12, ly + 10, screen, fs=10, color="#d1fae5", w=LC4W-20, wrap=True))
    ly += RH + 12

# connect hub to first lane visually
E.append(rect(PANEL_X + hub_w, hy0 + 35, 30, 1, bg=C_PAY, stk=C_PAY, round_=False))
# takeaway
tk_h = 70
E.append(rect(PANEL_X, ly + 4, ROW_W, tk_h, bg="#ffffffcc", stk=C_PAY, sw=2))
E.append(text(PANEL_X + 14, ly + 12, "★ Why pub/sub, not direct calls", fs=12, color=PANEL_TXT))
E.append(text(PANEL_X + 14, ly + 34,
    "The order service knows NOTHING about KDS, Admin or the tracking page — it just PUBLISHes. Subscribers come and go independently; a screen that's closed simply misses nothing it needs (it refetches on open). If Redis publish fails, it's logged and swallowed (fail-open) — the order is already committed. One write, four eventually-consistent screens, zero coupling.",
    fs=10, color="#1f2937", w=ROW_W - 28))
y = ly + 4 + tk_h + 60

# =====================================================================
#  PANEL 14 · FAILURE / EDGE MAP
# =====================================================================
y = title(y,
    "PANEL 14 · Failure & edge map — the unhappy paths Panel 11 only hinted at",
    "Every place POST /orders can deviate from the happy path, where it's caught, and how the system recovers. RED = request rejected · AMBER = silent degrade / retry · GREEN = handled, order still safe. Source: order_handler.go · order_service.go · order_repo.go.")

fail_cols = [("#",30),("Trigger",330),("Caught at",330),("What happens",560)]
def frow(n, trig, where, what, acc):
    return ([str(n), trig, where, what], acc, "")
fail_rows = [
 frow(1,"Malformed / missing JSON body","handler ShouldBindJSON (order_handler.go:71)","400 INVALID_INPUT 'Dữ liệu đầu vào không hợp lệ' via respondError", C_RED),
 frow(2,"Item has NEITHER product_id nor combo_id","handler XOR guard (:78)","400 'Mỗi món phải có product_id hoặc combo_id'", C_RED),
 frow(3,"Item has BOTH product_id AND combo_id","handler XOR guard (:82)","400 'Không thể có cả product_id và combo_id'", C_RED),
 frow(4,"items[] empty (bypassing handler min=1)","service defense (order_service.go:265)","400 'Đơn hàng phải có ít nhất 1 món' — never persists an empty order", C_RED),
 frow(5,"combo_items override product NOT in combo","expandCombo tmpl miss (:425)","400 'Sản phẩm X không thuộc combo' — client can't smuggle items", C_RED),
 frow(6,"product / combo id not found in catalog","GetProduct/ComboSnapshot err (:356/:390)","wrapped err → handleServiceError → 404/500", C_RED),
 frow(7,"Unknown / unavailable TOPPING id","buildToppingsSnapshot (:381) continue","SILENT skip — topping omitted, order still created", C_MONLE),
 frow(8,"order_number UNIQUE clash (uq_orders_order_number)","repo retry loop (order_service.go:332)","regenerate number, retry ≤3× — then succeeds (or hard error)", C_MONLE),
 frow(9,"Redis DOWN at generateOrderNumber","INCR fallback (:778)","timestamp number ORD-<date>-<ms%100000> — order still created", C_MONLE),
 frow(10,"Error mid-tx (insert order / item / recalc)","repo defer tx.Rollback (order_repo.go:81)","WHOLE tx rolled back — NO partial / orphan rows", C_BE),
 frow(11,"Redis DOWN at post-commit publish","publishOrderEvent slog.Warn (:816)","logged & swallowed — order committed, realtime missed (fail-open)", C_BE),
 frow(12,"Table already has an active order","GetActiveOrderByTable (:272)","NOT an error → table_busy:true in 201 → FE 'served after current' toast", C_BE),
 frow(13,"Catalog GET cache miss / Redis down","getCacheJSON swallows (product_service)","falls through to MySQL — menu browsing survives Redis outage", C_BE),
]
# render failure table
tw = sum(w for _,w in fail_cols) + 220
E.append(rect(PANEL_X, y, tw, 24, bg=C_RED, stk=C_RED))
E.append(text(PANEL_X + 10, y + 5, "POST /orders — deviation paths", fs=12, color=DARK))
hy = y + 24; rh = 26
E.append(rect(PANEL_X, hy, tw, rh, bg="#111827", stk=CARD_STK))
cx = PANEL_X
for lbl,w in fail_cols:
    E.append(text(cx+6, hy+6, lbl, fs=9, color=C_RED, ff=3)); cx += w
E.append(text(cx+6, hy+6, "class", fs=9, color=C_RED, ff=3))
ry = hy + rh
for cells, acc, _ in fail_rows:
    E.append(rect(PANEL_X, ry, tw, rh, bg="#0d1320", stk=CARD_STK))
    E.append(rect(PANEL_X, ry, 5, rh, bg=acc, stk=acc, round_=False))
    cx = PANEL_X
    for val,(lbl,w) in zip(cells, fail_cols):
        c = C_RED if (acc==C_RED and lbl=="What happens") else "#e5e7eb"
        E.append(text(cx+8, ry+6, val, fs=9, color=c, ff=3, w=w-6)); cx += w
    cls = {C_RED:"REJECT 4xx",C_MONLE:"degrade/retry",C_BE:"handled / safe"}[acc]
    E.append(text(cx+6, ry+6, cls, fs=9, color=acc, ff=3, w=210))
    ry += rh
y = ry + 16
# legend strip
E.append(rect(PANEL_X, y, ROW_W, 46, bg="#ffffffcc", stk=C_RED, sw=2))
E.append(text(PANEL_X + 14, y + 8, "★ Read it as a contract", fs=12, color=PANEL_TXT))
E.append(text(PANEL_X + 14, y + 26,
    "Client input is validated twice (handler XOR + service defense) and never trusted for prices or combo membership · the money path is one atomic tx (all-or-nothing) · everything non-essential (number counter, realtime, cache) FAILS OPEN so a Redis blip never blocks an order.",
    fs=10, color="#1f2937", w=ROW_W - 28))
y += 46 + 60

# =====================================================================
#  PANEL 15 · ONE FIELD, ALL LAYERS  (Rosetta stone)
# =====================================================================
y = title(y,
    "PANEL 15 · One field, every layer — 'nhân thịt' (a ₫0 topping) traced tap → Zustand → wire → service → SQL → read-back → render",
    "Proof that one fact survives ~8 representations unchanged in meaning. The wire carries only the id; the SERVER re-snapshots name+price (client never trusted), freezes it as JSON, and every read view renders it. Source: ToppingModal → cart.ts → order-payload.ts → order_service.go buildToppingsSnapshot → order_items.toppings_snapshot.")

stages = [
 ("1 · UI tap", C_TAN, "ToppingModal (local useState)",
  'checkbox "Nhân thịt" ✓\nopen-flag stays in useState\n(never enters the store)'),
 ("2 · Zustand", "#FBBF24", "CartItem.toppings[]  (cart.ts)",
  '{ id:"t_thit",\n  name:"Nhân thịt",\n  price:0 }   ← ₫0 topping'),
 ("3 · Payload", C_PAY, "buildOrderItemsPayload (order-payload.ts)",
  'topping_ids:["t_thit"]\n← flattened to IDS ONLY\n(name/price dropped)'),
 ("4 · DTO", "#94A3B8", "CreateOrderItemInput (handler→service)",
  'ToppingIDs:["t_thit"]\nmapped from req.Items\n(toComboOverrides too)'),
 ("5 · Snapshot", C_BE, "buildToppingsSnapshot (order_service.go:376)",
  'GetToppingSnapshot("t_thit")\n→ re-reads {id,name,price}\nfrom catalog (SERVER truth)'),
 ("6 · SQL column", C_COMBO, "order_items.toppings_snapshot  (JSON)",
  '[{"id":"t_thit",\n  "name":"Nhân thịt",\n  "price":0}]  ← frozen'),
 ("7 · Read-back", C_CANH, "GET /orders/:id → item.toppings",
  'JSON parsed back into\nitem.toppings_snapshot\non the order object'),
 ("8 · Render", "#22D3EE", "DishRow / KDS / Admin",
  '"+ nhân thịt" shown on\n/order/:id, KDS ticket,\nadmin WaitingSection'),
]
# pipeline of 8 cards, 4 per row
CARD_W = (ROW_W - 3*16) // 4
CARD_H = 116
sx = PANEL_X; sy = y
for i, (lbl, acc, where, val) in enumerate(stages):
    col = i % 4; row = i // 4
    cx = PANEL_X + col*(CARD_W + 16)
    cy = y + row*(CARD_H + 40)
    E.append(rect(cx, cy, CARD_W, CARD_H, bg="#0d1320", stk=acc, sw=2))
    E.append(rect(cx, cy, CARD_W, 22, bg=acc, stk=acc))
    E.append(text(cx + 10, cy + 4, lbl, fs=11, color=DARK))
    E.append(text(cx + 10, cy + 30, where, fs=9, color=acc, w=CARD_W-16, wrap=True))
    E.append(text(cx + 10, cy + 64, val, fs=10, color="#e5e7eb", ff=3, w=CARD_W-16))
    # arrow to next card (same row)
    if col < 3 and i < len(stages)-1:
        E.append(text(cx + CARD_W + 2, cy + CARD_H//2 - 10, "→", fs=18, color=MUTED))
    # wrap arrow at end of row 0
    if col == 3 and i < len(stages)-1:
        E.append(text(cx + CARD_W - 16, cy + CARD_H + 6, "↓", fs=16, color=MUTED))
y = y + 2*(CARD_H) + 40 + 16

# rosetta takeaway
tk_h = 96
E.append(rect(PANEL_X, y, ROW_W, tk_h, bg="#ffffffcc", stk=C_TAN, sw=2))
E.append(text(PANEL_X + 14, y + 10, "★ The same fact, eight costumes — and one trust boundary", fs=13, color=PANEL_TXT))
E.append(text(PANEL_X + 14, y + 34,
    "• Stages 1–3 are CLIENT: the topping is a rich object, then collapses to a bare id on the wire. The browser's name/price are display-only and thrown away at the boundary.\n"
    "• Stage 5 is the TRUST BOUNDARY: the server re-resolves the id against its own catalog, so a tampered client price can't survive. From here the value is server-owned.\n"
    "• Stages 6–8 are FROZEN HISTORY: the JSON snapshot is immutable order history — even if 'Nhân thịt' is later renamed or repriced, this order still reads ₫0 'Nhân thịt'. (And note: it's a topping, never a 'filling' column.)",
    fs=10, color="#1f2937", w=ROW_W - 28))
y += tk_h

# ===================================================== write back
with open(FP) as f: doc = json.load(f)
doc["elements"].extend(E)
with open(FP, "w") as f: json.dump(doc, f, ensure_ascii=False, indent=2)
print(f"added {len(E)} elements; Panels 12–15 end at y={y}; total now {len(doc['elements'])}")
