'use client'
import { useMemo, useState, useEffect, useRef, Suspense } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useFavouritesStore } from '@/store/favourites'
import { api } from '@/lib/api-client'
import { useCartStore } from '@/store/cart'
import { CategoryTabs } from '@/features/menu/components/CategoryTabs'
import { ComboSection } from '@/features/menu/components/ComboSection'
import { ProductList } from '@/features/menu/components/ProductList'
import { CartDrawer } from '@/features/menu/components/CartDrawer'
import { MenuHeader } from '@/features/menu/components/MenuHeader'
import { MiniCartStrip } from '@/features/menu/components/MiniCartStrip'
import { CartBottomBar } from '@/features/menu/components/CartBottomBar'
import { SearchBar } from '@/features/menu/components/SearchBar'
import { RestaurantBanner } from '@/features/menu/components/RestaurantBanner'
import { AddToOrderBanner } from '@/features/menu/components/AddToOrderBanner'
import { FavouritesRail } from '@/features/menu/components/FavouritesRail'
import { OrderSummary } from '@/features/menu/components/OrderSummary'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { formatVND } from '@/lib/utils'
import { buildOrderItemsPayload } from '@/lib/order-payload'
import type { Product, Combo, ComboRaw, Category } from '@/types/product'
import { STORAGE_KEYS } from '@/lib/storage-keys'

