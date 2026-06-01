'use client'
import type { Order } from '@/types/order'
import type { Table } from '@/features/admin/admin.api'
import { isKitchenItem } from '@/features/admin/overview.helpers'

interface PrepPanelProps {
  orders:   Order[]
  tableMap: Map<string, Table>
}

export function PrepPanel({ orders, tableMap }: PrepPanelProps) {
  // Aggregate: dish name → { remaining, tables }
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

  const rows          = Array.from(remainMap.entries()).sort((a, b) => b[1].remaining - a[1].remaining)
  const totalRemaining = rows.reduce((s, [, r]) => s + r.remaining, 0)

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
        {totalRemaining > 0 && (
          <span className="text-xs font-bold bg-indigo-600 text-white px-2.5 py-1 rounded-lg">
            {totalRemaining} phần
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-gray-400">
          Tất cả món đã ra hết.
        </div>
      ) : (
        <>
          {/* column headers */}
          <div className="grid grid-cols-[2fr_2fr_1fr] gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <span>Tên món</span>
            <span>Bàn</span>
            <span className="text-right">Còn lại</span>
          </div>

          <div className="divide-y divide-gray-100">
            {rows.map(([name, row]) => (
              <div key={name} className="grid grid-cols-[2fr_2fr_1fr] gap-2 px-4 py-3 items-center hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-800">{name}</span>
                <span className="text-xs text-gray-500 truncate">{row.tables.join(', ')}</span>
                <span className="text-right">
                  <span className="text-sm font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">
                    ×{row.remaining}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
