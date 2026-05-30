'use client'
import { Plus, Minus } from 'lucide-react'
import { useCartStore } from '@/store/cart'

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
  const { items, drinkConfig, setDrinkConfig } = useCartStore()

  const hasCombo    = items.some(i => i.type === 'combo')
  const hasNuocDung = items.some(
    i => i.type === 'product' && i.name.toLowerCase().includes('nước dùng'),
  )

  if (!hasCombo && !hasNuocDung) return null

  const { bowls, vegBowls } = drinkConfig
  const nonVegBowls = bowls - vegBowls

  const setVegBowls = (n: number) => {
    const next = Math.max(0, Math.min(99, n))
    setDrinkConfig({ bowls: next + nonVegBowls, vegBowls: next })
  }

  const setNonVegBowls = (n: number) => {
    const next = Math.max(0, Math.min(99, n))
    setDrinkConfig({ bowls: vegBowls + next, vegBowls })
  }

  return (
    <section className={embedded ? 'border-t border-border px-5 py-4' : 'mx-4 mt-4 bg-card rounded-xl p-4 shadow-sm'}>
      <h2 className="text-sm font-semibold text-muted-fg uppercase tracking-wide mb-3">Nước dùng</h2>
      <div className="space-y-3">
        <Stepper label="Bát có rau" value={vegBowls} min={0} max={99} onChange={setVegBowls} />
        <Stepper label="Bát không rau" value={nonVegBowls} min={0} max={99} onChange={setNonVegBowls} />
      </div>
    </section>
  )
}
