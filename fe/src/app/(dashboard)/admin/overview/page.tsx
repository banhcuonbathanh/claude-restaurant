'use client'
import { useCallback, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
import { StatCards } from '@/features/admin/components/StatCards'
import { WaitingSection } from '@/features/admin/components/WaitingSection'
import { PrepPanel } from '@/features/admin/components/PrepPanel'
import { TableSection } from '@/features/admin/components/TableSection'
import { PaidLog } from '@/features/admin/components/PaidLog'
import { CancelLog } from '@/features/admin/components/CancelLog'
import { NewOrderPopup } from '@/features/admin/components/NewOrderPopup'
import { OverviewHeader } from '@/features/admin/components/OverviewHeader'
import { OverviewSearchBar } from '@/features/admin/components/OverviewSearchBar'
import { ConnectionErrorBanner } from '@/components/shared/ConnectionErrorBanner'

const ACTIVE        = new Set(['pending', 'confirmed', 'preparing', 'ready', 'delivered'])
const TABLE_ACTIVE  = new Set(['pending', 'confirmed', 'preparing', 'ready', 'delivered'])

export default function OverviewPage() {
  const token       = useAuthStore(state => state.accessToken)
  const queryClient = useQueryClient()

  const [now,             setNow]             = useState(() => Date.now())
  const [loadingIds,      setLoadingIds]      = useState<Set<string>>(new Set())
  const [checkedTableIds, setCheckedTableIds] = useState<Set<string>>(new Set())
  const [popupOrder,      setPopupOrder]      = useState<Order | null>(null)
  const [popupLoading,    setPopupLoading]    = useState(false)
  const [searchQuery,     setSearchQuery]     = useState('')
  const [kiemTraIds,      setKiemTraIds]      = useState<Set<string>>(new Set())

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
  const orders       = rawOrders.filter(o => ACTIVE.has(o.status))
  const tableOrders  = rawOrders.filter(o => TABLE_ACTIVE.has(o.status))

  // WS — mutates ['orders','live'] TanStack Query cache on every push event
  const wsConnected = useOverviewWS()

  // SSE — fires popup when a new order arrives and adds it to the live cache immediately
  const handleNewOrder = useCallback(async (evt: { order_id: string }) => {
    try {
      const res   = await api.get(`/orders/${evt.order_id}`)
      const order: Order = res.data?.data ?? res.data
      if (ACTIVE.has(order.status)) {
        queryClient.setQueryData<Order[]>(['orders', 'live'], prev =>
          prev?.find(o => o.id === order.id) ? prev : [order, ...(prev ?? [])]
        )
        setPopupOrder(order)
      }
    } catch { /* skip */ }
  }, [queryClient])
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
    } catch {
      toast.error('Không thể cập nhật trạng thái. Vui lòng thử lại.')
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

  function toggleKiemTra(id: string) {
    setKiemTraIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
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
        const order = tableOrders.find(o => o.table_id === t.id)
        if (!order) return false
        if (order.order_number.toLowerCase().includes(q)) return true
        if (order.id.toLowerCase().includes(q)) return true
        if (order.customer_name?.toLowerCase().includes(q)) return true
        return false
      })
    : tables

  const filteredTableOrders = q
    ? tableOrders.filter(o => {
        if (o.order_number.toLowerCase().includes(q)) return true
        if (o.id.toLowerCase().includes(q)) return true
        if (o.customer_name?.toLowerCase().includes(q)) return true
        if (o.table_id) {
          const name = tableMap.get(o.table_id)?.name?.toLowerCase() ?? ''
          if (name.includes(q)) return true
        }
        return false
      })
    : tableOrders

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

      <OverviewHeader />

      <OverviewSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        orderCount={filteredOrders.length}
        tableCount={filteredTables.length}
      />

      {/* Zone A — 4 stat cards */}
      <StatCards orders={orders} tables={tables} now={now} />

      {/* Zone D — table view with grid/list toggle */}
      <TableSection
        tables={filteredTables}
        listOrders={filteredTableOrders}
        gridOrders={filteredOrders}
        now={now}
        loadingIds={loadingIds}
        checkedTableIds={checkedTableIds}
        onAction={handleAction}
        onToggleCheck={toggleCheck}
        onPaymentDone={(orderId) => {
          queryClient.setQueryData<Order[]>(['orders', 'live'], prev =>
            (prev ?? []).filter(o => o.id !== orderId)
          )
          queryClient.invalidateQueries({ queryKey: ['orders', 'history'] })
        }}
        onCancel={async (orderId) => {
          await handleAction(orderId, 'cancelled')
        }}
        belowSummary={
          /* Zone B — "Danh sách bàn cần chuẩn bị": right below the dish summary, above the Bàn list */
          <WaitingSection
            orders={filteredOrders}
            tables={tables}
            now={now}
            loadingIds={loadingIds}
            checkedTableIds={checkedTableIds}
            onAction={handleAction}
            onToggleCheck={toggleCheck}
            kiemTraIds={kiemTraIds}
            onKiemTra={toggleKiemTra}
          />
        }
      />

      {/* Zone C — only 'pending' orders: docs/fe/wireframes/admin_main/admin_overview/table_status.md §PrepPanel Rules */}
      {kiemTraIds.size > 0 && (
        <PrepPanel
          orders={filteredOrders.filter(o => kiemTraIds.has(o.id) && o.status === 'pending')}
          tableMap={tableMap}
          onAction={handleAction}
        />
      )}

      {/* Zone E — paid orders from today */}
      <PaidLog />

      {/* Zone F — cancelled orders from today */}
      <CancelLog />

    </div>
  )
}
