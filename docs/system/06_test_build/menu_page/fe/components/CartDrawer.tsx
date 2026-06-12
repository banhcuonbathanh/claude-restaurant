// P-SYSTEST reference build — cart slide-over per menu_spec.md §CartDrawer; the only zone
// with its own BE write (add-to-order mode → POST /orders/:id/items); not imported by the app.
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp, Minus, Plus, Trash2, X } from 'lucide-react'
import { api } from '../lib/api-client-stub'
import { useCartStore } from '../store/cart'
import { useSettingsStore } from '../store/settings'
import { buildOrderItemsPayload } from '../lib/order-payload'
import { formatVND } from '../lib/utils'

interface Props {
  open:             boolean
  onClose:          () => void
  addToOrderId?:    string      // ?add_to_order=<id> mode — CTA becomes "Thêm vào đơn hàng"
  onTableCheckout?: () => void  // QR branch — page opens TableConfirmModal
}

export function CartDrawer({ open, onClose, addToOrderId, onTableCheckout }: Props) {
  const router = useRouter()
  const [expandedCombos, setExpandedCombos] = useState<Set<string>>(new Set())
  const { items, total, tableId, activeOrderId, updateQty, removeItem, clearCart } = useCartStore()
  const { customerName, tableLabel } = useSettingsStore()

  const toggleCombo = (id: string) =>
    setExpandedCombos(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const addItemsToOrder = useMutation({
    mutationFn: () =>
      api.post(`/orders/${addToOrderId}/items`, { items: buildOrderItemsPayload(items) }),
    onSuccess: () => {
      toast.success('Đã thêm món vào đơn hàng')
      clearCart()
      router.push(`/order/${addToOrderId}`)
    },
    onError: (err: unknown) => {
      const resp = (err as { response?: { data?: { message?: string } } }).response
      toast.error(resp?.data?.message ?? 'Thêm món thất bại')
    },
  })

  const handleCheckout = () => {
    onClose()
    if (tableId && onTableCheckout) {
      onTableCheckout()
    } else {
      router.push('/checkout')
    }
  }

  return (
    <>
      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />}

      {/* Panel — slides in from the right */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-card flex flex-col transition-transform ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-foreground font-semibold">Giỏ hàng</h2>
            {(customerName || tableLabel) && (
              <p className="text-xs text-muted-fg truncate">
                {[customerName, tableLabel].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeOrderId && (
              <button
                onClick={() => router.push('/order')}
                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
              >
                Xem đơn hàng
              </button>
            )}
            <button onClick={onClose} aria-label="Đóng" className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-fg">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <p className="text-muted-fg text-sm text-center py-12">Giỏ hàng trống</p>
          ) : (
            <ul className="space-y-3">
              {items.map(item => {
                const hasSubItems = item.type === 'combo' && (item.combo_items?.length ?? 0) > 0
                const isExpanded  = expandedCombos.has(item.id)
                return (
                  <li key={item.id} className="border-b border-border/50 pb-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground text-sm font-medium line-clamp-1">{item.name}</p>
                        {item.toppings.length > 0 && (
                          <p className="text-xs text-muted-fg">{item.toppings.map(t => t.name).join(', ')}</p>
                        )}
                        {hasSubItems && (
                          <button
                            onClick={() => toggleCombo(item.id)}
                            className="mt-0.5 flex items-center gap-1 text-xs text-primary"
                          >
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            {isExpanded
                              ? 'Ẩn chi tiết'
                              : `${item.combo_items!.length} món · bấm để xem`}
                          </button>
                        )}
                        {hasSubItems && isExpanded && (
                          <ul className="mt-1 space-y-0.5">
                            {item.combo_items!.map(ci => (
                              <li key={ci.product_name} className="text-xs text-muted-fg">
                                ×{ci.quantity} {ci.product_name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <span className="text-primary text-sm font-semibold whitespace-nowrap">
                        {formatVND(item.price * item.quantity)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-muted-fg"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-sm text-foreground w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-muted-fg"
                      >
                        <Plus size={10} />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label="Xóa món"
                        className="w-6 h-6 flex items-center justify-center text-muted-fg hover:text-urgent"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer — two mutually-exclusive CTAs */}
        <div className="px-4 py-3 border-t border-border space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground font-semibold">Tổng cộng</span>
            <span className="text-primary font-bold">{formatVND(total())}</span>
          </div>
          {addToOrderId ? (
            <button
              onClick={() => addItemsToOrder.mutate()}
              disabled={items.length === 0 || addItemsToOrder.isPending}
              className="w-full min-h-[44px] bg-primary text-white rounded-xl font-semibold text-sm disabled:opacity-60"
            >
              {addItemsToOrder.isPending ? 'Đang thêm...' : 'Thêm vào đơn hàng'}
            </button>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={items.length === 0}
              className="w-full min-h-[44px] bg-primary text-white rounded-xl font-semibold text-sm disabled:opacity-60"
            >
              Thanh toán
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full min-h-[44px] border border-border rounded-xl text-muted-fg text-sm"
          >
            Tiếp tục chọn món
          </button>
        </div>
      </aside>
    </>
  )
}
