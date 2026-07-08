'use client'
import { Minus, Plus } from 'lucide-react'
import { useCartStore, canhCartId } from '@/store/cart'
import { formatVND } from '@/lib/utils'
import type { Product } from '@/types/product'

interface Props {
  canhCoRau:    Product | null
  canhKhongRau: Product | null
}

// "Canh — thêm nhanh": additive soup add straight to the cart via a stepper (− qty +).
// Reuses the same two real canh products + setCanhQty helper the menu OrderSummary
// stepper uses (có rau / không rau are distinct products, rau is NOT a topping).
export function CanhQuickAdd({ canhCoRau, canhKhongRau }: Props) {
  const items      = useCartStore(s => s.items)
  const setCanhQty = useCartStore(s => s.setCanhQty)

  const rows = [
    { kind: 'rau'   as const, emoji: '🥣', label: 'Canh có rau',    product: canhCoRau },
    { kind: 'plain' as const, emoji: '🍲', label: 'Canh không rau', product: canhKhongRau },
  ].filter(r => r.product)

  if (rows.length === 0) return null

  return (
    <div className="px-4 pt-1 pb-2">
      <p className="text-xs font-semibold uppercase text-muted-fg mb-2">Canh — thêm nhanh</p>
      <div className="space-y-2">
        {rows.map(r => {
          const qty = items.find(i => i.id === canhCartId(r.product!.id, r.kind))?.quantity ?? 0
          return (
            <div
              key={r.kind}
              className="flex items-center justify-between bg-card rounded-xl px-3 py-2"
            >
              <span className="text-sm text-foreground">
                {r.emoji} {r.label} · <span className="text-muted-fg">{formatVND(0)}</span>
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCanhQty(r.product!.id, null, r.kind, qty - 1)}
                  disabled={qty <= 0}
                  className="bg-muted text-foreground w-8 h-8 rounded-full flex items-center justify-center
                             hover:bg-muted/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Giảm số lượng"
                >
                  <Minus size={14} />
                </button>
                <span className="text-foreground text-sm font-bold w-4 text-center tabular-nums">{qty}</span>
                <button
                  onClick={() => setCanhQty(r.product!.id, null, r.kind, qty + 1)}
                  className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center
                             hover:bg-primary/90 transition-colors"
                  aria-label="Tăng số lượng"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
