'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/auth.store'
import { listLiveOrders, listTables, updateOrderStatus, type Table } from '@/features/admin/admin.api'
import type { Order, OrderItem } from '@/types/order'
import { formatVND } from '@/lib/utils'
import { useAdminSSE } from '@/hooks/useAdminSSE'
import { api } from '@/lib/api-client'

// ── Mock data (set USE_MOCK = false to use real API) ──────────────────────────

const USE_MOCK = false

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
    note: null, toppings_snapshot: null, flagged: false,
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

const FAKE_DISHES = [
  { name: 'Bánh Cuốn Thịt',  price: 45000 },
  { name: 'Bánh Cuốn Tôm',   price: 50000 },
  { name: 'Nem Rán',          price: 35000 },
  { name: 'Chả Giò',          price: 35000 },
  { name: 'Chả Quế',          price: 30000 },
  { name: 'Bún Bò Huế',       price: 55000 },
  { name: 'Gỏi Cuốn',         price: 40000 },
  { name: 'Phở Bò Tái',       price: 60000 },
  { name: 'Chả Lụa',          price: 25000 },
  { name: 'Nước Chanh',        price: 20000 },
  { name: 'Trà Đá',            price: 10000 },
  { name: 'Nước Cam',          price: 25000 },
]
function makeFakeOrder(tableId: string, orderIndex: number): Order {
  const dishCount = 2 + Math.floor(Math.random() * 3)
  const shuffled  = [...FAKE_DISHES].sort(() => Math.random() - 0.5).slice(0, dishCount)
  const items: OrderItem[] = shuffled.map((d, i) => ({
    id:              crypto.randomUUID(),
    product_id:      crypto.randomUUID(),
    combo_id:        null,
    combo_ref_id:    null,
    name:            d.name,
    quantity:        1 + Math.floor(Math.random() * 3),
    qty_served:      0,
    unit_price:      d.price,
    note:            null,
    toppings_snapshot: null,
    flagged:         false,
  }))
  const total = items.reduce((s, i) => s + i.unit_price * i.quantity, 0)
  return {
    id:             crypto.randomUUID(),
    order_number:   `ORD-F${String(orderIndex).padStart(3, '0')}`,
    status:         'pending',
    source:         Math.random() > 0.5 ? 'qr' : 'pos',
    table_id:       tableId,
    customer_name:  null,
    customer_phone: null,
    total_amount:   total,
    note:           Math.random() > 0.7 ? 'Ít cay' : null,
    created_at:     new Date(Date.now() - Math.floor(Math.random() * 4) * 60_000).toISOString(),
    items,
  }
}

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

