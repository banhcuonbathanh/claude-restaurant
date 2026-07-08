'use client'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { FavouritesTopNav } from '../components/FavouritesTopNav'
import { SuatBuilder } from '../components/SuatBuilder'
import type { Product, Combo, ComboRaw } from '@/types/product'

// Canh is stepper-only (có rau / không rau are two distinct real products, rau is
// NOT a topping) — mirrors the favourites list + menu OrderSummary sourcing.
const isSoupName = (name: string) =>
  name.toLowerCase().includes('canh') || name.toLowerCase().includes('nước dùng')

// "Tự tạo suất" builder (View C). The client assembles a custom suất from the FULL
// menu — every available dish (grouped by category) plus existing combos they can
// explode into editable món-lẻ rows; canh có/không rau is the standard 0đ add-on.
export default function BuildSuatPage() {
  const router = useRouter()

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['products-all'],
    queryFn: () => api.get('/products').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const { data: rawCombos = [] } = useQuery<ComboRaw[]>({
    queryKey: ['combos'],
    queryFn: () => api.get('/combos').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  // Selectable dishes = every available product except canh (canh is the 0đ add-on).
  const products = allProducts.filter(p => p.is_available && !isSoupName(p.name))

  const canhProducts = allProducts.filter(p => isSoupName(p.name))
  const canhKhongRau = canhProducts.find(p => p.name.toLowerCase().includes('không')) ?? null
  const canhCoRau    = canhProducts.find(p => p !== canhKhongRau) ?? null

  // Enrich combos so each item carries its product name (for the "gồm:" preview) —
  // same mapping the menu page uses. Unavailable combos are hidden.
  const combos = useMemo<Combo[]>(() => {
    const map = new Map(allProducts.map(p => [p.id, p]))
    return rawCombos
      .filter(c => c.is_available)
      .map(raw => ({
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
          product_name: map.get(ci.product_id)?.name ?? ci.product_id,
          unit_price:   map.get(ci.product_id)?.price,
          quantity:     ci.quantity,
          toppings:     map.get(ci.product_id)?.toppings ?? [],
        })),
      }))
  }, [rawCombos, allProducts])

  return (
    <div className="min-h-screen bg-background pb-[calc(96px+env(safe-area-inset-bottom))]">
      <FavouritesTopNav title="Tự tạo suất" showCart onBack={() => router.back()} />
      <SuatBuilder
        products={products}
        combos={combos}
        canhCoRau={canhCoRau}
        canhKhongRau={canhKhongRau}
      />
    </div>
  )
}
