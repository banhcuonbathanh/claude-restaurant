'use client'
import { useState } from 'react'
import type { Order } from '@/types/order'
import type { Table } from '@/features/admin/admin.api'
import { isKitchenItem } from '@/features/admin/overview.helpers'

interface PrepPanelProps {
  orders:   Order[]
  tableMap: Map<string, Table>
  onAction: (orderId: string, status: string) => Promise<void>
}

type SortKey = 'remaining' | 'time'

function nextAction(status: string): { label: string; nextStatus: string; cls: string } | null {
  switch (status) {
    case 'pending':   return { label: 'Xác nhận',    nextStatus: 'confirmed', cls: 'bg-indigo-600 hover:bg-indigo-700 text-white' }
    case 'confirmed': return { label: 'Bắt đầu làm', nextStatus: 'preparing', cls: 'bg-yellow-500 hover:bg-yellow-600 text-white' }
    case 'preparing': return { label: 'Sẵn sàng',    nextStatus: 'ready',     cls: 'bg-green-500 hover:bg-green-600 text-white' }
    case 'ready':     return { label: 'Đã giao',      nextStatus: 'delivered', cls: 'bg-green-600 hover:bg-green-700 text-white' }
    default:          return null
  }
}

export function PrepPanel({ orders, tableMap, onAction }: PrepPanelProps) {
  const [sortKey,  setSortKey]  = useState<SortKey>('time')
  const [sortDir,  setSortDir]  = useState<'asc' | 'desc'>('asc')
  const [loading,  setLoading]  = useState(false)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  // Aggregate: dish name → { remaining, tables, minCreatedAt }
  const remainMap = new Map<string, { remaining: number; tables: string[]; minCreatedAt: number }>()
  for (const o of orders) {
    const fullName = o.table_id ? (tableMap.get(o.table_id)?.name ?? '—') : '—'
    const tName = fullName.split(' ').pop() ?? fullName
    const orderTime = new Date(o.created_at).getTime()
    for (const it of o.items.filter(isKitchenItem)) {
      const rem = it.quantity - it.qty_served
      if (rem <= 0) continue
      const row = remainMap.get(it.name) ?? { remaining: 0, tables: [], minCreatedAt: orderTime }
      row.remaining += rem
      if (!row.tables.includes(tName)) row.tables.push(tName)
      if (orderTime < row.minCreatedAt) row.minCreatedAt = orderTime
      remainMap.set(it.name, row)
    }
  }

  const rows = Array.from(remainMap.entries()).sort((a, b) => {
    let diff = 0
    if (sortKey === 'time')      diff = a[1].minCreatedAt - b[1].minCreatedAt
    if (sortKey === 'remaining') diff = b[1].remaining - a[1].remaining
    return sortDir === 'asc' ? diff : -diff
  })
  const totalRemaining = rows.reduce((s, [, r]) => s + r.remaining, 0)

  const actionableOrders = orders
    .map(o => ({ order: o, next: nextAction(o.status) }))
    .filter((x): x is { order: Order; next: NonNullable<ReturnType<typeof nextAction>> } => x.next !== null)

  const primaryNext = actionableOrders[0]?.next ?? null

  async function handleAdvanceAll() {
    setLoading(true)
    try {
      await Promise.all(actionableOrders.map(({ order, next }) => onAction(order.id, next.nextStatus)))
    } finally {
      setLoading(false)
    }
  }

  function SortBtn({ col, label }: { col: SortKey; label: string }) {
    const active = sortKey === col
    return (
      <button
        onClick={() => toggleSort(col)}
        className={`flex items-center gap-1 hover:text-gray-700 transition-colors cursor-pointer select-none ${active ? 'text-indigo-600' : ''}`}
      >
        {label}
        <span className={active ? 'text-indigo-400' : 'text-gray-300'}>
          {active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </button>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Danh sách cần chuẩn bị</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {rows.length} loại món · {totalRemaining} phần còn lại
          </p>
        </div>
        <div className="flex items-center gap-2">
          {primaryNext && (
            <button
              onClick={handleAdvanceAll}
              disabled={loading}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors ${primaryNext.cls}`}
            >
              {loading ? '...' : primaryNext.label}
            </button>
          )}
          {totalRemaining > 0 && (
            <span className="text-xs font-bold bg-indigo-600 text-white px-2.5 py-1 rounded-lg">
              {totalRemaining} phần
            </span>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-gray-400">
          Tất cả món đã ra hết.
        </div>
      ) : (
        <>
          {/* column headers */}
          <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <span>Tên món</span>
            <span>Bàn</span>
            <SortBtn col="time" label="Giờ đặt" />
            <div className="flex justify-end"><SortBtn col="remaining" label="Còn lại" /></div>
          </div>

          <div className="divide-y divide-gray-100">
            {rows.map(([name, row]) => {
              const t = new Date(row.minCreatedAt)
              const timeStr = t.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
              return (
              <div key={name} className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-2 px-4 py-3 items-center hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-800">{name}</span>
                <span className="text-xs text-gray-500 truncate">{row.tables.join(', ')}</span>
                <span className="text-xs text-gray-500">{timeStr}</span>
                <span className="text-right">
                  <span className="text-sm font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">
                    ×{row.remaining}
                  </span>
                </span>
              </div>
            )})}

          </div>
        </>
      )}
    </div>
  )
}
