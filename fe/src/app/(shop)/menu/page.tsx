'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart } from 'lucide-react'
import { api } from '@/lib/api-client'
import { useCartStore } from '@/store/cart'
import { CategoryTabs } from '@/components/menu/CategoryTabs'
import { ProductCard } from '@/components/menu/ProductCard'
import { ToppingModal } from '@/components/menu/ToppingModal'
import { ComboModal } from '@/components/menu/ComboModal'
import { CartDrawer } from '@/components/menu/CartDrawer'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatVND } from '@/lib/utils'
import type { Product, Combo, Category, Topping } from '@/types/product'
import type { CartItem } from '@/types/cart'

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [toppingProduct, setToppingProduct]     = useState<Product | null>(null)
  const [comboTarget, setComboTarget]           = useState<Combo | null>(null)
  const [cartOpen, setCartOpen]                 = useState(false)

  const { addItem, itemCount, total } = useCartStore()

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data),
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

  const { data: combos = [] } = useQuery<Combo[]>({
    queryKey: ['combos'],
    queryFn: () => api.get('/combos').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const handleAddProduct = (product: Product) => {
    if (product.toppings.length > 0) {
      setToppingProduct(product)
    } else {
      addProductToCart(product, [])
    }
  }

  const addProductToCart = (product: Product, toppings: Topping[]) => {
    const toppingIds = toppings.map(t => t.id).sort().join('-')
    const id = `product_${product.id}_${toppingIds}`
    const toppingPrice = toppings.reduce((s, t) => s + t.price, 0)
    const item: CartItem = {
      id,
      type:       'product',
      product_id: product.id,
      name:       product.name,
      quantity:   1,
      price:      product.price + toppingPrice,
      toppings,
    }
    addItem(item)
  }

  const handleToppingConfirm = (toppings: Topping[]) => {
    if (toppingProduct) {
      addProductToCart(toppingProduct, toppings)
      setToppingProduct(null)
    }
  }

  const handleComboConfirm = (combo: Combo) => {
    const item: CartItem = {
      id:       `combo_${combo.id}`,
      type:     'combo',
      combo_id: combo.id,
      name:     combo.name,
      quantity: 1,
      price:    combo.price,
      toppings: [],
    }
    addItem(item)
    setComboTarget(null)
  }

  const count = itemCount()

  // Show combos only when "all" or no filter active
  const showCombos = selectedCategory === null && combos.length > 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="font-display text-xl text-foreground font-semibold">Quán Bánh Cuốn</h1>
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium"
        >
          <ShoppingCart size={16} />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {count}
            </span>
          )}
        </button>
      </header>

      {/* Category tabs */}
      <CategoryTabs
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Content */}
      <main className="px-4 py-4">
        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 && !showCombos ? (
          <EmptyState message="Không có món nào trong danh mục này" />
        ) : (
          <>
            {/* Combos section */}
            {showCombos && (
              <section className="mb-6">
                <h2 className="text-foreground font-semibold mb-3">Combo</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {combos.map((combo) => (
                    <div
                      key={combo.id}
                      className="bg-card rounded-xl overflow-hidden cursor-pointer"
                      onClick={() => setComboTarget(combo)}
                    >
                      <div className="relative aspect-square bg-muted flex items-center justify-center text-3xl">
                        🍱
                      </div>
                      <div className="p-3">
                        <p className="text-foreground text-sm font-semibold line-clamp-1">{combo.name}</p>
                        <p className="text-primary text-sm font-bold mt-1">{formatVND(combo.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Products grid */}
            {products.length > 0 && (
              <section>
                {showCombos && (
                  <h2 className="text-foreground font-semibold mb-3">Món lẻ</h2>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAdd={() => handleAddProduct(product)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
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

      {/* Modals */}
      {toppingProduct && (
        <ToppingModal
          product={toppingProduct}
          open={true}
          onClose={() => setToppingProduct(null)}
          onConfirm={handleToppingConfirm}
        />
      )}

      {comboTarget && (
        <ComboModal
          combo={comboTarget}
          open={true}
          onClose={() => setComboTarget(null)}
          onConfirm={() => handleComboConfirm(comboTarget)}
        />
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
