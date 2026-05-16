'use client'
import { useCallback, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/auth.store'
import {
  listLiveOrders,
  listTables,
  updateOrderStatus,
  type Table,
} from '@/features/admin/admin.api'
import type { Order } from '@/types/order'
import { useAdminSSE } from '@/hooks/useAdminSSE'
import { useOverviewWS } from '@/hooks/useOverviewWS'
import { api } from '@/lib/api-client'
import { formatVND } from '@/lib/utils'
import { StatCards } from '@/features/admin/components/StatCards'
import { WaitingSection } from '@/features/admin/components/WaitingSection'
import { PrepPanel } from '@/features/admin/components/PrepPanel'
import { TableGrid } from '@/features/admin/components/TableGrid'

const ACTIVE = new Set(['pending', 'confirmed', 'preparing', 'ready'])

// ── New-order popup modal ─────────────────────────────────────────────────────

function NewOrderPopup({
  order,
  onConfirm,
  onDismiss,
  loading,
}: {
  order:     Order
  onConfirm: () => void
  onDismiss: () => void
  loading:   boolean
}) {
  const kitItems = order.items.filter(i => !(i.combo_id !== null && i.combo_ref_id === null))
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-indigo-600 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-lg">Đơn hàng mới!</p>
              <p className="text-indigo-200 text-sm">{order.order_number}</p>
            </div>
            {order.table_id && (
              <span className="bg-white/20 text-white font-bold text-sm px-3 py-1.5 rounded-lg">
                {order.table_id}
              </span>
            )}
          </div>
        </div>

        <div className="px-5 py-4 max-h-64 overflow-y-auto space-y-2">
          {kitItems.map(it => (
            <div key={it.id} className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
              <span className="flex-1 text-sm text-gray-800">{it.name}</span>
              <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                ×{it.quantity}
              </span>
              <span className="text-xs text-gray-500 w-20 text-right">
                {formatVND(it.unit_price * it.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">{kitItems.length} món · Tổng cộng</p>
            <p className="text-lg font-bold text-gray-900">{formatVND(order.total_amount)}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onDismiss}
              disabled={loading}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Bỏ qua
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Đang xác nhận...' : '✓ Xác nhận nhận đơn'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const token       = useAuthStore(state => state.accessToken)
  const queryClient = useQueryClient()

  const [now,             setNow]             = useState(() => Date.now())
  const [loadingIds,      setLoadingIds]      = useState<Set<string>>(new Set())
  const [checkedTableIds, setCheckedTableIds] = useState<Set<string>>(new Set())
  const [popupOrder,      setPopupOrder]      = useState<Order | null>(null)
  const [popupLoading,    setPopupLoading]    = useState(false)

  // 30s timer — keeps elapsed-time urgency display fresh
  useEffect(() => {
    const timerId = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(timerId)
  }, [])

  // Server state
  const { data: tables = [] } = useQuery<Table[]>({
    queryKey: ['tables'],
    queryFn:  listTables,
    staleTime: 60_000,
  })

  const { data: rawOrders = [] } = useQuery<Order[]>({
    queryKey: ['orders', 'live'],
    queryFn:  listLiveOrders,
    staleTime: 15_000,
  })
  const orders = rawOrders.filter(o => ACTIVE.has(o.status))

  // WS — mutates ['orders','live'] TanStack Query cache on every push event
  useOverviewWS(token)

  // SSE — fires popup when a new order arrives
  const handleNewOrder = useCallback(async (evt: { order_id: string }) => {
    try {
      const res   = await api.get(`/orders/${evt.order_id}`)
      const order: Order = res.data?.data ?? res.data
      if (ACTIVE.has(order.status)) setPopupOrder(order)
    } catch { /* skip */ }
  }, [])
  useAdminSSE({ token, onNewOrder: handleNewOrder })

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleConfirmPopup() {
    if (!popupOrder) return
    setPopupLoading(true)
    try {
      await api.patch(`/orders/${popupOrder.id}/status`, { status: 'confirmed' })
      queryClient.setQueryData<Order[]>(['orders', 'live'], prev =>
        (prev ?? []).map(o =>
          o.id === popupOrder.id ? { ...o, status: 'confirmed' as Order['status'] } : o
        )
      )
    } finally {
      setPopupLoading(false)
      setPopupOrder(null)
    }
  }

  async function handleAction(orderId: string, status: string) {
    setLoadingIds(prev => new Set(prev).add(orderId))
    try {
      await updateOrderStatus(orderId, status)
      // Optimistic update — WS order_status_changed will confirm
      queryClient.setQueryData<Order[]>(['orders', 'live'], prev =>
        (prev ?? []).map(o =>
          o.id !== orderId ? o : { ...o, status: status as Order['status'] }
        )
      )
    } finally {
      setLoadingIds(prev => { const s = new Set(prev); s.delete(orderId); return s })
    }
  }

  function toggleCheck(tableId: string) {
    setCheckedTableIds(prev => {
      const next = new Set(prev)
      next.has(tableId) ? next.delete(tableId) : next.add(tableId)
      return next
    })
  }

  // ── Derived data ───────────────────────────────────────────────────────────

  const tableMap     = new Map(tables.map(t => [t.id, t]))
  const orderByTable = new Map(orders.filter(o => o.table_id).map(o => [o.table_id!, o]))
  const checkedOrders = Array.from(checkedTableIds)
    .map(tid => orderByTable.get(tid))
    .filter((o): o is Order => o !== undefined)

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* New-order popup */}
      {popupOrder && (
        <NewOrderPopup
          order={popupOrder}
          loading={popupLoading}
          onConfirm={handleConfirmPopup}
          onDismiss={() => setPopupOrder(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Tổng quan sàn</h2>
          <p className="text-sm text-gray-400 mt-0.5">Tất cả bàn — cập nhật theo thời gian thực</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>

      {/* Zone A — 4 stat cards */}
      <StatCards orders={orders} tables={tables} now={now} />

      {/* Zone B — pending orders awaiting confirmation */}
      <WaitingSection
        orders={orders}
        tables={tables}
        now={now}
        loadingIds={loadingIds}
        checkedTableIds={checkedTableIds}
        onAction={handleAction}
        onToggleCheck={toggleCheck}
      />

      {/* Zone C — prep detail panel, visible when any table is checked */}
      {checkedOrders.length > 0 && (
        <PrepPanel orders={checkedOrders} tableMap={tableMap} />
      )}

      {/* Zone D — full table grid (occupied first, then empty) */}
      <TableGrid
        tables={tables}
        orders={orders}
        now={now}
        loadingIds={loadingIds}
        checkedTableIds={checkedTableIds}
        onAction={handleAction}
        onToggleCheck={toggleCheck}
      />

    </div>
  )
}
