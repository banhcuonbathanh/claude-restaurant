#!/usr/bin/env python3
"""Generate PANEL 11 for customer_menu.excalidraw.

Panel 9 showed the STATIC shapes. Panel 11 shows the SAME objects MOVING:
a beat-by-beat lifecycle of useCartStore as the guest builds the Suất Giò
order — add COMBO, add MÓN LẺ, add CANH — then taps THANH TOÁN and the BE
reacts. Four lanes per beat:

  A · Action      (what the guest did + the Zustand mechanic that fires)
  B · useCartStore — the object snapshot AFTER, with ← what-changed markers
  C · Components reacting (who re-renders, what each now shows)
  D · TanStack / BE reaction (network, cache, gate)

A top strip shows how TanStack loads on mount (only products skeletons).
Sourced from docs/system/.../customer_menu_crosscomponent_dataflow.md,
customer_menu_loading.md, customer_menu_be.md. Matches Panel 9/10 dark theme.
"""
import json

FP = "docs/system/08_pages/customer/customer_menu/customer_menu.excalidraw"

CARD_BG = "#1F2937"; CARD_STK = "#2D3748"; LIGHT = "#F9FAFB"; MUTED = "#9CA3AF"
DARK = "#0a0a0a"; PANEL_TXT = "#0f172a"; SUB = "#475569"
C_SEED  = "#94A3B8"   # slate  – QR seed (neutral)
C_COMBO = "#FB923C"   # orange – add combo
C_MONLE = "#FBBF24"   # amber  – add món lẻ (standalone product)
C_CANH  = "#34D399"   # green  – add canh (opens the gate)
C_PAY   = "#A78BFA"   # violet – Thanh toán / handoff
C_BE    = "#22C55E"   # green  – BE reacts
C_TAN   = "#22D3EE"   # cyan   – TanStack loading
UPDATED = 1746316800000

_idc = [0]; _idx = [0]
def nid():
    _idc[0] += 1; return f"p11-{_idc[0]:04d}"
