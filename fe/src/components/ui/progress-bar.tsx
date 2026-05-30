import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  colorHex?: string
  className?: string
}

export function ProgressBar({ value, max = 100, colorHex, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, max > 0 ? (value / max) * 100 : 0))
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-gray-100', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-300', !colorHex && 'bg-orange-500')}
        style={{ width: `${pct}%`, ...(colorHex ? { backgroundColor: colorHex } : {}) }}
      />
    </div>
  )
}
