'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listTodayHistory } from '@/features/admin/admin.api'
import { formatVND } from '@/lib/utils'
import type { Order } from '@/types/order'

function fmtTime(iso: string) {
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}

const COLS = 'grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_2fr] gap-2 px-4'

export function CancelLog() {
  const [open, setOpen] = useState(false)

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders', 'history'],
    queryFn:  listTodayHistory,
    enabled:  open,
    staleTime: 30_000,
  })

  const cancelled = orders.filter(o => o.status === 'cancelled')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-red-800 dark:text-red-400">Đơn đã huỷ hôm nay</span>
          {!open && cancelled.length > 0 && (
            <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400 text-xs px-2 py-0.5 rounded-full font-medium">
              {cancelled.length} đơn
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-red-100 dark:border-red-800">
          {isLoading ? (
            <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">Đang tải...</p>
          ) : cancelled.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">Chưa có đơn bị huỷ hôm nay</p>
          ) : (
            <>
              <div className="px-4 py-2 bg-red-50 dark:bg-red-900/30 border-b border-red-100 dark:border-red-800">
                <span className="text-xs font-medium text-red-700 dark:text-red-400">{cancelled.length} đơn</span>
              </div>
              <div className={`${COLS} py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide`}>
                <span>Bàn</span>
                <span>Mã đơn</span>
                <span>Tổng tiền</span>
                <span>Giờ tạo</span>
                <span>Giờ huỷ</span>
                <span>Ghi chú</span>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {cancelled.map(order => (
                  <div key={order.id} className={`${COLS} py-2.5 items-center text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                      {order.table_name ?? order.table_id ?? '—'}
                    </span>
                    <span className="text-xs font-mono text-gray-400 dark:text-gray-500 truncate">{order.order_number}</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">{formatVND(order.total_amount)}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{fmtTime(order.created_at)}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{order.updated_at ? fmtTime(order.updated_at) : '—'}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 truncate">{order.note ?? '—'}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
