'use client'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useFavouritesStore } from '@/store/favourites'
import { useCartStore } from '@/store/cart'
import { FavouritesTopNav } from '../components/FavouritesTopNav'
import { SetCard } from './components/SetCard'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Product, ComboRaw } from '@/types/product'
import type { FavouriteItem, FavouriteItemResolved, FavouriteSet } from '@/store/favourites'
import type { CartItem } from '@/types/cart'

function resolveItems(
  items: FavouriteItem[],
  allProducts: Product[],
  allCombos: ComboRaw[],
): FavouriteItemResolved[] {
  return items.flatMap(item => {
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
        return { name: p?.name ?? ci.product_id, qty: ci.quantity }
      })
      return [{
        ...item,
        name: c.name,
        imageUrl: c.image_path ? `${process.env.NEXT_PUBLIC_STORAGE_URL ?? ''}/${c.image_path}` : null,
        basePrice: c.price,
        selectedToppings: [],
        comboItems,
        subtotalPerPortion: c.price,
      }]
    }
  })
}

export default function SetsPage() {
  const router = useRouter()
  const { sets, renameSet, deleteSet } = useFavouritesStore()
  const addToCart = useCartStore(s => s.addItem)

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['products-all'],
    queryFn: () => api.get('/products').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const { data: allCombos = [] } = useQuery<ComboRaw[]>({
    queryKey: ['combos'],
    queryFn: () => api.get('/combos').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const handleApplySet = (set: FavouriteSet) => {
    const resolved = resolveItems(set.items, allProducts, allCombos)
    resolved.forEach(item => {
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

  return (
    <div className="min-h-screen bg-background">
      <FavouritesTopNav title="📋 Các set của tôi" showCart onBack={() => router.back()} />

      {sets.length === 0 ? (
        <div className="bg-[#eef2ff] min-h-[calc(100vh-56px)] flex flex-col items-center justify-center gap-4 px-4">
          <EmptyState icon="♡" message="Chưa có set nào" />
          <p className="text-xs text-muted-fg text-center">
            Về Yêu thích → điều chỉnh → lưu set
          </p>
          <button
            onClick={() => router.push('/menu/favourites')}
            className="min-h-[44px] px-6 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
          >
            ← Về Yêu thích
          </button>
        </div>
      ) : (
        <div className="space-y-3 p-4">
          {sets.map(set => {
            const resolved = resolveItems(set.items, allProducts, allCombos)
            return (
              <SetCard
                key={set.id}
                set={set}
                resolvedItems={resolved}
                onApply={() => handleApplySet(set)}
                onRename={renameSet}
                onDelete={deleteSet}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
