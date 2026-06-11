'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Minus, Heart } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useFavouritesStore } from '@/store/favourites'
import type { Product } from '@/types/product'
import { formatVND } from '@/lib/utils'

interface Props {
  product: Product
}

export function ProductCard({ product }: Props) {
  const [nhanId, setNhanId] = useState<string>('')
  const { items, addItem, updateQty } = useCartStore()

  const { toggleFav, isFavourite } = useFavouritesStore()
  const fav = isFavourite(product.id, 'product')

  // Nhân options come straight from the product's available toppings — picked
  // inline on the card (same pattern as ComboCard), no modal.
  const nhanOptions   = product.toppings.filter(t => t.is_available)
  const selectedNhan  = nhanOptions.find(t => t.id === nhanId) ?? nhanOptions[0]

  const cartId   = `product_${product.id}_${selectedNhan?.id ?? 'plain'}`
  const cartItem = items.find(i => i.id === cartId)
  const qty      = cartItem?.quantity ?? 0

  const price = product.price + (selectedNhan?.price ?? 0)

  const imageUrl = product.image_path
    ? `${process.env.NEXT_PUBLIC_STORAGE_URL ?? ''}/${product.image_path}`
    : null

  const handleAdd = () => {
    if (qty === 0) {
      addItem({
        id:         cartId,
        type:       'product',
        product_id: product.id,
        name:       product.name,
        quantity:   1,
        price,
        toppings:   selectedNhan ? [selectedNhan] : [],
      })
    } else {
      updateQty(cartId, qty + 1)
    }
  }

  return (
    <div className="bg-card rounded-xl flex gap-3 p-3 shadow-sm">
      {/* Image — taps navigate to detail page */}
      <div className="relative w-20 flex-shrink-0" style={{ minHeight: '80px' }}>
        <Link href={`/menu/product/${product.id}`} className="relative block w-20 h-20 rounded-lg overflow-hidden bg-muted">
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
        </Link>
        <button
          onClick={() => toggleFav(product.id, 'product')}
          className="absolute top-1 right-1 bg-white/80 rounded-full p-1.5"
          aria-label={fav ? 'Bỏ yêu thích' : 'Yêu thích'}
        >
          <Heart size={16} className={fav ? 'fill-red-500 text-red-500' : 'text-muted-fg'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Name */}
        <Link href={`/menu/product/${product.id}`}>
          <p className="text-foreground text-sm font-semibold leading-snug line-clamp-2">
            {product.name}
          </p>
        </Link>

        {/* Description */}
        {product.description && (
          <p className="text-muted-fg text-xs line-clamp-2">{product.description}</p>
        )}

        {/* Chi tiết */}
        <div className="mt-auto pt-1">
          <Link
            href={`/menu/product/${product.id}`}
            className="text-xs text-primary underline underline-offset-2"
          >
            Chi tiết
          </Link>
        </div>
      </div>

      {/* Right column — price · qty control · nhân pills */}
      <div className="flex-shrink-0 w-28 flex flex-col items-stretch gap-2.5">
        {/* Price — top, full width */}
        <p className="text-primary font-bold text-sm text-center">{formatVND(price)}</p>

        {/* Qty control — centered, spans full width */}
        <div className="flex-1 flex items-center justify-between">
          <button
            onClick={() => updateQty(cartId, qty - 1)}
            disabled={qty === 0}
            className="bg-muted text-foreground w-8 h-8 rounded-full flex items-center justify-center
                       hover:bg-muted/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Minus size={14} />
          </button>
          <span className="text-foreground text-sm font-bold text-center">{qty}</span>
          <button
            onClick={handleAdd}
            disabled={!product.is_available}
            aria-label="Thêm vào giỏ hàng"
            className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center
                       hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Nhân selector — data-driven pills, single-select */}
        {nhanOptions.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {nhanOptions.map(nhan => (
              <button
                key={nhan.id}
                onClick={() => setNhanId(nhan.id)}
                className={`w-full text-center text-[11px] px-2 py-1 rounded-full border transition-colors ${
                  (selectedNhan?.id === nhan.id)
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-muted-fg hover:border-primary/50'
                }`}
              >
                {nhan.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
