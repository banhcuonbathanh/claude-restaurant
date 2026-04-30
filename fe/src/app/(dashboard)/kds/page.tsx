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

function urgencyClass(order: Order): string {
  const mins = elapsedMins(order.created_at)
  if (mins > 20) return 'border-urgent'
  if (mins >= 10) return 'border-warning'
  return 'border-border'
}

function urgencyTextClass(mins: number): string {
  if (mins > 20) return 'text-urgent'
  if (mins >= 10) return 'text-warning'
  return 'text-muted-fg'
}

// Sub-items (combo children) + regular product items; exclude combo parent rows
function isKitchenItem(item: OrderItem): boolean {
  return !(item.combo_id !== null && item.combo_ref_id === null)
}

const ACTIVE_STATUSES = new Set(['pending', 'confirmed', 'preparing'])

export default function KDSPage() {
  const token    = useAuthStore(state => state.accessToken)
  const beep     = useBeep()
  const [orders, setOrders] = useState<Order[]>([])
  const wsRef    = useRef<WebSocket | null>(null)

  // Initial load: fetch all orders and filter to active
  const { data: initial } = useQuery<Order[]>({
    queryKey: ['orders', 'kds-initial'],
    queryFn:  () => api.get('/orders').then(r => r.data?.data ?? r.data ?? []),
    staleTime: 30_000,
  })

  useEffect(() => {
    if (!initial) return
    setOrders((initial as Order[]).filter(o => ACTIVE_STATUSES.has(o.status)))
  }, [initial])

  // WebSocket — reconnect with exponential backoff
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
                prev.find(o => o.id === order.id)
                  ? prev
                  : [order, ...prev]
              )
              beep()
            } catch { /* skip if fetch fails */ }
            break
          }
          case 'item_progress': {
            if (!msg.item_id) break
            setOrders(prev =>
              prev.map(o =>
                o.id !== msg.order_id
                  ? o
                  : {
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
            // Remove when order transitions out of active states
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

  const patchStatus = useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: string; itemId: string }) =>
      api.patch(`/orders/${orderId}/items/${itemId}/status`, {}),
    onError: () => toast.error('Không thể cập nhật trạng thái'),
  })

  const patchFlag = useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: string; itemId: string }) =>
      api.patch(`/orders/${orderId}/items/${itemId}/flag`, {}),
    onSuccess: (_, { orderId, itemId }) => {
      setOrders(prev =>
        prev.map(o =>
          o.id !== orderId
            ? o
            : {
                ...o,
                items: o.items.map(i =>
                  i.id === itemId ? { ...i, flagged: !i.flagged } : i
                ),
              }
        )
      )
    },
    onError: () => toast.error('Không thể đánh dấu'),
  })

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
          const mins  = elapsedMins(order.created_at)
          const kitItems = order.items.filter(isKitchenItem)

          return (
            <div
              key={order.id}
              className={`bg-card rounded-xl border-2 ${urgencyClass(order)} p-4 space-y-3 flex flex-col`}
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-foreground">{order.order_number}</p>
                  {order.table_id && (
                    <p className="text-sm text-muted-fg">Bàn {order.table_id}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${urgencyTextClass(mins)}`}>
                    {mins} phút
                  </p>
                  <p className="text-xs text-muted-fg">
                    {new Date(order.created_at).toLocaleTimeString('vi-VN', {
                      hour:   '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2 flex-1">
                {kitItems.map(item => {
                  const done       = item.qty_served >= item.quantity
                  const preparing  = item.qty_served > 0 && !done

                  return (
                    <div
                      key={item.id}
                      role="button"
                      onClick={() =>
                        patchStatus.mutate({ orderId: order.id, itemId: item.id })
                      }
                      className={`rounded-lg p-3 cursor-pointer select-none transition-colors ${
                        done
                          ? 'bg-green-900/30 opacity-60'
                          : preparing
                          ? 'bg-yellow-900/30'
                          : 'bg-muted hover:bg-muted/70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium ${
                              done
                                ? 'line-through text-muted-fg'
                                : 'text-foreground'
                            }`}
                          >
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-fg mt-0.5">
                            {item.qty_served}/{item.quantity} phần
                          </p>
                        </div>

                        {/* Flag toggle */}
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation()
                            patchFlag.mutate({ orderId: order.id, itemId: item.id })
                          }}
                          className={`text-base p-1 rounded transition-colors ${
                            item.flagged
                              ? 'text-urgent'
                              : 'text-muted-fg hover:text-urgent'
                          }`}
                          title="Đánh dấu khẩn"
                        >
                          🚩
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
