'use client'
import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Minus, Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { formatVND } from '@/lib/utils'
import { useCartStore } from '@/store/cart'
import type { ComboRaw, Combo, Product } from '@/types/product'

export default function ComboDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const [qty, setQty] = useState(1)
  const addItem = useCartStore(s => s.addItem)

  const { data: rawCombos = [], isLoading, isError } = useQuery<ComboRaw[]>({
    queryKey: ['combos'],
    queryFn: () => api.get('/combos').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['products-all'],
    queryFn: () => api.get('/products').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const combo = useMemo<Combo | undefined>(() => {
    const raw = rawCombos.find(c => c.id === id)
    if (!raw) return undefined
    const productMap = new Map(allProducts.map(p => [p.id, p.name]))
    return {
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
    }
  }, [rawCombos, allProducts, id])

  const imageUrl = combo?.image_path
    ? `${process.env.NEXT_PUBLIC_STORAGE_URL ?? ''}/${combo.image_path}`
    : null

  const total = (combo?.price ?? 0) * qty

  function handleAddToCart() {
    if (!combo) return
    addItem({
      id:          `combo_${combo.id}`,
      type:        'combo',
      combo_id:    combo.id,
      name:        combo.name,
      quantity:    qty,
      price:       combo.price,
      toppings:    [],
      combo_items: combo.items.map(i => ({ product_name: i.product_name, quantity: i.quantity })),
    })
    router.back()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow"
        aria-label="Quay lại"
      >
        <ArrowLeft size={20} className="text-foreground" />
      </button>

      {isLoading && <ComboDetailSkeleton />}

      {(isError || (!isLoading && !combo)) && (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
          <p className="text-muted-fg text-center">Không tìm thấy combo.</p>
          <button onClick={() => router.back()} className="text-primary text-sm underline">
            Quay lại menu
          </button>
        </div>
      )}

      {combo && (
        <>
          {/* Zone A — Hero image */}
          <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={combo.name}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-6xl bg-muted">
                🍱
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>

          {/* Zone B — Name, availability, price, description */}
          <div className="px-4 pt-4 pb-4 flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <h1 className="text-xl font-bold text-foreground flex-1 leading-snug">
                {combo.name}
              </h1>
              {!combo.is_available && (
                <span className="flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-600">
                  Hết hàng
                </span>
              )}
            </div>

            <p className="text-2xl font-bold text-primary">{formatVND(combo.price)}</p>

            {combo.description && (
              <p className="text-sm text-muted-fg leading-relaxed">{combo.description}</p>
            )}
          </div>

          {/* Zone C — Items list */}
          {combo.items.length > 0 && (
            <div className="px-4 pt-4 pb-4 flex flex-col gap-3 border-t border-border">
              <h2 className="text-sm font-semibold text-foreground">Gồm có</h2>
              <ul className="flex flex-col gap-2">
                {combo.items.map(item => (
                  <li key={item.product_id} className="flex items-center gap-3">
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                      ×{item.quantity}
                    </span>
                    <span className="text-sm text-foreground">{item.product_name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Zone D — QtyStepper */}
          <div className="px-4 pt-4 pb-32 flex items-center gap-4 border-t border-border">
            <span className="text-sm font-semibold text-foreground">Số lượng</span>
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-40"
                aria-label="Giảm số lượng"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-base font-semibold tabular-nums">{qty}</span>
              <button
                onClick={() => setQty(q => q + 1)}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center"
                aria-label="Tăng số lượng"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Zone E — Sticky CTA footer */}
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 pt-3 pb-safe-4">
            <button
              onClick={handleAddToCart}
              disabled={!combo.is_available}
              className="w-full bg-primary text-primary-fg font-semibold text-sm rounded-xl py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[.98] transition-transform"
            >
              {combo.is_available
                ? `Thêm vào giỏ hàng · ${formatVND(total)}`
                : 'Combo tạm hết'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function ComboDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full aspect-[4/3] bg-muted" />
      <div className="px-4 pt-4 pb-4 flex flex-col gap-3">
        <div className="h-7 bg-muted rounded w-3/4" />
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
        </div>
      </div>
      <div className="px-4 pt-4 pb-32 flex flex-col gap-3 border-t border-border">
        <div className="h-4 bg-muted rounded w-1/4" />
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-5 bg-muted rounded-full" />
            <div className="flex-1 h-4 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
