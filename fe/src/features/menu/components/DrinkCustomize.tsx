'use client'
import { Plus, Minus } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import type { Topping } from '@/types/product'

const isSoupName = (name: string) =>
  name.toLowerCase().includes('canh') || name.toLowerCase().includes('nước dùng')

function Stepper({
  label, value, min, max, onChange,
}: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label="Giảm"
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 disabled:opacity-40 transition-colors"
        >
          <Minus size={14} />
        </button>
        <span className="text-foreground font-bold text-sm w-8 text-center tabular-nums">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label="Tăng"
          className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

export function DrinkCustomize({ embedded }: { embedded?: boolean }) {
  const { items, setCanhQty } = useCartStore()

  const hasCombo    = items.some(i => i.type === 'combo')
  const hasNuocDung = items.some(
    i => i.type === 'product' && i.name.toLowerCase().includes('nước dùng'),
  )

  if (!hasCombo && !hasNuocDung) return null

  // Discover canh product info from items
  let canhProductId: string | null = null
  let canhRauTopping: Topping | null = null
  for (const item of items) {
    if (item.type === 'product' && item.product_id && isSoupName(item.name)) {
      canhProductId = item.product_id
      const rau = item.toppings.find(t => t.is_available)
      if (rau) canhRauTopping = rau
    }
    if (item.type === 'combo' && item.combo_items) {
      for (const ci of item.combo_items) {
        if (isSoupName(ci.product_name) && ci.product_id) {
          canhProductId = ci.product_id
          const rau = (ci.toppings ?? []).find(t => t.is_available)
          if (rau) canhRauTopping = rau
        }
      }
    }
  }

  const rauItem    = canhProductId ? items.find(i => i.id === `canh_${canhProductId}_rau`)   : undefined
  const plainItem  = canhProductId ? items.find(i => i.id === `canh_${canhProductId}_plain`) : undefined
  const rauCount   = rauItem?.quantity   ?? 0
  const plainCount = plainItem?.quantity ?? 0

  const setRauCount = (n: number) => {
    if (!canhProductId) return
    setCanhQty(canhProductId, canhRauTopping, 'rau', Math.max(0, Math.min(99, n)))
  }

  const setPlainCount = (n: number) => {
    if (!canhProductId) return
    setCanhQty(canhProductId, canhRauTopping, 'plain', Math.max(0, Math.min(99, n)))
  }

  return (
    <section className={embedded ? 'border-t border-border px-5 py-4' : 'mx-4 mt-4 bg-card rounded-xl p-4 shadow-sm'}>
      <h2 className="text-sm font-semibold text-muted-fg uppercase tracking-wide mb-3">Nước dùng</h2>
      <div className="space-y-3">
        <Stepper label="Bát có rau" value={rauCount} min={0} max={99} onChange={setRauCount} />
        <Stepper label="Bát không rau" value={plainCount} min={0} max={99} onChange={setPlainCount} />
      </div>
    </section>
  )
}
