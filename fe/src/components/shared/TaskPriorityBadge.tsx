import { cn } from '@/lib/utils'
import type { TaskPriority } from '@/types/task'

const config: Record<TaskPriority, { label: string; classes: string }> = {
  high:   { label: 'CAO',   classes: 'bg-red-100 text-red-700' },
  medium: { label: 'TB',    classes: 'bg-amber-100 text-amber-700' },
  low:    { label: 'THẤP',  classes: 'bg-gray-100 text-gray-600' },
}

interface Props {
  priority: TaskPriority
  className?: string
}

export function TaskPriorityBadge({ priority, className }: Props) {
  const { label, classes } = config[priority] ?? config.medium
  return (
    <span
      aria-label={`Ưu tiên: ${label}`}
      className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold tracking-wide', classes, className)}
    >
      {label}
    </span>
  )
}
