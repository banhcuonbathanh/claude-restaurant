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
    <div className={`rounded-lg border p-4 bg-white space-y-2 ${task.status === 'overdue' ? 'border-red-300' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`font-medium text-gray-900 ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
          {task.name}
        </p>
        <TaskStatusBadge status={task.status} />
      </div>

      {task.description && (
        <p className="text-sm text-gray-500">{task.description}</p>
      )}

      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
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
