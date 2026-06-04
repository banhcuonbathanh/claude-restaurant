'use client'
import type { Task } from '@/types/task'
import { TaskStatusBadge } from '@/components/shared/TaskStatusBadge'

const PRIORITY_LABEL: Record<string, string> = {
  high:   '🔴 Cao',
  medium: '🟡 TB',
  low:    '🟢 Thấp',
}

interface Props {
  task: Task
  canEdit: boolean
  onEdit?: (task: Task) => void
}

export function TodoTaskCard({ task, canEdit, onEdit }: Props) {
  return (
    <div className={`rounded-lg border p-4 bg-card space-y-2 ${task.status === 'overdue' ? 'border-red-300 dark:border-red-800' : 'border-border'}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`font-medium text-foreground ${task.status === 'completed' ? 'line-through text-muted-fg' : ''}`}>
          {task.name}
        </p>
        <TaskStatusBadge status={task.status} />
      </div>

      {task.description && (
        <p className="text-sm text-muted-fg">{task.description}</p>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-fg flex-wrap">
        <span>{PRIORITY_LABEL[task.priority] ?? task.priority}</span>
        <span>
          🕐 {task.dueTimeStart
            ? `${task.dueTimeStart}${task.dueTimeEnd ? ` – ${task.dueTimeEnd}` : ''}`
            : task.dueDate}
        </span>
      </div>

      {canEdit && (
        <div className="flex justify-end pt-1">
          <button
            onClick={() => onEdit?.(task)}
            aria-label={`Sửa: ${task.name}`}
            className="min-h-[44px] min-w-[44px] px-3 text-sm text-orange-600 hover:text-orange-800 font-medium"
          >
            ✏️ Sửa
          </button>
        </div>
      )}
    </div>
  )
}
