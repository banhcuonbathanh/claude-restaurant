'use client'
import { useState } from 'react'
import { ChevronDown, ChevronRight, ChevronUp, Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import type { CartItem } from '@/types/cart'
import { formatVND } from '@/lib/utils'

export function OrderSummary({ embedded }: { embedded?: boolean }) {
  const [open, setOpen] = useState(true)
  const [expandedCombos, setExpandedCombos] = useState<Set<string>>(new Set())
  const { items, total, tableName, updateQty, removeItem, updateComboItem } = useCartStore()

  const toggleCombo = (id: string) =>
    setExpandedCombos(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  if (items.length === 0) return null

  const combos   = items.filter(i => i.type === 'combo')
  const products = items.filter(i => i.type === 'product')
  const comboTotal   = combos.reduce((s, i) => s + i.price * i.quantity, 0)
  const productTotal = products.reduce((s, i) => s + i.price * i.quantity, 0)

  // Aggregate all dishes: combos (×combo qty) + standalone products
  const productPriceMap = new Map<string, number>()
  for (const item of items) {
    if (item.type === 'product') {
      productPriceMap.set(item.name, item.price)
    } else if (item.type === 'combo' && item.combo_items) {
      for (const ci of item.combo_items) {
        if (ci.unit_price !== undefined && !productPriceMap.has(ci.product_name)) {
          productPriceMap.set(ci.product_name, ci.unit_price)
        }
      }
    }
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
  return (
    <section className={embedded ? 'border-t border-border px-5 py-4' : 'mx-4 mt-4 bg-card rounded-xl p-4 shadow-sm mb-4'}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between min-h-[44px]"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">Tóm tắt đơn hàng</h2>
          {tableName && (
            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Bàn {tableName}
            </span>
          )}
        </div>
        <span className="text-muted-fg text-xs flex items-center gap-1">
          {open
            ? <><ChevronDown size={14} /> Ẩn</>
            : <><ChevronRight size={14} /> Hiện</>}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {combos.length > 0 && (
            <ItemGroup
              title="COMBO"
              items={combos}
              subtotal={comboTotal}
              updateQty={updateQty}
              removeItem={removeItem}
              expandedCombos={expandedCombos}
              toggleCombo={toggleCombo}
              updateComboItem={updateComboItem}
            />
          )}
          {products.length > 0 && (
            <ItemGroup
              title="MÓN LẺ"
              items={products}
              subtotal={productTotal}
              updateQty={updateQty}
              removeItem={removeItem}
              expandedCombos={expandedCombos}
              toggleCombo={toggleCombo}
              updateComboItem={updateComboItem}
            />
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
              <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-border/50">
                <span className="text-xs text-muted-fg">Tổng cộng</span>
                <span className="text-xs font-bold text-primary">{formatVND(total())}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function QtyControls({
  qty, onDec, onInc, onDelete, price,
}: {
  qty: number
  onDec: () => void
  onInc: () => void
  onDelete: () => void
  price?: number
}) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button onClick={onDec} className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-muted-fg hover:text-foreground">
        <Minus size={10} />
      </button>
      <span className="text-sm text-foreground w-5 text-center">{qty}</span>
      <button onClick={onInc} className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-muted-fg hover:text-foreground">
        <Plus size={10} />
      </button>
      {price !== undefined && (
        <span className="text-xs text-muted-fg w-16 text-right">{formatVND(price)}</span>
      )}
      <button onClick={onDelete} className="w-6 h-6 flex items-center justify-center text-muted-fg hover:text-urgent">
        <Trash2 size={12} />
      </button>
    </div>
  )
}

function ItemGroup({
  title, items, subtotal, updateQty, removeItem, expandedCombos, toggleCombo, updateComboItem,
}: {
  title: string
  items: CartItem[]
  subtotal: number
  updateQty: (id: string, qty: number) => void
  removeItem: (id: string) => void
  expandedCombos: Set<string>
  toggleCombo: (id: string) => void
  updateComboItem: (comboCartId: string, productName: string, qty: number) => void
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-fg uppercase tracking-wide mb-1.5">{title}</p>
      <ul className="space-y-2">
        {items.map(item => {
          const isExpanded = expandedCombos.has(item.id)
          const hasSubItems = item.type === 'combo' && (item.combo_items?.length ?? 0) > 0
          return (
            <li key={item.id}>
              {/* Main row */}
              <div className="flex items-center gap-2">
                <span className="text-foreground text-sm flex-1 line-clamp-1 leading-snug">{item.name}</span>
                <QtyControls
                  qty={item.quantity}
                  onDec={() => updateQty(item.id, item.quantity - 1)}
                  onInc={() => updateQty(item.id, item.quantity + 1)}
                  onDelete={() => removeItem(item.id)}
                  price={item.price * item.quantity}
                />
              </div>
              {/* Expand/collapse toggle for combos */}
              {hasSubItems && (
                <button
                  onClick={() => toggleCombo(item.id)}
                  className="mt-1 flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                </button>
              )}

              {/* Combo sub-items */}
              {hasSubItems && isExpanded && (
                <ul className="mt-2 ml-2 space-y-1.5 border-l-2 border-border pl-3">
                  {item.combo_items!.map((ci) => (
                    <li key={ci.product_name} className="flex items-center gap-2">
                      <span className="text-xs text-muted-fg flex-1 line-clamp-1">{ci.product_name}</span>
                      <QtyControls
                        qty={ci.quantity}
                        onDec={() => updateComboItem(item.id, ci.product_name, ci.quantity - 1)}
                        onInc={() => updateComboItem(item.id, ci.product_name, ci.quantity + 1)}
                        onDelete={() => updateComboItem(item.id, ci.product_name, 0)}
                        price={ci.unit_price !== undefined ? ci.unit_price * ci.quantity : undefined}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
      <p className="text-right text-xs text-muted-fg mt-1.5">
        Subtotal: <span className="text-foreground font-medium">{formatVND(subtotal)}</span>
      </p>
    </div>
  )
}
