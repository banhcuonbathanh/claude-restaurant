#!/usr/bin/env python3
"""Add 'live state object' cards to PANEL 9 of customer_menu.excalidraw.

Three dark cards on the right of Panel 9 showing the REAL shapes + a concrete
example (Bàn 03 order = 112.000đ), all sourced from docs/system:
  A · useCartStore  (Zustand client state)
  B · TanStack Query (server cache)
  C · Order model    (BE truth → POST body → order_cache snapshot)
"""
import json

FP = "docs/system/08_pages/customer/customer_menu/customer_menu.excalidraw"

CARD_BG = "#1F2937"; CARD_STK = "#2D3748"; LIGHT = "#F9FAFB"; MUTED = "#9CA3AF"
DARK = "#0a0a0a"; PANEL_TXT = "#0f172a"
C_ZUS = "#FBBF24"   # amber  – Zustand client
C_TAN = "#34D399"   # green  – TanStack server cache
C_ORD = "#FF7A1A"   # orange – Order model / BE
UPDATED = 1746316800000

_idc = [0]; _idx = [0]
def nid():
    _idc[0] += 1; return f"p9o-{_idc[0]:04d}"
def nidx():
    v = _idx[0]; _idx[0] += 1; return f"e{v:04d}"

def rect(x, y, w, h, bg=CARD_BG, stk=CARD_STK, sw=1, round_=True):
    return {"id": nid(), "type": "rectangle", "x": x, "y": y, "width": w, "height": h,
        "angle": 0, "strokeColor": stk, "backgroundColor": bg, "fillStyle": "solid",
        "strokeWidth": sw, "strokeStyle": "solid", "roughness": 0, "opacity": 100,
        "groupIds": [], "roundness": {"type": 3} if round_ else None, "seed": 1,
        "version": 1, "versionNonce": 1, "isDeleted": False, "boundElements": [],
        "updated": UPDATED, "index": nidx(), "link": None, "locked": False, "frameId": None}

def text(x, y, s, fs=11, color=LIGHT, ff=2, align="left"):
    lines = s.split("\n"); maxlen = max((len(l) for l in lines), default=1)
    cw = 0.6 if ff == 3 else 0.58
    return {"id": nid(), "type": "text", "x": x, "y": y,
        "width": int(maxlen*fs*cw)+4, "height": int(len(lines)*fs*1.25)+2, "angle": 0,
        "strokeColor": color, "backgroundColor": "transparent", "fillStyle": "solid",
        "strokeWidth": 1, "strokeStyle": "solid", "roughness": 0, "opacity": 100,
        "groupIds": [], "roundness": None, "seed": 1, "version": 1, "versionNonce": 1,
        "isDeleted": False, "boundElements": [], "updated": UPDATED, "index": nidx(),
        "link": None, "locked": False, "frameId": None, "text": s, "fontSize": fs,
        "fontFamily": ff, "textAlign": align, "verticalAlign": "top",
        "containerId": None, "originalText": s, "autoResize": True, "lineHeight": 1.25}

E = []
COL_X = 1750
COL_W = 700
PAD = 14
LINE = 14          # px per code line at fs 11
FS = 11

# ---- column header ----
E.append(text(COL_X, 2690,
    "PANEL 9 · Live state objects behind the rendered /menu — real shapes + example (Bàn 03 order = 112.000đ)",
    fs=15, color=PANEL_TXT))
E.append(text(COL_X, 2714,
    "Same order, three representations: client cart (Zustand) → server cache (TanStack) → persisted Order (BE truth). Source: docs/system.",
    fs=10, color="#475569"))

