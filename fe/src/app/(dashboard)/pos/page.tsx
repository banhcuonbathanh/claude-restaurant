'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/features/auth/auth.store'
import { AuthGuard } from '@/components/guards/AuthGuard'
import { RoleGuard } from '@/components/guards/RoleGuard'
import { CategoryTabs } from '@/components/menu/CategoryTabs'
import { Role } from '@/types/auth'
import { formatVND } from '@/lib/utils'
import type { Category, Product } from '@/types/product'
import type { Order } from '@/types/order'

interface PosCartItem {
  product_id: string
  name:       string
  quantity:   number
  price:      number
}

interface WsMsg {
  type:     string
  order_id: string
}

export default function POSPage() {
  return (
    <AuthGuard>
      <RoleGuard minRole={Role.CASHIER}>
        <POSContent />
      </RoleGuard>
    </AuthGuard>
  )
}

function POSContent() {
  const router   = useRouter()
  const token    = useAuthStore(s => s.accessToken)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cart,        setCart]        = useState<PosCartItem[]>([])
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn:  () => api.get('/categories').then(r => r.data?.data ?? r.data ?? []),
    staleTime: 5 * 60 * 1000,
  })

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products', selectedCategory],
    queryFn:  () =>
      api.get('/products', { params: selectedCategory ? { category_id: selectedCategory } : {} })
        .then(r => r.data?.data ?? r.data ?? []),
    staleTime: 5 * 60 * 1000,
  })

  // WS — monitor order status when an active order exists
  useEffect(() => {
    if (!token || !activeOrder) return

    const orderId = activeOrder.id  // capture for closure

    const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1')
      .replace(/^https/, 'wss')
      .replace(/^http/, 'ws')
    const url = `${base}/ws/orders-live?token=${encodeURIComponent(token)}`

    let stopped  = false
    let attempts = 0
    let retryId: ReturnType<typeof setTimeout>
    let ws: WebSocket

    function connect() {
      ws = new WebSocket(url)

      ws.onopen = () => { attempts = 0 }

      ws.onmessage = async (evt: MessageEvent) => {
        let msg: WsMsg
        try { msg = JSON.parse(evt.data as string) } catch { return }

        if (msg.type !== 'order_status_changed') return
        if (msg.order_id !== orderId)            return

        // No status in WS payload — fetch to check
        try {
          const { data } = await api.get(`/orders/${orderId}`)
          const order: Order = data?.data ?? data
          if (order.status === 'ready') {
            toast.success('Đơn đã sẵn sàng — chuyển sang thanh toán')
            router.push(`/cashier/payment/${orderId}`)
          }
        } catch { /* skip */ }
      }

      ws.onclose = () => {
        if (stopped) return
        attempts++
        retryId = setTimeout(connect, Math.min(1000 * 2 ** attempts, 30_000))
      }
    }

    connect()
    return () => {
      stopped = true
      clearTimeout(retryId)
      ws?.close()
    }
  }, [token, activeOrder, router])

  const addToCart = useCallback((product: Product) => {
    if (!product.is_available) return
    setCart(prev => {
      const hit = prev.find(i => i.product_id === product.id)
      if (hit) return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product_id: product.id, name: product.name, quantity: 1, price: product.price }]
    })
  }, [])

  const updateQty = useCallback((productId: string, qty: number) => {
    setCart(prev =>
      prev.map(i => i.product_id === productId ? { ...i, quantity: qty } : i)
          .filter(i => i.quantity > 0)
    )
  }, [])

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  const createOrder = useMutation({
    mutationFn: () =>
      api.post('/orders', {
        customer_name:  'Khách tại quán',
        customer_phone: '0000000000',
        source:         'pos',
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
      }).then(r => r.data?.data ?? r.data),
    onSuccess: (order: Order) => {
      setActiveOrder(order)
      setCart([])
      toast.success(`Đã tạo đơn #${order.order_number}`)
    },
    onError: () => toast.error('Không thể tạo đơn hàng'),
  })

  // Waiting for kitchen state
  if (activeOrder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-6 p-4">
        <div className="bg-card rounded-2xl p-8 text-center max-w-sm w-full border border-border">
          <p className="text-muted-fg text-sm mb-1">Đơn #{activeOrder.order_number}</p>
          <h2 className="text-foreground text-xl font-semibold mb-3">⏳ Bếp đang chuẩn bị...</h2>
          <p className="text-muted-fg text-sm mb-6">
            Khi bếp hoàn thành, bạn sẽ được chuyển đến thanh toán tự động.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push(`/cashier/payment/${activeOrder.id}`)}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
            >
              Đến thanh toán
            </button>
            <button
              onClick={() => setActiveOrder(null)}
              className="px-4 py-2 bg-muted text-muted-fg text-sm font-medium rounded-full hover:text-foreground transition-colors"
            >
              Tạo đơn mới
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Left — menu browse */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
        <div className="p-4 border-b border-border shrink-0">
          <h1 className="text-lg font-semibold font-display">POS — Thu Ngân</h1>
        </div>

        <CategoryTabs
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {products.map(p => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={!p.is_available}
                className="bg-card rounded-xl p-3 text-left border border-border hover:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <p className="text-foreground text-sm font-semibold line-clamp-2 leading-snug">{p.name}</p>
                <p className="text-primary font-bold text-sm mt-1">{formatVND(p.price)}</p>
                {!p.is_available && (
                  <p className="text-urgent text-xs mt-1">Hết</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right — order summary */}
      <div className="w-72 xl:w-80 flex flex-col bg-background shrink-0">
        <div className="p-4 border-b border-border shrink-0">
          <h2 className="font-semibold text-foreground">Đơn hiện tại</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <p className="text-muted-fg text-sm text-center mt-10">Chọn món từ menu</p>
          ) : (
            cart.map(item => (
              <div key={item.product_id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-medium truncate">{item.name}</p>
                  <p className="text-primary text-xs">{formatVND(item.price)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => updateQty(item.product_id, item.quantity - 1)}
                    className="w-6 h-6 rounded-full bg-muted text-foreground text-sm flex items-center justify-center hover:bg-muted/80"
                  >−</button>
                  <span className="w-5 text-center text-sm text-foreground">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.product_id, item.quantity + 1)}
                    className="w-6 h-6 rounded-full bg-muted text-foreground text-sm flex items-center justify-center hover:bg-muted/80"
                  >+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-border space-y-3 shrink-0">
          <div className="flex justify-between items-center">
            <span className="text-muted-fg text-sm">Tổng:</span>
            <span className="text-foreground font-bold text-lg">{formatVND(cartTotal)}</span>
          </div>
          <button
            disabled={cart.length === 0 || createOrder.isPending}
            onClick={() => createOrder.mutate()}
            className="w-full bg-primary text-white font-semibold py-2.5 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {createOrder.isPending ? 'Đang tạo...' : 'Tạo Đơn →'}
          </button>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="w-full text-sm text-muted-fg hover:text-foreground transition-colors"
            >
              Xoá đơn
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
