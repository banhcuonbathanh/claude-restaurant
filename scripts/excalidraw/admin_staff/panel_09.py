#!/usr/bin/env python3
"""PANEL 9 for admin_staff.excalidraw — Live State Objects (dark) — from admin_staff_be.md (StaffJSON) + crosspage (cache keys)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_staff/admin_staff.excalidraw"
ex.reset("p9")
E = []

X, Y = 40, 2700
E += ex.panel_header(X, Y, "PANEL 9 · Live State Objects", "real shapes + ONE example threaded through all three: cashier 'Quân' (quan_tn)")

y0 = Y + 50
els, h1 = ex.card(X, y0, 430, ex.C_ZUS, "auth store (Zustand · memory only)",
    "currentUser: {\n"
    "  id: 'u-7', role: 'manager',\n"
    "  full_name: 'Hương', level: 4\n"
    "}\n"
    "// no persist · F5 = re-auth", body_color=ex.LIGHT)
E += els

els, h2 = ex.card(X+470, y0, 470, ex.C_TAN, "TanStack cache",
    "['admin','staff']  (staleTime 0)\n"
    "  -> [ StaffJSON, ... 100 max ]\n"
    "\n"
    "['admin','staff','s-quan']  (30s)\n"
    "  -> StaffDetailJSON (+ updated_at)", body_color=ex.LIGHT)
E += els

els, h3 = ex.card(X+980, y0, 520, ex.C_ORD, "BE StaffJSON  (toStaffJSON)  — example: Quân",
    "{ id:'s-quan', username:'quan_tn',\n"
    "  full_name:'Trần Quân', role:'cashier',\n"
    "  job_title:'Thu ngân', shifts:['sang','chieu'],\n"
    "  phone:'09…', email:'', is_active:true,\n"
    "  performance_score:0,   // hardcoded stub\n"
    "  created_at:'2026-06-20T10:02:…' }", body_color=ex.LIGHT)
E += els

# the thread note
ty = y0 + max(h1, h2, h3) + 16
E.append(ex.rect(X, ty, 1500, 40, bg=ex.CARD_BG, stk=ex.C_VIOLET, sw=2))
E.append(ex.text(X+14, ty+11,
    "ONE row, three homes:  password is NEVER in any of these (bcrypt-hashed server-side, write-only on POST) · is_active=true gates auth · performance_score is fake.",
    fs=11, color=ex.LIGHT, ff=2))

ex.append(FP, E)
print(f"PANEL 9: appended {len(E)} elements")