def card(y, accent, title, shape, example, ex_label="EXAMPLE"):
    shp_lines = shape.split("\n"); ex_lines = example.split("\n")
    body_h = PAD + 22 + 16 + len(shp_lines)*LINE + 14 + 16 + len(ex_lines)*LINE + PAD
    # frame + title bar
    E.append(rect(COL_X, y, COL_W, body_h, bg=CARD_BG, stk=accent, sw=2))
    E.append(rect(COL_X, y, COL_W, 30, bg=accent, stk=accent))
    E.append(text(COL_X+PAD, y+8, title, fs=13, color=DARK))
    cy = y + 30 + 12
    E.append(text(COL_X+PAD, cy, "SHAPE", fs=10, color=accent))
    cy += 16
    E.append(text(COL_X+PAD, cy, shape, fs=FS, color=LIGHT, ff=3))
    cy += len(shp_lines)*LINE + 14
    E.append(rect(COL_X+PAD, cy-6, COL_W-2*PAD, 1, bg=accent, stk=accent, round_=False))
    E.append(text(COL_X+PAD, cy, ex_label, fs=10, color=accent))
    cy += 16
    E.append(text(COL_X+PAD, cy, example, fs=FS, color="#E5E7EB", ff=3))
    return body_h

# ===================================================== A · Zustand
zus_shape = (
"useCartStore  (Zustand + persist)\n"
"  items: CartItem[]            // session-only · NOT persisted\n"
"  tableId / tableName: string | null\n"
"  activeOrderId: string | null      <-- persisted\n"
"  paymentMethod: string | null\n"
"  orderNote: string                 <-- persisted\n"
"  -- selectors (derived from items) --\n"
"  total()     = Σ price × quantity\n"
"  itemCount() = Σ quantity\n"
"  persist key 'cart-config-v3' · partialize {orderNote, activeOrderId}\n"
"CartItem { id, type:'combo'|'product', quantity, price,\n"
"           toppings?[], combo_items?[] }")
zus_ex = (
"{ tableName:\"Bàn 03\", tableId:\"tbl-ban03\",\n"
"  activeOrderId:null, paymentMethod:null, orderNote:\"Ít hành\",\n"
"  items:[\n"
"    { id:\"combo_daydan\", type:\"combo\", quantity:1, price:77000,\n"
"      combo_items:[\n"
"        {product_id:\"p_banh\", quantity:1, topping_ids:[\"t_thit\"]},\n"
"        {product_id:\"p_gio\",  quantity:1, topping_ids:[]},\n"
"        {product_id:\"p_canh\", quantity:1, topping_ids:[]} ] },\n"
"    { id:\"prod_banhcuon_thit\", type:\"product\", quantity:1, price:35000,\n"
"      toppings:[{id:\"t_thit\", name:\"Nhân thịt\", price:0}] } ] }\n"
"// total() -> 112.000đ    itemCount() -> 2")

# ===================================================== B · TanStack
tan_shape = (
"TanStack Query  (global cache · keyed by queryKey · staleTime 5m = Redis TTL)\n"
"  ['categories']                  GET /categories\n"
"  ['products', catId, search]     GET /products?category_id&search\n"
"  ['products-all']                GET /products   (enrich combo items)\n"
"  ['combos']                      GET /combos\n"
"  defaults: staleTime 60s · retry 1   |   POST /orders -> invalidate ['orders']\n"
"Product { id, category_id, category_name, name, price, image_path,\n"
"          is_available, toppings:[{id,name,price,is_available}] }\n"
"Combo(raw) { id,name,price, combo_items:[{id,product_id,quantity}] }\n"
"Combo(enriched).items[]  <- join product_id vs ['products-all'] (local useMemo)")
tan_ex = (
"['combos'] ->\n"
"[{ id:\"combo-1\", name:\"Combo Đầy Đặn\", price:77000, is_available:true,\n"
"   image_path:\"combos/combo-day-dan.jpg\",\n"
"   combo_items:[ {id:\"ci-1\",product_id:\"p_banh\",quantity:1},\n"
"                 {id:\"ci-2\",product_id:\"p_gio\", quantity:1},\n"
"                 {id:\"ci-3\",product_id:\"p_canh\",quantity:1} ] }]\n"
"['products', 'cat-banh', null] ->\n"
"[{ id:\"p_banh\", category_name:\"Bánh Cuốn\", name:\"Bánh cuốn thịt\",\n"
"   price:35000, is_available:true,\n"
"   toppings:[ {id:\"t_thit\",name:\"Nhân thịt\",price:0},\n"
"              {id:\"t_moc\", name:\"Mộc nhĩ\",  price:5000} ] }]")

