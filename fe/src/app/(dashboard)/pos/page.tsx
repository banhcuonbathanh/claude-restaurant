'use client'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { api } from '@/lib/api-client'
import { AuthGuard } from '@/components/guards/AuthGuard'
import { RoleGuard } from '@/components/guards/RoleGuard'
import { CategoryTabs } from '@/features/menu/components/CategoryTabs'
import { listTables, listLiveOrders, type Table } from '@/features/admin/admin.api'
import { useOrdersWSContext } from '@/context/OrdersWSContext'
import { Role } from '@/types/auth'
import { formatVND } from '@/lib/utils'
import type { Category, Product } from '@/types/product'
import type { Order } from '@/types/order'

// A table counts as occupied when it carries a live order in any active status.
const TABLE_ACTIVE = new Set(['pending', 'confirmed', 'preparing', 'ready', 'delivered'])

interface PosCartItem {
  product_id: string
  name:       string
  quantity:   number
  price:      number
}

export default function POSPage() {
  return (
    <AuthGuard>
      <RoleGuard minRole={Role.CASHIER}>
        <Suspense fallback={null}>
          <POSContent />
        </Suspense>
      </RoleGuard>
    </AuthGuard>
  )
}

// ── Table picker modal ────────────────────────────────────────────────────────

function TablePickerModal({
  tables,
  occupiedTableIds,
  currentTableId,
  onPick,
  onClose,
}: {
  tables:           Table[]
  occupiedTableIds: Set<string>
  currentTableId:   string | null
  onPick:           (table: Table | null) => void
  onClose:          () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-border" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Chọn bàn — Đặt hộ</h2>
          <button onClick={onClose} className="text-muted-fg hover:text-foreground text-sm">Đóng</button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            {tables.map(t => {
              const occupied = occupiedTableIds.has(t.id) && t.id !== currentTableId
              const selected = t.id === currentTableId
              return (
                <button
                  key={t.id}
                  disabled={occupied}
                  onClick={() => { onPick(t); onClose() }}
                  className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors
                    ${selected
                      ? 'border-primary bg-primary/10 text-primary'
                      : occupied
                        ? 'border-border bg-muted text-muted-fg opacity-40 cursor-not-allowed'
                        : 'border-border bg-card text-foreground hover:border-primary'}`}
                  title={occupied ? 'Bàn đang có khách' : t.name}
                >
                  <span className="block truncate">{t.name}</span>
                  <span className="block text-[10px] mt-0.5">{occupied ? 'Có khách' : 'Trống'}</span>
                </button>
              )
            })}
          </div>
        </div>
        <div className="px-5 py-3 border-t border-border">
          <button
            onClick={() => { onPick(null); onClose() }}
            className="w-full text-sm text-muted-fg hover:text-foreground transition-colors"
          >
            Khách vãng lai (không gắn bàn)
          </button>
        </div>
      </div>
    </div>
  )
}

function POSContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cart,        setCart]        = useState<PosCartItem[]>([])
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)

  // Table scope — seeded from query (?table_id=&table_name=) when launched via "Đặt hộ".
  const [tableId,    setTableId]    = useState<string | null>(() => searchParams.get('table_id'))
  const [tableName,  setTableName]  = useState<string | null>(() => searchParams.get('table_name'))
  const [pickerOpen, setPickerOpen] = useState(false)

  // Occupancy source — same endpoints the admin overview uses (no new endpoint).
  const { data: tables = [] } = useQuery<Table[]>({
    queryKey: ['tables'],
    queryFn:  listTables,
    staleTime: 60_000,
  })
  const { data: liveOrders = [] } = useQuery<Order[]>({
    queryKey: ['orders', 'live'],
    queryFn:  () => listLiveOrders(),
    staleTime: 15_000,
  })
  const occupiedTableIds = useMemo(
    () => new Set(liveOrders.filter(o => o.table_id && TABLE_ACTIVE.has(o.status)).map(o => o.table_id!)),
    [liveOrders],
  )

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

  // Subscribe to shared WS — watch for active order reaching 'ready' status
  const { subscribe } = useOrdersWSContext()
  useEffect(() => {
    if (!activeOrder) return
    const orderId = activeOrder.id
    return subscribe(async msg => {
      if (msg.type !== 'order_status_changed') return
      if (msg.order_id !== orderId)            return
      try {
        const { data } = await api.get(`/orders/${orderId}`)
        const order: Order = data?.data ?? data
        if (order.status === 'ready') {
          toast.success('Đơn đã sẵn sàng — chuyển sang thanh toán')
          router.push(`/cashier/payment/${orderId}`)
        }
      } catch { /* skip */ }
    })
  }, [subscribe, activeOrder, router])

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
        customer_name:  tableName ?? 'Khách tại quán',
        customer_phone: '0000000000',
        source:         'pos',
        ...(tableId ? { table_id: tableId } : {}),
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
      {pickerOpen && (
        <TablePickerModal
          tables={tables}
          occupiedTableIds={occupiedTableIds}
          currentTableId={tableId}
          onPick={(t) => { setTableId(t?.id ?? null); setTableName(t?.name ?? null) }}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {/* Left — menu browse */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
        <div className="p-4 border-b border-border shrink-0 flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold font-display">POS — Thu Ngân</h1>
          <div className="flex items-center gap-2">
            {tableName && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary/10 text-primary whitespace-nowrap">
                {tableName}
              </span>
            )}
            <button
              onClick={() => setPickerOpen(true)}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border text-foreground hover:border-primary transition-colors whitespace-nowrap"
            >
              {tableName ? 'Đổi bàn' : 'Chọn bàn'}
            </button>
          </div>
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
