// P-SYSTEST reference build — add-order banner per menu_spec.md §Add-to-Order Banner; not imported by the app.
'use client'
import { PlusCircle } from 'lucide-react'

interface Props {
  orderId?:    string
  onViewOrder: () => void
}

export function AddToOrderBanner({ orderId, onViewOrder }: Props) {
  if (!orderId) return null

  return (
    <div className="mx-4 mt-3 bg-primary/10 border border-primary/30 rounded-xl p-3 flex items-center gap-2">
      <PlusCircle size={18} className="text-primary flex-shrink-0" />
      <p className="flex-1 text-sm text-foreground">Chọn món để thêm vào đơn hàng hiện tại</p>
      <button
        onClick={onViewOrder}
        className="text-sm text-primary font-semibold min-h-[44px] px-2"
      >
        Xem đơn
      </button>
    </div>
  )
}
