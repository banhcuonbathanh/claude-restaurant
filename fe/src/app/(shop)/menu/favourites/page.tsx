'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api-client'
import { useFavouritesStore } from '@/store/favourites'
import { useCartStore } from '@/store/cart'
import { FavouritesTopNav } from './components/FavouritesTopNav'
import { FavouriteSegmentTabs } from './components/FavouriteSegmentTabs'
import { FavouriteFilterTabs } from './components/FavouriteFilterTabs'
import { FavouriteItemCard } from './components/FavouriteItemCard'
import { CanhQuickAdd } from './components/CanhQuickAdd'
import { FavouritesFooter } from './components/FavouritesFooter'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Product, ComboRaw } from '@/types/product'
import type { FavouriteItemResolved, FavouriteTab } from '@/store/favourites'
import type { CartItem } from '@/types/cart'

// Canh is stepper-only (có rau / không rau are two distinct real products, rau is
// NOT a topping) — mirrors the menu OrderSummary sourcing.
const isSoupName = (name: string) =>
  name.toLowerCase().includes('canh') || name.toLowerCase().includes('nước dùng')

export default function FavouritesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<FavouriteTab>('all')

  const { items, removeItem, updateQty } = useFavouritesStore()
  const addToCart = useCartStore(s => s.addItem)

  const { data: allProducts = [], isSuccess: productsLoaded } = useQuery<Product[]>({
    queryKey: ['products-all'],
    queryFn: () => api.get('/products').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const { data: allCombos = [], isSuccess: combosLoaded } = useQuery<ComboRaw[]>({
    queryKey: ['combos'],
    queryFn: () => api.get('/combos').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  // Resolve the two real canh products for the quick-add block (same as the menu).
  const canhProducts = allProducts.filter(p => isSoupName(p.name))
  const canhKhongRau = canhProducts.find(p => p.name.toLowerCase().includes('không')) ?? null
  const canhCoRau    = canhProducts.find(p => p !== canhKhongRau) ?? null

  // Auto-remove favourited items that no longer exist on the menu and notify the user
  useEffect(() => {
    if (!productsLoaded || !combosLoaded) return
    const currentItems = useFavouritesStore.getState().items
    const stale = currentItems.filter(item =>
      item.type === 'product'
        ? !allProducts.some(p => p.id === item.id)
        : !allCombos.some(c => c.id === item.id)
    )
    if (stale.length === 0) return
    stale.forEach(item => removeItem(item.id))
    toast.warning('Một số món không còn phục vụ đã được xoá khỏi danh sách yêu thích')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productsLoaded, combosLoaded])

  const resolvedItems: FavouriteItemResolved[] = items.flatMap(item => {
    if (item.type === 'product') {
      const p = allProducts.find(x => x.id === item.id)
      if (!p) return []
      const selectedToppings = (p.toppings ?? [])
        .filter(t => item.toppingIds.includes(t.id))
        .map(t => ({ id: t.id, name: t.name, price: t.price }))
      return [{
        ...item,
        name: p.name,
        imageUrl: p.image_path ? `${process.env.NEXT_PUBLIC_STORAGE_URL ?? ''}/${p.image_path}` : null,
        basePrice: p.price,
        selectedToppings,
        comboItems: [] as Array<{ name: string; qty: number }>,
        subtotalPerPortion: p.price + selectedToppings.reduce((s, t) => s + t.price, 0),
      }]
    } else {
      const c = allCombos.find(x => x.id === item.id)
      if (!c) return []
      const comboItems = c.combo_items.map(ci => {
        const p = allProducts.find(x => x.id === ci.product_id)
        return { name: p?.name || 'Món không rõ tên', qty: ci.quantity }
      })
      return [{
        ...item,
        name: c.name || 'Combo không có tên',
        imageUrl: c.image_path ? `${process.env.NEXT_PUBLIC_STORAGE_URL ?? ''}/${c.image_path}` : null,
        basePrice: c.price,
        selectedToppings: [] as Array<{ id: string; name: string; price: number }>,
        comboItems,
        subtotalPerPortion: c.price,
      }]
    }
  })

  const filteredItems = activeTab === 'all'
    ? resolvedItems
    : resolvedItems.filter(i => i.type === activeTab)

  const counts = {
    all:     resolvedItems.length,
    product: resolvedItems.filter(i => i.type === 'product').length,
    combo:   resolvedItems.filter(i => i.type === 'combo').length,
  }

  // Live total row — Σ every favourite card's qty × per-portion price (all items,
  // not just the active filter). Recomputes on stepper change / un-favourite.
  const favCount = resolvedItems.reduce((s, i) => s + i.qty, 0)
  const favTotal = resolvedItems.reduce((s, i) => s + i.subtotalPerPortion * i.qty, 0)

  const handleAddAllToCart = () => {
    resolvedItems.forEach(item => {
      const cartItem: CartItem = item.type === 'product'
        ? {
            id:         `product_${item.id}_${item.toppingIds.sort().join('-')}`,
            type:       'product',
            product_id: item.id,
            name:       item.name,
            quantity:   item.qty,
            price:      item.subtotalPerPortion,
            toppings:   item.selectedToppings.map(t => ({
              id: t.id, name: t.name, price: t.price, is_available: true,
            })),
          }
        : {
            id:       `combo_${item.id}`,
            type:     'combo',
            combo_id: item.id,
            name:     item.name,
            quantity: item.qty,
            price:    item.basePrice,
            toppings: [],
          }
      addToCart(cartItem)
    })
  }

  const isEmpty = resolvedItems.length === 0

  return (
    <div className="min-h-screen bg-background pb-[calc(190px+env(safe-area-inset-bottom))]">
      <FavouritesTopNav title="❤ Yêu thích" showCart onBack={() => router.back()} />
      <FavouriteSegmentTabs />

      {isEmpty ? (
        <EmptyState icon="♡" message="Nhấn ♥ trên món ăn bất kỳ để thêm" />
      ) : (
        <>
          <FavouriteFilterTabs active={activeTab} counts={counts} onChange={setActiveTab} />
          <div className="space-y-3 p-4">
            {filteredItems.map(item => (
              <FavouriteItemCard
                key={item.id}
                item={item}
                onRemove={removeItem}
                onQtyChange={updateQty}
              />
            ))}
          </div>

          <CanhQuickAdd canhCoRau={canhCoRau} canhKhongRau={canhKhongRau} />

          <FavouritesFooter
            itemCount={favCount}
            total={favTotal}
            onAddAllToCart={handleAddAllToCart}
          />
        </>
      )}
    </div>
  )
}
