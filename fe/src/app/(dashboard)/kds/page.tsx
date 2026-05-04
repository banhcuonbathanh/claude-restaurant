'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/features/auth/auth.store'
import type { Order, OrderItem } from '@/types/order'

interface WsMessage {
  type:        string
  order_id:    string
  item_id?:    string
  qty_served?: number
  status?:     string
}

function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null)
  return useCallback(() => {
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext()
      const ctx  = ctxRef.current
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } catch { /* no audio context */ }
  }, [])
}

function elapsedMins(createdAt: string) {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000)
}

function urgencyBorderClass(order: Order): string {
  const mins = elapsedMins(order.created_at)
  if (mins > 20) return 'border-urgent'
  if (mins >= 10) return 'border-warning'
  return 'border-border'
}

function urgencyBarClass(mins: number): string {
  if (mins > 20) return 'bg-urgent'
  if (mins >= 10) return 'bg-warning'
  return 'bg-muted-fg'
}

function urgencyTextClass(mins: number): string {
  if (mins > 20) return 'text-urgent'
  if (mins >= 10) return 'text-warning'
  return 'text-muted-fg'
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending:   'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    preparing: 'Đang chuẩn bị',
    ready:     'Sẵn sàng',
    delivered: 'Đã phục vụ',
    cancelled: 'Đã huỷ',
  }
  return map[status] ?? status
}

function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-orange-100 text-orange-800',
    ready:     'bg-green-100 text-green-800',
    delivered: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-700',
  }
  return map[status] ?? 'bg-muted text-muted-fg'
}

function isKitchenItem(item: OrderItem): boolean {
  return !(item.combo_id !== null && item.combo_ref_id === null)
}

const ACTIVE_STATUSES = new Set(['pending', 'confirmed', 'preparing'])

