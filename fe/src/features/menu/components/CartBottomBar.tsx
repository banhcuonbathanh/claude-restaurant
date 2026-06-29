'use client'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart'

interface Props {
  onCheckout: () => void
  onViewSummary: () => void
  /** dimmed when canh not chosen yet — checkout still fires so the page can warn. */
  dimmed?: boolean
}

export function CartBottomBar({ onCheckout, onViewSummary, dimmed = false }: Props) {
  const { itemCount } = useCartStore()
  const count = itemCount()

  if (count === 0) return null

  return (
    <div className="fixed bottom-[calc(80px+env(safe-area-inset-bottom))] right-4 z-30 flex flex-col items-end gap-2">
      {/* Cart pill — scrolls to order summary */}
      <button
        onClick={onViewSummary}
        data-cart-fly-target
        className="relative bg-card text-foreground rounded-full w-12 h-12 flex items-center justify-center shadow-lg border border-border"
        aria-label="Xem tóm tắt đơn hàng"
      >
        <ShoppingCart size={22} />
        {/* Round orange count badge */}
        <span className="absolute -top-1.5 -right-1.5 bg-primary text-white rounded-full text-xs font-bold min-w-[20px] h-5 flex items-center justify-center px-1 leading-none">
          {count}
        </span>
      </button>

      {/* Thanh toán pill */}
      <button
        onClick={onCheckout}
        className={`bg-primary text-white rounded-full px-5 py-2.5 font-semibold shadow-lg min-h-[44px] transition-opacity ${dimmed ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        Thanh toán
      </button>
    </div>
  )
}
