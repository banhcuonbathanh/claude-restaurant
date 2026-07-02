'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Order, OrderItem } from '@/types/order'
import type { Table } from '@/features/admin/admin.api'
import { createPayment } from '@/features/admin/admin.api'
import { elapsedMins, statusColors, statusLabel } from '@/features/admin/overview.helpers'
import { formatVND } from '@/lib/utils'

function nextStatus(status: Order['status']): string | null {
  switch (status) {
    case 'pending':   return 'confirmed'
    case 'confirmed': return 'preparing'
    case 'preparing': return 'ready'
    case 'ready':     return 'delivered'
    default:          return null
  }
}

// ── Payment confirmation modal ────────────────────────────────────────────────

function PaymentModal({
  order,
  table,
  onConfirm,
  onClose,
}: {
  order:     Order
  table:     Table
  onConfirm: () => Promise<void>
  onClose:   () => void
}) {
  const [clientPaid,    setClientPaid]    = useState(false)
  const [staffReceived, setStaffReceived] = useState(false)
  const [loading,       setLoading]       = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try { await onConfirm() } finally { setLoading(false) }
  }

  const canConfirm = clientPaid && staffReceived && !loading

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* header */}
        <div className="bg-green-600 px-5 py-4">
          <p className="text-white font-bold text-lg">Thu tiền — {table.name}</p>
          <p className="text-green-100 text-sm mt-0.5">Xác nhận thanh toán tiền mặt</p>
        </div>

        {/* amount */}
        <div className="px-5 py-5 text-center border-b border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Tổng tiền</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{formatVND(order.total_amount)}</p>
        </div>

        {/* checkboxes */}
        <div className="px-5 py-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={clientPaid}
              onChange={e => setClientPaid(e.target.checked)}
              className="w-5 h-5 rounded accent-green-600 cursor-pointer"
            />
            <span className={`text-sm font-medium ${clientPaid ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
              Khách đã đưa tiền
            </span>
            {clientPaid && <span className="text-green-500 text-sm">✓</span>}
          </label>

          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={staffReceived}
              onChange={e => setStaffReceived(e.target.checked)}
              className="w-5 h-5 rounded accent-green-600 cursor-pointer"
            />
            <span className={`text-sm font-medium ${staffReceived ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
              Nhân viên đã nhận đủ tiền
            </span>
            {staffReceived && <span className="text-green-500 text-sm">✓</span>}
          </label>
        </div>

        {/* actions */}
        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex-1 py-2.5 text-sm font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận thu tiền'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Table detail drawer ───────────────────────────────────────────────────────

function ItemRow({ item }: { item: OrderItem }) {
  const hasToppings = item.toppings_snapshot && item.toppings_snapshot.length > 0
  return (
    <div className="py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug">{item.name}</p>
          {hasToppings && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              + {item.toppings_snapshot!.map(t => t.name).join(', ')}
            </p>
          )}
          {item.note && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 italic">&ldquo;{item.note}&rdquo;</p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
            ×{item.quantity}
          </span>
          <span className="text-sm text-gray-700 dark:text-gray-300 w-20 text-right">
            {formatVND(item.unit_price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  )
}

function TableDetailDrawer({
  order,
  table,
  now,
  onClose,
}: {
  order:   Order
  table:   Table
  now:     number
  onClose: () => void
}) {
  const mins      = elapsedMins(order.created_at, now)
  const timeColor = mins > 20 ? 'text-red-600' : mins >= 10 ? 'text-yellow-600' : 'text-orange-500'
  const kitItems  = order.items.filter(i => !(i.combo_id !== null && i.combo_ref_id === null))

  return (
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      {/* drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-800 z-50 shadow-2xl flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-base font-bold text-gray-900 dark:text-gray-100">{table.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{table.capacity} chỗ · #{order.order_number}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* meta info */}
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Trạng thái</span>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors(order.status)}`}>
              {statusLabel(order.status)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Thời gian chờ</span>
            <span className={`font-semibold ${timeColor}`}>{mins} phút</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Nguồn</span>
            <span className="text-gray-700 dark:text-gray-300 capitalize">{order.source}</span>
          </div>
          {order.customer_name && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Khách</span>
              <span className="text-gray-700 dark:text-gray-300">{order.customer_name}</span>
            </div>
          )}
          {order.customer_phone && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">SĐT</span>
              <span className="text-gray-700 dark:text-gray-300">{order.customer_phone}</span>
            </div>
          )}
          {order.note && (
            <div className="flex items-start justify-between text-sm gap-2">
              <span className="text-gray-500 dark:text-gray-400 shrink-0">Ghi chú</span>
              <span className="text-amber-600 dark:text-amber-400 italic text-right">&ldquo;{order.note}&rdquo;</span>
            </div>
          )}
        </div>

        {/* items */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
            {kitItems.length} món
          </p>
          {kitItems.map(item => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>

        {/* footer total */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tổng cộng</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatVND(order.total_amount)}</span>
          </div>
        </div>
      </div>
    </>
  )
}

// ── TableList ─────────────────────────────────────────────────────────────────

interface TableListProps {
  tables:          Table[]
  orders:          Order[]
  now:             number
  loadingIds:      Set<string>
  checkedTableIds: Set<string>
  onAction:        (orderId: string, status: string) => Promise<void>
  onToggleCheck:   (tableId: string) => void
  onPaymentDone?:  (orderId: string) => void
  onCancel?:       (orderId: string) => Promise<void>
  kiemTraIds?:     Set<string>
}

export function TableList({
  tables, orders, now, loadingIds, onAction, onPaymentDone, onCancel, kiemTraIds,
}: TableListProps) {
  const router = useRouter()
  const [timeSort,    setTimeSort]    = useState<'asc' | 'desc'>('asc')
  const [payingEntry, setPayingEntry] = useState<{ order: Order; table: Table } | null>(null)
  const [detailEntry, setDetailEntry] = useState<{ order: Order; table: Table } | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  function toggleExpand(orderId: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(orderId) ? next.delete(orderId) : next.add(orderId)
      return next
    })
  }

  // Group orders by table (a table can have multiple active orders — e.g. staff
  // "Đặt hộ" on a table that's already occupied). Within a table, oldest first.
  const ordersByTable = new Map<string, Order[]>()
  for (const o of orders) {
    if (!o.table_id) continue
    const list = ordersByTable.get(o.table_id)
    if (list) list.push(o)
    else ordersByTable.set(o.table_id, [o])
  }
  Array.from(ordersByTable.values()).forEach(list => {
    list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  })

  const sorted = [...tables].sort((a, b) => {
    const aOrders = ordersByTable.get(a.id)
    const bOrders = ordersByTable.get(b.id)
    const aOcc = aOrders ? 0 : 1
    const bOcc = bOrders ? 0 : 1
    if (aOcc !== bOcc) return aOcc - bOcc
    if (aOrders && bOrders) {
      const diff = new Date(aOrders[0].created_at).getTime() - new Date(bOrders[0].created_at).getTime()
      return timeSort === 'asc' ? diff : -diff
    }
    return a.name.localeCompare(b.name, 'vi')
  })

  if (sorted.length === 0) return null

  // Flatten: occupied tables emit one row per order, empty tables emit one empty row.
  type Row = { table: Table; order: Order | null }
  const rows: Row[] = []
  for (const table of sorted) {
    const tableOrders = ordersByTable.get(table.id)
    if (tableOrders && tableOrders.length > 0) {
      for (const order of tableOrders) rows.push({ table, order })
    } else {
      rows.push({ table, order: null })
    }
  }

  async function handlePaymentConfirm() {
    if (!payingEntry) return
    try {
      await createPayment({
        order_id: payingEntry.order.id,
        method:   'cash',
        amount:   payingEntry.order.total_amount,
      })
      onPaymentDone?.(payingEntry.order.id)
      setPayingEntry(null)
      toast.success('Đã thu tiền thành công')
    } catch {
      toast.error('Thanh toán thất bại. Vui lòng thử lại.')
    }
  }

  return (
    <>
      {payingEntry && (
        <PaymentModal
          order={payingEntry.order}
          table={payingEntry.table}
          onConfirm={handlePaymentConfirm}
          onClose={() => setPayingEntry(null)}
        />
      )}

      {detailEntry && (
        <TableDetailDrawer
          order={detailEntry.order}
          table={detailEntry.table}
          now={now}
          onClose={() => setDetailEntry(null)}
        />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* header row */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          <span>Bàn</span>
          <button
            onClick={() => setTimeSort(s => s === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer select-none"
          >
            Thời gian
            <span className="text-gray-400 dark:text-gray-500">{timeSort === 'asc' ? '↑' : '↓'}</span>
          </button>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {rows.map(({ table, order }) => {
            const loading = order ? loadingIds.has(order.id) : false

            if (!order) {
              return (
                <div key={table.id} className="flex flex-col gap-2.5 px-4 py-3.5">
                  {/* info line */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-base text-gray-800 dark:text-gray-200">{table.name}</span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                      <span className="text-gray-400 dark:text-gray-500 text-sm">Trống</span>
                    </span>
                  </div>
                  {/* button line */}
                  <button
                    onClick={() => router.push(`/pos?table_id=${table.id}&table_name=${encodeURIComponent(table.name)}`)}
                    className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
                    title={`Đặt hộ — ${table.name}`}
                  >
                    Đặt hộ
                  </button>
                </div>
              )
            }

            const mins      = elapsedMins(order.created_at, now)
            const timeColor = mins > 20 ? 'text-red-600 font-semibold' : mins >= 10 ? 'text-yellow-600' : 'text-orange-500'
            const borderL   = mins > 20 ? 'border-l-4 border-l-red-400' : mins >= 10 ? 'border-l-4 border-l-yellow-400' : 'border-l-4 border-l-orange-400'
            const next      = nextStatus(order.status)

            function StatusBadge() {
              const baseClass = `inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full w-fit whitespace-nowrap ${statusColors(order!.status)}`

              // delivered → pay + cancel buttons
              if (order!.status === 'delivered') {
                return (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPayingEntry({ order: order!, table })}
                      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 cursor-pointer hover:opacity-75 transition-opacity whitespace-nowrap"
                      title="Thu tiền"
                    >
                      Đã thanh toán <span className="opacity-70">💰</span>
                    </button>
                    <button
                      onClick={() => onCancel?.(order!.id)}
                      disabled={loading}
                      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 cursor-pointer hover:opacity-75 disabled:opacity-50 transition-opacity whitespace-nowrap"
                      title="Huỷ đơn"
                    >
                      Huỷ <span className="opacity-70">✕</span>
                    </button>
                  </div>
                )
              }

              // other actionable statuses → advance status
              if (next) {
                return (
                  <button
                    onClick={() => onAction(order!.id, next)}
                    disabled={loading}
                    className={`${baseClass} cursor-pointer hover:opacity-75 disabled:opacity-50 transition-opacity`}
                  >
                    {loading ? '...' : statusLabel(order!.status)}
                    {!loading && <span className="opacity-60">›</span>}
                  </button>
                )
              }

              // paid / cancelled — static
              return <span className={baseClass}>{statusLabel(order!.status)}</span>
            }

            const isExpanded = expandedIds.has(order.id)
            const orderSuffix = order.order_number.split('-').pop() ?? order.order_number
            const isKiemTra = kiemTraIds?.has(order.id) ?? false

            // When 🔍 Kiểm tra is active, the whole row lights up in the button's indigo — matches Zone B.
            const rowHighlight = isKiemTra
              ? 'border-l-4 border-l-indigo-500 ring-1 ring-inset ring-indigo-400/60 bg-indigo-50/50 dark:bg-indigo-900/20'
              : borderL

            return (
              <div key={order.id} className={`${rowHighlight}`}>
                <div
                  onClick={() => setDetailEntry({ order, table })}
                  className="flex flex-col gap-2.5 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  {/* info line */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="font-semibold text-base text-gray-900 dark:text-gray-100 leading-tight">
                        {table.name}
                        <span className="ml-2 text-xs font-mono font-normal text-gray-400 dark:text-gray-500">{orderSuffix}</span>
                      </span>
                      <span onClick={e => e.stopPropagation()}>
                        <StatusBadge />
                      </span>
                    </div>
                    <span className={`text-sm whitespace-nowrap ${timeColor}`}>
                      {mins} phút
                    </span>
                  </div>

                  {/* button line */}
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => router.push(`/pos?table_id=${table.id}&table_name=${encodeURIComponent(table.name)}`)}
                      className="flex-1 text-sm font-semibold px-3 py-2.5 rounded-lg border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors whitespace-nowrap"
                      title={`Đặt hộ — ${table.name} (khách đặt trước, ăn sau)`}
                    >
                      Đặt hộ
                    </button>
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="flex items-center justify-center w-11 h-11 shrink-0 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors"
                      title={isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
                    >
                      <svg className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* inline expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-3 pt-0 bg-gray-50 dark:bg-gray-700/40 border-t border-gray-100 dark:border-gray-700">
                    <div className="py-2 space-y-1.5">
                      {order.items
                        .filter(i => !(i.combo_id !== null && i.combo_ref_id === null))
                        .map(it => (
                          <div key={it.id} className="flex items-center gap-2 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 shrink-0" />
                            <span className="flex-1 text-gray-700 dark:text-gray-300">{it.name}</span>
                            {it.note && <span className="text-amber-600 dark:text-amber-400 italic truncate max-w-[120px]">&ldquo;{it.note}&rdquo;</span>}
                            <span className="font-semibold text-gray-600 dark:text-gray-400 tabular-nums">×{it.quantity}</span>
                            <span className="text-gray-500 dark:text-gray-500 w-16 text-right tabular-nums">{formatVND(it.unit_price * it.quantity)}</span>
                          </div>
                        ))
                      }
                    </div>
                    <button
                      onClick={() => setDetailEntry({ order, table })}
                      className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Xem đầy đủ →
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
