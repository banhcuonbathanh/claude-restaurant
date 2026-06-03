'use client'
import type { Order } from '@/types/order'
import type { Table } from '@/features/admin/admin.api'
import { elapsedMins, itemCounts } from '@/features/admin/overview.helpers'

function StatCard({ label, value, sub, urgent }: { label: string; value: number | string; sub?: string; urgent?: boolean }) {
  return (
    <div className={`rounded-xl border shadow-sm p-4 flex flex-col gap-1 ${urgent ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-2xl font-bold ${urgent ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
    </div>
  )
}

interface StatCardsProps {
  orders: Order[]
  tables: Table[]
  now:    number
}

export function StatCards({ orders, tables, now }: StatCardsProps) {
  const orderByTable = new Map(orders.filter(o => o.table_id).map(o => [o.table_id!, o]))

  const occupied  = tables.filter(t => orderByTable.has(t.id)).length
  const urgent    = orders.filter(o => elapsedMins(o.created_at, now) > 20).length
  const warning   = orders.filter(o => {
    const m = elapsedMins(o.created_at, now)
    return m >= 10 && m <= 20
  }).length

  let totalPending = 0, totalPreparing = 0
  for (const o of orders) {
    const c = itemCounts(o.items)
    totalPending   += c.pending
    totalPreparing += c.preparing
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard label="Bàn đang phục vụ"   value={occupied}       sub={`/ ${tables.length} bàn`} />
      <StatCard label="Món chờ làm"         value={totalPending}   sub="Chưa bắt đầu" />
      <StatCard label="Món đang làm"        value={totalPreparing} sub="Đang chế biến" />
      <StatCard
        label="Khẩn cấp / Cảnh báo"
        value={`${urgent} / ${warning}`}
        sub=">20 phút / 10–20 phút"
        urgent={urgent > 0}
      />
    </div>
  )
}
