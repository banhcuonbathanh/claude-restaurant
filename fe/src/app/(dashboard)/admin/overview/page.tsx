'use client'
import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/auth.store'
import { listLiveOrders, listTables, updateOrderStatus, type Table } from '@/features/admin/admin.api'
import type { Order, OrderItem } from '@/types/order'

// ── Mock data (set USE_MOCK = false to use real API) ──────────────────────────

const USE_MOCK = true

const T = (mins: number) => new Date(Date.now() - mins * 60_000).toISOString()
const id = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`

const MOCK_TABLES: Table[] = [
  { id: id(1), name: 'Bàn 01', capacity: 4, status: 'occupied' },
  { id: id(2), name: 'Bàn 02', capacity: 4, status: 'occupied' },
  { id: id(3), name: 'Bàn 03', capacity: 6, status: 'occupied' },
  { id: id(4), name: 'Bàn 04', capacity: 2, status: 'occupied' },
  { id: id(5), name: 'Bàn 05', capacity: 4, status: 'available' },
  { id: id(6), name: 'Bàn 06', capacity: 4, status: 'occupied' },
  { id: id(7), name: 'Bàn 07', capacity: 6, status: 'available' },
  { id: id(8), name: 'Bàn 08', capacity: 2, status: 'available' },
]

function mockItem(n: number, name: string, qty: number, served: number): OrderItem {
  return {
    id: id(100 + n), product_id: id(200 + n), combo_id: null, combo_ref_id: null,
    name, quantity: qty, qty_served: served, unit_price: 45000,
    note: null, topping_snapshot: null, flagged: false,
  }
}

const MOCK_ORDERS: Order[] = [
  // Bàn 01 — pending, 3 min
  {
    id: id(10), order_number: 'ORD-001', status: 'pending', source: 'qr',
    table_id: id(1), customer_name: null, customer_phone: null,
    total_amount: 135000, note: null, created_at: T(3),
    items: [
      mockItem(1, 'Bánh Cuốn Thịt',  2, 0),
      mockItem(2, 'Nem Rán',          1, 0),
      mockItem(3, 'Chả Quế',          2, 0),
    ],
  },
  // Bàn 06 — pending, 5 min
  {
    id: id(14), order_number: 'ORD-005', status: 'pending', source: 'qr',
    table_id: id(6), customer_name: null, customer_phone: null,
    total_amount: 180000, note: 'Ít cay', created_at: T(5),
    items: [
      mockItem(13, 'Bánh Cuốn Tôm',  3, 0),
      mockItem(14, 'Chả Giò',         2, 0),
      mockItem(15, 'Bánh Cuốn Thịt', 1, 0),
      mockItem(16, 'Nước Cam',        3, 0),
    ],
  },
  // Bàn 02 — preparing, 14 min (warning)
  {
    id: id(11), order_number: 'ORD-002', status: 'preparing', source: 'qr',
    table_id: id(2), customer_name: null, customer_phone: null,
    total_amount: 190000, note: 'Ít cay', created_at: T(14),
    items: [
      mockItem(4, 'Bánh Cuốn Tôm',   2, 2),
      mockItem(5, 'Bún Bò Huế',       1, 0),
      mockItem(6, 'Chả Lụa',          3, 1),
      mockItem(7, 'Nước Chanh',       2, 2),
    ],
  },
  // Bàn 03 — preparing, 25 min (urgent)
  {
    id: id(12), order_number: 'ORD-003', status: 'preparing', source: 'pos',
    table_id: id(3), customer_name: null, customer_phone: null,
    total_amount: 255000, note: null, created_at: T(25),
    items: [
      mockItem(8,  'Bánh Cuốn Thịt',  3, 3),
      mockItem(9,  'Phở Bò Tái',      2, 1),
      mockItem(10, 'Gỏi Cuốn',        4, 0),
    ],
  },
  // Bàn 04 — ready, 8 min (all done)
  {
    id: id(13), order_number: 'ORD-004', status: 'ready', source: 'qr',
    table_id: id(4), customer_name: null, customer_phone: null,
    total_amount: 90000, note: null, created_at: T(8),
    items: [
      mockItem(11, 'Bánh Cuốn Thịt', 2, 2),
      mockItem(12, 'Trà Đá',          2, 2),
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function elapsedMins(createdAt: string, now: number) {
  return Math.floor((now - new Date(createdAt).getTime()) / 60_000)
}

function isKitchenItem(item: OrderItem) {
  return !(item.combo_id !== null && item.combo_ref_id === null)
}

function itemCounts(items: OrderItem[]) {
  const kitchen = items.filter(isKitchenItem)
  let pending = 0, preparing = 0, done = 0, totalQty = 0, servedQty = 0
  for (const it of kitchen) {
    totalQty  += it.quantity
    servedQty += it.qty_served
    if (it.qty_served === 0)              pending++
    else if (it.qty_served < it.quantity) preparing++
    else                                  done++
  }
  return { pending, preparing, done, totalQty, servedQty }
}

function statusLabel(status: Order['status']) {
  switch (status) {
    case 'pending':   return 'Chờ xác nhận'
    case 'confirmed': return 'Đã xác nhận'
    case 'preparing': return 'Đang chuẩn bị'
    case 'ready':     return 'Sẵn sàng phục vụ'
    default:          return status
  }
}

function statusColors(status: Order['status']) {
  switch (status) {
    case 'ready':     return 'bg-green-100 text-green-700'
    case 'preparing': return 'bg-yellow-100 text-yellow-700'
    case 'confirmed': return 'bg-blue-100 text-blue-700'
    default:          return 'bg-gray-100 text-gray-600'
  }
}

interface WsMessage {
  type:        string
  order_id:    string
  item_id?:    string
  qty_served?: number
  status?:     string
}

const ACTIVE = new Set(['pending', 'confirmed', 'preparing', 'ready'])

// ── Order detail section inside a table card ─────────────────────────────────

function OrderDetail({
  order, now, onAction, loadingIds, onCheck, isChecked,
}: {
  order: Order
  now: number
  onAction: (orderId: string, status: string) => void
  loadingIds: Set<string>
  onCheck: () => void
  isChecked: boolean
}) {
  const mins = elapsedMins(order.created_at, now)
  const { pending, preparing, done, totalQty, servedQty } = itemCounts(order.items)
  const pct = totalQty > 0 ? Math.round((servedQty / totalQty) * 100) : 0

  const urgencyText = mins > 20 ? 'text-red-600' : mins >= 10 ? 'text-yellow-600' : 'text-green-600'
  const urgencyBg   = mins > 20 ? 'bg-red-50'   : mins >= 10 ? 'bg-yellow-50'   : 'bg-green-50'

  return (
    <div className="space-y-3">
      {/* Order header row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-800">{order.order_number}</p>
          <span className={`inline-block mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${statusColors(order.status)}`}>
            {statusLabel(order.status)}
          </span>
        </div>
        <div className={`shrink-0 text-right px-2 py-1 rounded-lg ${urgencyBg}`}>
          <p className={`text-sm font-bold ${urgencyText}`}>{mins} phút</p>
          <p className="text-xs text-gray-400">
            {new Date(order.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{servedQty}/{totalQty} phần đã ra</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              pct === 100 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-orange-400'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Mini counters */}
      <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
        <div className="bg-gray-50 rounded-md py-1.5">
          <p className="font-bold text-gray-700 text-base leading-none">{pending}</p>
          <p className="text-gray-400 mt-0.5">Chờ</p>
        </div>
        <div className="bg-yellow-50 rounded-md py-1.5">
          <p className="font-bold text-yellow-600 text-base leading-none">{preparing}</p>
          <p className="text-gray-400 mt-0.5">Đang làm</p>
        </div>
        <div className="bg-green-50 rounded-md py-1.5">
          <p className="font-bold text-green-600 text-base leading-none">{done}</p>
          <p className="text-gray-400 mt-0.5">Đã ra</p>
        </div>
      </div>

      {/* Item list */}
      <div className="space-y-1 border-t border-gray-100 pt-2">
        {order.items.filter(isKitchenItem).map(it => {
          const itDone = it.qty_served >= it.quantity
          const itPrep = it.qty_served > 0 && !itDone
          return (
            <div key={it.id} className="flex items-center gap-2 text-sm">
              {/* dot indicator */}
              <span className={`w-1.5 h-1.5 shrink-0 rounded-full ${
                itDone ? 'bg-green-400' : itPrep ? 'bg-yellow-400' : 'bg-gray-300'
              }`} />
              <span className={`flex-1 truncate ${itDone ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {it.name}
              </span>
              <span className={`shrink-0 text-xs font-medium tabular-nums ${
                itDone ? 'text-green-600' : itPrep ? 'text-yellow-600' : 'text-gray-400'
              }`}>
                {it.qty_served}/{it.quantity}
              </span>
            </div>
          )
        })}
      </div>

      {/* Kiểm tra + action buttons */}
      <div className="pt-2 border-t border-gray-100 space-y-1.5">
        <button
          onClick={onCheck}
          className={`w-full text-xs font-semibold py-1.5 rounded-lg transition-colors ${
            isChecked
              ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
          }`}
        >
          {isChecked ? '✓ Đang xem' : '🔍 Kiểm tra'}
        </button>
        {(order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready') && (
          <div className="flex items-center gap-1.5">
            {order.status === 'ready' && (
              <button
                disabled={loadingIds.has(order.id)}
                onClick={() => onAction(order.id, 'delivered')}
                className="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 transition-colors"
              >
                ✓ Hoàn thành
              </button>
            )}
            <button
              disabled={loadingIds.has(order.id)}
              onClick={() => onAction(order.id, 'cancelled')}
              className="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-50 transition-colors"
            >
              Huỷ
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Table card ────────────────────────────────────────────────────────────────

function TableCard({
  table, order, now, onAction, loadingIds, onCheck, isChecked,
}: {
  table: Table
  order: Order | undefined
  now: number
  onAction: (orderId: string, status: string) => void
  loadingIds: Set<string>
  onCheck: () => void
  isChecked: boolean
}) {
  const occupied = order !== undefined
  const mins = occupied ? elapsedMins(order.created_at, now) : 0
  const borderColor = !occupied
    ? 'border-gray-200'
    : mins > 20 ? 'border-red-400'
    : mins >= 10 ? 'border-yellow-400'
    : 'border-orange-400'

  return (
    <div className={`bg-white rounded-xl border-2 ${borderColor} shadow-sm flex flex-col`}>
      {/* Table header */}
      <div className={`px-4 py-3 rounded-t-xl flex items-center justify-between ${
        occupied ? 'bg-orange-50' : 'bg-gray-50'
      }`}>
        <div>
          <p className="font-bold text-gray-900">{table.name}</p>
          <p className="text-xs text-gray-400">{table.capacity} chỗ</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          occupied
            ? 'bg-orange-100 text-orange-700'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {occupied ? 'Đang phục vụ' : 'Trống'}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex-1">
        {occupied ? (
          <OrderDetail order={order} now={now} onAction={onAction} loadingIds={loadingIds} onCheck={onCheck} isChecked={isChecked} />
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-gray-300 select-none">
            <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 10h18M3 14h18M10 4v16M14 4v16" />
            </svg>
            <p className="text-xs">Chưa có đơn</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-1">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

// ── Prep panel — shows per-table dish detail + combined remaining summary ─────

function PrepPanel({ orders, tableMap }: { orders: Order[]; tableMap: Map<string, Table> }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  function toggleCollapse(orderId: string) {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(orderId) ? next.delete(orderId) : next.add(orderId)
      return next
    })
  }

  // Remaining summary across all checked orders
  const remainMap = new Map<string, { remaining: number; tables: string[] }>()
  for (const o of orders) {
    const tName = o.table_id ? (tableMap.get(o.table_id)?.name ?? '—') : '—'
    for (const it of o.items.filter(isKitchenItem)) {
      const rem = it.quantity - it.qty_served
      if (rem <= 0) continue
      const row = remainMap.get(it.name) ?? { remaining: 0, tables: [] }
      row.remaining += rem
      if (!row.tables.includes(tName)) row.tables.push(tName)
      remainMap.set(it.name, row)
    }
  }
  const summaryRows   = Array.from(remainMap.entries()).sort((a, b) => b[1].remaining - a[1].remaining)
  const totalRemaining = summaryRows.reduce((s, [, r]) => s + r.remaining, 0)

  return (
    <div className="bg-white border-2 border-indigo-300 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-200">
        <p className="text-sm font-bold text-indigo-800">Danh sách cần chuẩn bị</p>
        <p className="text-xs text-indigo-600 mt-0.5">
          {orders.length} bàn · {summaryRows.length} loại món · {totalRemaining} phần còn lại
        </p>
      </div>

      {/* ── Per-table dish detail ─────────────────────────────────────────── */}
      <div className="divide-y divide-gray-100">
        {orders.map(order => {
          const tableName   = order.table_id ? (tableMap.get(order.table_id)?.name ?? '—') : '—'
          const kitItems    = order.items.filter(isKitchenItem)
          const isCollapsed = collapsed.has(order.id)

          return (
            <div key={order.id} className="px-4 py-3">
              {/* Table row header — click to collapse */}
              <button
                type="button"
                onClick={() => toggleCollapse(order.id)}
                className="w-full flex items-center justify-between gap-2 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1 h-4 bg-indigo-400 rounded-full shrink-0" />
                  <span className="text-sm font-bold text-gray-900">{tableName}</span>
                  <span className="text-xs text-gray-400">{order.order_number}</span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${statusColors(order.status)}`}>
                    {statusLabel(order.status)}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dish rows with status */}
              {!isCollapsed && (
                <div className="space-y-1.5 pl-3 mt-2">
                  {kitItems.map(it => {
                    const rem    = it.quantity - it.qty_served
                    const itDone = rem <= 0
                    const itPrep = it.qty_served > 0 && !itDone
                    return (
                      <div key={it.id} className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          itDone ? 'bg-green-400' : itPrep ? 'bg-yellow-400' : 'bg-gray-300'
                        }`} />
                        <span className={`text-sm flex-1 ${itDone ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {it.name}
                        </span>
                        {it.note && (
                          <span className="text-xs italic text-orange-500 truncate max-w-[80px]">{it.note}</span>
                        )}
                        <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-md min-w-[52px] text-center ${
                          itDone
                            ? 'bg-green-50 text-green-600'
                            : itPrep
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {itDone ? '✓ xong' : `còn ×${rem}`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Combined remaining summary ────────────────────────────────────── */}
      {summaryRows.length > 0 && (
        <div className="border-t-2 border-indigo-200 bg-indigo-50">
          <div className="px-4 py-2.5 flex items-center gap-2 border-b border-indigo-100">
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Tổng cần làm</span>
            <span className="text-xs text-indigo-600">· {summaryRows.length} loại · {totalRemaining} phần còn lại</span>
          </div>
          <div className="px-4 py-3 space-y-1.5">
            {summaryRows.map(([name, row]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-800 flex-1">{name}</span>
                <span className="text-xs text-gray-400 shrink-0">{row.tables.join(', ')}</span>
                <span className="shrink-0 font-bold text-sm bg-indigo-500 text-white px-2.5 py-0.5 rounded-lg min-w-[36px] text-center">
                  ×{row.remaining}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {summaryRows.length === 0 && (
        <div className="px-4 py-4 text-center text-sm text-gray-400">
          Tất cả món đã ra hết.
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const token = useAuthStore(state => state.accessToken)
  const [orders, setOrders] = useState<Order[]>([])
  const [now, setNow] = useState(() => Date.now())
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
  const [checkedTableIds, setCheckedTableIds] = useState<Set<string>>(new Set())

  function toggleCheck(tableId: string) {
    setCheckedTableIds(prev => {
      const next = new Set(prev)
      next.has(tableId) ? next.delete(tableId) : next.add(tableId)
      return next
    })
  }

  async function handleAction(orderId: string, status: string) {
    setLoadingIds(prev => new Set(prev).add(orderId))
    try {
      if (USE_MOCK) {
        await new Promise(r => setTimeout(r, 350))
      } else {
        await updateOrderStatus(orderId, status)
      }
      if (status === 'cancelled' || status === 'delivered') {
        setOrders(prev => prev.filter(o => o.id !== orderId))
      } else {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as Order['status'] } : o))
      }
    } finally {
      setLoadingIds(prev => { const s = new Set(prev); s.delete(orderId); return s })
    }
  }

  // Tick every 30s so elapsed times stay fresh
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  const { data: tables = [] } = useQuery<Table[]>({
    queryKey: ['tables'],
    queryFn: USE_MOCK ? () => Promise.resolve(MOCK_TABLES) : listTables,
    staleTime: 60_000,
  })

  const { data: initialOrders } = useQuery<Order[]>({
    queryKey: ['orders', 'live'],
    queryFn: USE_MOCK ? () => Promise.resolve(MOCK_ORDERS) : listLiveOrders,
    staleTime: 15_000,
  })

  useEffect(() => {
    if (!initialOrders) return
    setOrders(USE_MOCK ? initialOrders : initialOrders.filter(o => ACTIVE.has(o.status)))
  }, [initialOrders])

  // WebSocket (skip in mock mode)
  useEffect(() => {
    if (USE_MOCK || !token) return
    const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1')
      .replace(/^https/, 'wss').replace(/^http/, 'ws')
    const url = `${base}/ws/orders-live?token=${encodeURIComponent(token)}`

    let stopped = false, attempts = 0
    let retryId: ReturnType<typeof setTimeout>
    let ws: WebSocket

    function connect() {
      ws = new WebSocket(url)
      ws.onopen = () => { attempts = 0 }

      ws.onmessage = async (evt: MessageEvent) => {
        let msg: WsMessage
        try { msg = JSON.parse(evt.data as string) } catch { return }

        switch (msg.type) {
          case 'new_order': {
            try {
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'}/orders/${msg.order_id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              ).then(r => r.json())
              const order: Order = res?.data ?? res
              if (ACTIVE.has(order.status))
                setOrders(prev => prev.find(o => o.id === order.id) ? prev : [order, ...prev])
            } catch { /* skip */ }
            break
          }
          case 'item_progress': {
            if (!msg.item_id) break
            setOrders(prev => prev.map(o =>
              o.id !== msg.order_id ? o : {
                ...o,
                items: o.items.map(i =>
                  i.id === msg.item_id ? { ...i, qty_served: msg.qty_served ?? i.qty_served } : i
                ),
              }
            ))
            break
          }
          case 'order_status_changed':
          case 'order_updated': {
            if (!msg.status) break
            if (!ACTIVE.has(msg.status))
              setOrders(prev => prev.filter(o => o.id !== msg.order_id))
            else
              setOrders(prev => prev.map(o =>
                o.id === msg.order_id ? { ...o, status: msg.status as Order['status'] } : o
              ))
            break
          }
          case 'order_cancelled':
          case 'order_completed':
            setOrders(prev => prev.filter(o => o.id !== msg.order_id))
            break
        }
      }

      ws.onclose = () => {
        if (stopped) return
        attempts++
        retryId = setTimeout(connect, Math.min(1000 * 2 ** (attempts - 1), 30_000))
      }
      ws.onerror = () => ws.close()
    }

    connect()
    return () => { stopped = true; clearTimeout(retryId); ws?.close() }
  }, [token])

  // Build table → order map (max 1 active order per table)
  const orderByTable = new Map<string, Order>()
  for (const o of orders) {
    if (o.table_id) orderByTable.set(o.table_id, o)
  }

  // Sort tables: occupied first, then by name
  const sortedTables = [...tables].sort((a, b) => {
    const aOcc = orderByTable.has(a.id) ? 0 : 1
    const bOcc = orderByTable.has(b.id) ? 0 : 1
    if (aOcc !== bOcc) return aOcc - bOcc
    return a.name.localeCompare(b.name, 'vi')
  })

  const occupied    = sortedTables.filter(t => orderByTable.has(t.id)).length
  const urgent      = orders.filter(o => elapsedMins(o.created_at, now) > 20).length
  const warning     = orders.filter(o => { const m = elapsedMins(o.created_at, now); return m >= 10 && m <= 20 }).length

  let totalPending = 0, totalPreparing = 0
  for (const o of orders) {
    const c = itemCounts(o.items)
    totalPending   += c.pending
    totalPreparing += c.preparing
  }

  // Tables with unconfirmed orders (need staff action)
  const waitingTables = sortedTables
    .filter(t => orderByTable.get(t.id)?.status === 'pending')
    .map(t => ({ table: t, order: orderByTable.get(t.id)! }))

  const tableMap = new Map(tables.map(t => [t.id, t]))

  // Orders for checked tables
  const checkedOrders = Array.from(checkedTableIds)
    .map(tid => orderByTable.get(tid))
    .filter((o): o is Order => o !== undefined)

  return (
    <div className="space-y-5">

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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Bàn đang phục vụ"   value={occupied}       sub={`/ ${tables.length} bàn`} />
        <StatCard label="Món chờ làm"         value={totalPending}   sub="Chưa bắt đầu" />
        <StatCard label="Món đang làm"        value={totalPreparing} sub="Đang chế biến" />
        <StatCard
          label="Khẩn cấp / Cảnh báo"
          value={`${urgent} / ${warning}`}
          sub=">20 phút / 10–20 phút"
        />
      </div>

      {/* ── Waiting tables ────────────────────────────────────────────────── */}
      {waitingTables.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-3">
          {/* Section header */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <p className="text-sm font-bold text-amber-800">
              {waitingTables.length} bàn chờ xác nhận
            </p>
          </div>

          {/* One card per waiting table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {waitingTables.map(({ table, order }) => {
              const mins     = elapsedMins(order.created_at, now)
              const kitItems = order.items.filter(isKitchenItem)
              const totalQty = kitItems.reduce((s, i) => s + i.quantity, 0)
              const loading  = loadingIds.has(order.id)

              return (
                <div
                  key={table.id}
                  className="rounded-xl p-4 space-y-3 border-2 bg-white border-amber-200 transition-colors"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-gray-900">{table.name}</p>
                      <p className="text-xs text-gray-400">{order.order_number} · {table.capacity} chỗ</p>
                    </div>
                    <div className="text-right bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                      <p className="text-sm font-bold text-amber-700">{mins} phút</p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Dish list */}
                  <div className="space-y-1.5 border-t border-amber-100 pt-2">
                    {kitItems.map(it => (
                      <div key={it.id} className="flex items-center justify-between gap-2">
                        <span className="text-sm text-gray-700 flex-1 truncate">{it.name}</span>
                        <span className="text-xs font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md shrink-0">
                          ×{it.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer: summary + action buttons */}
                  <div className="pt-1 border-t border-amber-100 space-y-2">
                    <p className="text-xs text-gray-400">{kitItems.length} món · {totalQty} phần</p>
                    <button
                      onClick={() => toggleCheck(table.id)}
                      className={`w-full text-xs font-semibold py-1.5 rounded-lg transition-colors ${
                        checkedTableIds.has(table.id)
                          ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {checkedTableIds.has(table.id) ? '✓ Đang xem' : '🔍 Kiểm tra'}
                    </button>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        disabled={loading}
                        onClick={() => handleAction(order.id, 'confirmed')}
                        className="text-xs font-semibold py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 transition-colors"
                      >
                        ✓ Phục vụ
                      </button>
                      <button
                        disabled={loading}
                        onClick={() => handleAction(order.id, 'confirmed')}
                        className="text-xs font-semibold py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 transition-colors"
                      >
                        🥡 Mang đi
                      </button>
                      <button
                        disabled={loading}
                        onClick={() => handleAction(order.id, 'cancelled')}
                        className="text-xs font-semibold py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-50 transition-colors"
                      >
                        Huỷ
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      )}

      {/* Standalone prep panel — shown when any table has Kiểm tra active */}
      {checkedOrders.length > 0 && (
        <PrepPanel orders={checkedOrders} tableMap={tableMap} />
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-2 border-orange-400 inline-block" /> Đang phục vụ (&lt;10 phút)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-2 border-yellow-400 inline-block" /> Cảnh báo (10–20 phút)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-2 border-red-400 inline-block" /> Khẩn cấp (&gt;20 phút)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-2 border-gray-200 inline-block" /> Trống
        </span>
      </div>

      {/* All-tables grid */}
      {tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-300">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-base font-medium text-gray-400">Chưa có bàn nào trong hệ thống</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedTables.map(table => (
            <TableCard
              key={table.id}
              table={table}
              order={orderByTable.get(table.id)}
              now={now}
              onAction={handleAction}
              loadingIds={loadingIds}
              onCheck={() => toggleCheck(table.id)}
              isChecked={checkedTableIds.has(table.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
