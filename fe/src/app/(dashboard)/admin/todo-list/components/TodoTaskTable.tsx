'use client'
import type { Task } from '@/types/task'
import { TaskStatusBadge } from '@/components/shared/TaskStatusBadge'

const PRIORITY_LABEL: Record<string, string> = {
  high:   '🔴 Cao',
  medium: '🟡 TB',
  low:    '🟢 Thấp',
}

interface Props {
  tasks: Task[]
  canEdit: boolean
  onEdit?: (task: Task) => void
}

export function TodoTaskTable({ tasks, canEdit, onEdit }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-gray-400">
        Không có công việc nào cho bộ lọc này
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ưu tiên</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khung giờ</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
            {canEdit && <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>}
          </tr>
        </thead>
        <tbody className="divide-y">
          {tasks.map(task => (
            <tr
              key={task.id}
              className={task.status === 'overdue' ? 'bg-red-50' : 'hover:bg-gray-50'}
            >
              <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                <span className={task.status === 'completed' ? 'line-through text-gray-400' : ''}>
                  {task.name}
                </span>
                {task.description && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{task.description}</p>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-sm">{PRIORITY_LABEL[task.priority] ?? task.priority}</span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                {task.dueTimeStart
                  ? `${task.dueTimeStart}${task.dueTimeEnd ? ` – ${task.dueTimeEnd}` : ''}`
                  : task.dueDate}
              </td>
              <td className="px-4 py-3">
                <TaskStatusBadge status={task.status} />
              </td>
              {canEdit && (
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onEdit?.(task)}
                    aria-label={`Sửa: ${task.name}`}
                    className="min-h-[44px] min-w-[44px] px-3 text-orange-600 hover:text-orange-800 text-sm font-medium"
                  >
                    ✏️
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
