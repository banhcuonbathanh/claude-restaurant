#!/usr/bin/env python3
"""PANEL 12 (dark) for admin_task_board.excalidraw — Failure / Edge Map.
Sourced from _be.md Error Behaviour table + _loading.md error states. Replaces the SKIPPED
Realtime Fan-out catalog panel (no SSE/WS in this domain — see Panel 5)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_task_board/admin_task_board.excalidraw"
ex.reset("p12")
E = []

X, Y = 1660, 4140
E += ex.panel_header(X, Y, "PANEL 12 · Failure / Edge Map",
                     "every unhappy path · no Redis (no down-fallback) · no realtime (Realtime Fan-out panel N/A → folded here)")

cy = Y + 56
hdr = [("trigger", 0), ("status", 620), ("code / FE-visible", 760)]
E.append(ex.rect(X, cy, 1300, 26, bg=ex.C_RED, stk=ex.C_RED))
for name, dx in hdr:
    E.append(ex.text(X + dx + 8, cy + 7, name, fs=11, color=ex.DARK))
rows = [
    ("POST body fails binding", "400", "INVALID_INPUT · modal toast.error"),
    ("GET /admin/tasks without staffId", "400", "INVALID_INPUT 'staffId là bắt buộc'"),
    ("bad date format (stats / tasks)", "400", "INVALID_INPUT (service parse)"),
    ("bad priority (∉ high|medium|low)", "400", "INVALID_INPUT"),
    ("bad dueDateTime (not RFC3339 / fallback)", "400", "INVALID_INPUT"),
    ("assigned_to not a real staff (FK 1452)", "500", "INTERNAL_ERROR — should be 4xx (Bug 3)"),
    ("any underlying query error", "500", "INTERNAL_ERROR"),
    ("expanded-row read error", "—", "inline 'Không thể tải công việc' · NO retry btn"),
    ("Redis down", "N/A", "no cache in task domain → nothing to fail open"),
]
ry = cy + 26
for i, (trig, st, code) in enumerate(rows):
    bg = ex.CARD_BG if i % 2 else "#243042"
    stc = ex.C_RED if st == "500" else (ex.C_AMBER if st == "400" else ex.MUTED)
    E.append(ex.rect(X, ry, 1300, 34, bg=bg, stk=ex.CARD_STK, sw=1))
    E.append(ex.text(X + 8, ry + 10, trig, fs=10, color=ex.LIGHT, ff=3))
    E.append(ex.text(X + 628, ry + 10, st, fs=11, color=stc, ff=3))
    E.append(ex.text(X + 768, ry + 10, code, fs=10, color=ex.MUTED, ff=3))
    ry += 34

E.append(ex.text(X, ry + 8,
                 "No tx rollback story (single INSERT). No unique-constraint retry. The dead sql.ErrNoRows branch above the FK map never fires for ExecContext INSERT.",
                 fs=10, color=ex.SUB, w=1300, wrap=True))

ex.append(FP, E)
print("PANEL 12: appended")
