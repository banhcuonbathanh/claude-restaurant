import type { Order, OrderItem } from '@/types/order'

export function elapsedMins(createdAt: string, now: number): number {
  return Math.floor((now - new Date(createdAt).getTime()) / 60_000)
}

export function isKitchenItem(item: OrderItem): boolean {
  return !(item.combo_id !== null && item.combo_ref_id === null)
}

export function itemCounts(items: OrderItem[]) {
  const kitchen = items.filter(isKitchenItem)
  let pending = 0, preparing = 0, done = 0, totalQty = 0, servedQty = 0
  for (const it of kitchen) {
    totalQty  += it.quantity
    servedQty += it.qty_served
    if (it.qty_served === 0)              pending++
    else if (it.qty_served < it.quantity) preparing++
    else                                  done++
  }
  return { pending, preparing, done, totalQty, servedQty }
}

export function statusLabel(status: Order['status']): string {
  switch (status) {
    case 'pending':   return 'Chờ xác nhận'
    case 'confirmed': return 'Đã xác nhận'
    case 'preparing': return 'Đang chuẩn bị'
    case 'ready':     return 'Sẵn sàng phục vụ'
    case 'delivered': return 'Đã giao'
    case 'paid':      return 'Đã thanh toán'
    case 'cancelled': return 'Đã huỷ'
    default:          return status
  }
}

export function statusColors(status: Order['status']): string {
  switch (status) {
    case 'ready':     return 'bg-green-100 text-green-700'
    case 'preparing': return 'bg-yellow-100 text-yellow-700'
    case 'confirmed': return 'bg-blue-100 text-blue-700'
    case 'delivered': return 'bg-purple-100 text-purple-700'
    case 'paid':      return 'bg-green-100 text-green-700'
    case 'cancelled': return 'bg-red-100 text-red-700'
    default:          return 'bg-gray-100 text-gray-600'
  }
}

// Friendly topping/variant label for the prep list.
// Canh → "có rau" / "không rau". Canh is now its own product per variant
//   ("Canh có rau" / "Canh không rau"), so the product name is the source of truth.
//   Legacy orders (generic "Canh") fall back to the Rau topping / note.
// Bánh / Giò / Trứng → nhân names from item.toppings_snapshot.
export function toppingLabel(item: OrderItem): string {
  const name = item.name.toLowerCase()
  const isCanh = name.includes('canh')

  if (isCanh) {
    if (name.includes('không')) return 'không rau'
    if (name.includes('rau'))   return 'có rau'
    // Legacy generic "Canh": derive from topping snapshot / note.
    const hasRau = (item.toppings_snapshot ?? []).some(t => t.name.toLowerCase().includes('rau'))
    if (hasRau) return 'có rau'
    const note = item.note?.toLowerCase() ?? ''
    if (note.includes('không rau')) return 'không rau'
    if (note.includes('rau'))       return 'có rau'
    return 'không rau'
  }

  const names = (item.toppings_snapshot ?? []).map(t => t.name)
  return names.length > 0 ? names.join(', ').toLowerCase() : 'không nhân'
}

export interface PrepSummaryRow {
  key:     string
  name:    string
  topping: string
  note:    string | null
  qty:     number
}

// Merge still-pending kitchen items that share the same dish + topping (+ note)
// into one row, summing the remaining quantity.
// e.g. Canh/không rau ×3 + ×3 + ×6 → Canh/không rau ×12.
export function summarizePending(items: OrderItem[]): PrepSummaryRow[] {
  const map = new Map<string, PrepSummaryRow>()
  for (const it of items) {
    const remaining = it.quantity - it.qty_served
    if (remaining <= 0) continue
    const topping = toppingLabel(it)
    const note    = it.note ?? null
    const key     = `${it.name}|${topping}|${note ?? ''}`
    const existing = map.get(key)
    if (existing) existing.qty += remaining
    else map.set(key, { key, name: it.name, topping, note, qty: remaining })
  }
  return Array.from(map.values())
}

// ── Dish summary for "Danh sách bàn" ────────────────────────────────────────
// Aggregate every kitchen item across the given orders into the 4 dish
// categories (Bánh · Trứng · Giò · Canh), each with its nhân / rau breakdown.
// Quantity = total ordered (full count on the floor), not remaining-to-cook.
export interface DishSummaryDetail {
  tableLabel: string
  topping:    string       // nhân or rau
  note:       string | null
  qty:        number       // total ordered
  served:     number       // already served (qty_served)
  remaining:  number       // still to make (qty - qty_served)
  isDelta?:   boolean      // true → this row comes from a 🔍 Kiểm tra (checked) table, shown as a +N preview
}

