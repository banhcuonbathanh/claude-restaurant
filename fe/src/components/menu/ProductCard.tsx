'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Minus, Heart } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useFavouritesStore } from '@/store/favourites'
import type { Product, Topping } from '@/types/product'
import { formatVND } from '@/lib/utils'
import { ToppingModal } from './ToppingModal'

interface Props {
  product: Product
}

export function ProductCard({ product }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const { items, addItem, updateQty } = useCartStore()

  const { toggle: toggleFav, isFavourite } = useFavouritesStore()
  const fav = isFavourite(`product_${product.id}`)

  const hasToppings = (product.toppings ?? []).some(t => t.is_available)

  // For no-topping products only — tracks the single cart entry
  const noToppingCartId = `product_${product.id}_`
  const noToppingItem   = items.find(i => i.id === noToppingCartId)
  const noToppingQty    = noToppingItem?.quantity ?? 0

  const imageUrl = product.image_path
    ? `${process.env.NEXT_PUBLIC_STORAGE_URL ?? ''}/${product.image_path}`
    : null

  const handleDirectAdd = () => {
    if (noToppingQty === 0) {
      addItem({
        id:         noToppingCartId,
        type:       'product',
        product_id: product.id,
        name:       product.name,
        quantity:   1,
        price:      product.price,
        toppings:   [],
      })
    } else {
      updateQty(noToppingCartId, noToppingQty + 1)
    }
  }

  const handleModalConfirm = (selected: Topping[]) => {
    const sortedIds = selected.map(t => t.id).sort().join('-')
    const cartId    = `product_${product.id}_${sortedIds}`
    const price     = product.price + selected.reduce((s, t) => s + t.price, 0)
    addItem({
      id:         cartId,
      type:       'product',
      product_id: product.id,
      name:       product.name,
      quantity:   1,
      price,
      toppings:   selected,
    })
    setModalOpen(false)
  }

  return (
    <div className="bg-card rounded-xl flex gap-3 p-3 shadow-sm">
      {/* Image — taps navigate to detail page */}
      <div className="relative w-20 h-20 flex-shrink-0">
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
          onClick={() => toggleFav(`product_${product.id}`)}
          className="absolute top-1 right-1 bg-white/80 rounded-full p-0.5"
          aria-label={fav ? 'Bỏ yêu thích' : 'Yêu thích'}
        >
          <Heart size={12} className={fav ? 'fill-red-500 text-red-500' : 'text-muted-fg'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Name + price */}
        <div className="flex items-start justify-between gap-2">
          <Link href={`/menu/product/${product.id}`} className="flex-1">
            <p className="text-foreground text-sm font-semibold leading-snug line-clamp-2">
              {product.name}
            </p>
          </Link>
          <p className="text-primary font-bold text-sm flex-shrink-0">{formatVND(product.price)}</p>
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-muted-fg text-xs line-clamp-2">{product.description}</p>
        )}

        {/* Topping hint — opens modal */}
        {hasToppings && (
          <p className="text-muted-fg text-xs">Có thể chọn topping</p>
        )}

        {/* Chi tiết + qty / add control */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <Link
            href={`/menu/product/${product.id}`}
            className="text-xs text-primary underline underline-offset-2"
          >
            Chi tiết
          </Link>

          {hasToppings ? (
            <button
              onClick={() => setModalOpen(true)}
              disabled={!product.is_available}
              aria-label="Thêm vào giỏ hàng"
              className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center
                         hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
            </button>
          ) : noToppingQty === 0 ? (
            <button
              onClick={handleDirectAdd}
              disabled={!product.is_available}
              aria-label="Thêm vào giỏ hàng"
              className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center
                         hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQty(noToppingCartId, noToppingQty - 1)}
                className="bg-muted text-foreground w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="text-foreground text-sm font-bold w-4 text-center">{noToppingQty}</span>
              <button
                onClick={handleDirectAdd}
                className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <ToppingModal
        product={product}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleModalConfirm}
      />
    </div>
  )
}
