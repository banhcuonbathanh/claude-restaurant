'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useFavouritesStore } from '@/store/favourites'
import type { Product, Combo } from '@/types/product'
import { formatVND } from '@/lib/utils'

interface Props {
  products: Product[]
  combos:   Combo[]
}

export function FavouritesRail({ products, combos }: Props) {
  const { items, toggleFav } = useFavouritesStore()

  const favProducts = products.filter(p => items.some(i => i.id === p.id && i.type === 'product'))
  const favCombos   = combos.filter(c => items.some(i => i.id === c.id && i.type === 'combo'))

  if (favProducts.length === 0 && favCombos.length === 0) return null

  return (
    <section className="py-3">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-muted-fg uppercase tracking-wide px-4 mb-2">
        <Heart size={12} className="fill-primary text-primary" />
        Yêu thích
      </h2>
      <div className="flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
        {favProducts.map(p => (
          <FavCard
            key={`product_${p.id}`}
            id={p.id}
            name={p.name}
            price={p.price}
            imagePath={p.image_path}
            type="product"
            onToggle={toggleFav}
          />
        ))}
        {favCombos.map(c => (
          <FavCard
            key={`combo_${c.id}`}
            id={c.id}
            name={c.name}
            price={c.price}
            imagePath={c.image_path}
            type="combo"
            onToggle={toggleFav}
          />
        ))}
      </div>
    </section>
  )
}

interface FavCardProps {
  id:        string
  name:      string
  price:     number
  imagePath: string | null
  type:      'product' | 'combo'
  onToggle:  (id: string, type: 'product' | 'combo') => void
}

function FavCard({ id, name, price, imagePath, type, onToggle }: FavCardProps) {
  const imageUrl = imagePath
    ? `${process.env.NEXT_PUBLIC_STORAGE_URL ?? ''}/${imagePath}`
    : null

  const detailHref = type === 'combo' ? `/menu/combo/${id}` : `/menu/product/${id}`

  return (
    <div className="relative flex-shrink-0 w-28 bg-card rounded-xl overflow-hidden shadow-sm">
      <Link href={detailHref} className="block">
        <div className="relative w-full h-20 bg-muted">
          {imageUrl ? (
            <Image src={imageUrl} alt={name} fill className="object-cover" sizes="112px" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-2xl">🍜</div>
          )}
        </div>
        <div className="p-2">
          <p className="text-xs font-medium text-foreground line-clamp-1 leading-snug">{name}</p>
          <p className="text-xs text-primary font-bold mt-0.5">{formatVND(price)}</p>
        </div>
      </Link>
      <button
        onClick={() => onToggle(id, type)}
        className="absolute top-1 right-1 bg-white/80 rounded-full p-1 min-w-[28px] min-h-[28px] flex items-center justify-center"
        aria-label="Bỏ yêu thích"
      >
        <Heart size={12} className="fill-primary text-primary" />
      </button>
    </div>
  )
}
