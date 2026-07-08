'use client'

interface Props {
  itemCount:      number
  onAddAllToCart: () => void
}

// In-flow CTA — rendered under the selected-dishes summary table (no longer a floating
// pill). The table already shows the qty + total, so the button is just a centered
// action label; the right edge is kept clear of the floating speed-dial FAB.
export function FavouritesFooter({ itemCount, onAddAllToCart }: Props) {
  return (
    <div className="px-4 pb-4">
      <button
        onClick={onAddAllToCart}
        className="w-full rounded-full bg-primary px-5 py-3.5 text-center text-white font-semibold shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
      >
        🛒 Thêm tất cả vào giỏ · {itemCount} món
      </button>
    </div>
  )
}
