#!/usr/bin/env python3
"""excalib — shared Excalidraw element library for the page knowledge-map skill.

Extracted from scripts/gen_panel9_objects.py / gen_panel10.py / gen_panel11.py /
gen_panel12_15.py (the customer_menu.excalidraw build) so every new page's panel
script imports these helpers instead of re-declaring rect()/text() each time.

Usage in a panel script:
    import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
    import excalib as ex

    FP = "docs/system/08_pages/<area>/<page>/<page>.excalidraw"
    ex.reset("p9")                       # id prefix for this panel (keeps ids unique)
    E = []
    E.append(ex.rect(x, y, w, h, bg=ex.CARD_BG, stk=ex.C_ZUS, sw=2))
    E.append(ex.text(x+14, y+8, "A · useCartStore", fs=13, color=ex.DARK))
    ex.append(FP, E)                     # APPEND-ONLY: never deletes existing panels

To start a brand-new file (panel 1):  ex.save(FP, E)   (creates the doc wrapper)
To append to it (panels 2..n):        ex.append(FP, E)
"""
import json

# ── palette (dark deep-panel theme, from panels 9–15) ─────────────────────────
CARD_BG  = "#1F2937"   # dark card fill
CARD_STK = "#2D3748"   # dark card border
DARK     = "#0a0a0a"   # near-black text (on accent bars)
LIGHT    = "#F9FAFB"   # primary light text
MUTED    = "#9CA3AF"   # secondary text
SUB      = "#475569"   # subtitle / caption (on light bg)
PANEL_TXT = "#0f172a"  # panel header text (on light bg)

# accent colours — reuse the same role→colour mapping the customer_menu set used
C_ZUS   = "#FBBF24"   # amber  — Zustand / client state
C_TAN   = "#34D399"   # green  — TanStack / server cache  (also "#22D3EE" cyan in p10+)
C_ORD   = "#FF7A1A"   # orange — Order model / BE truth
C_BE    = "#22C55E"   # green  — backend reaction
C_CYAN  = "#22D3EE"   # cyan   — cross-component / network
C_VIOLET = "#A78BFA"  # violet — cross-page / handoff
C_AMBER = "#F59E0B"   # amber  — loading / món lẻ
C_RED   = "#F87171"   # red    — failure / edge
C_SLATE = "#94A3B8"   # slate  — seed / neutral

# light-theme panel colours (panels 1–8, page-wireframe style)
L_NEUTRAL = "#f8fafc"
L_ORANGE  = "#fff7ed"
L_INDIGO  = "#eef2ff"
L_BORDER  = "#94a3b8"
L_TEXT    = "#1e293b"

UPDATED = 1746316800000   # fixed timestamp — keeps diffs stable, no Date.now()

# ── id / fractional-index counters ────────────────────────────────────────────
_prefix = ["el"]
_idc = [0]
_idx = [0]

def reset(prefix="el", index_start=0):
    """Set a unique id prefix per panel script and reset counters.
    Call once at the top of each panel script (e.g. ex.reset('p9'))."""
    _prefix[0] = prefix
    _idc[0] = 0
    _idx[0] = index_start

def nid():
    _idc[0] += 1
    return f"{_prefix[0]}-{_idc[0]:04d}"

def nidx():
    v = _idx[0]; _idx[0] += 1
    # excalidraw fractional index — letter + zero-padded counter sorts lexically
    return f"z{v:05d}"

# ── primitives ────────────────────────────────────────────────────────────────
def rect(x, y, w, h, bg=CARD_BG, stk=CARD_STK, sw=1, round_=True, fill="solid",
         roughness=0, opacity=100, style="solid"):
    return {"id": nid(), "type": "rectangle", "x": x, "y": y, "width": w, "height": h,
        "angle": 0, "strokeColor": stk, "backgroundColor": bg, "fillStyle": fill,
        "strokeWidth": sw, "strokeStyle": style, "roughness": roughness, "opacity": opacity,
        "groupIds": [], "roundness": {"type": 3} if round_ else None, "seed": 1,
        "version": 1, "versionNonce": 1, "isDeleted": False, "boundElements": [],
        "updated": UPDATED, "index": nidx(), "link": None, "locked": False, "frameId": None}

