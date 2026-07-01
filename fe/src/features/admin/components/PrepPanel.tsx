'use client'
import { useState } from 'react'
import type { Order } from '@/types/order'
import type { Table } from '@/features/admin/admin.api'
import { isKitchenItem, toppingLabel } from '@/features/admin/overview.helpers'

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

  // Aggregate: dish name → { remaining, tables, minCreatedAt, orders, noteCounts, toppingCounts }
  // toppingCounts = topping/veg breakdown via toppingLabel():
  //   Bánh/Trứng/Giò → nhân names from toppings_snapshot / "không nhân"
  //   Canh           → "có rau" / "không rau"
  const remainMap = new Map<string, {
    remaining: number
    tables: string[]
    minCreatedAt: number
    orders: { orderId: string; tableLabel: string; time: string; qty: number; topping: string }[]
    noteCounts: Map<string, number>
    toppingCounts: Map<string, number>
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
        orders: [] as { orderId: string; tableLabel: string; time: string; qty: number; topping: string }[],
        noteCounts: new Map<string, number>(),
        toppingCounts: new Map<string, number>(),
      }
      const topping = toppingLabel(it)
      row.remaining += rem
      if (!row.tables.includes(tName)) row.tables.push(tName)
      if (orderTime < row.minCreatedAt) row.minCreatedAt = orderTime
      row.orders.push({ orderId: o.id, tableLabel: tName, time: timeStr, qty: rem, topping })
      row.toppingCounts.set(topping, (row.toppingCounts.get(topping) ?? 0) + rem)
      // Canh's note already encodes có/không rau — shown as the topping, so skip it here to avoid a duplicate line
      const note = it.note?.trim()
      if (note && !it.name.toLowerCase().includes('canh')) row.noteCounts.set(note, (row.noteCounts.get(note) ?? 0) + rem)
      remainMap.set(it.name, row)
    }
  }

  const allRows = Array.from(remainMap.entries()).sort((a, b) => {
    let diff = 0
    if (sortKey === 'time')      diff = a[1].minCreatedAt - b[1].minCreatedAt
    if (sortKey === 'remaining') diff = b[1].remaining - a[1].remaining
    return sortDir === 'asc' ? diff : -diff
  })

  // Canh + Giò are pulled out into the per-table matrix at the bottom.
  const isCanh = (name: string) => name.toLowerCase().includes('canh')
  const isGio  = (name: string) => { const n = name.toLowerCase(); return n.includes('giò') || n.includes('gio') }
  const mainRows = allRows.filter(([name]) => !isCanh(name) && !isGio(name))
  const canhRows = allRows.filter(([name]) => isCanh(name))
  const gioRows  = allRows.filter(([name]) => isGio(name))
  const rows = [...mainRows, ...canhRows, ...gioRows]
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
    <div className="bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-900 overflow-hidden">
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
            <span>Nhân / Rau</span>
            <div className="flex justify-end"><SortBtn col="remaining" label="Còn lại" /></div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {mainRows.map(([name, row]) => (
              <div key={name}>
                <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-2 px-4 py-3 items-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                  <span className="text-sm font-medium flex items-center gap-1.5 text-gray-800 dark:text-gray-100">
                    {name}
                  </span>
                  <span className="text-xs truncate text-gray-500 dark:text-gray-400">{row.tables.join(', ')}</span>
                  <span className="text-xs flex flex-wrap gap-x-2 gap-y-0.5 text-gray-700 dark:text-gray-300">
                    {Array.from(row.toppingCounts.entries()).map(([topping, count]) => (
                      <span key={topping} className="font-semibold whitespace-nowrap">
                        {topping} <span className="text-primary font-bold">×{count}</span>
                      </span>
                    ))}
                  </span>
                  <span className="text-right">
                    <span className="text-sm font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                      ×{row.remaining}
                    </span>
                  </span>
                </div>

                {/* Note summary (free-text notes) */}
                {row.noteCounts.size > 0 && (
                  <div className="px-4 pb-2 flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-800/50">
                    {Array.from(row.noteCounts.entries()).map(([note, count]) => (
                      <span key={note} className="text-xs font-semibold text-foreground">
                        {note} <span className="text-primary font-bold">×{count}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Canh + Giò matrix — tables as rows, each canh variant + one Giò column, with row + column totals */}
          {(canhRows.length > 0 || gioRows.length > 0) && (() => {
            const GIO = '__gio__'
            // Columns: each canh variant (own column) + a single combined Giò column.
            const columns: { key: string; label: string }[] = [
              ...canhRows.map(([name]) => ({ key: name, label: name })),
              ...(gioRows.length > 0 ? [{ key: GIO, label: 'Giò' }] : []),
            ]
            // table label → column key → remaining qty
            const matrix = new Map<string, Map<string, number>>()
            const add = (tableLabel: string, colKey: string, qty: number) => {
              const t = matrix.get(tableLabel) ?? new Map<string, number>()
              t.set(colKey, (t.get(colKey) ?? 0) + qty)
              matrix.set(tableLabel, t)
            }
            for (const [dishName, row] of canhRows)
              for (const od of row.orders) add(od.tableLabel, dishName, od.qty)
            for (const [, row] of gioRows)
              for (const od of row.orders) add(od.tableLabel, GIO, od.qty)

            const tables = Array.from(matrix.keys()).sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }))
            // Tổng counts canh only — the Giò column is excluded from the row/grand totals.
            const rowTotal = (t: string) => canhRows.reduce((s, [name]) => s + (matrix.get(t)?.get(name) ?? 0), 0)
            const colTotal = (key: string) => tables.reduce((s, t) => s + (matrix.get(t)?.get(key) ?? 0), 0)
            const grandTotal = tables.reduce((s, t) => s + rowTotal(t), 0)
            return (
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <span className="text-xs">♨</span> Canh &amp; Giò
                </p>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left font-medium py-1.5 px-2">Bàn</th>
                      {columns.map(c => (
                        <th key={c.key} className="text-center font-medium py-1.5 px-2">{c.label}</th>
                      ))}
                      <th className="text-center font-semibold py-1.5 px-2">Tổng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {tables.map(t => (
                      <tr key={t} className="text-gray-700 dark:text-gray-300">
                        <td className="py-1.5 px-2 font-semibold">{t}</td>
                        {columns.map(c => {
                          const q = matrix.get(t)?.get(c.key) ?? 0
                          return <td key={c.key} className="text-center py-1.5 px-2">{q > 0 ? q : '–'}</td>
                        })}
                        <td className="text-center py-1.5 px-2 font-bold text-primary">{rowTotal(t)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 dark:border-gray-700 font-bold text-gray-800 dark:text-gray-100">
                      <td className="py-1.5 px-2 uppercase tracking-wide">Tổng</td>
                      {columns.map(c => (
                        <td key={c.key} className="text-center py-1.5 px-2">{colTotal(c.key)}</td>
                      ))}
                      <td className="text-center py-1.5 px-2 text-primary">{grandTotal}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )
          })()}
        </>
      )}
    </div>
  )
}
