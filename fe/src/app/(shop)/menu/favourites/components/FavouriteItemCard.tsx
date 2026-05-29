'use client'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { QuantityStepper } from '@/components/shared/QuantityStepper'
import { formatVND } from '@/lib/utils'
import type { FavouriteItemResolved } from '@/store/favourites'

interface Props {
  item:        FavouriteItemResolved
  onRemove:    (id: string) => void
  onQtyChange: (id: string, qty: number) => void
}

export function FavouriteItemCard({ item, onRemove, onQtyChange }: Props) {
  const isCombo = item.type === 'combo'

  return (
    <div className="bg-card rounded-xl shadow-sm overflow-hidden">
      <div className="flex gap-3 p-3">
        {/* Image */}
        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              sizes="64px"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xl">🍜</div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase flex-shrink-0
                ${isCombo ? 'bg-primary text-white' : 'bg-muted text-muted-fg'}`}>
                {isCombo ? 'Combo' : 'Món lẻ'}
              </span>
              <p className="text-foreground text-sm font-semibold line-clamp-1">{item.name}</p>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
              aria-label="Xoá khỏi yêu thích"
            >
              <Heart size={18} className="fill-red-500 text-red-500" />
            </button>
          </div>
          <p className="text-muted-fg text-xs mt-0.5">{formatVND(item.basePrice)}/phần</p>
        </div>
      </div>

      {/* Toppings / combo items detail */}
      {(item.selectedToppings.length > 0 || item.comboItems.length > 0) && (
        <div className="mx-3 mb-2 pt-2 border-t border-border space-y-0.5">
          {item.comboItems.map(ci => (
            <div key={ci.name} className="flex justify-between text-xs text-muted-fg">
              <span>• {ci.name} × {ci.qty}</span>
            </div>
          ))}
          {item.selectedToppings.map(t => (
            <div key={t.id} className="flex justify-between text-xs text-muted-fg">
              <span>+ {t.name}</span>
              <span>{formatVND(t.price)}</span>
            </div>
          ))}
          {item.selectedToppings.length > 0 && (
            <div className="flex justify-between text-xs font-semibold text-foreground pt-1">
              <span>Tổng/phần</span>
              <span>{formatVND(item.subtotalPerPortion)}</span>
            </div>
          )}
        </div>
      )}

      {/* Qty stepper */}
      <div className="flex justify-end px-3 pb-3">
        <QuantityStepper
          value={item.qty}
          min={1}
          onChange={(n) => onQtyChange(item.id, n)}
          size="sm"
        />
      </div>
    </div>
  )
}
