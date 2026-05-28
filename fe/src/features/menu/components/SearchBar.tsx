'use client'
import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'

interface Props {
  onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: Props) {
  const [value, setValue] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => { onSearch(value) }, 300)
    return () => clearTimeout(timer)
  }, [value, onSearch])

  return (
    <div className="sticky top-[52px] z-10 bg-background border-b border-border px-4 py-2">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-fg pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Tìm món nhanh..."
          className="w-full bg-muted rounded-xl py-2.5 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-fg outline-none focus:ring-2 focus:ring-primary/30 min-h-[44px]"
        />
        {value.length > 0 && (
          <button
            onClick={() => setValue('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-fg hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Xóa tìm kiếm"
          >
            <X size={16} />
          </button>
        )}
      </div>
      {value.length > 0 && value.length < 2 && (
        <p className="text-xs text-muted-fg mt-1 pl-1">Nhập ít nhất 2 ký tự</p>
      )}
    </div>
  )
}
