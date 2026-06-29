'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Minus, Heart } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useFavouritesStore } from '@/store/favourites'
import type { Product } from '@/types/product'
import { formatVND } from '@/lib/utils'
import { flyToCart } from '@/lib/fly-to-cart'

interface Props {
  product: Product
}

export function ProductGridCard({ product }: Props) {
  const [nhanId, setNhanId] = useState<string>('')
  const { items, addItem, updateQty } = useCartStore()
  const { toggleFav, isFavourite } = useFavouritesStore()

  const fav = isFavourite(product.id, 'product')

  // Nhân options come straight from the product's available toppings — picked
  // inline on the card (same pattern as ComboCard), no modal.
  const nhanOptions  = (product.toppings ?? []).filter(t => t.is_available)
  const selectedNhan = nhanOptions.find(t => t.id === nhanId) ?? nhanOptions[0]

  const cartId   = `product_${product.id}_${selectedNhan?.id ?? 'plain'}`
  const cartItem = items.find(i => i.id === cartId)
  const qty      = cartItem?.quantity ?? 0

  const price = product.price + (selectedNhan?.price ?? 0)

  const imageUrl = product.image_path
    ? `${process.env.NEXT_PUBLIC_STORAGE_URL ?? ''}/${product.image_path}`
    : null

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
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
    flyToCart(e.currentTarget)
  }

  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Image */}
      <div className="relative aspect-square w-full">
        <Link href={`/menu/product/${product.id}`} className="block w-full h-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-3xl bg-muted">🍜</div>
          )}
          {!product.is_available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">Hết</span>
            </div>
          )}
        </Link>
        <button
          onClick={() => toggleFav(product.id, 'product')}
          className="absolute top-2 right-2 bg-white/80 rounded-full p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center"
          aria-label={fav ? 'Bỏ yêu thích' : 'Yêu thích'}
        >
          <Heart size={14} className={fav ? 'fill-primary text-primary' : 'text-muted-fg'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 p-2.5 flex-1">
        <Link href={`/menu/product/${product.id}`}>
          <p className="text-foreground text-sm font-semibold leading-snug line-clamp-2">
            {product.name}
          </p>
        </Link>
        <p className="text-primary font-bold text-sm">{formatVND(price)}</p>

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

        {/* Bottom row: chi tiết + qty control */}
        <div className="flex items-center justify-between mt-auto pt-1.5">
          <Link
            href={`/menu/product/${product.id}`}
            className="text-xs text-primary underline underline-offset-2"
          >
            Chi tiết
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQty(cartId, qty - 1)}
              disabled={qty === 0}
              className="bg-muted text-foreground w-7 h-7 rounded-full flex items-center justify-center
                         hover:bg-muted/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Minus size={12} />
            </button>
            <span className="text-foreground text-xs font-bold w-4 text-center">{qty}</span>
            <button
              onClick={handleAdd}
              disabled={!product.is_available}
              aria-label={`Thêm ${product.name} vào giỏ`}
              className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center
                         hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
