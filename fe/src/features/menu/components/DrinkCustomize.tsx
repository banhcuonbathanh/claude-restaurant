'use client'
import { Plus, Minus } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import type { VegAmount } from '@/types/cart'

const VEG_OPTIONS: { value: VegAmount; label: string }[] = [
  { value: 'nhiều', label: 'Rau nhiều' },
  { value: 'vừa',   label: 'Rau vừa'   },
  { value: 'không', label: 'Không'      },
]

export function DrinkCustomize() {
  const { drinkConfig, setDrinkConfig } = useCartStore()

  const setVeg   = (veg: VegAmount) => setDrinkConfig({ ...drinkConfig, veg })
  const setBowls = (n: number)      => setDrinkConfig({ ...drinkConfig, bowls: Math.max(1, Math.min(99, n)) })

  return (
    <section className="mx-4 mt-4 bg-card rounded-xl p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-muted-fg uppercase tracking-wide mb-3">Nước dùng</h2>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {VEG_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setVeg(opt.value)}
            className={`flex items-center gap-1.5 text-sm min-h-[44px] px-3 rounded-xl border transition-colors ${
              drinkConfig.veg === opt.value
                ? 'border-primary text-primary bg-primary/5'
                : 'border-border text-muted-fg hover:border-primary/50'
            }`}
          >
            <span className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
              drinkConfig.veg === opt.value ? 'border-primary bg-primary' : 'border-muted-fg'
            }`} />
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Số bát</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setBowls(drinkConfig.bowls - 1)}
            disabled={drinkConfig.bowls <= 1}
            aria-label="Giảm"
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 disabled:opacity-40 transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="text-foreground font-bold text-sm w-6 text-center">{drinkConfig.bowls}</span>
          <button
            onClick={() => setBowls(drinkConfig.bowls + 1)}
            disabled={drinkConfig.bowls >= 99}
            aria-label="Tăng"
            className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </section>
  )
}
