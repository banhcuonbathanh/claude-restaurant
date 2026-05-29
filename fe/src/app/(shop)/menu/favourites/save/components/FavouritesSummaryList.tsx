'use client'
import { formatVND } from '@/lib/utils'
import type { FavouriteItemResolved } from '@/store/favourites'

interface Props {
  items: FavouriteItemResolved[]
}

export function FavouritesSummaryList({ items }: Props) {
  const total = items.reduce((sum, i) => sum + i.subtotalPerPortion * i.qty, 0)

  return (
    <div className="bg-[#f8fafc] rounded-xl px-4 py-3 space-y-3">
      <p className="text-sm font-semibold text-foreground">Tóm tắt:</p>

      {items.map((item, idx) => (
        <div key={item.id}>
          {idx > 0 && <hr className="border-dashed border-border mb-3" />}
          <div className="text-sm text-foreground font-medium">
            ▸ {item.name} × {item.qty}
            <span className="text-muted-fg font-normal ml-1">
              ({formatVND(item.basePrice)}{item.type === 'product' ? '/phần' : ''})
            </span>
          </div>

          {item.comboItems.map(ci => (
            <div key={ci.name} className="flex justify-between text-xs text-muted-fg pl-3 mt-0.5">
              <span>• {ci.name} × {ci.qty}</span>
            </div>
          ))}

          {item.selectedToppings.map(t => (
            <div key={t.id} className="flex justify-between text-xs text-muted-fg pl-3 mt-0.5">
              <span>+ {t.name}</span>
              <span>{formatVND(t.price * item.qty)}</span>
            </div>
          ))}
        </div>
      ))}

      <hr className="border-border" />
      <div className="flex justify-end text-sm font-bold text-foreground">
        Tổng: {formatVND(total)}
      </div>
    </div>
  )
}
