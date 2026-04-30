'use client'
import { useRouter } from 'next/navigation'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { formatVND } from '@/lib/utils'

interface Props {
  open:    boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: Props) {
  const router = useRouter()
  const { items, updateQty, removeItem, total, itemCount } = useCartStore()

  const handleCheckout = () => {
    onClose()
    router.push('/checkout')
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-card z-50 flex flex-col shadow-2xl
                    transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display text-lg text-foreground font-semibold">
            Giỏ hàng ({itemCount()} món)
          </h2>
          <button onClick={onClose} className="text-muted-fg hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-muted-fg text-sm text-center mt-12">Giỏ hàng trống</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-medium leading-snug truncate">
                    {item.name}
                  </p>
                  {item.toppings.length > 0 && (
                    <p className="text-muted-fg text-xs mt-0.5">
                      + {item.toppings.map(t => t.name).join(', ')}
                    </p>
                  )}
                  <p className="text-primary text-sm font-semibold mt-1">
                    {formatVND(item.price * item.quantity)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateQty(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-fg hover:text-foreground"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-foreground text-sm w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-fg hover:text-foreground"
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-7 h-7 flex items-center justify-center text-muted-fg hover:text-urgent"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-fg text-sm">Tổng cộng</span>
            <span className="text-primary text-xl font-bold">{formatVND(total())}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={items.length === 0}
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            Thanh toán
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-muted-fg text-sm hover:text-foreground transition-colors"
          >
            Tiếp tục chọn món
          </button>
        </div>
      </div>
    </>
  )
}
