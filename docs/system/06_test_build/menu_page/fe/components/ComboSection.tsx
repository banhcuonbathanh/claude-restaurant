// P-SYSTEST reference build — Zone E wrapper; not imported by the app.
'use client'
import type { Combo } from '../types/product'
import { ComboCard } from './ComboCard'

interface Props {
  combos:  Combo[]
  visible: boolean   // page passes selectedCategory === null
}

export function ComboSection({ combos, visible }: Props) {
  if (!visible || combos.length === 0) return null

  return (
    <section>
      <p className="text-xs font-semibold text-muted-fg uppercase tracking-wide mb-2">Combo</p>
      <div className="flex flex-col gap-3">
        {combos.map(combo => <ComboCard key={combo.id} combo={combo} />)}
      </div>
    </section>
  )
}