function TableConfirmModal({ onClose }: { onClose: () => void }) {
  const router  = useRouter()
  const cart    = useCartStore()
  const [note, setNote] = useState('')
  const done    = useRef(false)

  const submitOrder = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/orders', {
        customer_name:  '',
        customer_phone: '',
        note:           note.trim() || null,
        table_id:       cart.tableId,
        source:         'qr',
        items: buildOrderItemsPayload(cart.items, cart.drinkConfig),
      })
      return data
    },
    onSuccess: async (data) => {
      done.current = true
      const order = data?.data
      if (order?.id) {
        try {
          const { data: fullRes } = await api.get(`/orders/${order.id}`)
          const fullOrder = fullRes?.data ?? order
          localStorage.setItem(`${STORAGE_KEYS.ORDER_CACHE}${order.id}`, JSON.stringify(fullOrder))
        } catch {
          try { localStorage.setItem(`${STORAGE_KEYS.ORDER_CACHE}${order.id}`, JSON.stringify(order)) } catch {}
        }
      }
      cart.clearCart()
      // Use router.replace (client-side nav) to preserve auth token in Zustand across navigation
      router.replace(order?.id ? `/order/${order.id}` : '/order')
    },
    onError: (err: unknown) => {
      const resp = (err as { response?: { data?: { error?: string; message?: string; details?: { active_order_id?: string } } } }).response
      if (resp?.data?.error === 'TABLE_HAS_ACTIVE_ORDER') {
        const activeId = resp?.data?.details?.active_order_id
        toast.info('Bàn này đang có đơn chưa hoàn tất — đây là đơn hiện tại của bàn.')
        // Use router.replace (client-side nav) to preserve auth token in Zustand across navigation
        router.replace(activeId ? `/order/${activeId}` : '/order')
        return
      }
      toast.error(resp?.data?.message ?? 'Đặt hàng thất bại')
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-4 pb-4">
      <div className="bg-card rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
        <h2 className="font-semibold text-foreground text-lg">Xác nhận đặt hàng</h2>

        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {cart.items.map(item => (
            <div key={item.id} className="flex justify-between text-sm gap-2">
              <span className="text-foreground flex-1 truncate">{item.quantity}× {item.name}</span>
              <span className="text-primary font-medium whitespace-nowrap">{formatVND(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-3 flex justify-between font-bold">
          <span className="text-foreground">Tổng cộng</span>
          <span className="text-primary text-lg">{formatVND(cart.total())}</span>
        </div>

        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Ghi chú cho bếp (tuỳ chọn)"
          rows={2}
          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-fg focus:outline-none focus:border-primary resize-none transition-colors"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={submitOrder.isPending}
            className="flex-1 py-3 rounded-xl border border-border text-muted-fg text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40"
          >
            Hủy
          </button>
          <button
            onClick={() => submitOrder.mutate()}
            disabled={submitOrder.isPending}
            className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold text-sm disabled:opacity-60 transition-opacity"
          >
            {submitOrder.isPending ? 'Đang đặt...' : 'Đặt hàng'}
          </button>
        </div>
      </div>
    </div>
  )
}

function MenuContent() {
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const addToOrderId  = searchParams.get('add_to_order') ?? undefined
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cartOpen, setCartOpen]                 = useState(false)
  const [confirmOpen, setConfirmOpen]           = useState(false)
  const [hasOrders, setHasOrders]               = useState(false)
  const [searchQuery, setSearchQuery]           = useState('')
  const [canhShakeKey, setCanhShakeKey]         = useState(0)

  useEffect(() => {
    const found = Object.keys(localStorage).some(k => k.startsWith(STORAGE_KEYS.ORDER_CACHE))
    setHasOrders(found)
  }, [])

  const { tableId, drinkConfig } = useCartStore()

  // Canh is always required: any order must have at least 1 bowl before checkout.
  const canhMissing  = drinkConfig.bowls === 0
  const { items: favItems } = useFavouritesStore()

  const handleCheckout = () => {
    if (canhMissing) {
      setCanhShakeKey(k => k + 1)
      toast.error('Vui lòng chọn số bát canh trước khi thanh toán')
      return
    }
    tableId ? setConfirmOpen(true) : router.push('/checkout')
  }

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  // All products (unfiltered) for combo item name lookup + FavouritesRail
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['products-all'],
    queryFn: () => api.get('/products').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const { data: products = [], isLoading: loadingProducts, isError, refetch } = useQuery<Product[]>({
    queryKey: ['products', selectedCategory, searchQuery],
    queryFn: () =>
      api.get('/products', {
        params: {
          ...(selectedCategory && { category_id: selectedCategory }),
          ...(searchQuery.length >= 2 && { search: searchQuery }),
          is_available: true,
        },
      }).then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
    enabled: searchQuery.length === 0 || searchQuery.length >= 2,
  })

  const { data: rawCombos = [] } = useQuery<ComboRaw[]>({
    queryKey: ['combos'],
    queryFn: () => api.get('/combos').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  // Enrich combos: map combo_items → items with product_name + unit_price resolved
  const combos = useMemo<Combo[]>(() => {
    const productMap = new Map(allProducts.map(p => [p.id, { name: p.name, price: p.price, toppings: p.toppings }]))
    return rawCombos.map(raw => ({
      id:           raw.id,
      category_id:  raw.category_id,
      name:         raw.name,
      description:  raw.description,
      price:        raw.price,
      image_path:   raw.image_path,
      sort_order:   raw.sort_order,
      is_available: raw.is_available,
      items: (raw.combo_items ?? []).map(ci => ({
        product_id:   ci.product_id,
        product_name: productMap.get(ci.product_id)?.name ?? ci.product_id,
        unit_price:   productMap.get(ci.product_id)?.price,
        quantity:     ci.quantity,
        toppings:     productMap.get(ci.product_id)?.toppings ?? [],
      })),
    }))
  }, [rawCombos, allProducts])

  const showCombos = selectedCategory === null && combos.length > 0
  const showFavs   = selectedCategory === null && favItems.length > 0

  return (
    <div className="min-h-screen bg-background">
      {/* Zone A — Header */}
      <MenuHeader hasOrders={hasOrders} onCartClick={() => setCartOpen(true)} />

      {/* Mini cart strip — sticky, shows when cart has items */}
      <MiniCartStrip onClick={() => setCartOpen(true)} />

      {/* Restaurant banner */}
      <RestaurantBanner />

      {/* Add-to-order mode banner */}
      <AddToOrderBanner
        orderId={addToOrderId}
        onViewOrder={() => router.push(`/order/${addToOrderId}`)}
      />

      {/* Zone B — SearchBar */}
      <SearchBar onSearch={setSearchQuery} />

      {/* Zone C — CategoryTabs */}
      <CategoryTabs
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Zone D — FavouritesRail */}
      {showFavs && (
        <FavouritesRail products={allProducts} combos={combos} />
      )}

      {/* Content */}
      <main className="px-4 py-4 pb-28">
        {isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-muted-fg text-sm">⚠ Kết nối mạng yếu</p>
            <Button onClick={() => refetch()} size="lg" className="min-h-[44px]">
              Thử lại
            </Button>
          </div>
        ) : loadingProducts ? (
          <>
            {/* Mobile skeleton — 1 col */}
            <div className="flex flex-col gap-3 sm:hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl h-24 animate-pulse" />
              ))}
            </div>
            {/* Tablet / Desktop skeleton — responsive grid */}
            <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl aspect-square animate-pulse" />
              ))}
            </div>
          </>
        ) : products.length === 0 && !showCombos ? (
          <EmptyState message={searchQuery.length >= 2
            ? 'Không tìm thấy món nào · Thử từ khóa khác nhé!'
            : 'Không có món nào trong danh mục này'
          } />
        ) : (
          <div className="flex flex-col gap-3">
            {/* Zone E — ComboSection */}
            <ComboSection combos={combos} visible={selectedCategory === null} />

            {/* Zone F — ProductList */}
            <ProductList products={products} withComboHeading={showCombos} />
          </div>
        )}

        {/* Zone I — OrderSummary (includes note) */}
        <OrderSummary shakeKey={canhShakeKey} />

      </main>

      {/* Zone J — CartBottomBar */}
      <CartBottomBar dimmed={canhMissing} onCheckout={handleCheckout} />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        addToOrderId={addToOrderId}
        onTableCheckout={() => setConfirmOpen(true)}
      />

      {confirmOpen && <TableConfirmModal onClose={() => setConfirmOpen(false)} />}
    </div>
  )
}

export default function MenuPage() {
  return (
    <Suspense>
      <MenuContent />
    </Suspense>
  )
}
