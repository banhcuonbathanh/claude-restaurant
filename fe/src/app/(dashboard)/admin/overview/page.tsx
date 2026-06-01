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
import { TableList } from '@/features/admin/components/TableList'
import { ConnectionErrorBanner } from '@/components/shared/ConnectionErrorBanner'

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
  const [searchQuery,     setSearchQuery]     = useState('')
  const [viewMode,        setViewMode]        = useState<'grid' | 'list'>('list')

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
    queryFn:  () => listLiveOrders(),
    staleTime: 15_000,
  })
  const orders = rawOrders.filter(o => ACTIVE.has(o.status))

  // WS — mutates ['orders','live'] TanStack Query cache on every push event
  const wsConnected = useOverviewWS()

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

  const tableMap = new Map(tables.map(t => [t.id, t]))

  const q = searchQuery.toLowerCase().trim()

  const filteredOrders = q
    ? orders.filter(o => {
        if (o.order_number.toLowerCase().includes(q)) return true
        if (o.id.toLowerCase().includes(q)) return true
        if (o.customer_name?.toLowerCase().includes(q)) return true
        if (o.table_id) {
          const name = tableMap.get(o.table_id)?.name?.toLowerCase() ?? ''
          if (name.includes(q)) return true
        }
        return false
      })
    : orders

  const filteredTables = q
    ? tables.filter(t => {
        if (t.name.toLowerCase().includes(q)) return true
        const order = orders.find(o => o.table_id === t.id)
        if (!order) return false
        if (order.order_number.toLowerCase().includes(q)) return true
        if (order.id.toLowerCase().includes(q)) return true
        if (order.customer_name?.toLowerCase().includes(q)) return true
        return false
      })
    : tables

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* WS disconnect banner */}
      {wsConnected === false && <ConnectionErrorBanner />}

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

      {/* Search bar */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Tìm theo mã đơn, số bàn, tên khách..."
          className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 placeholder:text-gray-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {q && (
        <p className="text-xs text-gray-400 -mt-2">
          {filteredOrders.length} đơn · {filteredTables.length} bàn phù hợp với &ldquo;{q}&rdquo;
        </p>
      )}

      {/* Zone A — 4 stat cards */}
      <StatCards orders={orders} tables={tables} now={now} />

      {/* Zone B — pending orders awaiting confirmation */}
      <WaitingSection
        orders={filteredOrders}
        tables={tables}
        now={now}
        loadingIds={loadingIds}
        checkedTableIds={checkedTableIds}
        onAction={handleAction}
        onToggleCheck={toggleCheck}
      />

      {/* Zone C — dish summary panel (always visible) */}
      <PrepPanel orders={filteredOrders} tableMap={tableMap} />

      {/* Zone D — table view with toggle */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Danh sách bàn</h3>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Danh sách"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Lưới"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <TableList
            tables={filteredTables}
            orders={filteredOrders}
            now={now}
            loadingIds={loadingIds}
            checkedTableIds={checkedTableIds}
            onAction={handleAction}
            onToggleCheck={toggleCheck}
          />
        ) : (
          <TableGrid
            tables={filteredTables}
            orders={filteredOrders}
            now={now}
            loadingIds={loadingIds}
            checkedTableIds={checkedTableIds}
            onAction={handleAction}
            onToggleCheck={toggleCheck}
          />
        )}
      </div>

    </div>
  )
}
