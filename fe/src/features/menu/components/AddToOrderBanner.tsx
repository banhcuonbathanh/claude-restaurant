'use client'
import { PlusCircle } from 'lucide-react'

interface Props {
  orderId?: string
  onViewOrder: () => void
}

export function AddToOrderBanner({ orderId, onViewOrder }: Props) {
  if (!orderId) return null

  return (
    <div className="mx-4 mt-3 flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-xl px-4 py-2.5">
      <PlusCircle size={16} className="text-primary shrink-0" />
      <p className="text-sm text-primary font-medium flex-1">
        Chọn món để thêm vào đơn hàng hiện tại
      </p>
      <button
        onClick={onViewOrder}
        className="text-xs text-primary underline underline-offset-2 shrink-0"
      >
        Xem đơn
      </button>
    </div>
  )
}
