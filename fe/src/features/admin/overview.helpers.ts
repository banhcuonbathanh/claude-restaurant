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
// Canh → "có rau" / "không rau". New orders: detected from the Rau topping in
//   toppings_snapshot (canh rau is now a real topping, not a note). Legacy orders
//   fall back to item.note for backward compatibility.
// Bánh / Giò / Trứng → nhân names from item.toppings_snapshot.
export function toppingLabel(item: OrderItem): string {
  const isCanh = item.name.toLowerCase().includes('canh')

  if (isCanh) {
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

export function urgencyBorder(createdAt: string, now: number): string {
  const mins = elapsedMins(createdAt, now)
  if (mins > 20) return 'border-red-400'
  if (mins >= 10) return 'border-yellow-400'
  return 'border-orange-400'
}
