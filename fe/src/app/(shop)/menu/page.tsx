'use client'
import { useMemo, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, ClipboardList, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSettingsStore } from '@/store/settings'
import { api } from '@/lib/api-client'
import { useCartStore } from '@/store/cart'
import { CategoryTabs } from '@/components/menu/CategoryTabs'
import { ProductCard } from '@/components/menu/ProductCard'
import { ComboCard } from '@/components/menu/ComboCard'
import { CartDrawer } from '@/components/menu/CartDrawer'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatVND } from '@/lib/utils'
import type { Product, Combo, ComboRaw, Category } from '@/types/product'

export default function MenuPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cartOpen, setCartOpen]                 = useState(false)
  const [hasOrders, setHasOrders]               = useState(false)

  useEffect(() => {
    const found = Object.keys(localStorage).some(k => k.startsWith('order_cache_'))
    setHasOrders(found)
  }, [])

  const { itemCount, total } = useCartStore()
  const { tableLabel } = useSettingsStore()

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  // All products (unfiltered) for combo item name lookup
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['products-all'],
    queryFn: () => api.get('/products').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const { data: products = [], isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ['products', selectedCategory],
    queryFn: () =>
      api.get('/products', {
        params: {
          ...(selectedCategory && { category_id: selectedCategory }),
          is_available: true,
        },
      }).then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex flex-col leading-none">
          <h1 className="font-display text-xl text-foreground font-semibold">Quán Bánh Cuốn</h1>
          {tableLabel && (
            <span className="text-xs text-muted-fg mt-0.5">{tableLabel}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
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

      {/* Category tabs */}
      <CategoryTabs
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Content */}
      <main className="px-4 py-4 pb-28">
        {loadingProducts ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 && !showCombos ? (
          <EmptyState message="Không có món nào trong danh mục này" />
        ) : (
          <div className="flex flex-col gap-3">
            {/* Combos section */}
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

            {/* Products section */}
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
      </main>

      {/* Cart FAB */}
      {count > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-30">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full bg-primary text-white py-3.5 rounded-2xl font-semibold flex items-center justify-between px-5 shadow-lg"
          >
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {count}
            </span>
            <span>Xem giỏ hàng</span>
            <span className="font-bold">{formatVND(total())}</span>
          </button>
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
