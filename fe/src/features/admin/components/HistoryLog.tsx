'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listTodayHistory } from '@/features/admin/admin.api'
import { statusLabel } from '@/features/admin/overview.helpers'
import { formatVND } from '@/lib/utils'
import type { Order } from '@/types/order'

function fmtTime(iso: string) {
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')} ${fmtTime(iso)}`
}

const COLS = 'grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_2fr] gap-2 px-4'

function OrderTable({ orders }: { orders: Order[] }) {
  return (
    <div>
      <div className={`${COLS} py-2 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide`}>
        <span>Bàn</span>
        <span>Mã đơn</span>
        <span>Tổng tiền</span>
        <span>Giờ tạo</span>
        <span>Giờ kết thúc</span>
        <span>Ghi chú</span>
      </div>
      <div className="divide-y divide-gray-50">
        {orders.map(order => (
          <div key={order.id} className={`${COLS} py-2.5 items-center text-sm hover:bg-gray-50 transition-colors`}>
            <span className="font-medium text-gray-800 truncate">
              {order.table_name ?? order.table_id ?? '—'}
            </span>
            <span className="text-xs font-mono text-gray-400 truncate">{order.order_number}</span>
            <span className="text-gray-700 font-medium whitespace-nowrap">{formatVND(order.total_amount)}</span>
            <span className="text-xs text-gray-400 whitespace-nowrap">{fmtTime(order.created_at)}</span>
            <span className="text-xs text-gray-500 whitespace-nowrap">{order.updated_at ? fmtDate(order.updated_at) : '—'}</span>
            <span className="text-xs text-gray-400 truncate">{order.note ?? '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function HistoryLog() {
  const [open, setOpen] = useState(false)

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders', 'history'],
    queryFn:  listTodayHistory,
    enabled:  open,
    staleTime: 30_000,
  })

  const cancelled = orders.filter(o => o.status === 'cancelled')
  const paid      = orders.filter(o => o.status === 'paid')

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* toggle header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">Lịch sử hôm nay</span>
          {!open && orders.length > 0 && (
            <div className="flex gap-2 text-xs">
              {paid.length > 0 && (
                <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  {paid.length} đã thu
                </span>
              )}
              {cancelled.length > 0 && (
                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
                  {cancelled.length} huỷ
                </span>
              )}
            </div>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {isLoading ? (
            <p className="py-4 text-center text-sm text-gray-400">Đang tải...</p>
          ) : orders.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">Chưa có đơn hoàn thành hoặc bị huỷ hôm nay</p>
          ) : (
            <>
              {/* Paid card */}
              <div className="rounded-xl border border-green-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-green-50 border-b border-green-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-green-800">Đã thanh toán</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      {paid.length} đơn
                    </span>
                  </div>
                  {paid.length > 0 && (
                    <span className="text-sm font-semibold text-green-700">
                      {formatVND(paid.reduce((s, o) => s + o.total_amount, 0))}
                    </span>
                  )}
                </div>
                {paid.length === 0 ? (
                  <p className="px-4 py-4 text-center text-xs text-gray-400">Chưa có đơn thanh toán</p>
                ) : (
                  <OrderTable orders={paid} />
                )}
              </div>

              {/* Cancelled card */}
              <div className="rounded-xl border border-red-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-red-50 border-b border-red-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-red-800">Đã huỷ</span>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                      {cancelled.length} đơn
                    </span>
                  </div>
                  {cancelled.length > 0 && (
                    <span className="text-sm font-semibold text-red-600">
                      {formatVND(cancelled.reduce((s, o) => s + o.total_amount, 0))}
                    </span>
                  )}
                </div>
                {cancelled.length === 0 ? (
                  <p className="px-4 py-4 text-center text-xs text-gray-400">Chưa có đơn bị huỷ</p>
                ) : (
                  <OrderTable orders={cancelled} />
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
