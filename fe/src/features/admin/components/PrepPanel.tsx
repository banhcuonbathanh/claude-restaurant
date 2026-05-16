'use client'
import { useState } from 'react'
import type { Order } from '@/types/order'
import type { Table } from '@/features/admin/admin.api'
import { isKitchenItem, statusColors, statusLabel } from '@/features/admin/overview.helpers'

interface PrepPanelProps {
  orders:   Order[]
  tableMap: Map<string, Table>
}

export function PrepPanel({ orders, tableMap }: PrepPanelProps) {
  const [collapsed,      setCollapsed]      = useState<Set<string>>(new Set())
  const [summaryVisible, setSummaryVisible] = useState(true)

  function toggleCollapse(orderId: string) {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(orderId) ? next.delete(orderId) : next.add(orderId)
      return next
    })
  }

  const remainMap = new Map<string, { remaining: number; tables: string[] }>()
  for (const o of orders) {
    const tName = o.table_id ? (tableMap.get(o.table_id)?.name ?? '—') : '—'
    for (const it of o.items.filter(isKitchenItem)) {
      const rem = it.quantity - it.qty_served
      if (rem <= 0) continue
      const row = remainMap.get(it.name) ?? { remaining: 0, tables: [] }
      row.remaining += rem
      if (!row.tables.includes(tName)) row.tables.push(tName)
      remainMap.set(it.name, row)
    }
  }
  const summaryRows    = Array.from(remainMap.entries()).sort((a, b) => b[1].remaining - a[1].remaining)
  const totalRemaining = summaryRows.reduce((s, [, r]) => s + r.remaining, 0)

  return (
    <div className="bg-white border-2 border-indigo-300 rounded-xl overflow-hidden">
      <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-200">
        <p className="text-sm font-bold text-indigo-800">Danh sách cần chuẩn bị</p>
        <p className="text-xs text-indigo-600 mt-0.5">
          {orders.length} bàn · {summaryRows.length} loại món · {totalRemaining} phần còn lại
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {orders.map(order => {
          const tableName   = order.table_id ? (tableMap.get(order.table_id)?.name ?? '—') : '—'
          const kitItems    = order.items.filter(isKitchenItem)
          const isCollapsed = collapsed.has(order.id)

          return (
            <div key={order.id} className="px-4 py-3">
              <button
                type="button"
                onClick={() => toggleCollapse(order.id)}
                className="w-full flex items-center justify-between gap-2 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1 h-4 bg-indigo-400 rounded-full shrink-0" />
                  <span className="text-sm font-bold text-gray-900">{tableName}</span>
                  <span className="text-xs text-gray-400">{order.order_number}</span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${statusColors(order.status)}`}>
                    {statusLabel(order.status)}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {!isCollapsed && (
                <div className="space-y-1.5 pl-3 mt-2">
                  {kitItems.map(it => {
                    const rem    = it.quantity - it.qty_served
                    const itDone = rem <= 0
                    const itPrep = it.qty_served > 0 && !itDone
                    return (
                      <div key={it.id} className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          itDone ? 'bg-green-400' : itPrep ? 'bg-yellow-400' : 'bg-gray-300'
                        }`} />
                        <span className={`text-sm flex-1 ${itDone ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {it.name}
                        </span>
                        {it.note && (
                          <span className="text-xs italic text-orange-500 truncate max-w-[80px]">{it.note}</span>
                        )}
                        <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-md min-w-[52px] text-center ${
                          itDone
                            ? 'bg-green-50 text-green-600'
                            : itPrep
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {itDone ? '✓ xong' : `còn ×${rem}`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {summaryRows.length > 0 && (
        <div className="border-t-2 border-indigo-200 bg-indigo-50">
          <button
            type="button"
            onClick={() => setSummaryVisible(v => !v)}
            className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-indigo-100/60 transition-colors text-left"
          >
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Tổng cần làm</span>
            <span className="text-xs text-indigo-600">· {summaryRows.length} loại · {totalRemaining} phần còn lại</span>
            <svg
              className={`ml-auto w-4 h-4 text-indigo-400 shrink-0 transition-transform ${summaryVisible ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {summaryVisible && (
            <div className="px-4 pb-3 space-y-1.5">
              {summaryRows.map(([name, row]) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-800 flex-1">{name}</span>
                  <span className="text-xs text-gray-400 shrink-0">{row.tables.join(', ')}</span>
                  <span className="shrink-0 font-bold text-sm bg-indigo-500 text-white px-2.5 py-0.5 rounded-lg min-w-[36px] text-center">
                    ×{row.remaining}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {summaryRows.length === 0 && (
        <div className="px-4 py-4 text-center text-sm text-gray-400">
          Tất cả món đã ra hết.
        </div>
      )}
    </div>
  )
}
