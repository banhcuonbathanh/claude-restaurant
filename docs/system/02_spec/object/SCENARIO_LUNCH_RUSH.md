# Scenario — A Full Lunch Rush (Orders · Staff · Tables · Ingredients)

> **What this is:** one busy lunch hour told as a *story*, using the **real seed data**
> ([MENU_CATALOG.md](MENU_CATALOG.md)) so you can *picture* how the object models move together.
> It is not a spec — it just animates the schemas. Field shapes live in their home files:
> [Order](OBJECT_MODEL_ORDER.md) · [Staff](OBJECT_MODEL_STAFF.md) · [Table](OBJECT_MODEL_TABLE.md) ·
> [Ingredient](OBJECT_MODEL_INGREDIENT.md) · [Combo](OBJECT_MODEL_COMBO.md) · index → [OBJECT_MODELS.md](OBJECT_MODELS.md).
>
> Money in VND (₫). Order numbers follow `ORD-YYYYMMDD-NNN`. Date: 2026-06-13.

---

## 👥 The cast (Staff — from the seed)

| Who | Username | Role | Job this hour |
|---|---|---|---|
| **Phạm Thu Ngân** | `cashier1` | cashier | Seats guests, runs the QR/POS, takes payment, works the waitlist |
| **Lê Đầu Bếp** | `chef1` | chef | Cooks on the KDS, increments `qty_served` per dish |
| **Trần Quản Lý** | `manager1` | manager | Watches stock, records ingredient movements |

## 🪑 The floor (Tables — from the seed)

| Table | Capacity |
|---|---|
| Bàn 01 | 4 |
| Bàn 02 | 4 |
| Bàn 03 | 6 |
| Bàn 04 | 2 |
| Bàn 05 | 4 |
| Bàn VIP | 8 |

Every table starts `available`. The order lifecycle flips it to `occupied`, and payment / cancel
flips it back to `available` — staff don't set this by hand.

---

## ⏱️ The timeline

### 11:40 — 1 guest sits at Bàn 01

A solo guest scans the **Bàn 01** QR and orders **1× Suất Giò** (₫21,000 — 1 Giò · 3 Bánh Cuốn · 1 Canh).

```jsonc
// orders row
{ "order_number": "ORD-20260613-014", "table_id": "Bàn 01",
  "source": "qr", "status": "pending", "total_amount": 21000,
  "created_by": null }                 // customer self-ordered → no staff
```

→ **Bàn 01: `available → occupied`.**

### 11:48 — 5 guests arrive for Bàn 02

A party of **5** is seated at **Bàn 02 (capacity 4)**. Phạm Thu Ngân pulls up a stool.

> ⚠️ **FLAG — no capacity enforcement.** The system never checks headcount vs. `Table.capacity`;
> seating 5 at a 4-seat table is a staff decision, not a system rule. `capacity` is display/planning
> only — see [Table home](OBJECT_MODEL_TABLE.md).

They order **5× Suất Đầy Đủ Trứng Chín** (5 × ₫30,000 = **₫150,000**). Each combo explodes into a
header + child rows — the price lives **only** on the order total, children sit at `unit_price = 0`:

| name | unit_price | qty | row type |
|---|---|---|---|
| Suất Đầy Đủ Trứng Chín | **₫0** | 5 | combo **header** (the ₫30k×5 is in `total_amount`, not here) |
| Bánh Trứng Chín | ₫0 | 5 | sub-item |
| Giò | ₫0 | 5 | sub-item |
| Bánh Cuốn | ₫0 | 15 | sub-item |
| Canh | ₫0 | 5 | sub-item |

→ **Bàn 02: occupied.** `ORD-20260613-015`, total **₫150,000**.

> 💡 If this party had been split across **two** tables (say 3 at Bàn 02 + 2 at Bàn 05), each table
> gets its *own* order, and a shared **`group_id`** links them so the cashier can settle **one bill**.
> Here they fit one table, so no `group_id` is needed.

### 11:55 — 6 more guests fill the remaining tables

Three small parties walk in together and take the **last four tables**, so every table is now occupied:

| Table | Guests | Order | Items | Total |
|---|---|---|---|---|
| Bàn 03 (6) | 2 | `…-016` qr | 2× Suất Đầy Đủ Trứng Tái | ₫60,000 |
| Bàn 04 (2) | 1 | `…-017` qr | 3× Giò (nhân thịt) | ₫27,000 |
| Bàn 05 (4) | 2 | `…-018` qr | 2× Giò *(cancels at 12:05 — see below)* | ₫18,000 |
| Bàn VIP (8) | 1 | `…-019` qr | 1× Suất Đầy Đủ Trứng Tái | ₫30,000 |

→ **All 6 tables `occupied`.** The stall is full.

### 12:01 & 12:03 — 2 online orders (no table)

Two takeaway customers order from the website. `source: "online"`, **`table_id: null`** — these are
independent of the floor and never touch a table's status:

```jsonc
// ORD-20260613-020 — online
{ "table_id": null, "source": "online", "status": "pending",
  "total_amount": 60000 }              // 2× Suất Đầy Đủ Trứng Chín

// ORD-20260613-021 — online
{ "table_id": null, "source": "online", "status": "pending",
  "total_amount": 12000 }              // 1× Bánh Chay
```

### 12:02 — 3 guests arrive, but no table → ⏳ waitlist

A party of **3** walks in. Every table is `occupied`, and **the QR flow needs a free table to start an
order** — there is no "ghost table." So they **wait**. Phạm Thu Ngân tells them Bàn 01 is closing out
in a few minutes.

> ⚠️ **FLAG — the waitlist lives in the cashier's head, not the DB.** There is no `waitlist` object;
> a guest with no table simply cannot create an order yet. Staff manage the queue manually until a
> table frees.

