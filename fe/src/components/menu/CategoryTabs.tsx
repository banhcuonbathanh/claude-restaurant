'use client'
import type { Category } from '@/types/product'

interface Props {
  categories:       Category[]
  selected:         string | null
  onSelect:         (id: string | null) => void
}

export function CategoryTabs({ categories, selected, onSelect }: Props) {
  return (
    <div className="sticky top-16 z-10 bg-background border-b border-border overflow-x-auto">
      <div className="flex gap-1 px-4 py-2 min-w-max">
        <button
          onClick={() => onSelect(null)}
          className={`px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
            selected === null
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-fg hover:text-foreground'
          }`}
        >
          Tất cả
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              selected === cat.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-fg hover:text-foreground'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  )
}