export default function KDSPage() {
  const token = useAuthStore(state => state.accessToken)
  const beep  = useBeep()
  const [orders, setOrders] = useState<Order[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  const [collapsed,   setCollapsed]   = useState<Set<string>>(new Set())
  const [statusMenus, setStatusMenus] = useState<Set<string>>(new Set())
  const [flagged,     setFlagged]     = useState<Set<string>>(new Set())

  const { data: initial } = useQuery<Order[]>({
    queryKey: ['orders', 'kds-initial'],
    queryFn:  () => api.get('/orders').then(r => r.data?.data ?? r.data ?? []),
    staleTime: 30_000,
  })

  useEffect(() => {
    if (!initial) return
    setOrders((initial as Order[]).filter(o => ACTIVE_STATUSES.has(o.status)))
  }, [initial])

  useEffect(() => {
    if (!token) return

    const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1')
      .replace(/^https/, 'wss')
      .replace(/^http/, 'ws')
    const url = `${base}/ws/kds?token=${encodeURIComponent(token)}`

    let stopped  = false
    let attempts = 0
    let retryId: ReturnType<typeof setTimeout>
    let ws: WebSocket

    function connect() {
      ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => { attempts = 0 }

      ws.onmessage = async (evt: MessageEvent) => {
        let msg: WsMessage
        try { msg = JSON.parse(evt.data as string) }
        catch { return }

        switch (msg.type) {
          case 'new_order': {
            try {
              const { data } = await api.get(`/orders/${msg.order_id}`)
              const order: Order = data?.data ?? data
              setOrders(prev =>
                prev.find(o => o.id === order.id) ? prev : [order, ...prev]
              )
              beep()
            } catch { /* skip */ }
            break
          }
          case 'item_progress': {
            if (!msg.item_id) break
            setOrders(prev =>
              prev.map(o =>
                o.id !== msg.order_id ? o : {
                  ...o,
                  items: o.items.map(i =>
                    i.id === msg.item_id
                      ? { ...i, qty_served: msg.qty_served ?? i.qty_served }
                      : i
                  ),
                }
              )
            )
            break
          }
          case 'order_cancelled': {
            setOrders(prev => prev.filter(o => o.id !== msg.order_id))
            break
          }
          case 'order_status_changed': {
            if (msg.status && !ACTIVE_STATUSES.has(msg.status)) {
              setOrders(prev => prev.filter(o => o.id !== msg.order_id))
            }
            break
          }
        }
      }

      ws.onclose = () => {
        if (stopped) return
        attempts++
        const delay = Math.min(1000 * Math.pow(2, attempts - 1), 30_000)
        retryId = setTimeout(connect, delay)
      }

      ws.onerror = () => ws.close()
    }

    connect()
    return () => {
      stopped = true
      clearTimeout(retryId)
      ws?.close()
    }
  }, [token, beep])

  const patchItemStatus = useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: string; itemId: string }) =>
      api.patch(`/orders/${orderId}/items/${itemId}/status`, {}),
    onError: () => toast.error('Không thể cập nhật món'),
  })

  const patchOrderStatus = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      api.patch(`/orders/${orderId}/status`, { status }),
    onSuccess: (_, { orderId }) => {
      setOrders(prev => prev.filter(o => o.id !== orderId))
      setStatusMenus(prev => { const n = new Set(prev); n.delete(orderId); return n })
      toast.success('Đã cập nhật đơn')
    },
    onError: () => toast.error('Không thể thay đổi trạng thái'),
  })

  function toggle<T extends string>(set: Set<T>, id: T): Set<T> {
    const next = new Set(set)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-fg text-xl">Không có đơn nào đang chờ 🍜</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <h1 className="text-foreground font-bold text-2xl mb-6">KDS — Bếp</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {orders.map(order => {
          const mins       = elapsedMins(order.created_at)
          const kitItems   = order.items.filter(isKitchenItem)
          const totalItems = kitItems.length
          const remaining  = kitItems.reduce((s, i) => s + Math.max(0, i.quantity - i.qty_served), 0)
          const isCollapsed   = collapsed.has(order.id)
          const isStatusOpen  = statusMenus.has(order.id)
          const isFlagged     = flagged.has(order.id)

          return (
            <div
              key={order.id}
              className={`bg-card rounded-xl border-2 p-3 space-y-2 ${
                isFlagged ? 'border-urgent' : urgencyBorderClass(order)
              }`}
            >
              {/* Header row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`w-1 h-5 rounded-full flex-shrink-0 ${urgencyBarClass(mins)}`} />
                <span className="font-bold text-foreground text-sm">
                  {order.table_id ? `Bàn ${order.table_id}` : 'Mang về'}
                </span>
                <span className="text-xs text-muted-fg">{order.order_number}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadgeClass(order.status)}`}>
                  {statusLabel(order.status)}
                </span>
                <span className={`ml-auto text-sm font-semibold ${urgencyTextClass(mins)}`}>
                  {mins} phút
                </span>
              </div>

              {/* Items — collapsible */}
              {!isCollapsed && (
                <div className="pl-3 space-y-1">
                  {kitItems.map(item => {
                    const rem  = item.quantity - item.qty_served
                    const done = rem <= 0
                    return (
                      <div
                        key={item.id}
                        role="button"
                        onClick={() => patchItemStatus.mutate({ orderId: order.id, itemId: item.id })}
                        className="flex items-center gap-2 cursor-pointer py-0.5 select-none"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${done ? 'bg-green-500' : 'bg-muted-fg'}`} />
                        <span className={`flex-1 text-sm ${done ? 'line-through text-muted-fg' : 'text-foreground'}`}>
                          {item.name}
                        </span>
                        {done
                          ? <span className="text-xs text-green-600 font-medium">✓</span>
                          : <span className="text-xs bg-muted text-foreground px-2 py-0.5 rounded font-medium">còn ×{rem}</span>
                        }
                      </div>
                    )
                  })}
                  <p className="text-xs text-muted-fg pt-0.5">
                    {totalItems} món · {remaining} phần còn lại
                  </p>
                </div>
              )}

              {/* Inline status picker */}
              {isStatusOpen && (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => patchOrderStatus.mutate({ orderId: order.id, status: 'ready' })}
                    className="flex-1 py-1.5 text-xs bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    ✓ Phục vụ
                  </button>
                  <button
                    onClick={() => patchOrderStatus.mutate({ orderId: order.id, status: 'ready' })}
                    className="flex-1 py-1.5 text-xs bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    🛍 Mang đi
                  </button>
                  <button
                    onClick={() => patchOrderStatus.mutate({ orderId: order.id, status: 'cancelled' })}
                    className="flex-1 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                  >
                    Huỷ
                  </button>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-1.5">
                {/* Kiểm tra — flag card for attention */}
                <button
                  onClick={() => setFlagged(prev => toggle(prev, order.id))}
                  className={`flex-1 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                    isFlagged
                      ? 'bg-amber-100 text-amber-700 border-amber-300'
                      : 'bg-muted text-foreground border-border hover:bg-muted/70'
                  }`}
                >
                  🔍 Kiểm tra
                </button>

                {/* Status change toggle */}
                <button
                  onClick={() => setStatusMenus(prev => toggle(prev, order.id))}
                  className={`flex-1 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                    isStatusOpen
                      ? 'bg-primary text-primary-fg border-primary'
                      : 'bg-muted text-foreground border-border hover:bg-muted/70'
                  }`}
                >
                  Trạng thái {isStatusOpen ? '▲' : '▼'}
                </button>

                {/* Show/hide dishes */}
                <button
                  onClick={() => setCollapsed(prev => toggle(prev, order.id))}
                  className="px-3 py-1.5 text-xs rounded-lg font-medium border bg-muted text-foreground border-border hover:bg-muted/70 transition-colors"
                  title={isCollapsed ? 'Hiện món' : 'Ẩn món'}
                >
                  {isCollapsed ? '▼' : '▲'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
