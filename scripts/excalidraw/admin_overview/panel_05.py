#!/usr/bin/env python3
"""PANEL 5 — Cross-Page Dataflow — admin_overview_crosspage_dataflow.md.
Stateless projector+mutator: zero browser handoff, BE row is the only durable output; 4 surfaces; durability matrix."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_overview/admin_overview.excalidraw"
ex.reset("p5")
E = []
T = ex.L_TEXT
B = ex.L_BORDER

X, Y = 1360, 1560
E += ex.panel_header(X, Y, "PANEL 5 · Cross-Page Dataflow — one BE row, four projections",
                     "NO localStorage / URL id / store — the page is a stateless projector + mutator of the order row · source: crosspage_dataflow.md")

# browser box (memory only)
bx, by, bw = X, Y + 70, 540
E.append(ex.rect(bx, by, bw, 150, bg="#f8fafc", stk=B, sw=2, style="dashed"))
E.append(ex.text(bx + 14, by + 10, "ONE MANAGER'S BROWSER — memory only (dies on F5)", fs=11, color="#0f172a"))
for i, l in enumerate(["░ ['orders','live']     TanStack  \"the live floor\"",
                       "░ ['tables']            TanStack  \"the room\"",
                       "░ ['orders','history']  TanStack  \"today's logs\""]):
    E.append(ex.text(bx + 14, by + 36 + i * 22, l, fs=9, color="#475569", ff=3))
E.append(ex.text(bx + 14, by + 108, "▲ write(optimistic)        ▲ read(every zone)", fs=9, color="#64748b", ff=3))
E.append(ex.text(bx + 14, by + 128, "NO ▓ localStorage anywhere — contrast customer /menu", fs=9, color="#b91c1c", ff=3))

# the wire
E.append(ex.text(bx, by + 168, "═══ THE WIRE — the BE is the only hub ═══", fs=10, color="#0f766e"))
E.append(ex.arrow(bx + 270, by + 150, bx + 270, by + 196, stk="#0f766e", sw=2))
E.append(ex.text(bx + 280, by + 162, "PATCH status · POST /payments", fs=8, color="#0f766e", ff=3))

# BE row
ry = by + 196
E.append(ex.rect(bx, ry, bw, 54, bg="#fff7ed", stk="#fb923c", sw=2))
E.append(ex.text(bx + 14, ry + 8, "one  order  row — MySQL (durable)", fs=11, color="#9a3412"))
E.append(ex.text(bx + 14, ry + 30, "order.id · status · total_amount   → Redis pub/sub fans out", fs=9, color="#7c2d12", ff=3))

# 4 downstream surfaces
sx = X + 600
E.append(ex.text(sx, by - 4, "4 downstream surfaces (no browser→browser arrow)", fs=11, color="#7c3aed"))
surf = [("① KDS /kds", "WS orders:kds — re-columns cook board"),
        ("② Other overview tabs", "WS orders:kds — patch/drop ['orders','live']"),
        ("③ Customer /order/<id>", "SSE order:<id> — status badge + toast"),
        ("④ Customer /tracking", "SSE queue:/tables: — queue + floor re-render")]
for i, (h, b) in enumerate(surf):
    yy = by + 24 + i * 60
    E.append(ex.rect(sx, yy, 540, 50, bg="#f5f3ff", stk="#a78bfa", sw=1.5))
    E.append(ex.text(sx + 12, yy + 8, h, fs=10, color="#6d28d9"))
    E.append(ex.text(sx + 12, yy + 28, b, fs=9, color="#7c3aed", ff=3))
    E.append(ex.arrow(bx + bw, ry + 27, sx, yy + 25, stk="#a78bfa", sw=1.5))

# durability matrix
my = ry + 80
E.append(ex.text(bx, my, "Durability matrix", fs=11, color="#0f172a"))
mat = [("Datum", "Survives F5?", "New device?"),
       ("['orders','live'] / ['tables'] / history", "❌ refetched", "❌"),
       ("kiemTraIds / checkedTableIds / searchQuery", "❌", "❌"),
       ("the order row + status (MySQL)", "✅", "✅"),
       ("payment row (MySQL)", "✅", "✅"),
       ("realtime deltas (Redis pub/sub)", "re-derived", "✅")]
mw = [560, 230, 200]
for i, row in enumerate(mat):
    yy = my + 22 + i * 26
    bg = "#0f172a" if i == 0 else ("#ffffff" if i % 2 else ex.L_NEUTRAL)
    E.append(ex.rect(bx, yy, sum(mw), 26, bg=bg, stk=B, sw=1))
    cx = bx
    for val, w in zip(row, mw):
        col = "#ffffff" if i == 0 else T
        E.append(ex.text(cx + 8, yy + 6, val, fs=9, color=col, ff=3))
        cx += w

n = ex.append(FP, E)
print(f"PANEL 5: {len(E)} elements added (total {n})")
