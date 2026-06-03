'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import type { Order } from '@/types/order'
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
}

export function TableList({
  tables, orders, now, loadingIds, onAction, onPaymentDone, onCancel,
}: TableListProps) {
  const [timeSort,    setTimeSort]    = useState<'asc' | 'desc'>('asc')
  const [payingEntry, setPayingEntry] = useState<{ order: Order; table: Table } | null>(null)

  const orderByTable = new Map(orders.filter(o => o.table_id).map(o => [o.table_id!, o]))

  const sorted = [...tables].sort((a, b) => {
    const aOrder = orderByTable.get(a.id)
    const bOrder = orderByTable.get(b.id)
    const aOcc = aOrder ? 0 : 1
    const bOcc = bOrder ? 0 : 1
    if (aOcc !== bOcc) return aOcc - bOcc
    if (aOrder && bOrder) {
      const diff = new Date(aOrder.created_at).getTime() - new Date(bOrder.created_at).getTime()
      return timeSort === 'asc' ? diff : -diff
    }
    return a.name.localeCompare(b.name, 'vi')
  })

  if (sorted.length === 0) return null

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

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* header row */}
        <div className="grid grid-cols-[2fr_2fr_1fr_1.5fr] gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          <span>Bàn</span>
          <span>Trạng thái</span>
          <button
            onClick={() => setTimeSort(s => s === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer select-none"
          >
            Thời gian
            <span className="text-gray-400 dark:text-gray-500">{timeSort === 'asc' ? '↑' : '↓'}</span>
          </button>
          <span>Tổng tiền</span>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {sorted.map(table => {
            const order   = orderByTable.get(table.id)
            const loading = order ? loadingIds.has(order.id) : false

            if (!order) {
              return (
                <div key={table.id}
                  className="grid grid-cols-[2fr_2fr_1fr_1.5fr] gap-3 px-4 py-3 items-center text-sm"
                >
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{table.name}
                    <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">{table.capacity} chỗ</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <span className="text-gray-400 dark:text-gray-500 text-xs">Trống</span>
                  </span>
                  <span className="text-gray-300 dark:text-gray-600">—</span>
                  <span className="text-gray-300 dark:text-gray-600">—</span>
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

            return (
              <div key={table.id}
                className={`grid grid-cols-[2fr_2fr_1fr_1.5fr] gap-3 px-4 py-3 items-center text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${borderL}`}
              >
                <span className="font-semibold text-gray-900 dark:text-gray-100">{table.name}
                  <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">{table.capacity} chỗ</span>
                </span>

                <StatusBadge />

                <span className={`text-sm whitespace-nowrap ${timeColor}`}>
                  {mins} phút
                </span>

                <span className="text-gray-800 dark:text-gray-200 font-medium whitespace-nowrap">{formatVND(order.total_amount)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
