'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCartStore, canhCartId } from '@/store/cart'
import { formatVND } from '@/lib/utils'
import type { Product } from '@/types/product'

interface Props {
  canhCoRau:    Product | null
  canhKhongRau: Product | null
}

// "Canh — thêm nhanh": one-tap additive add of a soup straight to the cart.
// Reuses the same two real canh products + setCanhQty helper the menu OrderSummary
// stepper uses (có rau / không rau are distinct products, rau is NOT a topping).
export function CanhQuickAdd({ canhCoRau, canhKhongRau }: Props) {
  const items      = useCartStore(s => s.items)
  const setCanhQty = useCartStore(s => s.setCanhQty)
  const [flashed, setFlashed] = useState<'rau' | 'plain' | null>(null)

  const rows = [
    { kind: 'rau'   as const, emoji: '🥣', label: 'Canh có rau',    product: canhCoRau },
    { kind: 'plain' as const, emoji: '🍲', label: 'Canh không rau', product: canhKhongRau },
  ].filter(r => r.product)

  if (rows.length === 0) return null

  const add = (kind: 'rau' | 'plain', product: Product) => {
    const current = items.find(i => i.id === canhCartId(product.id, kind))?.quantity ?? 0
    setCanhQty(product.id, null, kind, current + 1)
    setFlashed(kind)
    setTimeout(() => setFlashed(f => (f === kind ? null : f)), 1000)
  }

  return (
    <div className="px-4 pt-1 pb-2">
      <p className="text-xs font-semibold uppercase text-muted-fg mb-2">Canh — thêm nhanh</p>
      <div className="space-y-2">
        {rows.map(r => (
          <div
            key={r.kind}
            className="flex items-center justify-between bg-card rounded-xl px-3 py-2"
          >
            <span className="text-sm text-foreground">
              {r.emoji} {r.label} · <span className="text-muted-fg">{formatVND(0)}</span>
            </span>
            <Button
              size="sm"
              variant={flashed === r.kind ? 'success' : 'default'}
              onClick={() => add(r.kind, r.product!)}
              className="min-h-[44px]"
            >
              {flashed === r.kind ? '✓ Đã thêm' : '＋ Thêm'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
