// P-SYSTEST reference build — Zone D per menu_spec.md §Zone D (FavCard links to
// /menu/favourites, NOT product detail); not imported by the app.
'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { useFavouritesStore } from '../store/favourites'
import type { Product, Combo } from '../types/product'
import { formatVND } from '../lib/utils'

interface Props {
  products: Product[]   // all products (for fav resolution)
  combos:   Combo[]     // enriched combos (for fav resolution)
}

interface FavDisplay {
  id:         string
  type:       'product' | 'combo'
  name:       string
  price:      number
  image_path: string | null
}

function FavCard({ item, onToggle }: { item: FavDisplay; onToggle: () => void }) {
  const imageUrl = item.image_path
    ? `${process.env.NEXT_PUBLIC_STORAGE_URL ?? ''}/${item.image_path}`
    : null

  return (
    <div className="relative w-28 flex-shrink-0">
      <Link href="/menu/favourites" className="block bg-card rounded-xl overflow-hidden">
        <div className="relative h-20 bg-muted">
          {imageUrl ? (
            <Image src={imageUrl} alt={item.name} fill className="object-cover" sizes="112px" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-2xl">🍜</div>
          )}
        </div>
        <div className="p-2">
          <p className="text-foreground text-xs font-medium line-clamp-1">{item.name}</p>
          <p className="text-primary text-xs font-semibold">{formatVND(item.price)}</p>
        </div>
      </Link>
      <button
        onClick={onToggle}
        className="absolute top-1 right-1 bg-white/80 rounded-full p-1"
        aria-label="Bỏ yêu thích"
      >
        <Heart size={14} className="fill-red-500 text-red-500" />
      </button>
    </div>
  )
}

export function FavouritesRail({ products, combos }: Props) {
  const { items: favItems, toggleFav } = useFavouritesStore()

  // Favourites store carries only {id, type} — names/prices resolved from the catalog here.
  const resolved: FavDisplay[] = favItems.flatMap(fav => {
    if (fav.type === 'product') {
      const p = products.find(x => x.id === fav.id)
      return p ? [{ id: p.id, type: 'product' as const, name: p.name, price: p.price, image_path: p.image_path }] : []
    }
    const c = combos.find(x => x.id === fav.id)
    return c ? [{ id: c.id, type: 'combo' as const, name: c.name, price: c.price, image_path: c.image_path }] : []
  })

  if (resolved.length === 0) return null

  return (
    <section className="mt-3">
      <p className="text-xs font-semibold text-muted-fg uppercase tracking-wide px-4 mb-2">Yêu thích</p>
      <div className="flex gap-3 overflow-x-auto px-4 scrollbar-hide">
        {resolved.map(item => (
          <FavCard key={`${item.type}_${item.id}`} item={item} onToggle={() => toggleFav(item.id, item.type)} />
        ))}
      </div>
    </section>
  )
}
