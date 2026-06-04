'use client'
import { useState } from 'react'
import { Calendar } from 'lucide-react'
import type { DateRange } from '@/types/marketing'

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  placeholder?: string
}

function formatDisplay(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function DateRangePicker({ value, onChange, placeholder }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  const displayText =
    value.from && value.to
      ? `${formatDisplay(value.from)} – ${formatDisplay(value.to)}`
      : (placeholder ?? 'Chọn khoảng thời gian')

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex min-h-[36px] items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground shadow-sm transition hover:bg-muted"
      >
        <Calendar className="h-4 w-4 text-gray-400" />
        {displayText}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 flex gap-3 rounded-xl border border-border bg-card p-4 shadow-lg">
          <div>
            <label className="mb-1 block text-xs text-muted-fg">Từ ngày</label>
            <input
              type="date"
              value={value.from}
              onChange={e => onChange({ ...value, from: e.target.value })}
              className="rounded-lg border border-border bg-card text-foreground px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-fg">Đến ngày</label>
            <input
              type="date"
              value={value.to}
              onChange={e => onChange({ ...value, to: e.target.value })}
              className="rounded-lg border border-border bg-card text-foreground px-2 py-1 text-sm"
            />
          </div>
          <button
            onClick={() => setOpen(false)}
            className="self-end rounded-lg bg-orange-500 px-3 py-1 text-sm font-medium text-white hover:bg-orange-600"
          >
            Áp dụng
          </button>
        </div>
      )}
    </div>
  )
}
