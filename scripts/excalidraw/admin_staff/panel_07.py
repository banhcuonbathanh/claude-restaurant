#!/usr/bin/env python3
"""PANEL 7 for admin_staff.excalidraw — Scenario Timeline — sourced from SCENARIO_STAFF_MANAGE.md."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_staff/admin_staff.excalidraw"
ex.reset("p7")
E = []

def lrect(x, y, w, h, bg=ex.L_NEUTRAL, stk=ex.L_BORDER, sw=1):
    return ex.rect(x, y, w, h, bg=bg, stk=stk, sw=sw)
def lt(x, y, s, fs=11, color=ex.L_TEXT, ff=2):
    return ex.text(x, y, s, fs=fs, color=color, ff=ff)

X, Y = 1760, 880
E += ex.panel_header(X, Y, "PANEL 7 · Scenario Timeline", "Hương (manager, lvl4) manages the roster — mid-morning, before service")

beats = [
    ("10:02", "Hire Quân (create)", "POST /staff cashier quan_tn\nrole lvl2 < 4 ✅, username free ✅, bcrypt, INSERT is_active=1\n→ 201 toast 'Đã tạo' · can log in at /login immediately", "#16a34a"),
    ("10:05", "Fix Lâm's name (update)", "PATCH /staff/:id — handler diffs JSON, sends only full_name\nno role change → no hierarchy check · 200 'Đã cập nhật'", ex.C_ORD),
    ("10:08", "Deactivate Tú (status)", "PATCH /staff/:id/status {is_active:false}\nself-check ok, Tú below her ✅ · UPDATE + Del auth:staff:<tú>\n→ Tú's NEXT POS call → 401 within seconds (not 5-min TTL)", ex.C_AMBER),
    ("10:10", "Delete last admin — BLOCKED", "🗑 hidden (canDelete: role ≥ caller) + route admin-only\nhad an admin tried → CountAdmins≤1 → 409 LAST_ADMIN\ncan't self-deactivate (button disabled + SELF_DEACTIVATION)", ex.C_RED),
    ("10:11", "Inspect Quân (drawer)", "👁 → StaffDetailDrawer chunk → GET /staff/:id (30s)\nHiệu suất tab = 0% 'Chưa có dữ liệu' (performance_score stub)", ex.C_VIOLET),
]
ly = 950
# vertical spine
E.append(ex.arrow(X+60, ly, X+60, ly+len(beats)*108-20, stk=ex.SUB, sw=2))
for i, (t, title, body, c) in enumerate(beats):
    yy = ly + i*108
    E.append(lrect(X+8, yy, 96, 30, bg=c, stk=c))
    E.append(lt(X+18, yy+8, t, fs=13, color="#ffffff"))
    E.append(lrect(X+120, yy, 520, 92, bg="#ffffff", stk=c))
    E.append(lt(X+132, yy+8, title, fs=12, color=c))
    E.append(lt(X+132, yy+30, body, fs=10, ff=3, color=ex.SUB))

ex.append(FP, E)
print(f"PANEL 7: appended {len(E)} elements")
