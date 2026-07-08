'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { formatVND } from '@/lib/utils'
import type { FavouriteItemResolved } from '@/store/favourites'

interface Props {
  items: FavouriteItemResolved[]
}

// Collapsible table summary of the dishes selected on the favourites page — the favourite
// items (× qty) the "Thêm tất cả" pill will add, PLUS the canh bowls added via the Canh
// steppers (which live in the cart, ids `canh_*`). Styled to match the menu OrderSummary
// "Tổng số món" block: orange prices, orange ×qty, muted uppercase headers.
export function SelectedDishesSummary({ items }: Props) {
  const [open, setOpen] = useState(false)

  // Canh bowls are added straight to the cart by CanhQuickAdd — surface them here too.
  const canhRows = useCartStore(s => s.items).filter(
    i => i.id.startsWith('canh_') && i.quantity > 0,
  )

  if (items.length === 0 && canhRows.length === 0) return null

  const favQty = items.reduce((s, i) => s + i.qty, 0)
  const favTotal = items.reduce((s, i) => s + i.subtotalPerPortion * i.qty, 0)
  const canhQty = canhRows.reduce((s, i) => s + i.quantity, 0)
  const canhTotal = canhRows.reduce((s, i) => s + i.price * i.quantity, 0)

  const totalQty = favQty + canhQty
  const total = favTotal + canhTotal

  return (
    <div className="px-4 pb-2">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-xl bg-card px-3 py-2.5 text-sm font-semibold text-foreground shadow-sm"
      >
        <span>📋 Tóm tắt món đã chọn ({totalQty})</span>
        <ChevronDown size={16} className={`text-muted-fg transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-2 rounded-xl bg-card p-3 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-muted-fg">
                <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide">Món</th>
                <th className="pb-2 text-center text-xs font-semibold uppercase tracking-wide">SL</th>
                <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-border/50 align-top">
                  <td className="py-2 pr-2 text-foreground">
                    {item.name}
                    {item.selectedToppings.length > 0 && (
                      <span className="block text-xs text-muted-fg">
                        + {item.selectedToppings.map(t => t.name).join(', ')}
                      </span>
                    )}
                    {item.comboItems.map(ci => (
                      <span key={ci.name} className="block text-xs text-muted-fg">
                        • {ci.name} × {ci.qty}
                      </span>
                    ))}
                  </td>
                  <td className="py-2 text-center font-bold tabular-nums text-primary">×{item.qty}</td>
                  <td className="py-2 text-right tabular-nums text-primary">
                    {formatVND(item.subtotalPerPortion * item.qty)}
                  </td>
                </tr>
              ))}
              {canhRows.map(c => (
                <tr key={c.id} className="border-b border-border/50 align-top">
                  <td className="py-2 pr-2 text-foreground">🥣 {c.name}</td>
                  <td className="py-2 text-center font-bold tabular-nums text-primary">×{c.quantity}</td>
                  <td className="py-2 text-right tabular-nums text-primary">
                    {formatVND(c.price * c.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border">
                <td className="pt-2 font-bold text-foreground">Tổng cộng</td>
                <td className="pt-2 text-center font-bold tabular-nums text-primary">×{totalQty}</td>
                <td className="pt-2 text-right font-bold tabular-nums text-primary">{formatVND(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}
