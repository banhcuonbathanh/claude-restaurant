import { cn } from '@/lib/utils'
import type { TaskStatus } from '@/types/task'

const config: Record<TaskStatus, { label: string; classes: string }> = {
  pending:     { label: 'Chờ',        classes: 'bg-gray-100 text-gray-600' },
  in_progress: { label: 'Đang làm',   classes: 'bg-indigo-100 text-indigo-700' },
  completed:   { label: 'Hoàn thành', classes: 'bg-green-100 text-green-700' },
  overdue:     { label: 'Quá hạn',    classes: 'bg-red-100 text-red-700' },
}

interface Props {
  status: TaskStatus
  className?: string
}

export function TaskStatusBadge({ status, className }: Props) {
  const { label, classes } = config[status] ?? config.pending
  return (
    <span
      aria-label={`Trạng thái: ${label}`}
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', classes, className)}
    >
      {label}
    </span>
  )
}
