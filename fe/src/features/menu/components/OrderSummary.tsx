'use client'
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import type { CartItem } from '@/types/cart'
import { formatVND } from '@/lib/utils'

export function OrderSummary() {
  const [open, setOpen] = useState(true)
  const { items, total } = useCartStore()

  if (items.length === 0) return null

  const combos   = items.filter(i => i.type === 'combo')
  const products = items.filter(i => i.type === 'product')
  const comboTotal   = combos.reduce((s, i) => s + i.price * i.quantity, 0)
  const productTotal = products.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <section className="mx-4 mt-4 bg-card rounded-xl p-4 shadow-sm mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between min-h-[44px]"
      >
        <h2 className="text-sm font-semibold text-foreground">Tóm tắt đơn hàng</h2>
        <span className="text-muted-fg text-xs flex items-center gap-1">
          {open
            ? <><ChevronDown size={14} /> Ẩn</>
            : <><ChevronRight size={14} /> Hiện</>}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {combos.length > 0 && (
            <ItemGroup title="COMBO" items={combos} subtotal={comboTotal} />
          )}
          {products.length > 0 && (
            <ItemGroup title="MÓN LẺ" items={products} subtotal={productTotal} />
          )}
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Tổng cộng:</span>
            <span className="text-primary font-bold">{formatVND(total())}</span>
          </div>
        </div>
      )}
    </section>
  )
}

function ItemGroup({ title, items, subtotal }: { title: string; items: CartItem[]; subtotal: number }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-fg uppercase tracking-wide mb-1.5">{title}</p>
      <ul className="space-y-1">
        {items.map(item => (
          <li key={item.id} className="flex items-center justify-between text-sm">
            <span className="text-foreground flex-1 line-clamp-1">
              {item.name} ×{item.quantity}
            </span>
            <span className="text-muted-fg ml-2 flex-shrink-0">{formatVND(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <p className="text-right text-xs text-muted-fg mt-1">
        Subtotal: <span className="text-foreground font-medium">{formatVND(subtotal)}</span>
      </p>
    </div>
  )
}