### 12:05 — Bàn 05 orders 2 dishes, then cancels

The 2 guests at **Bàn 05** decide to leave. Their order (`…-018`, 2× Giò = ₫18,000) is **cancelled
before the chef starts cooking**:

```jsonc
// orders row — Bàn 05, before
{ "order_number": "ORD-20260613-018", "table_id": "Bàn 05",
  "status": "pending", "total_amount": 18000 }   // items: 2× Giò @ 9,000

// after cancel
{ "order_number": "ORD-20260613-018", "table_id": "Bàn 05",
  "status": "cancelled", "total_amount": 18000 }  // amount kept for audit, NOT billed
```

What happens:
- `status: pending → cancelled` (the `orders` enum includes `cancelled`).
- **Cancellation is allowed at any status** — this is an owner decision (the *cancel-anytime* drift),
  not a per-status gate. See the Decision Log in [LOGIC_INDEX](../../07_business_logic/LOGIC_INDEX.md).
- No payment is created; the order is **excluded from the day's revenue** (the `total_amount` row stays
  only as history).
- **Bàn 05: `occupied → available`.**

### 12:08 — The floor recovers

Two tables free up almost at once:
- The solo guest at **Bàn 01** pays ₫21,000 (cashier closes the bill) → `status → paid` → **Bàn 01 available**.
- **Bàn 05** is already free from the cancel.

Phạm Thu Ngân seats the **waiting party of 3 at Bàn 01** (the table they were promised). Bàn 05 stays
open for the next walk-in.

---

## 📸 Peak snapshot — 12:04 (the busiest moment)

| Table / channel | Cap | Guests | Status | Order | Total | Dish state (KDS) |
|---|---|---|---|---|---|---|
| Bàn 01 | 4 | 1 | occupied | `…-014` qr | ₫21,000 | ready (about to pay) |
| Bàn 02 | 4 | **5** ⚠️ | occupied | `…-015` qr | ₫150,000 | preparing |
| Bàn 03 | 6 | 2 | occupied | `…-016` qr | ₫60,000 | preparing |
| Bàn 04 | 2 | 1 | occupied | `…-017` qr | ₫27,000 | pending |
| Bàn 05 | 4 | 2 | occupied | `…-018` qr | ₫18,000 | pending *(cancels in 1 min)* |
| Bàn VIP | 8 | 1 | occupied | `…-019` qr | ₫30,000 | pending |
| 🌐 online | — | — | — | `…-020` | ₫60,000 | preparing |
| 🌐 online | — | — | — | `…-021` | ₫12,000 | pending |
| ⏳ waitlist | — | **3** | *waiting — no table* | — | — | — |

**Open orders on the kitchen screen: 8.** Lê Đầu Bếp works them by incrementing each item's
`qty_served`; when every item on an order reaches `qty_served == quantity`, that order flips to `ready`.

**Day revenue from this rush** (everyone pays except the Bàn 05 cancel):
`21k + 150k + 60k + 27k + 0 + 30k + 60k + 12k = ` **₫360,000**.

---

## 🥢 Behind the dishes — the ingredient thread

All that food drew down raw stock. After the rush, **Trần Quản Lý** does a quick stock-take and records
the flour used as an **`out`** movement:

```jsonc
// stock_movements row — end-of-lunch stock-take
{ "ingredient_id": "Bột bánh cuốn", "type": "out",
  "quantity": 6.5, "note": "Tiêu thụ trưa 13/06", "created_by": "manager1" }
```

That drops the ingredient toward its threshold:

```jsonc
// ingredients row — "Bột bánh cuốn" after the stock-take
{ "name": "Bột bánh cuốn", "unit": "kg",
  "quantity": 6.0,             // current_stock: 12.5 → 6.0
  "warningThreshold": 5.0,     // min_stock
  "expiryDate": "2026-07-01",
  "status": "in_stock" }       // 6.0 > 5.0 — but one more rush will trip "low_stock"
```

> ⚠️ Two real-world facts worth keeping in mind (both are existing system flags):
> 1. **Stock is not auto-decremented when food is cooked.** `current_stock` only changes when a staff
>    member records a movement. The recipe link (`product_ingredients`) exists in DB but **nothing reads
>    it during the order flow** — see [Ingredient §3](OBJECT_MODEL_INGREDIENT.md). The manager keeps
>    stock honest by hand.
> 2. **`out` can't go negative** — it floors at `GREATEST(0, current_stock - qty)`; over-draw is silently
>    clamped, no error.

If flour ever hits `0` → `status: out_of_stock`; within 7 days of `expiryDate` → `expiring_soon`;
at/under `5.0` → `low_stock`. Those badges light up on the admin ingredients page.

---

## 🧠 The one-line mental model

> **Staff** *act on* → **Orders** *(each pinned to a Table via QR, or to no table when `online`; combos
> split into a 0-priced header + children; cancel-anytime; prices/toppings snapshotted at order time)* →
> while **Ingredients** track the raw stock behind the dishes, **moved by hand** via the stock ledger —
> never auto-deducted.

## Flags surfaced by this scenario

| # | Flag | Where it bites |
|---|---|---|
| 1 | **No table-capacity enforcement** | 5 guests seated at a 4-seat Bàn 02 — staff judgment, not a system rule |
| 2 | **No waitlist object** | The party of 3 with no free table can't create an order; the queue is manual |
| 3 | **Cancel allowed at any status** | Bàn 05's cancel — owner *cancel-anytime* decision; excluded from revenue |
| 4 | **Combo price only on the order total** | Combo child rows are `unit_price = 0` — never sum the children |
| 5 | **Stock is manual, never auto-deducted** | Cooking 35+ bánh cuốn doesn't move `current_stock`; the manager does |
