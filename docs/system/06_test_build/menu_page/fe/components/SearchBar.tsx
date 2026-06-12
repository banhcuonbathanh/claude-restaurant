// P-SYSTEST reference build — Zone B per menu_spec.md §Zone B; not imported by the app.
'use client'
import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'

interface Props {
  onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: Props) {
  const [value, setValue] = useState('')

  // Debounce 300ms before notifying the page (query itself is gated to len 0 or ≥2 there).
  useEffect(() => {
    const t = setTimeout(() => onSearch(value), 300)
    return () => clearTimeout(t)
  }, [value, onSearch])

  return (
    <div className="sticky top-[52px] z-10 bg-background px-4 py-2">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-fg" />
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Tìm món..."
          className="w-full min-h-[44px] bg-muted border border-border rounded-lg pl-9 pr-10 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus:border-primary transition-colors"
        />
        {value.length > 0 && (
          <button
            onClick={() => setValue('')}
            aria-label="Xóa tìm kiếm"
            className="absolute right-0 top-0 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-fg hover:text-foreground"
          >
            <X size={16} />
          </button>
        )}
      </div>
      {value.length > 0 && value.length < 2 && (
        <p className="text-xs text-muted-fg mt-1">Nhập ít nhất 2 ký tự</p>
      )}
    </div>
  )
}
