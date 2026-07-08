'use client'
import { Minus, Plus } from 'lucide-react'

interface QuantityStepperProps {
  value:    number
  min?:     number
  max?:     number
  onChange: (value: number) => void
  size?:    'sm' | 'md'
  /** Fill the "+" button with the primary (orange) colour instead of an outline. */
  accentPlus?: boolean
}

export function QuantityStepper({ value, min = 1, max, onChange, size = 'md', accentPlus = false }: QuantityStepperProps) {
  const btnCls = size === 'sm'
    ? 'w-7 h-7 min-h-[44px] min-w-[44px]'
    : 'w-9 h-9 min-h-[44px] min-w-[44px]'

  const plusCls = accentPlus
    ? 'bg-primary text-primary-fg border-primary'
    : 'border border-border'

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`${btnCls} rounded-full border border-border flex items-center justify-center disabled:opacity-40 active:scale-90 transition-transform`}
        aria-label="Giảm số lượng"
      >
        <Minus size={size === 'sm' ? 12 : 14} />
      </button>
      <span className="w-6 text-center text-base font-semibold tabular-nums select-none">
        {value}
      </span>
      <button
        onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
        disabled={max !== undefined && value >= max}
        className={`${btnCls} ${plusCls} rounded-full flex items-center justify-center disabled:opacity-40 active:scale-90 transition-transform`}
        aria-label="Tăng số lượng"
      >
        <Plus size={size === 'sm' ? 12 : 14} />
      </button>
    </div>
  )
}
