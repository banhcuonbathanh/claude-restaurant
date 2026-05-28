'use client'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { useFavouritesStore } from '@/store/favourites'
import type { Product, Combo } from '@/types/product'
import { formatVND } from '@/lib/utils'

interface Props {
  products: Product[]
  combos:   Combo[]
}

export function FavouritesRail({ products, combos }: Props) {
  const { ids, toggle } = useFavouritesStore()

  const favProducts = products.filter(p => ids.includes(`product_${p.id}`))
  const favCombos   = combos.filter(c => ids.includes(`combo_${c.id}`))

  if (favProducts.length === 0 && favCombos.length === 0) return null

  return (
    <section className="py-3">
      <h2 className="text-sm font-semibold text-muted-fg uppercase tracking-wide px-4 mb-2">
        Yêu thích
      </h2>
      <div className="flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
        {favProducts.map(p => (
          <FavCard
            key={`product_${p.id}`}
            id={`product_${p.id}`}
            name={p.name}
            price={p.price}
            imagePath={p.image_path}
            onToggle={toggle}
          />
        ))}
        {favCombos.map(c => (
          <FavCard
            key={`combo_${c.id}`}
            id={`combo_${c.id}`}
            name={c.name}
            price={c.price}
            imagePath={c.image_path}
            onToggle={toggle}
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
  onToggle:  (id: string) => void
}

function FavCard({ id, name, price, imagePath, onToggle }: FavCardProps) {
  const imageUrl = imagePath
    ? `${process.env.NEXT_PUBLIC_STORAGE_URL ?? ''}/${imagePath}`
    : null

  return (
    <div className="relative flex-shrink-0 w-28 bg-card rounded-xl overflow-hidden shadow-sm">
      <div className="relative w-full h-20 bg-muted">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill className="object-cover" sizes="112px" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🍜</div>
        )}
        <button
          onClick={() => onToggle(id)}
          className="absolute top-1 right-1 bg-white/80 rounded-full p-1 min-w-[28px] min-h-[28px] flex items-center justify-center"
          aria-label="Bỏ yêu thích"
        >
          <Heart size={12} className="fill-red-500 text-red-500" />
        </button>
      </div>
      <div className="p-2">
        <p className="text-xs font-medium text-foreground line-clamp-1 leading-snug">{name}</p>
        <p className="text-xs text-primary font-bold mt-0.5">{formatVND(price)}</p>
      </div>
    </div>
  )
}
