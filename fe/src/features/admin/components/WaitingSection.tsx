'use client'
import { useState } from 'react'
import type { Order } from '@/types/order'
import type { Table } from '@/features/admin/admin.api'
import { elapsedMins, isKitchenItem, statusColors, statusLabel } from '@/features/admin/overview.helpers'

interface WaitingCardProps {
  table:          Table
  order:          Order
  now:            number
  loading:        boolean
  isChecked:      boolean
  onAction:       (orderId: string, status: string) => Promise<void>
  onToggleCheck:  (tableId: string) => void
}

function WaitingCard({ table, order, now, loading, isChecked, onAction, onToggleCheck }: WaitingCardProps) {
  const [collapsed, setCollapsed] = useState(false)
  const mins     = elapsedMins(order.created_at, now)
  const kitItems = order.items.filter(isKitchenItem)
  const remaining = kitItems.reduce((s, i) => s + Math.max(0, i.quantity - i.qty_served), 0)
  const barColor  = mins > 20 ? 'bg-red-400' : mins >= 10 ? 'bg-yellow-400' : 'bg-indigo-400'
  const timeColor = mins > 20 ? 'text-red-600' : mins >= 10 ? 'text-yellow-600' : 'text-amber-600'

  return (
    <div>
      <button
        type="button"
        onClick={() => setCollapsed(v => !v)}
        className="w-full px-4 py-3 flex items-center gap-2 text-left hover:bg-indigo-100/50 transition-colors"
      >
        <span className={`w-1 h-5 rounded-full shrink-0 ${barColor}`} />
        <span className="font-bold text-gray-900 text-sm">{table.name}</span>
        <span className="text-xs text-gray-400">{order.order_number}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors(order.status)}`}>
          {statusLabel(order.status)}
        </span>
        <span className={`ml-auto text-xs font-semibold ${timeColor}`}>{mins} phút</span>
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${collapsed ? '' : 'rotate-90'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {!collapsed && (
        <div className="px-4 pb-3 space-y-2">
          <div className="pl-3 space-y-1">
            {kitItems.map(it => {
              const rem  = it.quantity - it.qty_served
              const done = rem <= 0
              return (
                <div key={it.id} className="flex items-center gap-2 py-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${done ? 'bg-green-400' : 'bg-gray-300'}`} />
                  <span className={`flex-1 text-sm ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{it.name}</span>
                  {done
                    ? <span className="text-xs text-green-600 font-medium">✓</span>
                    : <span className="text-xs bg-white text-gray-700 px-2 py-0.5 rounded font-medium border border-gray-200">còn ×{rem}</span>
                  }
                </div>
              )
            })}
            <p className="text-xs text-gray-400 pt-0.5">{kitItems.length} món · {remaining} phần còn lại</p>
          </div>

          {/* Kiểm tra toggle */}
          <button
            onClick={() => onToggleCheck(table.id)}
            className={`w-full py-1.5 text-xs rounded-lg font-medium transition-colors ${
              isChecked
                ? 'bg-indigo-500 text-white'
                : 'bg-indigo-50 text-indigo-700'
            }`}
          >
            {isChecked ? '✓ Đang xem' : '🔍 Kiểm tra'}
          </button>

          {/* 3 action buttons */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              disabled={loading}
              onClick={() => onAction(order.id, 'confirmed')}
              className="py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              ✓ Phục vụ
            </button>
            <button
              disabled={loading}
              onClick={() => onAction(order.id, 'confirmed')}
              className="py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              🥡 Mang đi
            </button>
            <button
              disabled={loading}
              onClick={() => onAction(order.id, 'cancelled')}
              className="py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              Huỷ
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface WaitingSectionProps {
  orders:          Order[]
  tables:          Table[]
  now:             number
  loadingIds:      Set<string>
  checkedTableIds: Set<string>
  onAction:        (orderId: string, status: string) => Promise<void>
  onToggleCheck:   (tableId: string) => void
}

export function WaitingSection({
  orders, tables, now, loadingIds, checkedTableIds, onAction, onToggleCheck,
}: WaitingSectionProps) {
  const tableMap = new Map(tables.map(t => [t.id, t]))

  const waiting = orders
    .filter(o => o.status === 'pending' && o.table_id && tableMap.has(o.table_id))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(o => ({ table: tableMap.get(o.table_id!)!, order: o }))

  if (waiting.length === 0) return null

  const allKitItems = waiting.flatMap(({ order }) => order.items.filter(isKitchenItem))
  const dishTypes   = new Set(allKitItems.map(i => i.name)).size
  const totalRemain = allKitItems.reduce((s, i) => s + Math.max(0, i.quantity - i.qty_served), 0)

  return (
    <div className="rounded-xl bg-indigo-50 border border-indigo-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-indigo-100">
        <p className="text-sm font-bold text-indigo-800">
          {waiting.length} bàn chờ xác nhận
        </p>
        <p className="text-xs text-indigo-500 mt-0.5">
          {dishTypes} loại món · {totalRemain} phần còn lại
        </p>
      </div>

      <div className="divide-y divide-indigo-100">
        {waiting.map(({ table, order }) => (
          <WaitingCard
            key={table.id}
            table={table}
            order={order}
            now={now}
            loading={loadingIds.has(order.id)}
            isChecked={checkedTableIds.has(table.id)}
            onAction={onAction}
            onToggleCheck={onToggleCheck}
          />
        ))}
      </div>
    </div>
  )
}
