// P-SYSTEST reference build — Zone J per menu_spec.md §Zone J; not imported by the app.
'use client'
import { useCartStore } from '../store/cart'
import { formatVND } from '../lib/utils'

interface Props {
  onCheckout: () => void
  dimmed?:    boolean
}

export function CartBottomBar({ onCheckout, dimmed }: Props) {
  const { total, itemCount } = useCartStore()
  const count = itemCount()
  if (count === 0) return null

  return (
    // dimmed only lowers opacity — the tap still fires so the page can warn (canh gate).
    <div className={`fixed bottom-6 left-4 right-4 z-30 transition-opacity ${dimmed ? 'opacity-60' : ''}`}>
      <button
        onClick={onCheckout}
        className="w-full min-h-[44px] bg-primary text-white rounded-xl px-4 py-3 flex items-center justify-between font-semibold shadow-lg"
      >
        <span className="bg-white/20 text-white text-sm px-2.5 py-0.5 rounded-full">{count}</span>
        <span className="text-sm">Thanh toán</span>
        <span className="text-sm">{formatVND(total())}</span>
      </button>
    </div>
  )
}
