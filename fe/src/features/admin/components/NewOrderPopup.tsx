'use client'
import type { Order } from '@/types/order'
import { formatVND } from '@/lib/utils'

interface Props {
  order:     Order
  onConfirm: () => void
  onDismiss: () => void
  loading:   boolean
}

// Compact notice that slides down from the top — does not block the page.
export function NewOrderPopup({ order, onConfirm, onDismiss, loading }: Props) {
  const kitItems = order.items.filter(i => !(i.combo_id !== null && i.combo_ref_id === null))
  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-sm">
      <div className="animate-slide-down bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-indigo-600 px-4 py-2 flex items-center justify-between gap-2">
          <p className="text-white font-bold text-sm truncate">
            Đơn hàng mới!{' '}
            <span className="text-indigo-200 font-normal">{order.order_number}</span>
          </p>
          {order.table_id && (
            <span className="bg-white/20 text-white font-bold text-xs px-2 py-1 rounded-lg shrink-0">
              {order.table_id}
            </span>
          )}
        </div>

        <div className="px-4 py-2.5 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-600 dark:text-gray-300 shrink-0">
            {kitItems.length} món ·{' '}
            <span className="font-bold text-gray-900 dark:text-gray-100">
              {formatVND(order.total_amount)}
            </span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={onDismiss}
              disabled={loading}
              className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Bỏ qua
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Đang xác nhận...' : '✓ Xác nhận'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
