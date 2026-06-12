// P-SYSTEST reference build — route /(shop)/menu/page.tsx. MenuContent is the brain:
// 4 TanStack queries + page-local useState; zones are dumb and never talk to each other.
// Not imported by the app.
'use client'
import { useMemo, useState, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useFavouritesStore } from './store/favourites'
import { api } from './lib/api-client-stub'
import { useCartStore } from './store/cart'
import { CategoryTabs } from './components/CategoryTabs'
import { ComboSection } from './components/ComboSection'
import { ProductList } from './components/ProductList'
import { CartDrawer } from './components/CartDrawer'
import { MenuHeader } from './components/MenuHeader'
import { MiniCartStrip } from './components/MiniCartStrip'
import { CartBottomBar } from './components/CartBottomBar'
import { SearchBar } from './components/SearchBar'
import { RestaurantBanner } from './components/RestaurantBanner'
import { AddToOrderBanner } from './components/AddToOrderBanner'
import { FavouritesRail } from './components/FavouritesRail'
import { OrderSummary } from './components/OrderSummary'
import { TableConfirmModal } from './components/TableConfirmModal'
import type { Product, Combo, ComboRaw, Category } from './types/product'

function MenuContent() {
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const addToOrderId  = searchParams.get('add_to_order') ?? undefined
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cartOpen, setCartOpen]                 = useState(false)
  const [confirmOpen, setConfirmOpen]           = useState(false)
  const [searchQuery, setSearchQuery]           = useState('')
  const [canhShakeKey, setCanhShakeKey]         = useState(0)

  const { tableId, items } = useCartStore()

  // Canh is always required: any order must have at least 1 bowl before checkout.
  // Canh lives as CartItems with ids starting 'canh_*'; missing = no such item in the cart.
  const canhMissing = !items.some(i => i.id.startsWith('canh_'))
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
    // a 1-char search makes NO network call
    enabled: searchQuery.length === 0 || searchQuery.length >= 2,
  })

  const { data: rawCombos = [] } = useQuery<ComboRaw[]>({
    queryKey: ['combos'],
    queryFn: () => api.get('/combos').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  // Enrich combos: raw combo_items carry only product_id + quantity, so join against
  // products-all to resolve product_name + unit_price + toppings (IMP-2: belongs on BE).
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
      <MenuHeader />

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

      {/* Content — 3 mutually-exclusive states before E/F render */}
      <main className="px-4 py-4 pb-40">
        {isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-muted-fg text-sm">⚠ Kết nối mạng yếu</p>
            <button onClick={() => refetch()} className="min-h-[44px] bg-primary text-white rounded-lg px-6 font-semibold text-sm">
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
          <p className="text-muted-fg text-sm text-center py-16">
            {searchQuery.length >= 2
              ? 'Không tìm thấy món nào · Thử từ khóa khác nhé!'
              : 'Không có món nào trong danh mục này'}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Zone E — ComboSection */}
            <ComboSection combos={combos} visible={selectedCategory === null} />

            {/* Zone F — ProductList */}
            <ProductList products={products} withComboHeading={showCombos} />
          </div>
        )}

        {/* Zone I — OrderSummary (includes canh steppers + note) */}
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
