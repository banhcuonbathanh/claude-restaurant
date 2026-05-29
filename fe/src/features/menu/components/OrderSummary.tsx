'use client'
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import type { CartItem } from '@/types/cart'
import { formatVND } from '@/lib/utils'

export function OrderSummary({ embedded }: { embedded?: boolean }) {
  const [open, setOpen] = useState(true)
  const { items, total } = useCartStore()

  if (items.length === 0) return null

  const combos   = items.filter(i => i.type === 'combo')
  const products = items.filter(i => i.type === 'product')
  const comboTotal   = combos.reduce((s, i) => s + i.price * i.quantity, 0)
  const productTotal = products.reduce((s, i) => s + i.price * i.quantity, 0)

  // Aggregate all dishes: combos (×combo qty) + standalone products
  const productPriceMap = new Map<string, number>()
  for (const item of items) {
    if (item.type === 'product') productPriceMap.set(item.name, item.price)
  }
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
  const knownSubtotal = dishSummary.reduce((sum, [name, qty]) => {
    const price = productPriceMap.get(name)
    return price ? sum + price * qty : sum
  }, 0)

  return (
    <section className={embedded ? 'border-t border-border px-5 py-4' : 'mx-4 mt-4 bg-card rounded-xl p-4 shadow-sm mb-4'}>
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

          {/* Tổng số món — aggregated dish counts */}
          {dishSummary.length > 0 && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-fg uppercase tracking-wide mb-2">
                Tổng số món ({dishSummary.length} loại)
              </p>
              <div className="flex items-center justify-between pb-1 mb-1 border-b border-border/50">
                <span className="text-[11px] text-muted-fg uppercase tracking-wide flex-1">Món</span>
                <span className="text-[11px] text-muted-fg uppercase tracking-wide w-8 text-center">SL</span>
                <span className="text-[11px] text-muted-fg uppercase tracking-wide w-16 text-right">Đơn giá</span>
                <span className="text-[11px] text-muted-fg uppercase tracking-wide w-16 text-right">Thành tiền</span>
              </div>
              {dishSummary.map(([name, qty]) => {
                const unitPrice = productPriceMap.get(name)
                return (
                  <div key={name} className="flex items-center justify-between py-1">
                    <span className="text-xs text-foreground flex-1 pr-2 leading-snug">{name}</span>
                    <span className="text-xs font-bold text-primary w-8 text-center">×{qty}</span>
                    <span className="text-[11px] text-muted-fg w-16 text-right">
                      {unitPrice ? formatVND(unitPrice) : '—'}
                    </span>
                    <span className="text-[11px] font-semibold text-foreground w-16 text-right">
                      {unitPrice ? formatVND(unitPrice * qty) : '—'}
                    </span>
                  </div>
                )
              })}
              {knownSubtotal > 0 && (
                <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-border/50">
                  <span className="text-xs text-muted-fg">Tổng món lẻ</span>
                  <span className="text-xs font-bold text-primary">{formatVND(knownSubtotal)}</span>
                </div>
              )}
            </div>
          )}
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
