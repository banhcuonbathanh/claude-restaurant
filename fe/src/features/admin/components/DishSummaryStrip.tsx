'use client'
import { useState } from 'react'
import type { Order } from '@/types/order'
import type { Table } from '@/features/admin/admin.api'
import { summarizeTableDishes } from '@/features/admin/overview.helpers'

// Zone D2 — "Tổng món": total Bánh / Trứng / Giò / Canh across all tables, with nhân/rau split.
// 🔍 Kiểm tra tables are split off into the delta (deltaTotal / breakdown.delta / detail.isDelta).
// Owns its own expand state (openDish / showAll); computes the summary from the same table-scoped
// orders TableList renders — an order with no table_id / a stale table_id must not keep this alive.
interface Props {
  tables:           Table[]
  listOrders:       Order[]
  kiemTraTableIds?: Set<string>   // tables marked 🔍 Kiểm tra — shown as a +N delta
  onClearKiemTra?:  () => void     // clears all Kiểm tra selections
}

export function DishSummaryStrip({ tables, listOrders, kiemTraTableIds, onClearKiemTra }: Props) {
  const [openDish,  setOpenDish]  = useState<string | null>(null)
  const [showAll,   setShowAll]   = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const tableIds     = new Set(tables.map(t => t.id))
  const tableScoped  = listOrders.filter(o => o.table_id != null && tableIds.has(o.table_id))
  const dishSummary  = summarizeTableDishes(tableScoped, tables, kiemTraTableIds)
  const dishTotal    = dishSummary.reduce((s, r) => s + r.total, 0)
  const dishDelta    = dishSummary.reduce((s, r) => s + r.deltaTotal, 0)
  const kiemTraCount = kiemTraTableIds?.size ?? 0

  if (dishTotal <= 0 && dishDelta <= 0) return null

  // Per-table detail block for one dish — reused by single-dish expand and "Xem tất cả".
  function renderDishDetail(row: typeof dishSummary[number]) {
    return (
      <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 border-b border-indigo-100 dark:border-indigo-800">
          Chi tiết {row.label} theo bàn
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
              <th className="px-3 py-1.5 text-left font-medium">Bàn</th>
              <th className="px-2 py-1.5 text-left font-medium">Nhân / Rau</th>
              <th className="px-2 py-1.5 text-right font-medium">Đặt</th>
              <th className="px-2 py-1.5 text-right font-medium text-green-600 dark:text-green-400">Đã ra</th>
              <th className="px-3 py-1.5 text-right font-medium text-orange-600 dark:text-orange-400">Còn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {row.details.map((d, i) => (
              // Delta rows (🔍 Kiểm tra tables) light up in indigo with a +N marker — kept separate from the base.
              <tr key={i} className={d.isDelta ? 'bg-indigo-50/70 dark:bg-indigo-900/20 border-l-2 border-l-indigo-500' : ''}>
                <td className="px-3 py-1.5 font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">
                  {d.tableLabel}
                  {d.isDelta && <span className="ml-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-300">🔍</span>}
                </td>
                <td className="px-2 py-1.5 text-gray-500 dark:text-gray-400">
                  {d.topping}
                  {d.note && <span className="text-amber-600 dark:text-amber-400 italic ml-1">({d.note})</span>}
                </td>
                <td className={`px-2 py-1.5 text-right font-bold tabular-nums ${d.isDelta ? 'text-indigo-600 dark:text-indigo-300' : 'text-indigo-600 dark:text-indigo-400'}`}>{d.isDelta ? `+${d.qty}` : d.qty}</td>
                <td className="px-2 py-1.5 text-right font-semibold text-green-600 dark:text-green-400 tabular-nums">{d.served}</td>
                <td className={`px-3 py-1.5 text-right font-bold tabular-nums ${d.remaining > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400 dark:text-gray-600'}`}>{d.remaining}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="mb-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3 py-2.5">
      <div className={`flex items-center justify-between ${collapsed ? '' : 'mb-2'}`}>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
          Tổng món
          {kiemTraCount > 0 && (
            <span className="normal-case text-[11px] font-medium text-indigo-600 dark:text-indigo-300">
              🔍 đang kiểm tra {kiemTraCount} bàn
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {kiemTraCount > 0 && onClearKiemTra && (
            <button
              type="button"
              onClick={onClearKiemTra}
              className="text-xs font-semibold px-2 py-0.5 rounded-md border border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
            >
              Bỏ kiểm tra ({kiemTraCount})
            </button>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={() => { setShowAll(v => !v); setOpenDish(null) }}
              className={`text-xs font-semibold px-2 py-0.5 rounded-md border transition-colors ${
                showAll
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
              }`}
            >
              {showAll ? 'Thu gọn' : 'Xem tất cả'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setCollapsed(v => !v)}
            className="text-xs font-semibold px-2 py-0.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {collapsed ? 'Hiện' : 'Ẩn'}
          </button>
          <span className="text-xs font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-md">
            {dishTotal} phần
            {dishDelta > 0 && <span className="ml-1 text-indigo-100">(+{dishDelta})</span>}
          </span>
        </div>
      </div>
      {!collapsed && (
      <>
      <div className="flex flex-wrap gap-2">
        {dishSummary.map(row => {
          const isOpen = openDish === row.label
          return (
            <button
              key={row.label}
              type="button"
              onClick={() => { setOpenDish(isOpen ? null : row.label); setShowAll(false) }}
              className={`flex flex-col gap-0.5 rounded-lg border px-2.5 py-1.5 text-left transition-colors ${
                isOpen
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-1">
                {row.label} <span className="text-indigo-600 dark:text-indigo-400 font-bold">×{row.total}</span>
                {row.deltaTotal > 0 && <span className="text-indigo-500 dark:text-indigo-300 font-bold text-xs">(+{row.deltaTotal})</span>}
                <span className="text-indigo-400 text-[10px]">{isOpen ? '▲' : '▼'}</span>
              </span>
              <span className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                {row.breakdown.map(b => (
                  <span key={b.label} className="whitespace-nowrap">
                    {b.label} <span className="font-semibold text-gray-700 dark:text-gray-300">×{b.qty}</span>
                    {b.delta > 0 && <span className="font-bold text-indigo-500 dark:text-indigo-300"> (+{b.delta})</span>}
                  </span>
                ))}
              </span>
            </button>
          )
        })}
      </div>

      {/* Per-table detail — all dishes when "Xem tất cả", else just the expanded one */}
      {showAll ? (
        <div className="mt-2 space-y-2">
          {dishSummary.map(row => (
            <div key={row.label}>{renderDishDetail(row)}</div>
          ))}
        </div>
      ) : openDish && (() => {
        const row = dishSummary.find(r => r.label === openDish)
        if (!row) return null
        return <div className="mt-2">{renderDishDetail(row)}</div>
      })()}
      </>
      )}
    </div>
  )
}
