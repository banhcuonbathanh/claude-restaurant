'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { X, Minus, Plus, Trash2, ChevronDown, ChevronUp, ClipboardList } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useSettingsStore } from '@/store/settings'
import { formatVND } from '@/lib/utils'
import { addItemsToOrder } from '@/lib/api-client'
import { buildOrderItemsPayload } from '@/lib/order-payload'

interface Props {
  open:              boolean
  onClose:           () => void
  addToOrderId?:     string
  onTableCheckout?:  () => void
}

export function CartDrawer({ open, onClose, addToOrderId, onTableCheckout }: Props) {
  const router = useRouter()
  const { items, updateQty, removeItem, total, itemCount, activeOrderId, clearCart, setActiveOrderId, tableId, tableName } = useCartStore()
  const { customerName } = useSettingsStore()

  // Track which combos have their dish list expanded
  const [expandedCombos, setExpandedCombos] = useState<Set<string>>(new Set())

  const addItemsMutation = useMutation({
    mutationFn: () => addItemsToOrder(
      addToOrderId!,
      buildOrderItemsPayload(items),
    ),
    onSuccess: () => {
      toast.success('Đã thêm món thành công')
      clearCart()
      setActiveOrderId(addToOrderId!)
      onClose()
      router.push(`/order/${addToOrderId}`)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Không thể thêm món')
    },
  })

  const toggleCombo = (id: string) =>
    setExpandedCombos(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleCheckout = () => {
    onClose()
    if (tableId) {
      onTableCheckout?.()
    } else {
      router.push('/checkout')
    }
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
          <div className="flex flex-col leading-none gap-0.5">
            <h2 className="font-display text-lg text-foreground font-semibold">
              Giỏ hàng
            </h2>
            {(customerName || tableName) && (
              <p className="text-xs text-muted-fg">
                {[customerName, tableName].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeOrderId && (
              <button
                onClick={() => { onClose(); router.push('/order') }}
                className="flex items-center gap-1.5 text-xs text-primary border border-primary/40 px-2.5 py-1.5 rounded-lg hover:bg-primary/10 transition-colors font-medium"
              >
                <ClipboardList size={13} />
                Xem đơn hàng
              </button>
            )}
            <button onClick={onClose} className="text-muted-fg hover:text-foreground p-2 -mr-2 rounded-full hover:bg-muted transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Tóm tắt đơn hàng */}
          <div className="px-5 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Tóm tắt đơn hàng</span>
              {items.length > 0 && (
                <span className="text-xs text-muted-fg bg-muted px-2 py-0.5 rounded-full">
                  {itemCount()} món
                </span>
              )}
            </div>
            {items.length === 0 ? (
              <p className="text-muted-fg text-sm text-center mt-8">Giỏ hàng trống</p>
            ) : (
              items.map((item) => {
                const isExpanded = expandedCombos.has(item.id)
                const hasComboItems = item.type === 'combo' && (item.combo_items?.length ?? 0) > 0

                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Name row + toggle for combos */}
                      <div className="flex items-center gap-1">
                        <p className="text-foreground text-sm font-medium leading-snug flex-1">
                          {item.name}
                        </p>
                        {hasComboItems && (
                          <button
                            onClick={() => toggleCombo(item.id)}
                            className="shrink-0 text-muted-fg hover:text-foreground transition-colors"
                            aria-label={isExpanded ? 'Ẩn món' : 'Xem món'}
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        )}
                      </div>

                      {/* Combo dish list — collapsible */}
                      {hasComboItems && isExpanded && (
                        <ul className="mt-1 space-y-0.5">
                          {item.combo_items!.map((ci, idx) => (
                            <li key={idx} className="flex items-center gap-1.5 text-xs text-muted-fg">
                              <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none shrink-0">
                                ×{ci.quantity}
                              </span>
                              {ci.product_name}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Collapsed hint */}
                      {hasComboItems && !isExpanded && (
                        <p className="text-muted-fg text-xs mt-0.5">
                          {item.combo_items!.length} món · bấm để xem
                        </p>
                      )}

                      {/* Product toppings */}
                      {item.type === 'product' && item.toppings.length > 0 && (
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
                )
              })
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-fg text-sm">Tổng cộng</span>
            <span className="text-primary text-xl font-bold">{formatVND(total())}</span>
          </div>
          {addToOrderId ? (
            <button
              onClick={() => addItemsMutation.mutate()}
              disabled={items.length === 0 || addItemsMutation.isPending}
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              {addItemsMutation.isPending ? 'Đang thêm...' : 'Thêm vào đơn hàng'}
            </button>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={items.length === 0}
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              Thanh toán
            </button>
          )}
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
