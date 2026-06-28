'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api-client'
import { useOrdersWSContext } from '@/context/OrdersWSContext'
import { type Order, type OrderItem } from '@/types/order'

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

// Prep variant the chef needs: for canh, "có rau" / "không rau". Canh is its own
// product per variant ("Canh có rau" / "Canh không rau"), so the name is the source
// of truth; legacy generic "Canh" falls back to the Rau topping / note.
function kdsVariant(item: OrderItem): string {
  const names = (item.toppings_snapshot ?? []).map(t => t.name)
  const lowerName = item.name.toLowerCase()
  if (lowerName.includes('canh')) {
    if (lowerName.includes('không')) return 'không rau'
    if (lowerName.includes('rau'))   return 'có rau'
    const hasRau = names.some(n => n.toLowerCase().includes('rau'))
    if (hasRau) return 'có rau'
    if (item.note) return item.note   // legacy fallback
    return 'không rau'
  }
  if (names.length > 0) return names.join(', ')
  return ''
}

const ACTIVE_STATUSES = new Set(['pending', 'confirmed', 'preparing'])

export default function KDSPage() {
  const beep  = useBeep()
  const [orders, setOrders] = useState<Order[]>([])

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

  // Subscribe to shared WS connection (one connection per browser session)
  const { subscribe } = useOrdersWSContext()
  useEffect(() => {
    return subscribe(async msg => {
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
    })
  }, [subscribe, beep])

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

              {/* Items — always visible */}
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
                        {kdsVariant(item) && (
                          <span className="ml-1.5 text-[11px] text-primary font-medium">· {kdsVariant(item)}</span>
                        )}
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

              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
