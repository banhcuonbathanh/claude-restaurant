'use client'
import type { Order } from '@/types/order'
import type { Table } from '@/features/admin/admin.api'
import { elapsedMins, isKitchenItem, statusColors, statusLabel } from '@/features/admin/overview.helpers'

const PREP_STATUSES = new Set(['pending', 'confirmed', 'preparing', 'ready'])

function nextAction(status: Order['status']): { label: string; nextStatus: string; cls: string } | null {
  switch (status) {
    case 'pending':   return { label: 'Xác nhận',    nextStatus: 'confirmed', cls: 'bg-indigo-600 hover:bg-indigo-700 text-white' }
    case 'confirmed': return { label: 'Bắt đầu làm', nextStatus: 'preparing', cls: 'bg-yellow-500 hover:bg-yellow-600 text-white' }
    case 'preparing': return { label: 'Sẵn sàng',    nextStatus: 'ready',     cls: 'bg-green-500 hover:bg-green-600 text-white' }
    case 'ready':     return { label: 'Đã giao',      nextStatus: 'delivered', cls: 'bg-green-600 hover:bg-green-700 text-white' }
    default:          return null
  }
}

interface WaitingSectionProps {
  orders:          Order[]
  tables:          Table[]
  now:             number
  loadingIds:      Set<string>
  checkedTableIds: Set<string>
  onAction:        (orderId: string, status: string) => Promise<void>
  onToggleCheck:   (tableId: string) => void
}

export function WaitingSection({
  orders, tables, now, loadingIds, onAction,
}: WaitingSectionProps) {
  const tableMap = new Map(tables.map(t => [t.id, t]))

  const prepOrders = orders
    .filter(o => PREP_STATUSES.has(o.status) && o.table_id && tableMap.has(o.table_id))
    .sort((a, b) => {
      const aM = elapsedMins(a.created_at, now)
      const bM = elapsedMins(b.created_at, now)
      if (aM > 20 && bM <= 20) return -1
      if (bM > 20 && aM <= 20) return 1
      return bM - aM
    })
    .map(o => ({ table: tableMap.get(o.table_id!)!, order: o }))

  if (prepOrders.length === 0) return (
    <div className="rounded-xl bg-white border border-gray-200 px-4 py-6 text-center text-sm text-gray-400">
      Chưa có đơn hàng — quán đang yên tĩnh
    </div>
  )

  const allKitItems = prepOrders.flatMap(({ order }) => order.items.filter(isKitchenItem))
  const dishTypes   = new Set(allKitItems.map(i => i.name)).size
  const totalRemain = allKitItems.reduce((s, i) => s + Math.max(0, i.quantity - i.qty_served), 0)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Danh sách cần chuẩn bị</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {prepOrders.length} bàn · {dishTypes} loại món · {totalRemain} phần còn lại
          </p>
        </div>
        <span className="text-xs font-bold bg-indigo-600 text-white px-2.5 py-1 rounded-lg">
          {totalRemain} phần
        </span>
      </div>

      {/* column headers */}
      <div className="grid grid-cols-[2fr_1.5fr_1fr_2fr_1.5fr] gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
        <span>Bàn</span>
        <span>Trạng thái</span>
        <span>Thời gian</span>
        <span>Còn lại</span>
        <span className="text-right">Thao tác</span>
      </div>

      <div className="divide-y divide-gray-100">
        {prepOrders.map(({ table, order }) => {
          const mins      = elapsedMins(order.created_at, now)
          const kitItems  = order.items.filter(isKitchenItem)
          const remaining = kitItems.reduce((s, i) => s + Math.max(0, i.quantity - i.qty_served), 0)
          const createdDate = new Date(order.created_at)
          const dateLabel = `${createdDate.getDate().toString().padStart(2,'0')}/${(createdDate.getMonth()+1).toString().padStart(2,'0')} ${createdDate.getHours().toString().padStart(2,'0')}:${createdDate.getMinutes().toString().padStart(2,'0')}`
          const timeColor = mins > 20 ? 'text-red-600 font-semibold' : mins >= 10 ? 'text-yellow-600' : 'text-orange-500'
          const borderL   = mins > 20 ? 'border-l-4 border-l-red-400' : mins >= 10 ? 'border-l-4 border-l-yellow-400' : 'border-l-4 border-l-orange-400'
          const next      = nextAction(order.status)
          const loading   = loadingIds.has(order.id)

          // compact dish summary: "gio ×2, trung ×2, banh cuon ×6"
          const dishSummary = kitItems
            .filter(i => i.quantity - i.qty_served > 0)
            .map(i => `${i.name} ×${i.quantity - i.qty_served}`)
            .join(', ')

          return (
            <div
              key={order.id}
              className={`grid grid-cols-[2fr_1.5fr_1fr_2fr_1.5fr] gap-2 px-4 py-3 items-center text-sm hover:bg-gray-50 transition-colors ${borderL}`}
            >
              {/* table */}
              <span className="font-semibold text-gray-900">
                {table.name}
                <span className="ml-2 text-xs font-normal text-gray-400">{order.order_number.slice(-6)}</span>
              </span>

              {/* status */}
              <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full w-fit ${statusColors(order.status)}`}>
                {statusLabel(order.status)}
              </span>

              {/* elapsed + created date */}
              <div className="flex flex-col gap-0.5">
                <span className={`text-sm ${timeColor}`}>{mins} phút</span>
                <span className="text-xs text-gray-400">{dateLabel}</span>
              </div>

              {/* remaining dishes */}
              <span className="text-xs text-gray-600 truncate" title={dishSummary}>
                {dishSummary || <span className="text-green-500">✓ Xong hết</span>}
              </span>

              {/* action */}
              <div className="flex justify-end gap-1">
                {next && (
                  <button
                    onClick={() => onAction(order.id, next.nextStatus)}
                    disabled={loading}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors ${next.cls}`}
                  >
                    {loading ? '...' : next.label}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
