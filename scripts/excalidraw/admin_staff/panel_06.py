#!/usr/bin/env python3
"""PANEL 6 for admin_staff.excalidraw — Loading States — sourced from admin_staff_loading.md."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_staff/admin_staff.excalidraw"
ex.reset("p6")
E = []

def lrect(x, y, w, h, bg=ex.L_NEUTRAL, stk=ex.L_BORDER, sw=1):
    return ex.rect(x, y, w, h, bg=bg, stk=stk, sw=sw)
def lt(x, y, s, fs=11, color=ex.L_TEXT, ff=2):
    return ex.text(x, y, s, fs=fs, color=color, ff=ff)

X, Y = 950, 880
E += ex.panel_header(X, Y, "PANEL 6 · Loading States", "4 layers · NO skeletons — every in-flight state is a spinner or a text line")

layers = [
    ("1 · Route segment spinner", "admin/loading.tsx — orange spinner in h-64\nshared by every /admin/* tab", ex.C_AMBER),
    ("2 · Auth / role gate", "AuthGuard + RoleGuard minRole=MANAGER\nblanks shell until auth resolves; non-mgr redirected", ex.C_VIOLET),
    ("3 · Staff list query ['admin','staff']", "isLoading → 'Đang tải...' text + StatsBar HIDDEN (!isLoading)\nstaleTime 0 + refetchOnWindowFocus (silent bg refetch)", ex.C_ORD),
    ("4 · Detail-drawer query ['admin','staff',id]", "dynamic chunk + enabled:open · staleTime 30s\nisLoading||!staff → 'Đang tải...' h-48 · NO error branch", "#0e7490"),
]
ly = 950
for i, (t, b, c) in enumerate(layers):
    yy = ly + i*88
    E.append(lrect(X, yy, 560, 76, bg="#ffffff", stk=c))
    E.append(lt(X+12, yy+8, t, fs=12, color=c))
    E.append(lt(X+12, yy+30, b, fs=10, ff=3, color=ex.SUB))

# main-content branch priority
my = ly + 4*88 + 8
E.append(lrect(X, my, 560, 110, bg=ex.L_INDIGO, stk=ex.C_CYAN))
E.append(lt(X+12, my+8, "Main-content branch (priority order) — page.tsx:172-185", fs=12, color="#0e7490"))
E.append(lt(X+12, my+32,
    "1. isError   → full-body EmptyState + 'Thử lại' refetch()\n"
    "2. isLoading → 'Đang tải...' line\n"
    "3. empty     → StaffTable EmptyState (no-staff == filtered-to-none, Flag2)\n"
    "4. rows      → the table",
    fs=10, ff=3))

# mutation note
muy = my + 130
E.append(lrect(X, muy, 560, 54, bg=ex.L_ORANGE, stk=ex.C_ORD))
E.append(lt(X+12, muy+8, "Mutations don't block the page", fs=12, color=ex.C_ORD))
E.append(lt(X+12, muy+30, "M1 submit disabled + 'Đang lưu...' (createMut/editMut.isPending) · No search gating — pure client filter, no debounce", fs=10, ff=3))

ex.append(FP, E)
print(f"PANEL 6: appended {len(E)} elements")