function EmptyTableCard({ table }: { table: Table }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
      <div>
        <p className="font-semibold text-gray-700 text-sm">{table.name}</p>
        <p className="text-xs text-gray-400">{table.capacity} chỗ</p>
      </div>
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Trống</span>
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
  const [collapsed,       setCollapsed]       = useState<Set<string>>(new Set())
  const [summaryVisible,  setSummaryVisible]  = useState(true)

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
          <button
            type="button"
            onClick={() => setSummaryVisible(v => !v)}
            className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-indigo-100/60 transition-colors text-left"
          >
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Tổng cần làm</span>
            <span className="text-xs text-indigo-600">· {summaryRows.length} loại · {totalRemaining} phần còn lại</span>
            <svg
              className={`ml-auto w-4 h-4 text-indigo-400 shrink-0 transition-transform ${summaryVisible ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {summaryVisible && (
            <div className="px-4 pb-3 space-y-1.5">
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
          )}
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

// ── New-order popup ───────────────────────────────────────────────────────────

interface NewOrderPopupProps {
  order:     Order
  onConfirm: () => void
  onDismiss: () => void
  loading:   boolean
}

function NewOrderPopup({ order, onConfirm, onDismiss, loading }: NewOrderPopupProps) {
  const kitItems = order.items.filter(i => !(i.combo_id !== null && i.combo_ref_id === null))
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-lg">Đơn hàng mới!</p>
              <p className="text-indigo-200 text-sm">{order.order_number}</p>
            </div>
            {order.table_id && (
              <span className="bg-white/20 text-white font-bold text-sm px-3 py-1.5 rounded-lg">
                Bàn {order.table_id}
              </span>
            )}
          </div>
        </div>

        {/* Items list */}
        <div className="px-5 py-4 max-h-64 overflow-y-auto space-y-2">
          {kitItems.map(it => (
            <div key={it.id} className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
              <span className="flex-1 text-sm text-gray-800">{it.name}</span>
              <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                ×{it.quantity}
              </span>
              <span className="text-xs text-gray-500 w-20 text-right">{formatVND(it.unit_price * it.quantity)}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
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
  const token = useAuthStore(state => state.accessToken)
  const [orders, setOrders] = useState<Order[]>([])
  const [now, setNow] = useState(() => Date.now())
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
  const [checkedTableIds, setCheckedTableIds] = useState<Set<string>>(new Set())
  const [waitingCollapsed,   setWaitingCollapsed]   = useState<Set<string>>(new Set())
  const [waitingStatusMenus, setWaitingStatusMenus] = useState<Set<string>>(new Set())
  const [waitingFlagged,     setWaitingFlagged]     = useState<Set<string>>(new Set())
  const [occupiedCollapsed,      setOccupiedCollapsed]      = useState<Set<string>>(new Set())
  const [occupiedStatusMenus,    setOccupiedStatusMenus]    = useState<Set<string>>(new Set())
  const [occupiedSummaryVisible, setOccupiedSummaryVisible] = useState(true)
  const [popupOrder,  setPopupOrder]  = useState<Order | null>(null)
  const [popupLoading, setPopupLoading] = useState(false)
  const fakeOrderIdx = useRef(0)

  const handleNewOrder = useCallback(async (evt: { order_id: string }) => {
    try {
      const res = await api.get(`/orders/${evt.order_id}`)
      const order: Order = res.data?.data ?? res.data
      if (ACTIVE.has(order.status)) {
        setOrders(prev => prev.find(o => o.id === order.id) ? prev : [order, ...prev])
        setPopupOrder(order)
      }
    } catch { /* skip */ }
  }, [])

  useAdminSSE({ token: USE_MOCK ? null : token, onNewOrder: handleNewOrder })

  async function handleConfirmPopup() {
    if (!popupOrder) return
    setPopupLoading(true)
    try {
      if (!USE_MOCK) await api.patch(`/orders/${popupOrder.id}/status`, { status: 'confirmed' })
      setOrders(prev => prev.map(o => o.id === popupOrder.id ? { ...o, status: 'confirmed' } : o))
    } finally {
      setPopupLoading(false)
      setPopupOrder(null)
    }
  }

  function toggleSet(prev: Set<string>, id: string): Set<string> {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  }

  function addFakeOrder(currentTables: Table[], currentOrders: Order[]) {
    const occupiedIds = new Set(currentOrders.map(o => o.table_id).filter(Boolean))
    const freeTables  = currentTables.filter(t => !occupiedIds.has(t.id))
    if (freeTables.length === 0) return
    const table = freeTables[Math.floor(Math.random() * freeTables.length)]
    const order = makeFakeOrder(table.id, ++fakeOrderIdx.current)
    setOrders(prev => [order, ...prev])
    setPopupOrder(order)
  }

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
        <div className="flex items-center gap-3">
          {USE_MOCK && (
            <button
              onClick={() => addFakeOrder(tables, orders)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-violet-100 hover:bg-violet-200 text-violet-700 transition-colors"
            >
              + Thêm đơn thử
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-500">Live</span>
          </div>
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

      {/* ── Waiting tables — list style ───────────────────────────────────── */}
      {waitingTables.length > 0 && (() => {
        const allKitItems  = waitingTables.flatMap(({ order }) => order.items.filter(isKitchenItem))
        const dishTypes    = new Set(allKitItems.map(i => i.name)).size
        const totalRemain  = allKitItems.reduce((s, i) => s + Math.max(0, i.quantity - i.qty_served), 0)

        return (
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-indigo-100">
              <p className="text-sm font-bold text-indigo-800">Danh sách cần chuẩn bị</p>
              <p className="text-xs text-indigo-500 mt-0.5">
                {waitingTables.length} bàn · {dishTypes} loại món · {totalRemain} phần còn lại
              </p>
            </div>

            {/* Rows */}
            <div className="divide-y divide-indigo-100">
              {waitingTables.map(({ table, order }) => {
                const mins        = elapsedMins(order.created_at, now)
                const kitItems    = order.items.filter(isKitchenItem)
                const totalItems  = kitItems.length
                const remaining   = kitItems.reduce((s, i) => s + Math.max(0, i.quantity - i.qty_served), 0)
                const loading     = loadingIds.has(order.id)
                const isExpanded   = !waitingCollapsed.has(order.id)
                const isStatusOpen = waitingStatusMenus.has(order.id)
                const isFlagged    = waitingFlagged.has(order.id)

                const barColor  = mins > 20 ? 'bg-red-400'   : mins >= 10 ? 'bg-yellow-400' : 'bg-indigo-400'

                return (
                  <div key={table.id} className={isFlagged ? 'bg-amber-50' : ''}>
                    {/* Row header — click to expand/collapse */}
                    <button
                      type="button"
                      onClick={() => setWaitingCollapsed(prev => toggleSet(prev, order.id))}
                      className="w-full px-4 py-3 flex items-center gap-2 text-left hover:bg-indigo-100/50 transition-colors"
                    >
                      <span className={`w-1 h-5 rounded-full shrink-0 ${barColor}`} />
                      <span className="font-bold text-gray-900 text-sm">{table.name}</span>
                      <span className="text-xs text-gray-400">{order.order_number}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors(order.status)}`}>
                        {statusLabel(order.status)}
                      </span>
                      <svg
                        className={`ml-auto w-4 h-4 text-gray-400 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="px-4 pb-3 space-y-2">
                        {/* Item list */}
                        <div className="pl-3 space-y-1">
                          {kitItems.map(it => {
                            const rem  = it.quantity - it.qty_served
                            const done = rem <= 0
                            return (
                              <div key={it.id} className="flex items-center gap-2 py-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${done ? 'bg-green-400' : 'bg-gray-300'}`} />
                                <span className={`flex-1 text-sm ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                  {it.name}
                                </span>
                                {done
                                  ? <span className="text-xs text-green-600 font-medium">✓</span>
                                  : <span className="text-xs bg-white text-gray-700 px-2 py-0.5 rounded font-medium border border-gray-200">còn ×{rem}</span>
                                }
                              </div>
                            )
                          })}
                          <p className="text-xs text-gray-400 pt-0.5">{totalItems} món · {remaining} phần còn lại</p>
                        </div>

                        {/* Inline status picker */}
                        {isStatusOpen && (
                          <div className="flex gap-1.5">
                            <button
                              disabled={loading}
                              onClick={() => handleAction(order.id, 'confirmed')}
                              className="flex-1 py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                            >
                              ✓ Phục vụ
                            </button>
                            <button
                              disabled={loading}
                              onClick={() => handleAction(order.id, 'confirmed')}
                              className="flex-1 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                            >
                              🥡 Mang đi
                            </button>
                            <button
                              disabled={loading}
                              onClick={() => handleAction(order.id, 'cancelled')}
                              className="flex-1 py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium disabled:opacity-50 transition-colors"
                            >
                              Huỷ
                            </button>
                          </div>
                        )}

                        {/* 3 action buttons */}
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              setWaitingFlagged(prev => toggleSet(prev, order.id))
                              toggleCheck(table.id)
                            }}
                            className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                              isFlagged
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            🔍 Kiểm tra
                          </button>
                          <button
                            onClick={() => setWaitingStatusMenus(prev => toggleSet(prev, order.id))}
                            className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                              isStatusOpen
                                ? 'bg-indigo-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            Trạng thái {isStatusOpen ? '▲' : '▼'}
                          </button>
                          <button
                            onClick={() => setWaitingCollapsed(prev => toggleSet(prev, order.id))}
                            className="px-3 py-1.5 text-xs rounded-lg font-medium bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            ▲
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* Standalone prep panel — shown when any table has Kiểm tra active */}
      {checkedOrders.length > 0 && (
        <PrepPanel orders={checkedOrders} tableMap={tableMap} />
      )}

      {/* ── Đang phục vụ — list style ─────────────────────────────────────── */}
      {(() => {
        const occupiedTables = sortedTables.filter(t => orderByTable.has(t.id))
        if (occupiedTables.length === 0) return null

        return (
          <div className="rounded-xl bg-orange-50 border border-orange-100 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-orange-100">
              <p className="text-sm font-bold text-orange-800">Đang phục vụ</p>
              <p className="text-xs text-orange-500 mt-0.5">
                {occupiedTables.length} bàn đang có khách
              </p>
            </div>

            <div className="divide-y divide-orange-100">
              {(() => {
                const allKit    = occupiedTables.flatMap(t => orderByTable.get(t.id)!.items.filter(isKitchenItem))
                const remainMap = new Map<string, { remaining: number; tables: string[] }>()
                for (const t of occupiedTables) {
                  const o = orderByTable.get(t.id)!
                  for (const it of o.items.filter(isKitchenItem)) {
                    const rem = it.quantity - it.qty_served
                    if (rem <= 0) continue
                    const row = remainMap.get(it.name) ?? { remaining: 0, tables: [] }
                    row.remaining += rem
                    if (!row.tables.includes(t.name)) row.tables.push(t.name)
                    remainMap.set(it.name, row)
                  }
                }
                const rows         = Array.from(remainMap.entries()).sort((a, b) => b[1].remaining - a[1].remaining)
                const totalRemain  = rows.reduce((s, [, r]) => s + r.remaining, 0)
                if (rows.length === 0) return null
                return (
                  <div className="border-b border-orange-100 bg-orange-100/40">
                    <button
                      type="button"
                      onClick={() => setOccupiedSummaryVisible(v => !v)}
                      className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-orange-100/60 transition-colors text-left"
                    >
                      <span className="text-xs font-bold text-orange-800 uppercase tracking-wide">Tổng cần làm</span>
                      <span className="text-xs text-orange-600">· {rows.length} loại · {totalRemain} phần còn lại</span>
                      <svg
                        className={`ml-auto w-4 h-4 text-orange-400 shrink-0 transition-transform ${occupiedSummaryVisible ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {occupiedSummaryVisible && (
                      <div className="px-4 pb-3 space-y-1">
                        {rows.map(([name, row]) => (
                          <div key={name} className="flex items-center gap-2">
                            <span className="flex-1 text-sm text-gray-700">{name}</span>
                            <span className="text-xs text-gray-400 shrink-0">{row.tables.join(', ')}</span>
                            <span className="shrink-0 font-bold text-sm bg-orange-500 text-white px-2 py-0.5 rounded-lg min-w-[36px] text-center">
                              ×{row.remaining}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}

              {occupiedTables.map(table => {
                const order       = orderByTable.get(table.id)!
                const mins        = elapsedMins(order.created_at, now)
                const kitItems    = order.items.filter(isKitchenItem)
                const { totalQty, servedQty } = itemCounts(order.items)
                const isExpanded   = !occupiedCollapsed.has(table.id)
                const isStatusOpen = occupiedStatusMenus.has(table.id)
                const loading      = loadingIds.has(order.id)

                const barColor  = mins > 20 ? 'bg-red-400' : mins >= 10 ? 'bg-yellow-400' : 'bg-orange-400'
                const timeColor = mins > 20 ? 'text-red-600' : mins >= 10 ? 'text-yellow-600' : 'text-orange-600'

                function nextActions() {
                  switch (order.status) {
                    case 'pending':   return [{ label: '✓ Xác nhận',      status: 'confirmed', cls: 'bg-blue-500 hover:bg-blue-600 text-white' }]
                    case 'confirmed': return [{ label: '🍳 Bắt đầu làm', status: 'preparing', cls: 'bg-yellow-500 hover:bg-yellow-600 text-white' }]
                    case 'preparing': return [{ label: '✓ Hoàn thành bếp', status: 'ready',   cls: 'bg-green-500 hover:bg-green-600 text-white' }]
                    case 'ready':     return [{ label: '🛎 Đã phục vụ',   status: 'delivered', cls: 'bg-green-600 hover:bg-green-700 text-white' }]
                    default:          return []
                  }
                }

                return (
                  <div key={table.id}>
                    {/* Row header */}
                    <button
                      type="button"
                      onClick={() => setOccupiedCollapsed(prev => toggleSet(prev, table.id))}
                      className="w-full px-4 py-3 flex items-center gap-2 text-left hover:bg-orange-100/50 transition-colors"
                    >
                      <span className={`w-1 h-5 rounded-full shrink-0 ${barColor}`} />
                      <span className="font-bold text-gray-900 text-sm">{table.name}</span>
                      <span className="text-xs text-gray-400">{order.order_number}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors(order.status)}`}>
                        {statusLabel(order.status)}
                      </span>
                      <span className="ml-auto text-sm font-semibold text-gray-700 shrink-0">{formatVND(order.total_amount)}</span>
                      <span className={`text-sm font-bold shrink-0 ${timeColor}`}>{mins} phút</span>
                      <svg
                        className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="px-4 pb-3 space-y-2">
                        {/* Dish list with full detail */}
                        <div className="space-y-1.5">
                          {kitItems.map(it => {
                            const rem    = it.quantity - it.qty_served
                            const done   = rem <= 0
                            const inProg = it.qty_served > 0 && !done
                            return (
                              <div key={it.id} className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  done ? 'bg-green-400' : inProg ? 'bg-yellow-400' : 'bg-gray-300'
                                }`} />
                                <span className={`flex-1 text-sm ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                  {it.name}
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">
                                    tổng ×{it.quantity}
                                  </span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                    it.qty_served === 0 ? 'bg-gray-50 text-gray-400'
                                    : done ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    ra ×{it.qty_served}
                                  </span>
                                  {!done && (
                                    <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">
                                      còn ×{rem}
                                    </span>
                                  )}
                                  {done && (
                                    <span className="text-xs text-green-600 font-medium">✓</span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                          <p className="text-xs text-gray-400 pt-0.5">
                            {servedQty}/{totalQty} phần đã ra
                          </p>
                        </div>

                        {/* Inline status picker */}
                        {isStatusOpen && (
                          <div className="flex gap-1.5">
                            {nextActions().map(a => (
                              <button
                                key={a.status}
                                disabled={loading}
                                onClick={() => {
                                  handleAction(order.id, a.status)
                                  setOccupiedStatusMenus(prev => toggleSet(prev, table.id))
                                }}
                                className={`flex-1 py-1.5 text-xs rounded-lg font-medium disabled:opacity-50 transition-colors ${a.cls}`}
                              >
                                {a.label}
                              </button>
                            ))}
                            <button
                              disabled={loading}
                              onClick={() => handleAction(order.id, 'cancelled')}
                              className="flex-1 py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium disabled:opacity-50 transition-colors"
                            >
                              Huỷ
                            </button>
                          </div>
                        )}

                        {/* Trạng thái button only */}
                        <button
                          onClick={() => setOccupiedStatusMenus(prev => toggleSet(prev, table.id))}
                          className={`w-full py-1.5 text-xs rounded-lg font-medium transition-colors ${
                            isStatusOpen
                              ? 'bg-orange-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Trạng thái {isStatusOpen ? '▲' : '▼'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* ── Bàn trống ─────────────────────────────────────────────────────── */}
      {(() => {
        const emptyTables = sortedTables.filter(t => !orderByTable.has(t.id))
        if (emptyTables.length === 0) return null
        return (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Bàn trống ({emptyTables.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {emptyTables.map(t => <EmptyTableCard key={t.id} table={t} />)}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
