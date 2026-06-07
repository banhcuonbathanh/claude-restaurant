'use client'
import { ComboCard } from './ComboCard'
import type { Combo } from '@/types/product'

interface Props {
  combos: Combo[]
  visible: boolean
}

export function ComboSection({ combos, visible }: Props) {
  if (!visible || combos.length === 0) return null

  return (
    <section>
      <h2 className="text-muted-fg font-semibold mb-2 text-sm uppercase tracking-wide">
        Combo
      </h2>
      <div className="flex flex-col gap-3">
        {combos.map(combo => (
          <ComboCard key={combo.id} combo={combo} />
        ))}
      </div>
    </section>
  )
}
