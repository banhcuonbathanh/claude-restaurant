'use client'
import { useCartStore } from '@/store/cart'
import { formatVND } from '@/lib/utils'

interface Props {
  onClick: () => void
}

export function MiniCartStrip({ onClick }: Props) {
  const { items, itemCount, total } = useCartStore()
  const count = itemCount()

  if (count === 0) return null

  return (
    <div className="sticky top-[57px] z-10 bg-background border-b border-border/60 px-4 py-2">
      <button
        onClick={onClick}
        className="w-full flex items-center gap-2 text-left"
      >
        <span className="bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
          {count} món
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {items.map(item => (
              <span
                key={item.id}
                className="shrink-0 text-xs text-foreground bg-muted px-2 py-0.5 rounded-full whitespace-nowrap"
              >
                {item.name} ×{item.quantity}
              </span>
            ))}
          </div>
        </div>
        <span className="shrink-0 text-xs font-bold text-primary ml-1">{formatVND(total())}</span>
      </button>
    </div>
  )
}
