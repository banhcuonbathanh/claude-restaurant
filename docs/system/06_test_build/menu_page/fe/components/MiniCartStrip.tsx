// P-SYSTEST reference build — Zone A-strip per menu_spec.md §Mini Cart Strip; not imported by the app.
'use client'
import { useCartStore } from '../store/cart'
import { formatVND } from '../lib/utils'

interface Props {
  onClick: () => void
}

export function MiniCartStrip({ onClick }: Props) {
  const { items, total, itemCount } = useCartStore()
  const count = itemCount()
  if (count === 0) return null

  return (
    <button
      onClick={onClick}
      className="sticky top-[57px] z-10 w-full min-h-[44px] bg-card border-b border-border px-4 py-2 flex items-center gap-2"
    >
      <span className="bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
        {count} món
      </span>
      <div className="flex-1 flex gap-1.5 overflow-x-auto scrollbar-hide">
        {items.map(item => (
          <span key={item.id} className="bg-muted text-foreground text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
            {item.name} ×{item.quantity}
          </span>
        ))}
      </div>
      <span className="text-primary text-sm font-semibold whitespace-nowrap">{formatVND(total())}</span>
    </button>
  )
}
