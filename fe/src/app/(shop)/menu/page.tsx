'use client'
import { useMemo, useState, useEffect, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, ClipboardList, Settings, PlusCircle, Heart } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSettingsStore } from '@/store/settings'
import { useFavouritesStore } from '@/store/favourites'
import { api } from '@/lib/api-client'
import { useCartStore } from '@/store/cart'
import { CategoryTabs } from '@/features/menu/components/CategoryTabs'
import { ProductCard } from '@/features/menu/components/ProductCard'
import { ComboCard } from '@/features/menu/components/ComboCard'
import { CartDrawer } from '@/features/menu/components/CartDrawer'
import { SearchBar } from '@/features/menu/components/SearchBar'
import { FavouritesRail } from '@/features/menu/components/FavouritesRail'
import { DrinkCustomize } from '@/features/menu/components/DrinkCustomize'
import { OrderNote } from '@/features/menu/components/OrderNote'
import { OrderSummary } from '@/features/menu/components/OrderSummary'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatVND } from '@/lib/utils'
import type { Product, Combo, ComboRaw, Category } from '@/types/product'
import { STORAGE_KEYS } from '@/lib/storage-keys'

function MenuContent() {
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const addToOrderId  = searchParams.get('add_to_order') ?? undefined
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cartOpen, setCartOpen]                 = useState(false)
  const [hasOrders, setHasOrders]               = useState(false)
  const [searchQuery, setSearchQuery]           = useState('')

  useEffect(() => {
    const found = Object.keys(localStorage).some(k => k.startsWith(STORAGE_KEYS.ORDER_CACHE))
    setHasOrders(found)
  }, [])

  const { items, itemCount, total } = useCartStore()
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

  // Enrich combos: map combo_items → items with product_name resolved
  const combos = useMemo<Combo[]>(() => {
    const productMap = new Map(allProducts.map(p => [p.id, p.name]))
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
        product_name: productMap.get(ci.product_id) ?? ci.product_id,
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
        <div className="flex flex-col leading-none">
          <h1 className="font-display text-xl text-foreground font-semibold">Quán Bánh Cuốn</h1>
          {tableLabel && (
            <span className="text-xs text-muted-fg mt-0.5">{tableLabel}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/menu/favourites"
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors"
            aria-label="Yêu thích"
          >
            <Heart size={18} className="text-muted-fg" />
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
            <span>Đơn hàng</span>
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
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl h-24 animate-pulse" />
            ))}
          </div>
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
                <div className="flex flex-col gap-3">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Zone G — DrinkCustomize */}
        <DrinkCustomize />

        {/* Zone H — OrderNote */}
        <OrderNote />

        {/* Zone I — OrderSummary */}
        <OrderSummary />

      </main>

      {/* Zone J — CartBottomBar */}
      {count > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-30">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full bg-primary text-white py-3.5 rounded-2xl font-semibold flex items-center justify-between px-5 shadow-lg min-h-[44px]"
          >
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {count}
            </span>
            <span>Xem giỏ hàng</span>
            <span className="font-bold">{formatVND(total())}</span>
          </button>
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} addToOrderId={addToOrderId} />
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
