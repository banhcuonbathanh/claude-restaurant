'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'
import { formatVND } from '@/lib/utils'
import { flyToCart } from '@/lib/fly-to-cart'
import { useFavouritesStore } from '@/store/favourites'
import { useCartStore, canhCartId } from '@/store/cart'
import { resolveSuatToCart, suatTotals, suatLineNames } from '@/lib/favourite-suat-cart'
import type { CustomSuat } from '@/store/favourites'
import type { Product } from '@/types/product'

interface Props {
  products: Product[]
  visible:  boolean
}

// The customer's own saved "Suất tự tạo" rendered as its own menu section — treated
// like the Combo section (browsable inline, one-tap add). Add-to-cart reuses
// resolveSuatToCart so this path stays identical to the FavouritesRail + favourites
// page. Renders nothing when the customer has no saved suất.
export function CustomSuatSection({ products, visible }: Props) {
  const suats = useFavouritesStore(s => s.suats)

  if (!visible || suats.length === 0) return null

  return (
    <section>
      <h2 className="text-muted-fg font-semibold mb-2 text-sm uppercase tracking-wide">
        Suất tự tạo
      </h2>
      <div className="flex flex-col gap-3">
        {suats.map(suat => (
          <CustomSuatCard key={suat.id} suat={suat} products={products} />
        ))}
      </div>
    </section>
  )
}

interface CardProps {
  suat:     CustomSuat
  products: Product[]
}

// Styled EXACTLY like the menu ComboCard (image left, ×qty món list middle, orange
// price + round − qty + stepper right). A saved suất has no single cart line (it
// resolves to món-lẻ lines), so the stepper tracks a per-card session count: each
// "+" adds one whole suất-worth to the cart, each "−" removes one.
function CustomSuatCard({ suat, products }: CardProps) {
  const { addItem, updateQty, setCanhQty } = useCartStore()
  const [qty, setQty] = useState(0)

  const { count, total } = suatTotals(suat.lines, products)
  const lines = suatLineNames(suat.lines, products)
  const coverImage = suat.image ?? null

  // Add one whole suất-worth: món-lẻ lines merge additively, canh routes through setCanhQty.
  const addOne = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { productItems, canhOps, missing } = resolveSuatToCart(suat.lines, products)
    if (productItems.length === 0 && canhOps.length === 0) {
      toast.error('Các món trong suất không còn khả dụng')
      return
    }
    productItems.forEach(addItem)
    canhOps.forEach(op => {
      const current = useCartStore.getState().items
        .find(i => i.id === canhCartId(op.productId, op.kind))?.quantity ?? 0
      setCanhQty(op.productId, null, op.kind, current + op.qty)
    })
    if (missing > 0) toast.warning('Một số món trong suất không còn phục vụ')
    setQty(q => q + 1)
    flyToCart(e.currentTarget)
  }

  // Remove one suất-worth — reverse of addOne (updateQty drops any line that hits 0).
  const removeOne = () => {
    if (qty <= 0) return
    const { productItems, canhOps } = resolveSuatToCart(suat.lines, products)
    productItems.forEach(pi => {
      const current = useCartStore.getState().items.find(i => i.id === pi.id)?.quantity ?? 0
      updateQty(pi.id, current - pi.quantity)
    })
    canhOps.forEach(op => {
      const current = useCartStore.getState().items
        .find(i => i.id === canhCartId(op.productId, op.kind))?.quantity ?? 0
      setCanhQty(op.productId, null, op.kind, Math.max(0, current - op.qty))
    })
    setQty(q => q - 1)
  }

  return (
    <div className="bg-card rounded-xl flex gap-3 p-3 shadow-sm">
      {/* Image — the suất's own cover if the client picked one, else 🍽️ emoji fallback */}
      <div className="relative w-20 flex-shrink-0" style={{ minHeight: '80px' }}>
        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={suat.name}
              fill
              className="object-cover"
              sizes="80px"
              unoptimized={coverImage.startsWith('data:')}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-2xl">🍽️</div>
          )}
        </div>
      </div>

      {/* Content — name + món list (one per line, ×qty pill) */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-foreground text-sm font-semibold leading-snug">{suat.name}</p>

        <ul className="space-y-0.5 mt-1">
          {lines.slice(0, 5).map((l, i) => (
            <li key={i} className="text-muted-fg text-xs flex items-center gap-1.5">
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                ×{l.qty}
              </span>
              <span>{l.name}</span>
            </li>
          ))}
          {lines.length > 5 && (
            <li className="text-muted-fg text-xs pl-1">và {lines.length - 5} món khác</li>
          )}
        </ul>
      </div>

      {/* Right column — price · qty stepper · món count */}
      <div className="flex-shrink-0 w-28 flex flex-col items-stretch gap-2.5">
        {/* Price — top, full width */}
        <p className="text-primary font-bold text-sm text-center">{formatVND(total)}</p>

        {/* Qty stepper — centered, spans full width */}
        <div className="flex-1 flex items-center justify-between">
          <button
            onClick={removeOne}
            disabled={qty === 0}
            className="bg-muted text-foreground w-8 h-8 rounded-full flex items-center justify-center
                       hover:bg-muted/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Bớt một suất"
          >
            <Minus size={14} />
          </button>
          <span className="text-foreground text-sm font-bold text-center">{qty}</span>
          <button
            onClick={addOne}
            className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center
                       hover:bg-primary/90 transition-colors"
            aria-label="Thêm một suất"
          >
            <Plus size={14} />
          </button>
        </div>

        <p className="text-muted-fg text-[11px] text-center">{count} món</p>
      </div>
    </div>
  )
}
