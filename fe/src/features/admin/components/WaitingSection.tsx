'use client'
import { useState } from 'react'
import type { Order } from '@/types/order'
import type { Table } from '@/features/admin/admin.api'
import { elapsedMins, isKitchenItem, statusColors, statusLabel } from '@/features/admin/overview.helpers'
import { OrderDetail } from '@/features/admin/components/OrderDetail'

const PREP_STATUSES  = new Set(['pending'])
const STATUS_ORDER   = ['pending', 'confirmed', 'preparing', 'ready']

type SortKey = 'table' | 'status' | 'order_number' | 'time' | 'remaining'

function nextAction(status: Order['status']): { label: string; nextStatus: string; cls: string } | null {
  switch (status) {
    case 'pending':   return { label: 'Xác nhận',    nextStatus: 'confirmed', cls: 'bg-indigo-600 hover:bg-indigo-700 text-white' }
    case 'confirmed': return { label: 'Bắt đầu làm', nextStatus: 'preparing', cls: 'bg-yellow-500 hover:bg-yellow-600 text-white' }
    case 'preparing': return { label: 'Sẵn sàng',    nextStatus: 'ready',     cls: 'bg-green-500 hover:bg-green-600 text-white' }
    case 'ready':     return { label: 'Đã giao',      nextStatus: 'delivered', cls: 'bg-green-600 hover:bg-green-700 text-white' }
    default:          return null
  }
}

function remainingCount(order: Order) {
  return order.items.filter(isKitchenItem).reduce((s, i) => s + Math.max(0, i.quantity - i.qty_served), 0)
}

interface WaitingSectionProps {
  orders:          Order[]
  tables:          Table[]
  now:             number
  loadingIds:      Set<string>
  checkedTableIds: Set<string>
  onAction:        (orderId: string, status: string) => Promise<void>
  onToggleCheck:   (tableId: string) => void
  kiemTraIds: Set<string>
  onKiemTra:  (orderId: string) => void
}

