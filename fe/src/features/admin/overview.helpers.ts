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
    default:          return status
  }
}

export function statusColors(status: Order['status']): string {
  switch (status) {
    case 'ready':     return 'bg-green-100 text-green-700'
    case 'preparing': return 'bg-yellow-100 text-yellow-700'
    case 'confirmed': return 'bg-blue-100 text-blue-700'
    default:          return 'bg-gray-100 text-gray-600'
  }
}

export function urgencyBorder(createdAt: string, now: number): string {
  const mins = elapsedMins(createdAt, now)
  if (mins > 20) return 'border-red-400'
  if (mins >= 10) return 'border-yellow-400'
  return 'border-orange-400'
}
