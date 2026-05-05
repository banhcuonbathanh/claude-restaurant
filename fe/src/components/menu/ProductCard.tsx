'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Star, Plus, Minus } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import type { Product } from '@/types/product'
import { formatVND } from '@/lib/utils'

interface Props {
  product: Product
}

export function ProductCard({ product }: Props) {
  const [selectedToppings, setSelectedToppings] = useState<Set<string>>(new Set())
  const { items, addItem, updateQty, removeItem } = useCartStore()

  const sortedIds = Array.from(selectedToppings).sort().join('-')
  const cartId    = `product_${product.id}_${sortedIds}`
  const cartItem  = items.find(i => i.id === cartId)
  const qty       = cartItem?.quantity ?? 0

  const imageUrl = product.image_path
    ? `${process.env.NEXT_PUBLIC_STORAGE_URL ?? ''}/${product.image_path}`
    : null

  const toggleTopping = (id: string) => {
    // remove old cart entry when topping selection changes
    const oldCartId = `product_${product.id}_${Array.from(selectedToppings).sort().join('-')}`
    const oldItem   = items.find(i => i.id === oldCartId)
    if (oldItem) removeItem(oldItem.id)

    setSelectedToppings(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toppingPrice = (product.toppings ?? [])
    .filter(t => selectedToppings.has(t.id))
    .reduce((s, t) => s + t.price, 0)
  const unitPrice = product.price + toppingPrice

  const handleAdd = () => {
    if (qty === 0) {
      addItem({
        id:         cartId,
        type:       'product',
        product_id: product.id,
        name:       product.name,
        quantity:   1,
        price:      unitPrice,
        toppings:   (product.toppings ?? []).filter(t => selectedToppings.has(t.id)),
      })
    } else {
      updateQty(cartId, qty + 1)
    }
  }

  const availableToppings = (product.toppings ?? []).filter(t => t.is_available)

  return (
    <div className="bg-card rounded-xl flex gap-3 p-3 shadow-sm">
      {/* Image */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
        {imageUrl ? (
          <Image src={imageUrl} alt={product.name} fill className="object-cover" sizes="80px" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🍜</div>
        )}
        {!product.is_available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">Hết</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Name + price */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-foreground text-sm font-semibold leading-snug line-clamp-2 flex-1">
            {product.name}
          </p>
          <p className="text-primary font-bold text-sm flex-shrink-0">{formatVND(unitPrice)}</p>
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-muted-fg text-xs line-clamp-2">{product.description}</p>
        )}

        {/* Topping chips */}
        {availableToppings.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {availableToppings.map(t => (
              <button
                key={t.id}
                onClick={() => toggleTopping(t.id)}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  selectedToppings.has(t.id)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-transparent text-muted-fg border-border hover:border-primary'
                }`}
              >
                {t.name} +{formatVND(t.price)}
              </button>
            ))}
          </div>
        )}

        {/* Stars + qty control */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                size={10}
                className={i <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-fg'}
              />
            ))}
          </div>

          {qty === 0 ? (
            <button
              onClick={handleAdd}
              disabled={!product.is_available}
              className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center
                         hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQty(cartId, qty - 1)}
                className="bg-muted text-foreground w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="text-foreground text-sm font-bold w-4 text-center">{qty}</span>
              <button
                onClick={handleAdd}
                className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
