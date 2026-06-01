'use client'
import { useState } from 'react'
import type { Order } from '@/types/order'
import type { Table } from '@/features/admin/admin.api'
import { elapsedMins, statusColors, statusLabel, urgencyBorder } from '@/features/admin/overview.helpers'
import { formatVND } from '@/lib/utils'

interface TableListProps {
  tables:          Table[]
  orders:          Order[]
  now:             number
  loadingIds:      Set<string>
  checkedTableIds: Set<string>
  onAction:        (orderId: string, status: string) => Promise<void>
  onToggleCheck:   (tableId: string) => void
}

export function TableList({
  tables, orders, now, loadingIds, onAction,
}: TableListProps) {
  const [timeSort, setTimeSort] = useState<'asc' | 'desc'>('asc')

  const orderByTable = new Map(orders.filter(o => o.table_id).map(o => [o.table_id!, o]))

  const sorted = [...tables].sort((a, b) => {
    const aOrder = orderByTable.get(a.id)
    const bOrder = orderByTable.get(b.id)
    const aOcc = aOrder ? 0 : 1
    const bOcc = bOrder ? 0 : 1
    if (aOcc !== bOcc) return aOcc - bOcc
    // Both occupied — sort by order created_at
    if (aOrder && bOrder) {
      const diff = new Date(aOrder.created_at).getTime() - new Date(bOrder.created_at).getTime()
      return timeSort === 'asc' ? diff : -diff
    }
    return a.name.localeCompare(b.name, 'vi')
  })

  if (sorted.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* header row */}
      <div className="grid grid-cols-[2fr_2fr_1fr_1.5fr_1fr] gap-3 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
        <span>Bàn</span>
        <span>Trạng thái</span>
        <button
          onClick={() => setTimeSort(s => s === 'asc' ? 'desc' : 'asc')}
          className="flex items-center gap-1 hover:text-gray-700 transition-colors cursor-pointer select-none"
        >
          Thời gian
          <span className="text-gray-400">{timeSort === 'asc' ? '↑' : '↓'}</span>
        </button>
        <span>Tổng tiền</span>
        <span className="text-right">Thao tác</span>
      </div>

      <div className="divide-y divide-gray-100">
        {sorted.map(table => {
          const order   = orderByTable.get(table.id)
          const loading = order ? loadingIds.has(order.id) : false

          if (!order) {
            return (
              <div key={table.id}
                className="grid grid-cols-[2fr_2fr_1fr_1.5fr_1fr] gap-3 px-4 py-3 items-center text-sm"
              >
                <span className="font-semibold text-gray-800">{table.name}
                  <span className="ml-2 text-xs font-normal text-gray-400">{table.capacity} chỗ</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                  <span className="text-gray-400 text-xs">Trống</span>
                </span>
                <span className="text-gray-300">—</span>
                <span className="text-gray-300">—</span>
                <span />
              </div>
            )
          }

          const mins      = elapsedMins(order.created_at, now)
          const timeColor = mins > 20 ? 'text-red-600 font-semibold' : mins >= 10 ? 'text-yellow-600' : 'text-orange-500'
          const borderL   = mins > 20 ? 'border-l-4 border-l-red-400' : mins >= 10 ? 'border-l-4 border-l-yellow-400' : 'border-l-4 border-l-orange-400'
          const canDeliver = order.status === 'ready'
          const canConfirm = order.status === 'pending'

          return (
            <div key={table.id}
              className={`grid grid-cols-[2fr_2fr_1fr_1.5fr_1fr] gap-3 px-4 py-3 items-center text-sm hover:bg-gray-50 transition-colors ${borderL}`}
            >
              {/* table name */}
              <span className="font-semibold text-gray-900">{table.name}
                <span className="ml-2 text-xs font-normal text-gray-400">{table.capacity} chỗ</span>
              </span>

              {/* status badge */}
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full w-fit whitespace-nowrap ${statusColors(order.status)}`}>
                {statusLabel(order.status)}
              </span>

              {/* elapsed */}
              <span className={`text-sm whitespace-nowrap ${timeColor}`}>
                {mins} phút
              </span>

              {/* total */}
              <span className="text-gray-800 font-medium whitespace-nowrap">{formatVND(order.total_amount)}</span>

              {/* action */}
              <div className="flex justify-end gap-1">
                {canConfirm && (
                  <button
                    onClick={() => onAction(order.id, 'confirmed')}
                    disabled={loading}
                    className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? '...' : 'Xác nhận'}
                  </button>
                )}
                {canDeliver && (
                  <button
                    onClick={() => onAction(order.id, 'delivered')}
                    disabled={loading}
                    className="px-2.5 py-1 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? '...' : 'Phục vụ'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