export function WaitingSection({
  orders, tables, now, loadingIds, onAction, checkedTableIds, onToggleCheck, kiemTraIds, onKiemTra,
}: WaitingSectionProps) {
  const [sortKey,    setSortKey]    = useState<SortKey>('time')
  const [sortDir,    setSortDir]    = useState<'asc' | 'desc'>('desc')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const tableMap = new Map(tables.map(t => [t.id, t]))

  const prepOrders = orders
    .filter(o => PREP_STATUSES.has(o.status) && o.table_id && tableMap.has(o.table_id))
    .sort((a, b) => {
      const ta = tableMap.get(a.table_id!)!
      const tb = tableMap.get(b.table_id!)!
      let diff = 0
      switch (sortKey) {
        case 'table':        diff = ta.name.localeCompare(tb.name, 'vi'); break
        case 'status':       diff = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status); break
        case 'order_number': diff = a.order_number.localeCompare(b.order_number); break
        case 'time':         diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break
        case 'remaining':    diff = remainingCount(a) - remainingCount(b); break
      }
      return sortDir === 'asc' ? diff : -diff
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

  function SortBtn({ col, label, align = 'left' }: { col: SortKey; label: string; align?: 'left' | 'right' }) {
    const active = sortKey === col
    return (
      <button
        onClick={() => toggleSort(col)}
        className={`flex items-center gap-1 transition-colors cursor-pointer select-none hover:text-gray-700 ${align === 'right' ? 'justify-end w-full' : ''} ${active ? 'text-indigo-600' : 'text-gray-500'}`}
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
          <h3 className="text-sm font-semibold text-gray-700">Danh sách bàn cần chuẩn bị</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {prepOrders.length} bàn · {dishTypes} loại món · {totalRemain} phần còn lại
          </p>
        </div>
        <span className="text-xs font-bold bg-indigo-600 text-white px-2.5 py-1 rounded-lg">
          {totalRemain} phần
        </span>
      </div>

      {/* Desktop: column headers (hidden on mobile) */}
      <div className="hidden md:grid grid-cols-[2fr_1.5fr_1.5fr_1fr_2fr_1.5fr] gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-medium uppercase tracking-wide">
        <SortBtn col="table"        label="Bàn" />
        <SortBtn col="status"       label="Trạng thái" />
        <SortBtn col="order_number" label="Mã đơn" />
        <SortBtn col="time"         label="Thời gian" />
        <SortBtn col="remaining"    label="Còn lại" />
        <span className="text-right text-gray-500">Thao tác</span>
      </div>

      {/* Mobile: sort bar */}
      <div className="flex md:hidden items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs overflow-x-auto">
        <span className="text-gray-400 shrink-0">Sắp xếp:</span>
        <SortBtn col="table"        label="Bàn" />
        <SortBtn col="status"       label="Trạng thái" />
        <SortBtn col="order_number" label="Mã đơn" />
        <SortBtn col="time"         label="Thời gian" />
        <SortBtn col="remaining"    label="Còn lại" />
      </div>

      <div className="divide-y divide-gray-100">
        {prepOrders.map(({ table, order }) => {
          const mins        = elapsedMins(order.created_at, now)
          const kitItems    = order.items.filter(isKitchenItem)
          const createdDate = new Date(order.created_at)
          const dateLabel   = `${createdDate.getDate().toString().padStart(2,'0')}/${(createdDate.getMonth()+1).toString().padStart(2,'0')} ${createdDate.getHours().toString().padStart(2,'0')}:${createdDate.getMinutes().toString().padStart(2,'0')}`
          const timeColor   = mins > 20 ? 'text-red-600 font-semibold' : mins >= 10 ? 'text-yellow-600' : 'text-orange-500'
          const borderL     = mins > 20 ? 'border-l-4 border-l-red-400' : mins >= 10 ? 'border-l-4 border-l-yellow-400' : 'border-l-4 border-l-orange-400'
          const next        = nextAction(order.status)
          const loading      = loadingIds.has(order.id)
          const isExpanded   = expandedId === order.id
          const isKiemTra    = kiemTraIds.has(order.id)

          const pendingItems = kitItems.filter(i => i.quantity - i.qty_served > 0)

          return (
            <div key={order.id} className={`border-b border-gray-100 last:border-b-0 ${borderL}`}>

              {/* ── Desktop row ── */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                className={`hidden md:grid grid-cols-[2fr_1.5fr_1.5fr_1fr_2fr_1.5fr] gap-2 px-4 py-3 items-center text-sm cursor-pointer transition-colors ${isExpanded ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
              >
                <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                  {table.name}
                  <span className="text-indigo-400">{isExpanded ? '▲' : '▼'}</span>
                </span>
                <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full w-fit ${statusColors(order.status)}`}>
                  {statusLabel(order.status)}
                </span>
                <span className="text-xs font-mono text-gray-500 truncate">{order.order_number}</span>
                <div className="flex flex-col gap-0.5">
                  <span className={`text-sm ${timeColor}`}>{mins} phút</span>
                  <span className="text-xs text-gray-400">{dateLabel}</span>
                </div>
                <div className="text-xs text-gray-600">
                  {pendingItems.length === 0
                    ? <span className="text-green-500">✓ Xong hết</span>
                    : <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5">
                        {pendingItems.map(i => (
                          <>
                            <span key={`n-${i.id}`} className="truncate">{i.name}</span>
                            <span key={`q-${i.id}`} className="font-semibold text-right tabular-nums">×{i.quantity - i.qty_served}</span>
                          </>
                        ))}
                      </div>
                  }
                </div>
                <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => onKiemTra(order.id)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                      isKiemTra
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    🔍
                  </button>
                  {next && (
                    <button onClick={() => onAction(order.id, next.nextStatus)} disabled={loading}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors ${next.cls}`}>
                      {loading ? '...' : next.label}
                    </button>
                  )}
                </div>
              </div>

              {/* ── Mobile card ── */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                className={`md:hidden px-4 py-3 cursor-pointer transition-colors ${isExpanded ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
              >
                {/* top row: table name + status + kiểm tra */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-base">{table.name}</span>
                  <span className="text-indigo-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                  <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${statusColors(order.status)}`}>
                    {statusLabel(order.status)}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); onKiemTra(order.id) }}
                    className={`ml-auto px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                      isKiemTra
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    🔍 Kiểm tra
                  </button>
                </div>
                {/* meta row: order suffix · mins · time */}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-mono text-gray-400">{order.order_number.split('-').pop()}</span>
                  <span className={`text-xs font-semibold ${timeColor}`}>{mins} phút</span>
                  <span className="text-xs text-gray-400">{dateLabel.split(' ')[1]}</span>
                </div>
                {/* dish list */}
                {pendingItems.length > 0 && (
                  <div className="text-xs text-gray-500 mt-2 w-full grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5">
                    {pendingItems.map(i => (
                      <>
                        <span key={`n-${i.id}`}>{i.name}</span>
                        <span key={`q-${i.id}`} className="font-semibold text-right tabular-nums">×{i.quantity - i.qty_served}</span>
                      </>
                    ))}
                  </div>
                )}
              </div>

              {/* expanded detail panel (both breakpoints) */}
              {isExpanded && (
                <div className="border-t border-indigo-100 bg-indigo-50/40 pt-2">
                  <OrderDetail
                    order={order}
                    table={table}
                    now={now}
                    loading={loading}
                    isChecked={checkedTableIds.has(table.id)}
                    onAction={onAction}
                    onToggleCheck={onToggleCheck}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
