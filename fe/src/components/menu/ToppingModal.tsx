'use client'
import { useState } from 'react'
import type { Product, Topping } from '@/types/product'
import { formatVND } from '@/lib/utils'

interface Props {
  product:   Product
  open:      boolean
  onClose:   () => void
  onConfirm: (selected: Topping[]) => void
}

export function ToppingModal({ product, open, onClose, onConfirm }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  if (!open) return null

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const selectedToppings = product.toppings.filter(t => selected.has(t.id))
  const toppingTotal = selectedToppings.reduce((s, t) => s + t.price, 0)
  const total = product.price + toppingTotal

  const handleConfirm = () => {
    onConfirm(selectedToppings)
    setSelected(new Set())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-card rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-5 shadow-xl">
        <h2 className="font-display text-lg text-foreground font-semibold mb-1">
          {product.name}
        </h2>
        <p className="text-muted-fg text-sm mb-4">Chọn thêm topping (tuỳ chọn)</p>

        <div className="space-y-2 max-h-56 overflow-y-auto mb-4">
          {product.toppings.filter(t => t.is_available).map((topping) => (
            <label
              key={topping.id}
              className="flex items-center justify-between gap-3 cursor-pointer py-1"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selected.has(topping.id)}
                  onChange={() => toggle(topping.id)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-foreground text-sm">{topping.name}</span>
              </div>
              <span className="text-muted-fg text-xs">+{formatVND(topping.price)}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4 pt-3 border-t border-border">
          <span className="text-muted-fg text-sm">Tổng</span>
          <span className="text-primary font-bold">{formatVND(total)}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-border text-muted-fg text-sm hover:bg-muted transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  )
}
