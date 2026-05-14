'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Minus, Plus, Trash2, ChevronDown, ChevronUp, ClipboardList } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useSettingsStore } from '@/store/settings'
import { formatVND } from '@/lib/utils'

interface Props {
  open:    boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: Props) {
  const router = useRouter()
  const { items, updateQty, removeItem, total, itemCount, activeOrderId } = useCartStore()
  const { customerName, tableLabel } = useSettingsStore()

  // Track which combos have their dish list expanded
  const [expandedCombos, setExpandedCombos] = useState<Set<string>>(new Set())
  const [summaryOpen, setSummaryOpen]       = useState(true)

  const toggleCombo = (id: string) =>
    setExpandedCombos(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  // Unit price lookup from standalone products currently in cart
  const productPriceMap = new Map<string, number>()
  for (const item of items) {
    if (item.type === 'product') productPriceMap.set(item.name, item.price)
  }

  // Aggregate all dishes: combos (×combo qty) + standalone products
  const dishSummary = (() => {
    const map = new Map<string, number>()
    for (const item of items) {
      if (item.type === 'combo' && item.combo_items) {
        for (const ci of item.combo_items) {
          map.set(ci.product_name, (map.get(ci.product_name) ?? 0) + ci.quantity * item.quantity)
        }
      } else if (item.type === 'product') {
        map.set(item.name, (map.get(item.name) ?? 0) + item.quantity)
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  })()

  // Subtotal of dishes where unit price is known
  const knownSubtotal = dishSummary.reduce((sum, [name, qty]) => {
    const price = productPriceMap.get(name)
    return price ? sum + price * qty : sum
  }, 0)

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
          <div className="flex flex-col leading-none gap-0.5">
            <h2 className="font-display text-lg text-foreground font-semibold">
              Giỏ hàng ({itemCount()} món)
            </h2>
            {(customerName || tableLabel) && (
              <p className="text-xs text-muted-fg">
                {[customerName, tableLabel].filter(Boolean).join(' · ')}
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
            <button onClick={onClose} className="text-muted-fg hover:text-foreground">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Cart items */}
          <div className="px-5 py-4 space-y-4">
            {items.length === 0 ? (
              <p className="text-muted-fg text-sm text-center mt-12">Giỏ hàng trống</p>
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

          {/* Dish summary section */}
          {dishSummary.length > 0 && (
            <div className="border-t border-border">
              {/* Toggle header */}
              <button
                onClick={() => setSummaryOpen(v => !v)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-background/60 transition-colors"
              >
                <span className="text-xs font-semibold text-muted-fg uppercase tracking-wide">
                  Tổng số món ({dishSummary.length} loại)
                </span>
                {summaryOpen ? <ChevronUp size={14} className="text-muted-fg" /> : <ChevronDown size={14} className="text-muted-fg" />}
              </button>

              {summaryOpen && (
                <div className="px-5 pb-4 space-y-0">
                  {/* Table header */}
                  <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-border/50">
                    <span className="text-[11px] text-muted-fg uppercase tracking-wide flex-1">Món</span>
                    <span className="text-[11px] text-muted-fg uppercase tracking-wide w-10 text-center">SL</span>
                    <span className="text-[11px] text-muted-fg uppercase tracking-wide w-20 text-right">Đơn giá</span>
                    <span className="text-[11px] text-muted-fg uppercase tracking-wide w-20 text-right">Thành tiền</span>
                  </div>

                  {dishSummary.map(([name, qty]) => {
                    const unitPrice = productPriceMap.get(name)
                    return (
                      <div key={name} className="flex items-center justify-between py-1">
                        <span className="text-sm text-foreground flex-1 pr-2 leading-snug">{name}</span>
                        <span className="text-sm font-bold text-primary w-10 text-center">×{qty}</span>
                        <span className="text-xs text-muted-fg w-20 text-right">
                          {unitPrice ? formatVND(unitPrice) : '—'}
                        </span>
                        <span className="text-xs font-semibold text-foreground w-20 text-right">
                          {unitPrice ? formatVND(unitPrice * qty) : '—'}
                        </span>
                      </div>
                    )
                  })}

                  {/* Subtotal row for known-price dishes */}
                  {knownSubtotal > 0 && (
                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-border/50">
                      <span className="text-xs text-muted-fg">Tổng món lẻ</span>
                      <span className="text-sm font-bold text-primary">{formatVND(knownSubtotal)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
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
