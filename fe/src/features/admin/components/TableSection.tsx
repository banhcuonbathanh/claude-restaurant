'use client'
import { useState, type ReactNode } from 'react'
import type { Order } from '@/types/order'
import type { Table } from '@/features/admin/admin.api'
import { summarizeTableDishes } from '@/features/admin/overview.helpers'
import { TableList } from './TableList'
import { TableGrid } from './TableGrid'

interface Props {
  tables:          Table[]
  listOrders:      Order[]   // TableList view
  gridOrders:      Order[]   // TableGrid view
  now:             number
  loadingIds:      Set<string>
  checkedTableIds: Set<string>
  onAction:        (orderId: string, status: string) => Promise<void>
  onToggleCheck:   (tableId: string) => void
  onPaymentDone:   (orderId: string) => void
  onCancel:        (orderId: string) => Promise<void>
  belowSummary?:   ReactNode   // rendered between the dish summary and the Bàn list
  kiemTraTableIds?: Set<string>   // tables marked 🔍 Kiểm tra — shown as a +N delta in Tổng món
  onClearKiemTra?: () => void     // clears all Kiểm tra selections
}

export function TableSection({
  tables,
  listOrders,
  gridOrders,
  now,
  loadingIds,
  checkedTableIds,
  onAction,
  onToggleCheck,
  onPaymentDone,
  onCancel,
  belowSummary,
  kiemTraTableIds,
  onClearKiemTra,
}: Props) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [openDish, setOpenDish] = useState<string | null>(null)
  const [showAll,  setShowAll]  = useState(false)

  // Total dishes across every active table — Bánh · Trứng · Giò · Canh, each with nhân/rau split.
  // 🔍 Kiểm tra tables are split off into the delta (deltaTotal / breakdown.delta / detail.isDelta).
  const dishSummary  = summarizeTableDishes(listOrders, tables, kiemTraTableIds)
  const dishTotal    = dishSummary.reduce((s, r) => s + r.total, 0)
  const dishDelta    = dishSummary.reduce((s, r) => s + r.deltaTotal, 0)
  const kiemTraCount = kiemTraTableIds?.size ?? 0

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
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Danh sách bàn</h3>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
            title="Danh sách"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
            title="Lưới"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Dish summary — total Bánh / Trứng / Giò / Canh across all tables, with nhân/rau split */}
      {(dishTotal > 0 || dishDelta > 0) && (
        <div className="mb-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3 py-2.5">
          <div className="flex items-center justify-between mb-2">
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
              <span className="text-xs font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-md">
                {dishTotal} phần
                {dishDelta > 0 && <span className="ml-1 text-indigo-100">(+{dishDelta})</span>}
              </span>
            </div>
          </div>
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
        </div>
      )}

      {belowSummary && <div className="mb-3">{belowSummary}</div>}

      {viewMode === 'list' ? (
        <TableList
          tables={tables}
          orders={listOrders}
          now={now}
          loadingIds={loadingIds}
          checkedTableIds={checkedTableIds}
          onAction={onAction}
          onToggleCheck={onToggleCheck}
          onPaymentDone={onPaymentDone}
          onCancel={onCancel}
        />
      ) : (
        <TableGrid
          tables={tables}
          orders={gridOrders}
          now={now}
          loadingIds={loadingIds}
          checkedTableIds={checkedTableIds}
          onAction={onAction}
          onToggleCheck={onToggleCheck}
        />
      )}
    </div>
  )
}
