// P-SYSTEST reference build — Zone F desktop/tablet grid variant (≥sm): square image,
// w-6 h-6 steppers, same inline nhân pills + cart-id scheme as ProductCard; not imported by the app.
'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Minus, Heart } from 'lucide-react'
import { useCartStore } from '../store/cart'
import { useFavouritesStore } from '../store/favourites'
import type { Product } from '../types/product'
import { formatVND } from '../lib/utils'

interface Props {
  product: Product
}

export function ProductGridCard({ product }: Props) {
  const [nhanId, setNhanId] = useState<string>('')
  const { items, addItem, updateQty } = useCartStore()
  const { toggleFav, isFavourite } = useFavouritesStore()
  const fav = isFavourite(product.id, 'product')

  const nhanOptions  = product.toppings.filter(t => t.is_available)
  const selectedNhan = nhanOptions.find(t => t.id === nhanId) ?? nhanOptions[0]

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
    <div className="bg-card rounded-xl overflow-hidden flex flex-col">
      {/* Square image */}
      <div className="relative aspect-square bg-muted">
        <Link href={`/menu/product/${product.id}`} className="absolute inset-0">
          {imageUrl ? (
            <Image src={imageUrl} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl">🍜</div>
          )}
          {!product.is_available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">Hết</span>
            </div>
          )}
        </Link>
        <button
          onClick={() => toggleFav(product.id, 'product')}
          className="absolute top-2 right-2 bg-white/80 rounded-full p-1.5"
          aria-label={fav ? 'Bỏ yêu thích' : 'Yêu thích'}
        >
          <Heart size={16} className={fav ? 'fill-red-500 text-red-500' : 'text-muted-fg'} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <Link href={`/menu/product/${product.id}`}>
          <p className="text-foreground text-sm font-semibold leading-snug line-clamp-1">{product.name}</p>
        </Link>

        {nhanOptions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {nhanOptions.map(nhan => (
              <button
                key={nhan.id}
                onClick={() => setNhanId(nhan.id)}
                className={`text-[11px] px-2 py-1 rounded-full border transition-colors ${
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

        <div className="mt-auto flex items-center justify-between">
          <p className="text-primary font-bold text-sm">{formatVND(price)}</p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => updateQty(cartId, qty - 1)}
              disabled={qty === 0}
              className="bg-muted text-foreground w-6 h-6 rounded-full flex items-center justify-center disabled:opacity-40"
            >
              <Minus size={12} />
            </button>
            <span className="text-foreground text-sm font-bold w-5 text-center">{qty}</span>
            <button
              onClick={handleAdd}
              disabled={!product.is_available}
              aria-label="Thêm vào giỏ hàng"
              className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center disabled:opacity-40"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
