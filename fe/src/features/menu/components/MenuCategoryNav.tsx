'use client'
import type { MenuSection } from './MenuSections'

interface Props {
  sections: MenuSection[]
  activeId: string
  onSelect: (id: string) => void
}

// Sticky scroll-spy nav for the customer menu: tabs are navigation anchors, not
// filters. Tapping a tab scrolls to its section; scrolling the page auto-highlights
// the active tab (orange text + underline + soft orange glow).
export function MenuCategoryNav({ sections, activeId, onSelect }: Props) {
  return (
    <div className="sticky top-0 z-20 bg-background border-b border-border overflow-x-auto">
      <div className="flex gap-1 px-4 py-2 min-w-max">
        {sections.map(sec => {
          const active = sec.id === activeId
          return (
            <button
              key={sec.id}
              onClick={() => onSelect(sec.id)}
              className={`px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                active
                  ? 'border-primary text-primary [text-shadow:0_0_10px_var(--color-primary)]'
                  : 'border-transparent text-muted-fg hover:text-foreground'
              }`}
            >
              {sec.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