def text(x, y, s, fs=11, color=LIGHT, ff=2, align="left", w=None, wrap=False):
    """ff=2 normal (Helvetica), ff=3 monospace (Cascadia) for code/shapes."""
    lines = s.split("\n"); maxlen = max((len(l) for l in lines), default=1)
    cw = 0.6 if ff == 3 else 0.58
    width = w if w is not None else int(maxlen * fs * cw) + 4
    if wrap and w:
        per = max(1, int(w / (fs * cw)))
        nrows = sum(max(1, (len(l) // per) + (1 if len(l) % per else 0)) for l in lines)
    else:
        nrows = len(lines)
    return {"id": nid(), "type": "text", "x": x, "y": y,
        "width": width, "height": int(nrows * fs * 1.25) + 2, "angle": 0,
        "strokeColor": color, "backgroundColor": "transparent", "fillStyle": "solid",
        "strokeWidth": 1, "strokeStyle": "solid", "roughness": 0, "opacity": 100,
        "groupIds": [], "roundness": None, "seed": 1, "version": 1, "versionNonce": 1,
        "isDeleted": False, "boundElements": [], "updated": UPDATED, "index": nidx(),
        "link": None, "locked": False, "frameId": None, "text": s, "fontSize": fs,
        "fontFamily": ff, "textAlign": align, "verticalAlign": "top",
        "containerId": None, "originalText": s, "autoResize": (not wrap), "lineHeight": 1.25}

def arrow(x1, y1, x2, y2, stk=MUTED, sw=2, style="solid"):
    """Simple 2-point arrow (relative points, like excalidraw expects)."""
    return {"id": nid(), "type": "arrow", "x": x1, "y": y1,
        "width": abs(x2 - x1), "height": abs(y2 - y1), "angle": 0,
        "strokeColor": stk, "backgroundColor": "transparent", "fillStyle": "solid",
        "strokeWidth": sw, "strokeStyle": style, "roughness": 0, "opacity": 100,
        "groupIds": [], "roundness": {"type": 2}, "seed": 1, "version": 1,
        "versionNonce": 1, "isDeleted": False, "boundElements": [], "updated": UPDATED,
        "index": nidx(), "link": None, "locked": False, "frameId": None,
        "points": [[0, 0], [x2 - x1, y2 - y1]], "lastCommittedPoint": None,
        "startBinding": None, "endBinding": None, "startArrowhead": None,
        "endArrowhead": "arrow"}

# ── composite helpers ─────────────────────────────────────────────────────────
def panel_header(x, y, title, subtitle=None, color=PANEL_TXT, sub_color=SUB):
    """Standard panel title + optional one-line subtitle. Returns element list."""
    out = [text(x, y, title, fs=15, color=color)]
    if subtitle:
        out.append(text(x, y + 24, subtitle, fs=10, color=sub_color))
    return out

def card(x, y, w, accent, title, body_lines, body_color=LIGHT, ff=3, fs=11,
         pad=14, line_h=14, title_fs=13):
    """Dark card with a coloured title bar + monospace body. Returns (elements, height)."""
    lines = body_lines.split("\n")
    body_h = pad + 30 + 12 + len(lines) * line_h + pad
    out = [
        rect(x, y, w, body_h, bg=CARD_BG, stk=accent, sw=2),
        rect(x, y, w, 30, bg=accent, stk=accent),
        text(x + pad, y + 8, title, fs=title_fs, color=DARK),
        text(x + pad, y + 30 + 12, body_lines, fs=fs, color=body_color, ff=ff),
    ]
    return out, body_h

def badge(x, y, label, accent, fs=10):
    """Small pill — accent-filled rect + dark text. Returns element list."""
    w = int(len(label) * fs * 0.62) + 16
    return [
        rect(x, y, w, fs + 10, bg=accent, stk=accent, round_=True),
        text(x + 8, y + 5, label, fs=fs, color=DARK),
    ]

# ── file io ───────────────────────────────────────────────────────────────────
def new_doc(elements=None):
    return {"type": "excalidraw", "version": 2, "source": "https://excalidraw.com",
        "elements": elements or [],
        "appState": {"gridSize": None, "theme": "light", "viewBackgroundColor": "#ffffff"},
        "files": {}}

def save(fp, elements):
    """Create / overwrite the file with these elements (use for panel 1)."""
    with open(fp, "w") as f:
        json.dump(new_doc(elements), f, ensure_ascii=False, indent=2)
    return len(elements)

def append(fp, elements):
    """APPEND-ONLY: read existing doc, extend its elements, write back.
    Deletes nothing — this is how every panel after the first is added."""
    with open(fp) as f:
        doc = json.load(f)
    doc["elements"].extend(elements)
    with open(fp, "w") as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)
    return len(doc["elements"])
