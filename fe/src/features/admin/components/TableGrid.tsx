'use client'
import { useState } from 'react'
import type { Order } from '@/types/order'
import type { Table } from '@/features/admin/admin.api'
import { urgencyBorder } from '@/features/admin/overview.helpers'
import { OrderDetail } from './OrderDetail'

function EmptyTableCard({ table }: { table: Table }) {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 px-4 py-3 flex items-center justify-between">
      <div>
        <p className="font-semibold text-gray-700 text-sm">{table.name}</p>
        <p className="text-xs text-gray-400">{table.capacity} chỗ</p>
      </div>
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Trống</span>
    </div>
  )
}

interface TableCardProps {
  table:          Table
  order?:         Order
  now:            number
  loading:        boolean
  isChecked:      boolean
  onAction:       (orderId: string, status: string) => Promise<void>
  onToggleCheck:  (tableId: string) => void
}

function TableCard({ table, order, now, loading, isChecked, onAction, onToggleCheck }: TableCardProps) {
  const [expanded, setExpanded] = useState(true)

  if (!order) return <EmptyTableCard table={table} />

  const border = urgencyBorder(order.created_at, now)

  return (
    <div className={`bg-white rounded-xl border-2 overflow-hidden ${border}`}>
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full px-4 py-3 flex items-center gap-2 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-bold text-gray-900 text-sm">{table.name}</span>
        <span className="text-xs text-gray-400">{table.capacity} chỗ</span>
        <svg
          className={`ml-auto w-4 h-4 text-gray-400 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <OrderDetail
          order={order}
          table={table}
          now={now}
          loading={loading}
          isChecked={isChecked}
          onAction={onAction}
          onToggleCheck={onToggleCheck}
        />
      )}
    </div>
  )
}

interface TableGridProps {
  tables:          Table[]
  orders:          Order[]
  now:             number
  loadingIds:      Set<string>
  checkedTableIds: Set<string>
  onAction:        (orderId: string, status: string) => Promise<void>
  onToggleCheck:   (tableId: string) => void
}

export function TableGrid({
  tables, orders, now, loadingIds, checkedTableIds, onAction, onToggleCheck,
}: TableGridProps) {
  const orderByTable = new Map(orders.filter(o => o.table_id).map(o => [o.table_id!, o]))

  const sorted = [...tables].sort((a, b) => {
    const aOcc = orderByTable.has(a.id) ? 0 : 1
    const bOcc = orderByTable.has(b.id) ? 0 : 1
    if (aOcc !== bOcc) return aOcc - bOcc
    return a.name.localeCompare(b.name, 'vi')
  })

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-300">
        <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 10h18M3 14h18M10 3v18M14 3v18" />
        </svg>
        <p className="text-sm font-medium text-gray-400">Chưa có đơn</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {sorted.map(table => {
        const order = orderByTable.get(table.id)
        return (
          <TableCard
            key={table.id}
            table={table}
            order={order}
            now={now}
            loading={order ? loadingIds.has(order.id) : false}
            isChecked={checkedTableIds.has(table.id)}
            onAction={onAction}
            onToggleCheck={onToggleCheck}
          />
        )
      })}
    </div>
  )
}
