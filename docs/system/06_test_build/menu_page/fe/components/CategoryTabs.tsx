// P-SYSTEST reference build — Zone C per menu_spec.md §Zone C; not imported by the app.
'use client'
import type { Category } from '../types/product'

interface Props {
  categories: Category[]
  selected:   string | null
  onSelect:   (id: string | null) => void
}

// Pure controlled component — no state, no store.
export function CategoryTabs({ categories, selected, onSelect }: Props) {
  const tabClass = (active: boolean) =>
    `min-h-[44px] px-4 text-sm whitespace-nowrap border-b-2 transition-colors ${
      active ? 'border-primary text-primary font-semibold' : 'border-transparent text-muted-fg'
    }`

  return (
    <div className="sticky top-[108px] z-10 bg-background border-b border-border overflow-x-auto">
      <div className="flex min-w-max px-2">
        <button onClick={() => onSelect(null)} className={tabClass(selected === null)}>
          Tất cả
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => onSelect(cat.id)} className={tabClass(selected === cat.id)}>
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  )
}