export interface DishSummaryRow {
  label:      string                                            // 'Bánh' | 'Trứng' | 'Giò' | 'Canh' | <raw name>
  total:      number                                            // base total (excludes checked tables)
  deltaTotal: number                                            // extra from 🔍 Kiểm tra tables (0 when none checked)
  breakdown:  { label: string; qty: number; delta: number }[]   // nhân/rau split — qty = base, delta = checked
  details:    DishSummaryDetail[]                               // per-table breakdown; base rows first, delta rows after
}

// Category order is fixed so the strip always reads Bánh → Trứng → Giò → Canh.
const DISH_CATEGORIES: { key: string; label: string }[] = [
  { key: 'bánh',  label: 'Bánh'  },
  { key: 'trứng', label: 'Trứng' },
  { key: 'giò',   label: 'Giò'   },
  { key: 'canh',  label: 'Canh'  },
]

function dishCategory(name: string): string {
  const n = name.toLowerCase()
  const hit = DISH_CATEGORIES.find(c => n.includes(c.key))
  return hit ? hit.label : name   // unknown dishes keep their own name as a category
}

// `checkedTableIds` = tables marked 🔍 Kiểm tra. Their dishes are pulled OUT of the
// base totals and re-surfaced as a delta (`deltaTotal` / breakdown `delta` / detail `isDelta`),
// so staff can preview the extra prep load without touching the committed numbers.
// Empty set (default) → byte-for-byte the original base-only summary.
export function summarizeTableDishes(
  orders: Order[],
  tables: { id: string; name: string }[] = [],
  checkedTableIds: Set<string> = new Set(),
): DishSummaryRow[] {
  const tableName = new Map(tables.map(t => [t.id, t.name]))
  // label → { total, deltaTotal, breakdown: topping → { qty, delta }, details: prefix|table|topping|note → detail }
  const cats = new Map<string, {
    total: number
    deltaTotal: number
    breakdown: Map<string, { qty: number; delta: number }>
    details: Map<string, DishSummaryDetail>
  }>()
  for (const o of orders) {
    const isChecked = o.table_id ? checkedTableIds.has(o.table_id) : false
    const label_ = o.table_name ?? (o.table_id ? tableName.get(o.table_id) : null) ?? '—'
    for (const it of o.items.filter(isKitchenItem)) {
      const label = dishCategory(it.name)
      const row   = cats.get(label) ?? { total: 0, deltaTotal: 0, breakdown: new Map<string, { qty: number; delta: number }>(), details: new Map<string, DishSummaryDetail>() }
      const topping = toppingLabel(it)
      const note    = it.note?.trim() || null
      const served    = Math.min(it.qty_served, it.quantity)
      const remaining = Math.max(0, it.quantity - it.qty_served)

      const b = row.breakdown.get(topping) ?? { qty: 0, delta: 0 }
      if (isChecked) { row.deltaTotal += it.quantity; b.delta += it.quantity }
      else           { row.total      += it.quantity; b.qty   += it.quantity }
      row.breakdown.set(topping, b)

      // Key base vs delta separately so a checked table keeps its own (delta) row even
      // when its table/topping/note matches an existing base row.
      const dKey = `${isChecked ? 'D' : 'B'}|${label_}|${topping}|${note ?? ''}`
      const d = row.details.get(dKey)
      if (d) { d.qty += it.quantity; d.served += served; d.remaining += remaining }
      else   row.details.set(dKey, { tableLabel: label_, topping, note, qty: it.quantity, served, remaining, isDelta: isChecked })
      cats.set(label, row)
    }
  }

  const order = DISH_CATEGORIES.map(c => c.label)
  return Array.from(cats.entries())
    .map(([label, r]) => ({
      label,
      total:      r.total,
      deltaTotal: r.deltaTotal,
      breakdown:  Array.from(r.breakdown.entries())
        .map(([bl, v]) => ({ label: bl, qty: v.qty, delta: v.delta }))
        .sort((a, b) => (b.qty + b.delta) - (a.qty + a.delta)),
      details:    Array.from(r.details.values())
        .sort((a, b) => {
          // Base rows first, delta (Kiểm tra) rows after; each alphabetical by table.
          if (!!a.isDelta !== !!b.isDelta) return a.isDelta ? 1 : -1
          return a.tableLabel.localeCompare(b.tableLabel, 'vi')
        }),
    }))
    .sort((a, b) => {
      const ia = order.indexOf(a.label), ib = order.indexOf(b.label)
      // Known categories first in fixed order; unknown dishes after, by total qty desc.
      if (ia !== -1 && ib !== -1) return ia - ib
      if (ia !== -1) return -1
      if (ib !== -1) return 1
      return (b.total + b.deltaTotal) - (a.total + a.deltaTotal)
    })
}

export function urgencyBorder(createdAt: string, now: number): string {
  const mins = elapsedMins(createdAt, now)
  if (mins > 20) return 'border-red-400'
  if (mins >= 10) return 'border-yellow-400'
  return 'border-orange-400'
}
