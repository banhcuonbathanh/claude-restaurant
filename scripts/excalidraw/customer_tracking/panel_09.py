#!/usr/bin/env python3
"""PANEL 9 — Live State Objects (dark). Real shapes threaded with the Bàn 03 example.
From _crosscomponent §2.1 + _be.md."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_tracking/customer_tracking.excalidraw"
ex.reset("p9")
E = []
X, Y = 40, 2900
E += ex.panel_header(X, Y, "PANEL 9 · Live State Objects — the 3 real shapes (Bàn 03)",
                     "from _crosscomponent §2.1 · one concrete order threaded through Zustand · TanStack · SSE hook",
                     color="#0f172a")

y0 = Y + 60
c1, _ = ex.card(X, y0, 360, ex.C_ZUS, "Zustand · useCartStore (persisted)",
                'activeOrderId:\n  "ord-…-016"   ← the pivot\n(partialize → CART_CONFIG)')
E += c1
c2, _ = ex.card(X + 390, y0, 460, ex.C_ORD, "TanStack · ['order','ord-…-016']",
                'order: {\n  id: "ord-…-016",\n  status: "preparing",\n  total_amount: 60000,\n  table_name: "Bàn 03",\n  items: [ {qty:2, qty_served:1,\n    filling, ItemStatus:"partial"} ]\n}')
E += c2
c3, _ = ex.card(X + 880, y0, 520, ex.C_CYAN, "useOrderMonitorSSE() return (7 fields)",
                'orderStatus:    null   // never set (Flag 1)\nqueueData:      QueueState\ntableStatuses:  []     // not rendered\nsseConnected:   true\nisUnauthorized: false\nitemsChangedAt: 1718…  // Date.now()\nreconnect:      ƒ()    // not wired')
E += c3

# QueueState / QueueItem nested
y1 = y0 + 230
c4, _ = ex.card(X, y1, 420, ex.C_VIOLET, "QueueState (FE-derived)",
                'queue:            QueueItem[]\nposition:         3   // idx+1\ntotal:            5   // data.total\nestimatedMinutes: 6   // idx*3')
E += c4
c5, _ = ex.card(X + 450, y1, 500, ex.C_TAN, "QueueItem (own row highlighted)",
                'orderId:    "ord-…-016"\ntableLabel: "Bàn 03"\nstatus:     "preparing"\nitemCount:  2\norderNumber:"ORD-20260613-016"')
E += c5

print("PANEL 9:", ex.append(FP, E), "total elements")
