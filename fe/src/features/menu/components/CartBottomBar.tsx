'use client'
import { useCartStore } from '@/store/cart'
import { formatVND } from '@/lib/utils'

interface Props {
  onCheckout: () => void
  /** When true the bar is dimmed (e.g. canh not chosen yet) — checkout still fires so the page can warn. */
  dimmed?: boolean
}

export function CartBottomBar({ onCheckout, dimmed = false }: Props) {
  const { itemCount, total } = useCartStore()
  const count = itemCount()

  if (count === 0) return null

  return (
    <div className="fixed bottom-6 left-4 right-4 z-30">
      <button
        onClick={onCheckout}
        className={`w-full bg-primary text-white py-3.5 rounded-2xl font-semibold flex items-center justify-between px-5 shadow-lg min-h-[44px] transition-opacity ${dimmed ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {count}
        </span>
        <span>Thanh toán</span>
        <span className="font-bold">{formatVND(total())}</span>
      </button>
    </div>
  )
}
