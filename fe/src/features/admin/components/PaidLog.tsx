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

export function PaidLog() {
  const [open, setOpen] = useState(false)

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders', 'history'],
    queryFn:  listTodayHistory,
    enabled:  open,
    staleTime: 30_000,
  })

  const paid = orders.filter(o => o.status === 'paid')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-800 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-green-800 dark:text-green-400">Đơn đã thanh toán hôm nay</span>
          {!open && paid.length > 0 && (
            <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 text-xs px-2 py-0.5 rounded-full font-medium">
              {paid.length} đơn
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!open && paid.length > 0 && (
            <span className="text-sm font-semibold text-green-700 dark:text-green-400">
              {formatVND(paid.reduce((s, o) => s + o.total_amount, 0))}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-green-100 dark:border-green-800">
          {isLoading ? (
            <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">Đang tải...</p>
          ) : paid.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">Chưa có đơn thanh toán hôm nay</p>
          ) : (
            <>
              <div className="flex items-center justify-between px-4 py-2 bg-green-50 dark:bg-green-900/30 border-b border-green-100 dark:border-green-800">
                <span className="text-xs font-medium text-green-700 dark:text-green-400">{paid.length} đơn</span>
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  {formatVND(paid.reduce((s, o) => s + o.total_amount, 0))}
                </span>
              </div>
              <div className={`${COLS} py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide`}>
                <span>Bàn</span>
                <span>Mã đơn</span>
                <span>Tổng tiền</span>
                <span>Giờ tạo</span>
                <span>Giờ thanh toán</span>
                <span>Ghi chú</span>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {paid.map(order => (
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
