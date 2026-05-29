'use client'
import type { FavouriteTab } from '@/store/favourites'

interface TabCounts {
  all:     number
  product: number
  combo:   number
}

interface Props {
  active:   FavouriteTab
  counts:   TabCounts
  onChange: (tab: FavouriteTab) => void
}

const TABS: { key: FavouriteTab; label: string }[] = [
  { key: 'all',     label: 'Tất cả' },
  { key: 'product', label: 'Món lẻ' },
  { key: 'combo',   label: 'Combo'  },
]

export function FavouriteFilterTabs({ active, counts, onChange }: Props) {
  return (
    <div className="sticky top-[56px] z-10 flex gap-2 px-4 py-2 bg-background border-b border-border">
      {TABS.map(tab => {
        const count = counts[tab.key]
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`min-h-[44px] px-3 py-1 rounded-full text-sm font-medium transition-colors
              ${isActive
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-fg hover:bg-muted/80'}`}
          >
            {tab.label} ({count})
          </button>
        )
      })}
    </div>
  )
}