# ===================================================== C · Order model
ord_shape = (
"Order model  (BE truth -> FE snapshot)\n"
"Order { id, order_number, table_id, table_name,\n"
"  status: pending->confirmed->preparing->ready->delivered | cancelled | paid,\n"
"  source:'qr'|'pos'|'online', note,\n"
"  total_amount (denormalized · auto-recalc on item mutation),\n"
"  created_by (null = customer self-order), items[] }\n"
"OrderItem { id, product_id | combo_id, combo_ref_id,\n"
"  name(snapshot), unit_price, quantity, qty_served,\n"
"  toppings_snapshot, note }\n"
"★ Combo double-count fix: header row unit_price=0 (combo_id set,\n"
"  combo_ref_id=null); children carry real price (combo_ref_id->header);\n"
"  total = Σ unit_price×qty  EXCLUDING headers")
ord_ex = (
"① POST /api/v1/orders   (no prices on wire — BE snapshots)\n"
"{ table_id:\"tbl-ban03\", source:\"qr\", note:\"Ít hành\", items:[\n"
"   { product_id:\"combo_daydan\", quantity:1, combo_items:[\n"
"       {product_id:\"p_banh\",quantity:1,topping_ids:[\"t_thit\"]},\n"
"       {product_id:\"p_gio\", quantity:1,topping_ids:[]},\n"
"       {product_id:\"p_canh\",quantity:1,topping_ids:[]} ] },\n"
"   { product_id:\"p_banh\", quantity:1, topping_ids:[\"t_thit\"] } ] }\n"
"② BE 201 response  ==  localStorage['order_cache_<id>']\n"
"{ id:\"ord-12345\", order_number:\"ORD-20260619-001\", status:\"pending\",\n"
"  table_name:\"Bàn 03\", total_amount:112000, items:[\n"
"   {name:\"Combo Đầy Đặn\", combo_id:\"combo-1\", combo_ref_id:null,\n"
"    unit_price:0, quantity:1},                          <-- header = 0\n"
"   {name:\"Bánh cuốn thịt\", combo_ref_id:\"hdr\", unit_price:42000,\n"
"    quantity:1, toppings_snapshot:[{name:\"Nhân thịt\",price:0}]},\n"
"   {name:\"Giò\",  combo_ref_id:\"hdr\", unit_price:35000, quantity:1},\n"
"   {name:\"Canh\", combo_ref_id:\"hdr\", unit_price:0,     quantity:1},\n"
"   {name:\"Bánh cuốn thịt\", combo_ref_id:null, unit_price:35000, quantity:1}\n"
"  ] }\n"
"// 0 + (42000+35000+0 = combo 77.000) + 35000  =  112.000đ")

y = 2746
GAP = 26
h = card(y, C_ZUS, "A · useCartStore  —  Zustand (client state)", zus_shape, zus_ex); y += h + GAP
h = card(y, C_TAN, "B · TanStack Query  —  server cache", tan_shape, tan_ex); y += h + GAP
h = card(y, C_ORD, "C · Order model  —  BE truth · POST body · order_cache snapshot",
         ord_shape, ord_ex, ex_label="EXAMPLE — same Bàn 03 order, 3 views"); y += h

# write back
with open(FP) as f: doc = json.load(f)
doc["elements"].extend(E)
with open(FP, "w") as f: json.dump(doc, f, ensure_ascii=False, indent=2)
print(f"added {len(E)} elements; column ends at y={y}; total now {len(doc['elements'])}")
