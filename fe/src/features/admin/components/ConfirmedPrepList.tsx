'use client'
import { useState } from 'react'
import type { Order } from '@/types/order'
import { isKitchenItem } from '@/features/admin/overview.helpers'
import { CanhGioMatrix, isCanhGioName, type CanhGioEntry } from './CanhGioMatrix'

// Zone D4 — "Đơn hàng cần làm": one merged table of dishes to prepare.
//   Món | SL ban đầu (confirmed) | SL thêm (pending orders with 🔍 Kiểm tra active —
//   amber, never mixed into the base count) | Tổng.
// Canh + Giò are excluded from the dish rows and shown in the per-table
// ♨ Canh & Giò matrix at the bottom instead (same matrix as Zone C).
interface Props {
  orders: Order[]   // pass the live order list — filtered by status here
  previewIds?: Set<string>
}

// dish name → per-table remaining counts for a set of orders — Canh + Giò skipped.
// Keeps the table breakdown so a dish row can expand to "which table gets how many".
function countRemainingByTable(orders: Order[]): Map<string, Map<string, number>> {
  const map = new Map<string, Map<string, number>>()
  for (const o of orders) {
    const tableName = o.table_name ?? '—'
    for (const it of o.items.filter(isKitchenItem)) {
      if (isCanhGioName(it.name)) continue
      const rem = it.quantity - it.qty_served
      if (rem <= 0) continue
      const byTable = map.get(it.name) ?? new Map<string, number>()
      byTable.set(tableName, (byTable.get(tableName) ?? 0) + rem)
      map.set(it.name, byTable)
    }
  }
  return map
}

function sumCounts(m: Map<string, number> | undefined): number {
  if (!m) return 0
  return Array.from(m.values()).reduce((s, n) => s + n, 0)
}

// Remaining canh/giò per table for the matrix — same order set as the dish rows.
// preview=true marks entries from 🔍 Kiểm tra pending orders (amber ⊕ SL thêm in the matrix).
function collectCanhGio(orders: Order[], preview = false): CanhGioEntry[] {
  const entries: CanhGioEntry[] = []
  for (const o of orders) {
    const fullName = o.table_name ?? '—'
    const tableLabel = fullName.split(' ').pop() ?? fullName
    for (const it of o.items.filter(isKitchenItem)) {
      if (!isCanhGioName(it.name)) continue
      const rem = it.quantity - it.qty_served
      if (rem <= 0) continue
      entries.push({ tableLabel, name: it.name, qty: rem, preview })
    }
  }
  return entries
}

