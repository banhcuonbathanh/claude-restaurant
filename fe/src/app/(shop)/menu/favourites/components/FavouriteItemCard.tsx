'use client'
import Image from 'next/image'
import { Heart, Minus, Plus } from 'lucide-react'
import { formatVND } from '@/lib/utils'
import type { FavouriteItemResolved } from '@/store/favourites'

interface Props {
  item:        FavouriteItemResolved
  onRemove:    (id: string) => void
  onQtyChange: (id: string, qty: number) => void
}

// Mirrors the menu ProductCard layout (image · content · price+qty column) so the
// favourites list reads with the same visual language: heart badge on the image,
// orange bold price, and a grey-minus / orange-plus round qty control.
export function FavouriteItemCard({ item, onRemove, onQtyChange }: Props) {
  const hasDetail = item.selectedToppings.length > 0 || item.comboItems.length > 0

  return (
    <div className="bg-card rounded-xl flex gap-3 p-3 shadow-sm">
      {/* Image + heart badge */}
      <div className="relative w-20 flex-shrink-0" style={{ minHeight: '80px' }}>
        <div className="relative block w-20 h-20 rounded-lg overflow-hidden bg-muted">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              sizes="80px"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-2xl">🍜</div>
          )}
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="absolute top-1 right-1 bg-white/80 rounded-full p-1.5"
          aria-label="Xoá khỏi yêu thích"
        >
          <Heart size={16} className="fill-primary text-primary" />
        </button>
      </div>

      {/* Content — name + topping/combo detail */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-foreground text-sm font-semibold leading-snug line-clamp-2">
          {item.name}
        </p>
        {hasDetail && (
          <div className="text-muted-fg text-xs space-y-0.5">
            {item.comboItems.map(ci => (
              <p key={ci.name} className="line-clamp-1">• {ci.name} × {ci.qty}</p>
            ))}
            {item.selectedToppings.map(t => (
              <p key={t.id} className="line-clamp-1">+ {t.name}</p>
            ))}
          </div>
        )}
      </div>

      {/* Right column — orange price + qty control */}
      <div className="flex-shrink-0 w-28 flex flex-col items-stretch gap-2.5">
        <p className="text-primary font-bold text-sm text-center">
          {formatVND(item.subtotalPerPortion)}
        </p>
        <div className="flex items-center justify-between">
          <button
            onClick={() => onQtyChange(item.id, item.qty - 1)}
            disabled={item.qty <= 1}
            className="bg-muted text-foreground w-8 h-8 rounded-full flex items-center justify-center
                       hover:bg-muted/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Giảm số lượng"
          >
            <Minus size={14} />
          </button>
          <span className="text-foreground text-sm font-bold text-center">{item.qty}</span>
          <button
            onClick={() => onQtyChange(item.id, item.qty + 1)}
            className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center
                       hover:bg-primary/90 transition-colors"
            aria-label="Tăng số lượng"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
