'use client'
import { TaskPriorityBadge } from '@/components/shared/TaskPriorityBadge'
import { TaskStatusBadge } from '@/components/shared/TaskStatusBadge'
import type { Task } from '@/types/task'

interface Props {
  tasks: Task[]
  isLoading: boolean
  isError: boolean
}

export function ExpandedTaskList({ tasks, isLoading, isError }: Props) {
  if (isLoading) {
    return (
      <div className="px-4 py-3 text-sm text-gray-400 animate-pulse">
        Đang tải công việc…
      </div>
    )
  }
  if (isError) {
    return (
      <div className="px-4 py-3 text-sm text-red-500">
        Không thể tải công việc. Thử lại sau.
      </div>
    )
  }
  if (tasks.length === 0) {
    return (
      <div className="px-4 py-3 text-sm text-gray-400">
        Không có công việc nào trong ngày này.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <th className="px-4 py-2 text-left">Tên công việc</th>
            <th className="px-4 py-2 text-left">Ưu tiên</th>
            <th className="px-4 py-2 text-left">Giờ</th>
            <th className="px-4 py-2 text-left">Trạng thái</th>
            <th className="px-4 py-2 text-left">Ghi chú</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {tasks.map(task => (
            <tr key={task.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-medium text-gray-900">{task.name}</td>
              <td className="px-4 py-2">
                <TaskPriorityBadge priority={task.priority} />
              </td>
              <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
                {task.dueTimeStart && task.dueTimeEnd
                  ? `${task.dueTimeStart}–${task.dueTimeEnd}`
                  : task.dueTimeStart || '—'}
              </td>
              <td className="px-4 py-2">
                <TaskStatusBadge status={task.status} />
              </td>
              <td className="px-4 py-2 text-gray-500 max-w-[200px] truncate">
                {task.notes || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