export function ConfirmedPrepList({ orders, previewIds }: Props) {
  // Per-table breakdown is hidden by default — tap a dish row to toggle it.
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const confirmed = orders.filter(o => o.status === 'confirmed')
  // Stale ids (order confirmed/cancelled meanwhile) drop out here — only live pending orders count.
  const previewOrders = previewIds
    ? orders.filter(o => o.status === 'pending' && previewIds.has(o.id))
    : []

  const baseByTable    = countRemainingByTable(confirmed)
  const previewByTable = countRemainingByTable(previewOrders)

  // Merge: union of dish names, sorted by combined total (desc).
  const names = Array.from(new Set([...Array.from(baseByTable.keys()), ...Array.from(previewByTable.keys())]))
  const rows = names
    .map(name => {
      const base    = sumCounts(baseByTable.get(name))
      const preview = sumCounts(previewByTable.get(name))
      return { name, base, preview, total: base + preview }
    })
    .sort((a, b) => b.total - a.total)

  function toggleExpand(name: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const canhGioEntries = [...collectCanhGio(confirmed), ...collectCanhGio(previewOrders, true)]
  if (rows.length === 0 && canhGioEntries.length === 0) return null

  const baseTotal    = rows.reduce((s, r) => s + r.base, 0)
  const previewTotal = rows.reduce((s, r) => s + r.preview, 0)

  return (
    <div className="mb-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-xl border border-yellow-200 dark:border-yellow-900 overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Đơn hàng cần làm</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Đơn đã xác nhận · {rows.length} loại món · {baseTotal} phần còn lại
            {previewTotal > 0 && (
              <span className="text-amber-600 dark:text-amber-400 font-semibold"> · ⊕ +{previewTotal} kiểm tra</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold bg-yellow-500 text-white px-2.5 py-1 rounded-lg">
            {baseTotal} phần
          </span>
          {previewTotal > 0 && (
            <span className="text-xs font-bold border border-dashed border-amber-500 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-lg">
              +{previewTotal}
            </span>
          )}
        </div>
      </div>

      {rows.length > 0 && (<>
      {/* column headers */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        <span>Món</span>
        <span className="text-right">SL ban đầu</span>
        <span className="text-right text-amber-600 dark:text-amber-400">⊕ SL thêm</span>
        <span className="text-right">Tổng</span>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {rows.map(r => {
          const isOpen = expanded.has(r.name)
          const baseTables    = baseByTable.get(r.name)
          const previewTables = previewByTable.get(r.name)
          const tableNames = Array.from(new Set([
            ...Array.from(baseTables?.keys() ?? []),
            ...Array.from(previewTables?.keys() ?? []),
          ])).sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }))
          return (
            <div key={r.name}>
              <button
                type="button"
                onClick={() => toggleExpand(r.name)}
                className="w-full min-h-[44px] text-left grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 px-4 py-3 items-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
                  <span className={`text-[10px] text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                  {r.name}
                </span>
                <span className="text-sm text-right tabular-nums text-gray-700 dark:text-gray-300">
                  {r.base > 0 ? `×${r.base}` : '–'}
                </span>
                <span className="text-sm text-right tabular-nums">
                  {r.preview > 0
                    ? <span className="font-semibold italic text-amber-600 dark:text-amber-400">+{r.preview}</span>
                    : <span className="text-gray-300 dark:text-gray-600">–</span>}
                </span>
                <span className="text-right">
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-md tabular-nums ${
                    r.preview > 0
                      ? 'border border-dashed border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                  }`}>
                    ×{r.total}
                  </span>
                </span>
              </button>

              {/* per-table breakdown — hidden until the dish row is tapped */}
              {isOpen && (
                <div className="px-4 pb-3 pt-1 bg-gray-50 dark:bg-gray-800/50">
                  <div className="ml-4 border-l-2 border-yellow-300 dark:border-yellow-800 pl-3 space-y-1">
                    {tableNames.map(t => {
                      const b = baseTables?.get(t) ?? 0
                      const p = previewTables?.get(t) ?? 0
                      return (
                        <div key={t} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-300">{t}</span>
                          <span className="tabular-nums">
                            {b > 0 && <span className="font-semibold text-gray-800 dark:text-gray-100">×{b}</span>}
                            {p > 0 && <span className="ml-1.5 font-semibold italic text-amber-600 dark:text-amber-400">+{p}</span>}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* totals row */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 px-4 py-2.5 items-center border-t-2 border-yellow-200 dark:border-yellow-900 bg-yellow-100/60 dark:bg-yellow-900/30 text-sm font-bold">
        <span className="uppercase tracking-wide text-xs text-gray-600 dark:text-gray-300">Tổng</span>
        <span className="text-right tabular-nums text-gray-800 dark:text-gray-100">×{baseTotal}</span>
        <span className="text-right tabular-nums italic text-amber-600 dark:text-amber-400">
          {previewTotal > 0 ? `+${previewTotal}` : '–'}
        </span>
        <span className="text-right tabular-nums text-gray-900 dark:text-gray-50">×{baseTotal + previewTotal}</span>
      </div>
      </>)}

      {/* ♨ Canh & Giò — per-table matrix (self-guards when empty); collapsible here only */}
      <CanhGioMatrix entries={canhGioEntries} collapsible />
    </div>
  )
}
