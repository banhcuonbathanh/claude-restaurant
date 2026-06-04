'use client'
import { useMemo, useState, useEffect, useRef, Suspense } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ShoppingCart, ClipboardList, Settings, PlusCircle, Heart } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { useSettingsStore } from '@/store/settings'
import { useFavouritesStore } from '@/store/favourites'
import { api } from '@/lib/api-client'
import { useCartStore } from '@/store/cart'
import { CategoryTabs } from '@/features/menu/components/CategoryTabs'
import { ProductCard } from '@/features/menu/components/ProductCard'
import { ProductGridCard } from '@/features/menu/components/ProductGridCard'
import { ComboCard } from '@/features/menu/components/ComboCard'
import { CartDrawer } from '@/features/menu/components/CartDrawer'
import { SearchBar } from '@/features/menu/components/SearchBar'
import { FavouritesRail } from '@/features/menu/components/FavouritesRail'
import { DrinkCustomize } from '@/features/menu/components/DrinkCustomize'
import { OrderSummary } from '@/features/menu/components/OrderSummary'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatVND } from '@/lib/utils'
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
        items: cart.items.map(item => ({
          product_id:  item.product_id ?? null,
          combo_id:    item.combo_id   ?? null,
          quantity:    item.quantity,
          topping_ids: item.toppings.map(t => t.id),
        })),
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

  useEffect(() => {
    const found = Object.keys(localStorage).some(k => k.startsWith(STORAGE_KEYS.ORDER_CACHE))
    setHasOrders(found)
  }, [])

  const { items, itemCount, total, tableId } = useCartStore()
  const { tableLabel } = useSettingsStore()
  const { items: favItems } = useFavouritesStore()

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
    const productMap = new Map(allProducts.map(p => [p.id, { name: p.name, price: p.price }]))
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
      })),
    }))
  }, [rawCombos, allProducts])

  const count      = itemCount()
  const showCombos = selectedCategory === null && combos.length > 0
  const showFavs   = selectedCategory === null && favItems.length > 0

  return (
    <div className="min-h-screen bg-background">
      {/* Zone A — Header */}
      <header className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex flex-col leading-none min-w-0">
          <h1 className="font-display text-xl text-foreground font-semibold truncate">Quán Bánh Cuốn</h1>
          {tableLabel && (
            <span className="text-xs text-muted-fg mt-0.5 truncate">{tableLabel}</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/menu/favourites"
            className="relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors"
            aria-label="Yêu thích"
          >
            <Heart
              size={18}
              className={favItems.length > 0 ? 'text-red-500 fill-red-500' : 'text-red-400/60'}
            />
            {favItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {favItems.length > 9 ? '9+' : favItems.length}
              </span>
            )}
          </Link>
          <Link
            href="/menu/settings"
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors"
            aria-label="Cài đặt"
          >
            <Settings size={18} className="text-muted-fg" />
          </Link>
          <button
            onClick={() => router.push('/order')}
            className="relative flex items-center gap-1.5 bg-muted text-foreground px-3 py-1.5 rounded-full text-sm font-medium"
          >
            <ClipboardList size={16} />
            <span className="hidden sm:inline">Đơn hàng</span>
            {hasOrders && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setCartOpen(true)}
            aria-label="Giỏ hàng"
            className="relative flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium"
          >
            <ShoppingCart size={16} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mini cart strip — sticky, shows when cart has items */}
      {count > 0 && (
        <div className="sticky top-[57px] z-10 bg-background border-b border-border/60 px-4 py-2">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full flex items-center gap-2 text-left"
          >
            <span className="bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
              {count} món
            </span>
            <div className="flex-1 overflow-hidden">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                {items.map(item => (
                  <span
                    key={item.id}
                    className="shrink-0 text-xs text-foreground bg-muted px-2 py-0.5 rounded-full whitespace-nowrap"
                  >
                    {item.name} ×{item.quantity}
                  </span>
                ))}
              </div>
            </div>
            <span className="shrink-0 text-xs font-bold text-primary ml-1">{formatVND(total())}</span>
          </button>
        </div>
      )}

      {/* Restaurant banner */}
      <div className="relative w-full h-44 overflow-hidden">
        <img
          src="/restaurant-banner.jpg"
          alt="Quán Bánh Cuốn"
          className="w-full h-full object-cover"
          onError={e => {
            const img = e.currentTarget
            img.style.display = 'none'
            img.parentElement!.classList.add('bg-gradient-to-br', 'from-primary/30', 'to-background')
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
        <div className="absolute bottom-3 left-4">
          <p className="text-white/90 text-sm font-medium drop-shadow">Bánh cuốn tươi — ngon mỗi ngày</p>
        </div>
      </div>

      {/* Add-to-order mode banner */}
      {addToOrderId && (
        <div className="mx-4 mt-3 flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-xl px-4 py-2.5">
          <PlusCircle size={16} className="text-primary shrink-0" />
          <p className="text-sm text-primary font-medium flex-1">
            Chọn món để thêm vào đơn hàng hiện tại
          </p>
          <button
            onClick={() => router.push(`/order/${addToOrderId}`)}
            className="text-xs text-primary underline underline-offset-2 shrink-0"
          >
            Xem đơn
          </button>
        </div>
      )}

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
            <button
              onClick={() => refetch()}
              className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-medium min-h-[44px]"
            >
              Thử lại
            </button>
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
            {showCombos && (
              <section>
                <h2 className="text-muted-fg font-semibold mb-2 text-sm uppercase tracking-wide">
                  Combo
                </h2>
                <div className="flex flex-col gap-3">
                  {combos.map(combo => (
                    <ComboCard key={combo.id} combo={combo} />
                  ))}
                </div>
              </section>
            )}

            {/* Zone F — ProductList */}
            {products.length > 0 && (
              <section>
                {showCombos && (
                  <h2 className="text-muted-fg font-semibold mb-2 mt-2 text-sm uppercase tracking-wide">
                    Món lẻ
                  </h2>
                )}
                {/* Mobile: 1-col list */}
                <div className="flex flex-col gap-3 sm:hidden">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {/* Tablet / Desktop: responsive grid (2 → 3 → 4 cols) */}
                <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {products.map(product => (
                    <ProductGridCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Zone G — DrinkCustomize */}
        <DrinkCustomize />

        {/* Zone I — OrderSummary (includes note) */}
        <OrderSummary />

      </main>

      {/* Zone J — CartBottomBar */}
      {count > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-30">
          <button
            onClick={() => tableId ? setConfirmOpen(true) : router.push('/checkout')}
            className="w-full bg-primary text-white py-3.5 rounded-2xl font-semibold flex items-center justify-between px-5 shadow-lg min-h-[44px]"
          >
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {count}
            </span>
            <span>Thanh toán</span>
            <span className="font-bold">{formatVND(total())}</span>
          </button>
        </div>
      )}

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
