'use client'
import type { Order } from '@/types/order'
import { isKitchenItem } from '@/features/admin/overview.helpers'

// Zone D4 — "Đơn hàng cần làm": one merged table of dishes to prepare.
//   Món | SL ban đầu (confirmed) | SL thêm (pending orders toggled via the "Chờ xác nhận"
//   badge in Zone B — amber, never mixed into the base count) | Tổng.
// Canh + Giò are excluded entirely (kitchen tracks them via the Zone C matrix / Tổng món strip).
interface Props {
  orders: Order[]   // pass the live order list — filtered by status here
  previewIds?: Set<string>
}

// dish name → remaining count for a set of orders — Canh + Giò skipped.
function countRemaining(orders: Order[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const o of orders) {
    for (const it of o.items.filter(isKitchenItem)) {
      const n = it.name.toLowerCase()
      if (n.includes('canh') || n.includes('giò') || n.includes('gio')) continue
      const rem = it.quantity - it.qty_served
      if (rem <= 0) continue
      map.set(it.name, (map.get(it.name) ?? 0) + rem)
    }
  }
  return map
}

export function ConfirmedPrepList({ orders, previewIds }: Props) {
  const confirmed = orders.filter(o => o.status === 'confirmed')
  // Stale ids (order confirmed/cancelled meanwhile) drop out here — only live pending orders count.
  const previewOrders = previewIds
    ? orders.filter(o => o.status === 'pending' && previewIds.has(o.id))
    : []

  const baseCounts    = countRemaining(confirmed)
  const previewCounts = countRemaining(previewOrders)

  // Merge: union of dish names, sorted by combined total (desc).
  const names = Array.from(new Set([...Array.from(baseCounts.keys()), ...Array.from(previewCounts.keys())]))
  const rows = names
    .map(name => {
      const base    = baseCounts.get(name) ?? 0
      const preview = previewCounts.get(name) ?? 0
      return { name, base, preview, total: base + preview }
    })
    .sort((a, b) => b.total - a.total)
  if (rows.length === 0) return null

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

      {/* column headers */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        <span>Món</span>
        <span className="text-right">SL ban đầu</span>
        <span className="text-right text-amber-600 dark:text-amber-400">⊕ SL thêm</span>
        <span className="text-right">Tổng</span>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {rows.map(r => (
          <div key={r.name} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 px-4 py-3 items-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{r.name}</span>
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
          </div>
        ))}
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
    </div>
  )
}
