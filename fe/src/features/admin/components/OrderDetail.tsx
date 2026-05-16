'use client'
import { useState } from 'react'
import type { Order } from '@/types/order'
import type { Table } from '@/features/admin/admin.api'
import { elapsedMins, isKitchenItem, itemCounts, statusColors, statusLabel } from '@/features/admin/overview.helpers'
import { formatVND } from '@/lib/utils'

interface OrderDetailProps {
  order:          Order
  table:          Table
  now:            number
  loading:        boolean
  isChecked:      boolean
  onAction:       (orderId: string, status: string) => Promise<void>
  onToggleCheck:  (tableId: string) => void
}

export function OrderDetail({
  order, table, now, loading, isChecked, onAction, onToggleCheck,
}: OrderDetailProps) {
  const [actionsOpen, setActionsOpen] = useState(false)

  const mins     = elapsedMins(order.created_at, now)
  const kitItems = order.items.filter(isKitchenItem)
  const counts   = itemCounts(order.items)
  const pct      = counts.totalQty > 0 ? Math.round(counts.servedQty / counts.totalQty * 100) : 0

  const canDeliver = order.status === 'ready'
  const canCancel  = ['confirmed', 'preparing', 'ready'].includes(order.status)
  const timeColor  = mins > 20 ? 'text-red-600' : mins >= 10 ? 'text-yellow-600' : 'text-orange-600'

  function nextStatus() {
    switch (order.status) {
      case 'pending':   return { label: '✓ Xác nhận',       status: 'confirmed', cls: 'bg-blue-500 hover:bg-blue-600 text-white' }
      case 'confirmed': return { label: '🍳 Bắt đầu làm',  status: 'preparing', cls: 'bg-yellow-500 hover:bg-yellow-600 text-white' }
      case 'preparing': return { label: '✓ Hoàn thành bếp', status: 'ready',    cls: 'bg-green-500 hover:bg-green-600 text-white' }
      case 'ready':     return { label: '🛎 Đã phục vụ',    status: 'delivered', cls: 'bg-green-600 hover:bg-green-700 text-white' }
      default:          return null
    }
  }

  const next = nextStatus()

  return (
    <div className="px-4 pb-3 space-y-3">
      {/* Order header */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <span className="text-xs font-mono text-gray-500">{order.order_number}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors(order.status)}`}>
          {statusLabel(order.status)}
        </span>
        <span className={`ml-auto text-sm font-bold ${timeColor}`}>{mins} phút</span>
        <span className="text-sm font-semibold text-gray-700">{formatVND(order.total_amount)}</span>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-400 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{counts.servedQty}/{counts.totalQty} phần đã ra</span>
          <span>{pct}%</span>
        </div>
      </div>

      {/* 3 mini counters */}
      <div className="grid grid-cols-3 gap-1.5 text-center">
        <div className="bg-gray-50 rounded-lg py-1.5">
          <p className="text-xs text-gray-400">Chờ</p>
          <p className="text-sm font-bold text-gray-700">{counts.pending}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg py-1.5">
          <p className="text-xs text-yellow-500">Đang làm</p>
          <p className="text-sm font-bold text-yellow-700">{counts.preparing}</p>
        </div>
        <div className="bg-green-50 rounded-lg py-1.5">
          <p className="text-xs text-green-500">Đã ra</p>
          <p className="text-sm font-bold text-green-700">{counts.done}</p>
        </div>
      </div>

      {/* Item list with status dots */}
      <div className="space-y-1.5">
        {kitItems.map(it => {
          const rem    = it.quantity - it.qty_served
          const done   = rem <= 0
          const inProg = it.qty_served > 0 && !done
          return (
            <div key={it.id} className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                done ? 'bg-green-400' : inProg ? 'bg-yellow-400' : 'bg-gray-300'
              }`} />
              <span className={`flex-1 text-sm ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {it.name}
              </span>
              <span className="text-xs text-gray-400 shrink-0">{it.qty_served}/{it.quantity}</span>
            </div>
          )
        })}
      </div>

      {/* Kiểm tra toggle */}
      <button
        onClick={() => onToggleCheck(table.id)}
        className={`w-full py-1.5 text-xs rounded-lg font-medium transition-colors ${
          isChecked ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700'
        }`}
      >
        {isChecked ? '✓ Đang xem' : '🔍 Kiểm tra'}
      </button>

      {/* Action buttons */}
      {actionsOpen && (
        <div className="flex gap-1.5">
          {next && (
            <button
              disabled={loading}
              onClick={() => {
                onAction(order.id, next.status)
                setActionsOpen(false)
              }}
              className={`flex-1 py-1.5 text-xs rounded-lg font-medium disabled:opacity-50 transition-colors ${next.cls}`}
            >
              {next.label}
            </button>
          )}
          {canCancel && (
            <button
              disabled={loading}
              onClick={() => onAction(order.id, 'cancelled')}
              className="flex-1 py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              Huỷ
            </button>
          )}
        </div>
      )}

      {/* Hoàn thành shortcut when ready */}
      {canDeliver && !actionsOpen && (
        <button
          disabled={loading}
          onClick={() => onAction(order.id, 'delivered')}
          className="w-full py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
        >
          Hoàn thành
        </button>
      )}

      <button
        onClick={() => setActionsOpen(v => !v)}
        className={`w-full py-1.5 text-xs rounded-lg font-medium transition-colors ${
          actionsOpen ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
        }`}
      >
        Trạng thái {actionsOpen ? '▲' : '▼'}
      </button>
    </div>
  )
}
