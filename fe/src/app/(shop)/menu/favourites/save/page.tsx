'use client'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api-client'
import { useFavouritesStore } from '@/store/favourites'
import { FavouritesTopNav } from '../components/FavouritesTopNav'
import { FavouritesSummaryList } from './components/FavouritesSummaryList'
import type { Product, ComboRaw } from '@/types/product'
import type { FavouriteItemResolved } from '@/store/favourites'

const schema = z.object({ name: z.string().min(1, 'Vui lòng đặt tên cho set') })
type FormData = z.infer<typeof schema>

export default function SaveSetPage() {
  const router = useRouter()
  const { items, addSet } = useFavouritesStore()

  const { register, handleSubmit, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

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

  const onSubmit = (data: FormData) => {
    addSet(data.name.trim())
    router.push('/menu/favourites/sets')
  }

  return (
    <div className="min-h-screen bg-background pb-[100px]">
      <FavouritesTopNav title="💾 Lưu thành set mới" onBack={() => router.back()} />

      {/* ZB — name input */}
      <div className="bg-[#fff7ed] px-4 py-4">
        <label className="text-sm font-medium text-foreground block mb-2">
          Đặt tên cho set này:
        </label>
        <input
          {...register('name')}
          placeholder="vd: Set cuối tuần, Bữa sáng..."
          className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* ZC — summary */}
      <div className="p-4">
        <FavouritesSummaryList items={resolvedItems} />
      </div>

      {/* ZD — actions */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#fff7ed] border-t border-border px-4 py-3 flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 min-h-[44px] rounded-xl border border-border text-foreground text-sm font-semibold hover:bg-muted transition-colors"
        >
          Huỷ
        </button>
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid}
          className="flex-1 min-h-[44px] rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          💾 Lưu set này
        </button>
      </div>
    </div>
  )
}
