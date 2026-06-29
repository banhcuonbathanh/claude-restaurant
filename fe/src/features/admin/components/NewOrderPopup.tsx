'use client'
import type { Order } from '@/types/order'
import { formatVND } from '@/lib/utils'

interface Props {
  order:     Order
  onConfirm: () => void
  onDismiss: () => void
  loading:   boolean
}

export function NewOrderPopup({ order, onConfirm, onDismiss, loading }: Props) {
  const kitItems = order.items.filter(i => !(i.combo_id !== null && i.combo_ref_id === null))
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-indigo-600 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-lg">Đơn hàng mới!</p>
              <p className="text-indigo-200 text-sm">{order.order_number}</p>
            </div>
            {order.table_id && (
              <span className="bg-white/20 text-white font-bold text-sm px-3 py-1.5 rounded-lg">
                {order.table_id}
              </span>
            )}
          </div>
        </div>

        <div className="px-5 py-4 max-h-64 overflow-y-auto space-y-2">
          {kitItems.map(it => (
            <div key={it.id} className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
              <span className="flex-1 text-sm text-gray-800 dark:text-gray-200">{it.name}</span>
              <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                ×{it.quantity}
              </span>
              <span className="text-xs text-gray-500 w-20 text-right">
                {formatVND(it.unit_price * it.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-3 bg-gray-50 dark:bg-gray-700 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{kitItems.length} món · Tổng cộng</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatVND(order.total_amount)}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onDismiss}
              disabled={loading}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Bỏ qua
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Đang xác nhận...' : '✓ Xác nhận nhận đơn'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