def nidx():
    v = _idx[0]; _idx[0] += 1; return f"f{v:04d}"

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
    # estimate wrapped line count so the band height accounts for soft-wraps
    if wrap and w:
        per = max(1, int(w / (fs * cw)))
        nrows = sum(max(1, (len(l)//per) + (1 if len(l) % per else 0)) for l in lines)
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
PANEL_Y = 7120
LINE = 14
PAD = 12

# ---- column geometry (4 lanes) ----
LA_X, LA_W = PANEL_X,        220   # action
LB_X, LB_W = PANEL_X + 232,  840   # useCartStore object
LC_X, LC_W = PANEL_X + 1084, 540   # components reacting
LD_X, LD_W = PANEL_X + 1636, 840   # TanStack / BE
ROW_W = (LD_X + LD_W) - PANEL_X     # full band width

# ===================================================== title
E.append(text(PANEL_X, PANEL_Y,
    "PANEL 11 · Object lifecycle — watch useCartStore MUTATE beat-by-beat as the guest builds the order, then Thanh toán → BE reacts",
    fs=16, color=PANEL_TXT))
E.append(text(PANEL_X, PANEL_Y + 26,
    "Panel 9 froze the shapes; this panel runs them. Each band = one beat: the action, the store object AFTER (← = what changed), who re-renders, and the BE/TanStack reaction. Source: docs/system customer_menu dataflow + loading + be.",
    fs=11, color=SUB))

# ---- legend ----
leg_y = PANEL_Y + 54
legend = [("QR seed", C_SEED), ("add COMBO", C_COMBO), ("add MÓN LẺ", C_MONLE),
          ("add CANH (gate)", C_CANH), ("Thanh toán / handoff", C_PAY), ("BE reacts", C_BE)]
lx = PANEL_X
for lbl, col in legend:
    E.append(rect(lx, leg_y, 14, 14, bg=col, stk=col, round_=False))
    E.append(text(lx + 20, leg_y, lbl, fs=11, color=SUB))
    lx += int(len(lbl) * 7.2) + 56

# ===================================================== TanStack loading strip
strip_y = leg_y + 34
STRIP_H = 92
E.append(rect(PANEL_X, strip_y, ROW_W, STRIP_H, bg="#06222b", stk=C_TAN, sw=2))
E.append(rect(PANEL_X, strip_y, 8, STRIP_H, bg=C_TAN, stk=C_TAN, round_=False))
E.append(text(PANEL_X + 18, strip_y + 8,
    "ON MOUNT · how TanStack loads /menu (before any tap)", fs=12, color=C_TAN))
E.append(text(PANEL_X + 18, strip_y + 28,
    "4 useQuery fire together · all staleTime 5m (no spinner on revisit <5m). Only ['products',cat,q] drives a VISIBLE skeleton; the other three degrade to [] silently.",
    fs=10, color="#cbeef5", w=ROW_W - 36))
E.append(text(PANEL_X + 18, strip_y + 50,
    "['categories'] →[] no UI  ·  ['products-all'] →[] silent (combo enrich)  ·  ['combos'] →[] hidden until length>0  ·  ['products',cat,q] →[] ⏳ SKELETON 5 mobile / 8 desktop cards",
    fs=10, color="#9bdfeb", w=ROW_W - 36))
E.append(text(PANEL_X + 18, strip_y + 70,
    "Writes come later: POST /orders → invalidate ['orders'] (catalog GETs untouched).  1-char search disables the products query (no refetch, no skeleton).",
    fs=10, color="#7fb8c2", w=ROW_W - 36))

# ===================================================== lane headers
hdr_y = strip_y + STRIP_H + 18
E.append(text(LA_X,      hdr_y, "▸ ACTION  (+ Zustand mechanic)", fs=11, color=PANEL_TXT))
E.append(text(LB_X,      hdr_y, "▸ useCartStore — object AFTER  (← = changed)", fs=11, color=PANEL_TXT))
E.append(text(LC_X,      hdr_y, "▸ COMPONENTS reacting", fs=11, color=PANEL_TXT))
E.append(text(LD_X,      hdr_y, "▸ TanStack / BE reaction", fs=11, color=PANEL_TXT))

# ===================================================== beat renderer
def beat(y, accent, tag, action, mechanic, store, comps, be):
    """One lifecycle band across 4 lanes. Returns its height."""
    s_lines = store.split("\n"); c_lines = comps.split("\n"); b_lines = be.split("\n")
    a_lines = action.split("\n")
    # lane A wraps the mechanic at fs9 inside LA_W
    per = max(1, int(LA_W / (9 * 0.58)))
    mech_rows = sum(max(1, -(-len(l)//per)) for l in mechanic.split("\n"))
    aH = 24 + len(a_lines)*16 + 6 + mech_rows*12        # tag + action + mechanic
    bH = len(s_lines)*LINE                              # store object (fs11)
    cH = len(c_lines)*LINE                              # components  (fs10)
    dH = len(b_lines)*LINE                              # be          (fs10)
    h = PAD*2 + max(aH, bH, cH, dH) + 6
    # band
    E.append(rect(PANEL_X, y, ROW_W, h, bg="#0d1320", stk=CARD_STK, sw=1))
    E.append(rect(PANEL_X, y, 8, h, bg=accent, stk=accent, round_=False))
    # vertical lane dividers
    for dx in (LB_X - 12, LC_X - 12, LD_X - 12):
        E.append(rect(dx, y + 8, 1, h - 16, bg=CARD_STK, stk=CARD_STK, round_=False))
    cy = y + PAD
    # Lane A
    E.append(rect(LA_X, cy, 56, 18, bg=accent, stk=accent))
    E.append(text(LA_X + 8, cy + 2, tag, fs=11, color=DARK))
    E.append(text(LA_X, cy + 24, action, fs=12, color=LIGHT, w=LA_W))
    E.append(text(LA_X, cy + 24 + len(action.split("\n"))*16 + 6, mechanic,
                  fs=9, color=accent, w=LA_W, wrap=True))
    # Lane B — store object (code: explicit newlines, no soft-wrap)
    E.append(text(LB_X, cy, store, fs=11, color="#E5E7EB", ff=3, w=LB_W))
    # Lane C — components
    E.append(text(LC_X, cy, comps, fs=10, color="#cbd5e1", w=LC_W))
    # Lane D — BE / TanStack
    E.append(text(LD_X, cy, be, fs=10, color="#bbf7d0", w=LD_W))
    return h

# ===================================================== BE layer-trace renderer
# 3 columns: [layer + func@file] [what it does] [data / SQL / result]
BT_C1, BT_C1W = PANEL_X + 18,   330
BT_C2, BT_C2W = PANEL_X + 360,  830
BT_C3         = PANEL_X + 1206
BT_C3W        = (PANEL_X + ROW_W) - BT_C3 - 18

def be_row(y, step, layer, func, does, data, accent=C_BE):
    d_lines = data.split("\n")
    per = max(1, int(BT_C2W / (10 * 0.58)))
    does_rows = sum(max(1, -(-len(l)//per)) for l in does.split("\n"))
    c1_rows = 1 + len(func.split("\n"))
    h = PAD*2 + max(does_rows, len(d_lines), c1_rows)*LINE + 4
    E.append(rect(PANEL_X, y, ROW_W, h, bg="#08160d", stk="#16341f", sw=1))
    E.append(rect(PANEL_X, y, 8, h, bg=accent, stk=accent, round_=False))
    for dx in (BT_C2 - 12, BT_C3 - 12):
        E.append(rect(dx, y + 8, 1, h - 16, bg="#16341f", stk="#16341f", round_=False))
    cy = y + PAD
    # col1: step badge + layer + func
    E.append(rect(BT_C1, cy, 30, 16, bg=accent, stk=accent))
    E.append(text(BT_C1 + 5, cy + 1, step, fs=10, color=DARK))
    E.append(text(BT_C1 + 38, cy, layer, fs=12, color="#bbf7d0", w=BT_C1W - 38))
    E.append(text(BT_C1, cy + 20, func, fs=9, color="#5f9e72", ff=3, w=BT_C1W))
    # col2: what it does (wrapped)
    E.append(text(BT_C2, cy, does, fs=10, color="#d1fae5", w=BT_C2W, wrap=True))
    # col3: data / SQL (monospace)
    E.append(text(BT_C3, cy, data, fs=10, color="#86efac", ff=3, w=BT_C3W))
    return h

y = hdr_y + 22
GAP = 12

# ----- T0 · QR seed -----
y += beat(y, C_SEED, "T0",
    "Scan Bàn 01 QR\n(/table/:id)",
    "setTableId() + setTableName() — store seeded, NO food yet",
    "{ tableId:\"<uuid Bàn 01>\",   ← set by QR\n"
    "  tableName:\"Bàn 01\",         ← set by QR\n"
    "  items:[],\n"
    "  activeOrderId:null, paymentMethod:null, orderNote:\"\" }\n"
    "total() = 0      itemCount() = 0",
    "MenuHeader → \"Quán Bánh Cuốn · Bàn 01\"\n"
    "MiniCartStrip / CartBottomBar → \"0 món\"\n"
    "(no props passed — every widget reads the store)",
    "GET /categories /products /combos = PUBLIC (no token).\n"
    "Guest JWT (sub='guest', table_id) minted at /table — only\n"
    "needed once the cart submits.  See loading strip above.") + GAP

# ----- T1 · add COMBO -----
y += beat(y, C_COMBO, "T1",
    "Tap [+] Suất Giò\n(ComboSection)",
    "addItem(type:'combo') — dedup by id 'combo_<id>': same id bumps qty, new id appends. ONE combo = ONE line. OPTIMISTIC (the only one in the app — no network wait).",
    "items:[\n"
    "  { id:\"combo_<SuấtGiò>\", type:\"combo\", quantity:1,\n"
    "    price:21000,\n"
    "    toppings:[],                ← nhân not picked yet\n"
    "    combo_items:[ Giò×1, BánhCuốn×3, Canh×1 ] }  ← template\n"
    "]\n"
    "total() = 21000      itemCount() = 1",
    "MiniCartStrip → \"1 món · 21.000đ\"\n"
    "OrderSummary → preview row appears\n"
    "CartBottomBar → total updates\n"
    "★ canh gate: items.some(id^='canh_') = FALSE\n"
    "  → Bottom DIMMED · OrderSummary will SHAKE 🔴",
    "NO BE call — pure local optimistic write.\n"
    "combo_items here are the TEMPLATE snapshot from\n"
    "['combos'] (enriched vs ['products-all'] in a useMemo).\n"
    "Price ₫21.000 is FE display only — never sent on the wire.") + GAP

# ----- T2 · nhân thịt -----
y += beat(y, C_COMBO, "T2",
    "Pick nhân thịt\n(ToppingModal)",
    "Modal open/closed stays in LOCAL useState (single-widget state never enters the store). Only the CHOSEN topping lands in the combo line.",
    "items[0].toppings:[\n"
    "  { id:\"<Nhân thịt>\", name:\"Nhân thịt\", price:0 }  ← ₫0 topping\n"
    "]\n"
    "// nhân is a ₫0 TOPPING, NOT a 'filling' column\n"
    "// (mig 016 added one, 017 dropped it)\n"
    "total() = 21000  (unchanged — ₫0)   itemCount() = 1",
    "OrderSummary → \"1× Suất Giò + nhân thịt\"\n"
    "total UNCHANGED (topping is ₫0)\n"
    "Modal closes — its open-flag never hit the store",
    "NO BE call. ToppingModal's open state is the canonical\n"
    "example of LOCAL state: if >1 widget needs it → store;\n"
    "if it's 'this widget right now' → useState.") + GAP

# ----- T3 · add MÓN LẺ -----
y += beat(y, C_MONLE, "T3",
    "Add 1× Bánh cuốn\nthịt (món lẻ)\n(ProductList)",
    "addItem(type:'product') — dedup by 'prod_<id>'. A standalone item carries its OWN price (unlike the ₫0 combo header).",
    "items:[ combo…,\n"
    "  { id:\"prod_<BánhCuốnThịt>\", type:\"product\", quantity:1,\n"
    "    price:35000,                          ← món lẻ has real price\n"
    "    toppings:[ {Nhân thịt, ₫0} ] }        ← NEW standalone line\n"
    "]\n"
    "total() = 56000      itemCount() = 2",
    "MiniCartStrip → \"2 món · 56.000đ\"\n"
    "OrderSummary → adds a 2nd row\n"
    "CartBottomBar → total 56.000đ\n"
    "All 3 totals = the SAME derived total() — cannot drift",
    "NO BE call — optimistic local write again.\n"
    "Re-tapping the same món = qty bump (dedup by id),\n"
    "not a duplicate row.") + GAP

# ----- T4 · add CANH -----
y += beat(y, C_CANH, "T4",
    "Set Canh 'có rau'\n(ProductList)",
    "setCanhQty(id, rau, 'rau', 1) — NOT addItem. Upsert by STABLE id 'canh_<id>_rau|plain'; qty 0 = remove. Price always 0. Stable id = same bowl never duplicates.",
    "items:[ combo…, prod…,\n"
    "  { id:\"canh_<Canh>_rau\", type:\"product\", quantity:1,\n"
    "    price:0,\n"
    "    toppings:[ {Rau mùi tàu, ₫0} ] }   ← stable id drives GATE\n"
    "]\n"
    "total() = 56000      itemCount() = 3",
    "★ canh gate: items.some(id^='canh_') = TRUE\n"
    "  → CartBottomBar ENABLED ✅  [ Thanh toán ]\n"
    "  → OrderSummary stops shaking\n"
    "Two widgets (dim in J, shake in I) read the SAME\n"
    "items[] and reach the SAME verdict — no shared prop.",
    "NO BE call. The gate is an ID-CONVENTION rule, not a\n"
    "type field: renaming 'canh_' breaks the gate silently.") + GAP

# ----- T5 · Thanh toán -----
y += beat(y, C_PAY, "T5",
    "Tap Thanh toán\n(CartBottomBar)",
    "Branch reads tableId: ≠null → open TableConfirmModal (popup confirm only). null → router.push('/checkout'). buildOrderItemsPayload(items) — ONE builder, 3 callers.",
    "POST /api/v1/orders   (NO prices on the wire)\n"
    "{ table_id, source:\"qr\", note:\"\", items:[\n"
    "  { product_id:null, combo_id:\"<SuấtGiò>\", quantity:1,\n"
    "    topping_ids:[],            ← header carries no topping\n"
    "    combo_items:[ {Giò×1,[Nhân]}, {BánhCuốn×3,[Nhân]} ] },\n"
    "                               ← CANH stripped from combo\n"
    "  { product_id:\"<BánhCuốnThịt>\", combo_id:null, qty:1,[Nhân] },\n"
    "  { product_id:\"<Canh>\", combo_id:null, qty:1, [Rau] } ] }",
    "Store NOT mutated yet — items read-only here.\n"
    "TableConfirmModal builds the payload via\n"
    "buildOrderItemsPayload() — never inline (fe/CLAUDE.md).\n"
    "Same builder used by checkout + add-to-order → all 3\n"
    "payloads byte-identical & match the on-screen preview.",
    "3 builder transforms (order-payload.ts):\n"
    "1 combo → header (product_id:null + combo_id) + overrides\n"
    "2 canh STRIPPED from combo_items (travels as own row;\n"
    "  BE treats supplied combo_items as the COMPLETE list)\n"
    "3 toppings flattened to ids (nhân on each non-canh child)") + GAP

# ===================================================== T6 · BE LAYER TRACE
# section header band
bt_h = 44
E.append(rect(PANEL_X, y, ROW_W, bt_h, bg="#0a2a14", stk=C_BE, sw=2))
E.append(rect(PANEL_X, y, 8, bt_h, bg=C_BE, stk=C_BE, round_=False))
E.append(text(PANEL_X + 18, y + 7,
    "T6 · BE LAYER REACTION — POST /api/v1/orders traced authMW → handler → service → repository → SQL → Redis  (be/internal/...)",
    fs=14, color="#bbf7d0"))
E.append(text(PANEL_X + 18, y + 26,
    "ONE request, six layers. Client prices are never trusted — the service re-snapshots name + unit_price from the catalog; the whole insert is ONE atomic tx; the combo header's ₫0 is what keeps total_amount honest.",
    fs=10, color="#7fcf97", w=ROW_W - 36))
y += bt_h + GAP
# column headers for the trace
E.append(text(BT_C1, y, "LAYER · func@file", fs=10, color=PANEL_TXT))
E.append(text(BT_C2, y, "WHAT IT DOES", fs=10, color=PANEL_TXT))
E.append(text(BT_C3, y, "DATA · SQL · RESULT", fs=10, color=PANEL_TXT))
y += 18

# B1 · auth middleware
y += be_row(y, "B1", "Auth middleware",
    "authMW\nClaimsFromContext\n(middleware/auth)",
    "Verifies the guest JWT minted at /table/:id (sub='guest', role='customer', carries table_id). Write routes 4–6 require it; catalog GETs don't. role=='customer' → callerID=\"\" so created_by is stored NULL (staff JWTs would set it).",
    "claims = { sub:'guest',\n  role:'customer',\n  table_id:'<uuid Bàn 01>' }\n→ callerID = \"\"  (guest)") + GAP

# B2 · handler
y += be_row(y, "B2", "HTTP handler",
    "OrderHandler.Create\norder_handler.go:69",
    "ShouldBindJSON → 400 INVALID_INPUT on bad body. Per-item XOR guard: each item must have EXACTLY one of product_id / combo_id (neither or both → 400). Maps DTO → service.CreateOrderInput (combo_items → overrides). On service err → handleServiceError; else 201.",
    "guard per item:\n product_id XOR combo_id\n  else 400 INVALID_INPUT\n201 {data:{id, table_busy}}") + GAP

# B3 · service entry
y += be_row(y, "B3", "Service · orchestrates",
    "OrderService.CreateOrder\norder_service.go:262",
    "Defense-in-depth: items≥1 else 400 (never persist an empty order). GetActiveOrderByTable(table) → sets tableBusy flag (informational only — order still created). newUUID() for the order id, then builds the rows (combo expand vs product row) BEFORE opening the tx.",
    "orderID = newUUID()\ntableBusy = (table already\n  has an active order)\nrows = []OrderItemRow{}") + GAP

# B4 · order number
y += be_row(y, "B4", "Order-number counter",
    "generateOrderNumber\norder_service.go:774",
    "Redis INCR order:seq:YYYYMMDD (per-day counter); on the first incr sets EXPIRE 25h. If Redis is down → timestamp fallback ORD-<date>-<ms%100000>. The repo retries ≤3× regenerating this on a uq_orders_order_number unique clash.",
    "INCR order:seq:20260619 → 1\nEXPIRE 25h (first only)\n→ \"ORD-20260619-0001\"") + GAP

# B5 · combo expansion
y += be_row(y, "B5", "Combo → header + children",
    "expandCombo\norder_service.go:389",
    "GetComboSnapshot(combo_id). Emits a HEADER row: combo_id set, unit_price = formatPrice(0) — MUST be 0 or RecalculateTotalAmount double-counts. Then child rows from the client overrides (each product_id validated ∈ combo, else 400 'không thuộc combo'); child qty = override.qty × header.qty; prices ALWAYS from the server template, never the client.",
    "header { combo_id, unit_price:0,\n  combo_ref_id:null }\nchild  { product_id, combo_ref_id:\n  parentID, unit_price:21000,\n  toppings_snapshot:[Nhân] }\n  qty = ov.qty × header.qty") + GAP

# B6 · product row (món lẻ)
y += be_row(y, "B6", "Món lẻ → product row",
    "buildProductRow\norder_service.go:355",
    "Standalone item. GetProductSnapshot(product_id) → name + unit_price taken SERVER-side (client price discarded). buildToppingsSnapshot resolves topping ids → [{id,name,price}] JSON; unknown/unavailable toppings skipped. nhân rides here as a ₫0 topping (no 'filling' column).",
    "row { product_id, combo_ref_id:null,\n  name: snap.Name,\n  unit_price: 35000,  ← from catalog\n  toppings_snapshot:[Nhân ₫0] }") + GAP

# B7 · repository tx
y += be_row(y, "B7", "Repository · ONE tx",
    "CreateOrderWithItems\norder_repo.go:76",
    "BeginTx → defer Rollback (any error rolls the whole thing back — no half-orders). qtx.CreateOrder → loop qtx.CreateOrderItem(row) for every header+child → qtx.RecalculateTotalAmount → Commit. All-or-nothing atomicity.",
    "tx := BeginTx(); defer Rollback()\nCreateOrder(...)\nfor row: CreateOrderItem(row)\nRecalculateTotalAmount(id)\ntx.Commit()") + GAP

# B8 · SQL
y += be_row(y, "B8", "SQL (sqlc · query/orders.sql)",
    "CreateOrder · CreateOrderItem · RecalculateTotalAmount",
    "INSERT orders (status defaults 'pending', created_by NULL for guest). INSERT order_items × N (1 header + 2 combo children + 1 món lẻ + 1 canh). RecalculateTotalAmount UPDATEs the denormalized total from the rows — the header's unit_price 0 is naturally excluded by the SUM.",
    "UPDATE orders SET total_amount = (\n  SELECT COALESCE(\n    SUM(unit_price*quantity),0)\n  FROM order_items\n  WHERE order_id = orders.id)\n→ 0+21000+0+35000+0 = 56000") + GAP

# B9 · post-commit events
y += be_row(y, "B9", "Post-commit · realtime",
    "publishOrderEvent +\nAdmin + Monitor\norder_service.go:348",
    "After commit (not in the tx): Redis PUBLISH on order:<id> and orders:kds ('new_order') → SSE to the tracking page + KDS. publishAdminOrderEvent (admin board) and a goroutine publishMonitorBroadcast. NO catalog cache touched — products/categories/combos stay warm.",
    "PUBLISH order:<id>  {new_order}\nPUBLISH orders:kds  {new_order}\nPUBLISH admin:orders …\ngo monitor broadcast") + GAP

# B10 · response → FE
y += be_row(y, "B10", "Response → FE",
    "201 Created\n→ TableConfirmModal",
    "201 {data:{id, table_busy}}. FE then GET /orders/:id (authMW) for the full order and writes it to localStorage order_cache_<id>. table_busy is response-ONLY — never on the order object itself.",
    "{id:\"ord-…\", order_number:\n  \"ORD-20260619-0001\", status:\n  \"pending\", total_amount:56000,\n items:[ header₫0 + 4 priced rows ]}\n== order_cache_<id> (survives F5)",
    accent=C_PAY) + GAP

# ----- T7 · handoff -----
y += beat(y, C_PAY, "T7",
    "Handoff & forget\n(on 201)",
    "setActiveOrderId(id) → clearCart() → write order_cache_<id> → router.replace('/order/<id>').",
    "STORE AFTER clearCart():\n"
    "{ items:[],                    ← wiped\n"
    "  tableId:null, tableName:null, ← wiped\n"
    "  activeOrderId:null, paymentMethod:null, orderNote:\"\" }\n"
    "// persist (partialize) keeps only {orderNote, activeOrderId};\n"
    "// items were SESSION-ONLY — F5 mid-order = empty cart by design",
    "/menu unmounts — cart now empty.\n"
    "/order/<id> paints from order_cache_<id>;\n"
    "the tracking page owns NO cart.\n"
    "Only the ORDER ID (URL) + order_cache_<id>\n"
    "snapshot + activeOrderId crossed the page boundary.",
    "No further BE call on this beat — GET /orders/:id fires\n"
    "on the tracking page (authMW). The whole order lifecycle:\n"
    "QR seeds the store → taps mutate it → selectors keep totals\n"
    "in sync → canh gate reads it → one builder drains it into\n"
    "the POST → clearCart() empties it the instant the order is born.") + GAP

# ===================================================== takeaway
tk_h = 110
E.append(rect(PANEL_X, y, ROW_W, tk_h, bg="#ffffffcc", stk=C_PAY, sw=2))
E.append(text(PANEL_X + 14, y + 10, "★ The three add-types react differently — that is the whole object model", fs=13, color=PANEL_TXT))
E.append(text(PANEL_X + 14, y + 34,
    "• COMBO  → addItem(type:'combo'), one line, price is FE-display, combo_items template inside; on POST it becomes a ₫0 header + priced children server-side.\n"
    "• MÓN LẺ → addItem(type:'product'), standalone line carrying its OWN price; dedup by id = qty bump.\n"
    "• CANH   → setCanhQty() upsert by STABLE id 'canh_*', price 0 — its id (not a type field) is what opens the Thanh toán gate.\n"
    "All three live in ONE items[] array; total()/itemCount() are derived on read so MiniCart, OrderSummary & CartBottomBar never drift. clearCart() ends it.",
    fs=10, color="#1f2937", w=ROW_W - 28))
y += tk_h

# ===================================================== write back
with open(FP) as f: doc = json.load(f)
doc["elements"].extend(E)
with open(FP, "w") as f: json.dump(doc, f, ensure_ascii=False, indent=2)
print(f"added {len(E)} elements; Panel 11 ends at y={y}; total now {len(doc['elements'])}")
