'use client'
import { useState } from 'react'
import { ShoppingCart, Pencil, Trash2, Check, X } from 'lucide-react'
import { formatVND } from '@/lib/utils'
import type { FavouriteSet } from '@/store/favourites'
import type { FavouriteItemResolved } from '@/store/favourites'

interface Props {
  set:           FavouriteSet
  resolvedItems: FavouriteItemResolved[]
  onApply:       (id: string) => void
  onRename:      (id: string, name: string) => void
  onDelete:      (id: string) => void
}

export function SetCard({ set, resolvedItems, onApply, onRename, onDelete }: Props) {
  const [renaming, setRenaming] = useState(false)
  const [nameInput, setNameInput] = useState(set.name)

  const total = resolvedItems.reduce((sum, i) => sum + i.subtotalPerPortion * i.qty, 0)

  const handleRenameConfirm = () => {
    const trimmed = nameInput.trim()
    if (trimmed) onRename(set.id, trimmed)
    setRenaming(false)
  }

  return (
    <div className="bg-card rounded-xl shadow-sm p-4 space-y-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        {renaming ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleRenameConfirm(); if (e.key === 'Escape') setRenaming(false) }}
              className="flex-1 border border-primary rounded-lg px-2 py-1 text-sm focus:outline-none"
              autoFocus
            />
            <button onClick={handleRenameConfirm} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-primary">
              <Check size={16} />
            </button>
            <button onClick={() => setRenaming(false)} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-fg">
              <X size={16} />
            </button>
          </div>
        ) : (
          <p className="text-sm font-semibold text-foreground flex-1 truncate">📋 {set.name}</p>
        )}
      </div>

      {/* Items summary */}
      <div className="space-y-1">
        {resolvedItems.slice(0, 5).map(item => (
          <div key={item.id} className="text-xs text-muted-fg">
            <span className="font-medium text-foreground">▸ {item.name} × {item.qty}</span>
            {item.selectedToppings.length > 0 && (
              <span className="ml-1">
                · {item.selectedToppings.map(t => `+ ${t.name}`).join('  ')}
              </span>
            )}
            {item.comboItems.length > 0 && (
              <div className="pl-3 space-y-0.5 mt-0.5">
                {item.comboItems.map(ci => (
                  <div key={ci.name}>• {ci.name} × {ci.qty}</div>
                ))}
              </div>
            )}
          </div>
        ))}
        {resolvedItems.length > 5 && (
          <p className="text-xs text-muted-fg pl-3">và {resolvedItems.length - 5} món khác</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <p className="text-xs text-muted-fg">{set.items.length} món · {formatVND(total)}</p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onApply(set.id)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-1 bg-primary text-white text-xs font-semibold px-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart size={14} />
            Áp dụng
          </button>
          <button
            onClick={() => { setNameInput(set.name); setRenaming(true) }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-fg hover:text-foreground transition-colors"
            aria-label="Đổi tên set"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(set.id)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-fg hover:text-red-500 transition-colors"
            aria-label="Xoá set"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
