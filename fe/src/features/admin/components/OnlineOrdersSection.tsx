'use client'
import type { Order } from '@/types/order'
import { formatVND } from '@/lib/utils'
import {
  elapsedMins,
  isKitchenItem,
  statusColors,
  statusLabel,
  toppingLabel,
} from '@/features/admin/overview.helpers'

// Zone ONLINE — orders with source='online' (no table). These never appear in
// WaitingSection/TableSection (both are table-keyed), so without this zone an
// online order is invisible to staff and stays 'pending' forever.

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  vnpay:   'VNPay',
  momo:    'MoMo',
  zalopay: 'ZaloPay',
  cash:    'Tiền mặt',
}

function paymentBadge(order: Order): { label: string; cls: string } {
  if (!order.payment_method) {
    return { label: 'Chưa thanh toán', cls: 'bg-gray-100 text-gray-600' }
  }
  const method = PAYMENT_METHOD_LABEL[order.payment_method] ?? order.payment_method
  switch (order.payment_status) {
    case 'completed': return { label: `Đã TT · ${method}`, cls: 'bg-green-100 text-green-700' }
    case 'failed':    return { label: `TT lỗi · ${method}`, cls: 'bg-red-100 text-red-700' }
    case 'refunded':  return { label: `Hoàn tiền · ${method}`, cls: 'bg-purple-100 text-purple-700' }
    default:          return { label: `Chờ TT · ${method}`, cls: 'bg-yellow-100 text-yellow-700' }
  }
}

function nextAction(status: Order['status']): { label: string; nextStatus: string; cls: string } | null {
  switch (status) {
    case 'pending':   return { label: 'Xác nhận',    nextStatus: 'confirmed', cls: 'bg-indigo-600 hover:bg-indigo-700 text-white' }
    case 'confirmed': return { label: 'Bắt đầu làm', nextStatus: 'preparing', cls: 'bg-yellow-500 hover:bg-yellow-600 text-white' }
    case 'preparing': return { label: 'Sẵn sàng',    nextStatus: 'ready',     cls: 'bg-green-500 hover:bg-green-600 text-white' }
    case 'ready':     return { label: 'Đã giao',     nextStatus: 'delivered', cls: 'bg-green-600 hover:bg-green-700 text-white' }
    default:          return null
  }
}

function formatPickup(pickupAt: string, now: number): { label: string; overdue: boolean } {
  const t = new Date(pickupAt)
  const hhmm = t.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  const diffMins = Math.round((t.getTime() - now) / 60_000)
  if (diffMins > 0)  return { label: `Lấy lúc ${hhmm} · còn ${diffMins}p`, overdue: false }
  if (diffMins < 0)  return { label: `Lấy lúc ${hhmm} · trễ ${-diffMins}p`, overdue: true }
  return { label: `Lấy lúc ${hhmm} · đến giờ`, overdue: true }
}

interface Props {
  orders:     Order[] // pre-filtered: active statuses only; this component picks source='online'
  now:        number
  loadingIds: Set<string>
  onAction:   (orderId: string, status: string) => Promise<void>
}

export function OnlineOrdersSection({ orders, now, loadingIds, onAction }: Props) {
  const onlineOrders = orders
    .filter(o => o.source === 'online')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  if (onlineOrders.length === 0) return null

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <span className="text-base">🛵</span>
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Đơn online</h2>
        <span className="text-xs font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
          {onlineOrders.length}
        </span>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {onlineOrders.map(order => {
          const mins     = elapsedMins(order.created_at, now)
          const kitItems = order.items.filter(isKitchenItem)
          const next     = nextAction(order.status)
          const loading  = loadingIds.has(order.id)
          const pay      = paymentBadge(order)
          const pickup   = order.pickup_at ? formatPickup(order.pickup_at, now) : null
          const mapsUrl  = order.delivery_address
            ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.delivery_address)}`
            : null

          return (
            <div key={order.id} className="px-4 py-3 space-y-2">
              {/* Row 1 — order number · status · payment · elapsed */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                  #{order.order_number.split('-').pop()}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors(order.status)}`}>
                  {statusLabel(order.status)}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pay.cls}`}>
                  {pay.label}
                </span>
                <span className={`ml-auto text-xs tabular-nums ${mins >= 20 ? 'text-red-600 font-bold' : mins >= 10 ? 'text-yellow-600 font-semibold' : 'text-gray-500'}`}>
                  {mins}p trước
                </span>
              </div>

              {/* Row 2 — customer · phone · address · directions · pickup time */}
              <div className="flex items-start gap-x-4 gap-y-1 flex-wrap text-sm">
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {order.customer_name || 'Khách online'}
                </span>
                {order.customer_phone && (
                  <a
                    href={`tel:${order.customer_phone}`}
                    className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                  >
                    📞 {order.customer_phone}
                  </a>
                )}
                {order.delivery_address && (
                  <span className="text-gray-600 dark:text-gray-300 break-words">
                    📍 {order.delivery_address}
                  </span>
                )}
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs font-medium px-2 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                  >
                    🗺️ Chỉ đường
                  </a>
                )}
              </div>

              {pickup && (
                <p className={`text-xs font-medium ${pickup.overdue ? 'text-red-600' : 'text-gray-600 dark:text-gray-300'}`}>
                  ⏰ {pickup.label}
                </p>
              )}

              {/* Items — dish + topping + note */}
              <div className="text-sm text-gray-700 dark:text-gray-200 space-y-0.5">
                {kitItems.map(item => (
                  <p key={item.id}>
                    <span className="font-medium tabular-nums">{item.quantity}x</span>{' '}
                    {item.name}
                    <span className="text-gray-500 dark:text-gray-400"> · {toppingLabel(item)}</span>
                    {item.note && (
                      <span className="text-amber-700 dark:text-amber-400"> — “{item.note}”</span>
                    )}
                  </p>
                ))}
                {order.note && (
                  <p className="text-xs text-amber-700 dark:text-amber-400">📝 {order.note}</p>
                )}
              </div>

              {/* Row 3 — total + actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                  {formatVND(order.total_amount)}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  {order.status !== 'delivered' && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => onAction(order.id, 'cancelled')}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      Hủy
                    </button>
                  )}
                  {next && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => onAction(order.id, next.nextStatus)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors ${next.cls}`}
                    >
                      {loading ? '...' : next.label}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
