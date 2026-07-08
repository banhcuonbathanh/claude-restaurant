'use client'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
      {/* Cart pill — scrolls to order summary. 44px = min touch target (rule 02 §3). */}
      <button
        onClick={onViewSummary}
        data-cart-fly-target
        className="relative bg-card text-foreground rounded-full w-11 h-11 flex items-center justify-center shadow-md border border-border"
        aria-label="Xem tóm tắt đơn hàng"
      >
        <ShoppingCart size={20} />
        {/* Round orange count badge */}
        <span className="absolute -top-1 -right-1 bg-primary text-white rounded-full text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
          {count}
        </span>
      </button>

      {/* Thanh toán pill */}
      <Button
        onClick={onCheckout}
        className={`rounded-full min-h-[44px] transition-opacity ${dimmed ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        Thanh toán
      </Button>
    </div>
  )
}
