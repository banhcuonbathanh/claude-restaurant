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

  // Soup/broth items are treated differently — sorted last and highlighted
  function isSoupItem(name: string) {
    return name.toLowerCase().includes('canh')
  }

  // Aggregate: dish name → { remaining, tables, minCreatedAt, orders, noteCounts }
  const remainMap = new Map<string, {
    remaining: number
    tables: string[]
    minCreatedAt: number
    orders: { tableLabel: string; time: string; qty: number }[]
    noteCounts: Map<string, number>
  }>()
  for (const o of orders) {
    const fullName = o.table_id ? (tableMap.get(o.table_id)?.name ?? '—') : '—'
    const tName = fullName.split(' ').pop() ?? fullName
    const orderTime = new Date(o.created_at).getTime()
    const timeStr = new Date(o.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    for (const it of o.items.filter(isKitchenItem)) {
      const rem = it.quantity - it.qty_served
      if (rem <= 0) continue
      const row = remainMap.get(it.name) ?? {
        remaining: 0, tables: [] as string[], minCreatedAt: orderTime,
        orders: [] as { tableLabel: string; time: string; qty: number }[],
        noteCounts: new Map<string, number>(),
      }
      row.remaining += rem
      if (!row.tables.includes(tName)) row.tables.push(tName)
      if (orderTime < row.minCreatedAt) row.minCreatedAt = orderTime
      row.orders.push({ tableLabel: tName, time: timeStr, qty: rem })
      const note = it.note?.trim()
      if (note) row.noteCounts.set(note, (row.noteCounts.get(note) ?? 0) + rem)
      remainMap.set(it.name, row)
    }
  }

  const allRows = Array.from(remainMap.entries()).sort((a, b) => {
    let diff = 0
    if (sortKey === 'time')      diff = a[1].minCreatedAt - b[1].minCreatedAt
    if (sortKey === 'remaining') diff = b[1].remaining - a[1].remaining
    return sortDir === 'asc' ? diff : -diff
  })

  // Soup items always go to the bottom
  const mainRows = allRows.filter(([name]) => !isSoupItem(name))
  const soupRows = allRows.filter(([name]) => isSoupItem(name))
  const rows = [...mainRows, ...soupRows]
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
        className={`flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer select-none ${active ? 'text-indigo-600 dark:text-indigo-400' : ''}`}
      >
        {label}
        <span className={active ? 'text-indigo-400 dark:text-indigo-300' : 'text-gray-300 dark:text-gray-600'}>
          {active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </button>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Danh sách món ăn cần chuẩn bị</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
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
        <div className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
          Tất cả món đã ra hết.
        </div>
      ) : (
        <>
          {/* column headers */}
          <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            <span>Tên món</span>
            <span>Bàn</span>
            <SortBtn col="time" label="Giờ đặt" />
            <div className="flex justify-end"><SortBtn col="remaining" label="Còn lại" /></div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map(([name, row]) => {
              const t = new Date(row.minCreatedAt)
              const timeStr = t.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
              const soup = isSoupItem(name)
              return (
                <div key={name}>
                  <div className={`grid grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-2 px-4 py-3 items-center transition-colors ${soup ? 'bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    <span className={`text-sm font-medium flex items-center gap-1.5 ${soup ? 'text-amber-800 dark:text-amber-300' : 'text-gray-800 dark:text-gray-100'}`}>
                      {soup && <span className="text-amber-500 text-xs">♨</span>}
                      {name}
                    </span>
                    <span className={`text-xs truncate ${soup ? 'text-amber-700 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`}>{row.tables.join(', ')}</span>
                    <span className={`text-xs ${soup ? 'text-amber-700 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`}>{timeStr}</span>
                    <span className="text-right">
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-md ${soup ? 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200' : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'}`}>
                        ×{row.remaining}
                      </span>
                    </span>
                  </div>

                  {/* Note summary (có rau / không rau etc.) */}
                  {row.noteCounts.size > 0 && (
                    <div className={`px-4 pb-2 flex flex-wrap gap-2 ${soup ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                      {Array.from(row.noteCounts.entries()).map(([note, count]) => (
                        <span key={note} className="text-xs font-semibold text-foreground">
                          {note} <span className="text-primary font-bold">×{count}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Per-order detail for soup items */}
                  {soup && row.orders.length > 0 && (
                    <div className="px-4 pb-3 bg-amber-50 dark:bg-amber-950/30 border-t border-amber-100 dark:border-amber-800/40">
                      <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-500 uppercase tracking-wide mb-1.5">Chi tiết theo đơn</p>
                      <div className="flex flex-wrap gap-1.5">
                        {row.orders.map((od, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-700">
                            <span className="font-semibold">Bàn {od.tableLabel}</span>
                            <span className="text-amber-500">·</span>
                            <span>{od.time}</span>
                            <span className="text-amber-500">·</span>
                            <span className="font-bold">×{od.qty}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
