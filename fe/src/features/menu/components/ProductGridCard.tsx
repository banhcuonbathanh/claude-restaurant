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

export function ProductGridCard({ product }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const { items, addItem, updateQty } = useCartStore()
  const { toggleFav, isFavourite } = useFavouritesStore()

  const fav = isFavourite(product.id, 'product')
  const hasToppings = (product.toppings ?? []).some(t => t.is_available)

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
          <Heart size={14} className={fav ? 'fill-red-500 text-red-500' : 'text-muted-fg'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 p-2.5 flex-1">
        <Link href={`/menu/product/${product.id}`}>
          <p className="text-foreground text-sm font-semibold leading-snug line-clamp-2">
            {product.name}
          </p>
        </Link>
        <p className="text-primary font-bold text-sm">{formatVND(product.price)}</p>
        {hasToppings && (
          <p className="text-muted-fg text-xs leading-none">Có thể chọn topping</p>
        )}

        {/* Bottom row: chi tiết + add/stepper */}
        <div className="flex items-center justify-between mt-auto pt-1.5">
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
              aria-label={`Thêm ${product.name} vào giỏ`}
              className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center
                         hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
            </button>
          ) : noToppingQty === 0 ? (
            <button
              onClick={handleDirectAdd}
              disabled={!product.is_available}
              aria-label={`Thêm ${product.name} vào giỏ`}
              className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center
                         hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateQty(noToppingCartId, noToppingQty - 1)}
                className="bg-muted text-foreground w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <Minus size={11} />
              </button>
              <span className="text-foreground text-xs font-bold w-4 text-center">{noToppingQty}</span>
              <button
                onClick={handleDirectAdd}
                className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Plus size={11} />
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
