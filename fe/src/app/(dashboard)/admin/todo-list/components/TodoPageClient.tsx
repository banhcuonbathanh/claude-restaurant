'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listStaff } from '@/features/admin/admin.api'
import { useTodoTasks, useTaskStats, useCreateTask } from '@/hooks/useTodoTasks'
import { useAuthStore } from '@/features/auth/auth.store'
import type { Task, TodoTaskFilter } from '@/types/task'
import { TodoPageHeader } from './TodoPageHeader'
import { TodoFilterBar } from './TodoFilterBar'
import { TodoTaskTable } from './TodoTaskTable'
import { TodoTaskCard } from './TodoTaskCard'
import { CreateEditTaskModal } from './CreateEditTaskModal'
import { TodoPageSkeleton } from './TodoPageSkeleton'
import { TaskStatusBadge } from '@/components/shared/TaskStatusBadge'

const today = new Date().toISOString().slice(0, 10)

function isManagerOrAdmin(role: string) {
  return role === 'manager' || role === 'admin'
}

export function TodoPageClient() {
  const user = useAuthStore(s => s.user)
  const canCreate = isManagerOrAdmin(user?.role ?? '')

  const [filters, setFilters] = useState<TodoTaskFilter>({ status: 'all', page: 1 })
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)

  // Derive single-date + staffId from filter for the hooks
  const staffId = filters.assigned_to ?? null
  const date = filters.start_date ?? today

  // Staff list for dropdowns
  const { data: staffData } = useQuery({
    queryKey: ['admin', 'staff'],
    queryFn: listStaff,
    staleTime: 60_000,
  })
  const staffList = staffData?.data ?? []
  const staffOptions = staffList.map(s => ({ id: s.id, name: s.full_name }))

  // Stats board — always load (regardless of staff selection)
  const statsQuery = useTaskStats(date)

  // Task list — only when a staff member is selected
  const tasksQuery = useTodoTasks(staffId, date)

  const createTask = useCreateTask()

  function handleOpenCreate() {
    setEditTask(null)
    setModalOpen(true)
  }

  function handleEdit(task: Task) {
    setEditTask(task)
    setModalOpen(true)
  }

  function handleModalSubmit(values: {
    name: string; staffId: string; priority: 'high' | 'medium' | 'low'
    dueDate: string; dueTime: string
    dueTimeStart?: string; dueTimeEnd?: string
    description?: string; notes?: string
  }) {
    const dueDateTime = `${values.dueDate}T${values.dueTime}:00Z`
    createTask.mutate({
      staffId:      values.staffId,
      name:         values.name,
      priority:     values.priority,
      dueDateTime,
      dueTimeStart: values.dueTimeStart || undefined,
      dueTimeEnd:   values.dueTimeEnd || undefined,
      description:  values.description || undefined,
      notes:        values.notes || undefined,
    }, {
      onSuccess: () => setModalOpen(false),
    })
  }

  return (
    <div>
      <TodoPageHeader canCreate={canCreate} onCreateClick={handleOpenCreate} />

      <TodoFilterBar
        filters={filters}
        staffList={staffOptions}
        onChange={setFilters}
      />

      {/* Stats board — shown when no staff is selected or while loading tasks */}
      {!staffId && (
        <div>
          {statsQuery.isLoading ? (
            <TodoPageSkeleton />
          ) : statsQuery.data ? (
            <div className="space-y-4">
              {/* Daily metrics summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Tổng', value: statsQuery.data.metrics.totalTasks },
                  { label: 'Hoàn thành', value: statsQuery.data.metrics.completedTasks },
                  { label: 'Đang làm', value: statsQuery.data.metrics.inProgressTasks },
                  { label: 'Quá hạn', value: statsQuery.data.metrics.overdueTasks },
                ].map(m => (
                  <div key={m.label} className="bg-card rounded-lg border border-border p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">{m.value}</p>
                    <p className="text-xs text-muted-fg mt-1">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Per-staff stats */}
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-fg uppercase">Nhân viên</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-fg uppercase">Được giao</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-fg uppercase">Xong</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-fg uppercase">Tỉ lệ</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-fg uppercase">Quá hạn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {statsQuery.data.staffStats.map(stat => (
                      <tr
                        key={stat.staffId}
                        className={`hover:bg-muted cursor-pointer ${stat.hasOverdue ? 'bg-red-50 dark:bg-red-950/40' : ''}`}
                        onClick={() => setFilters(f => ({ ...f, assigned_to: stat.staffId }))}
                      >
                        <td className="px-4 py-3 font-medium">{stat.staffName}</td>
                        <td className="px-4 py-3 text-center">{stat.assignedCount}</td>
                        <td className="px-4 py-3 text-center">{stat.completedCount}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-medium ${stat.completionRate >= 80 ? 'text-green-600' : stat.completionRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {stat.completionRate}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {stat.hasOverdue
                            ? <TaskStatusBadge status="overdue" />
                            : <span className="text-muted-fg text-xs">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Task list — shown when a staff member is selected */}
      {staffId && (
        <div>
          {tasksQuery.isLoading ? (
            <TodoPageSkeleton />
          ) : (
            <div>
              {/* Mobile card list */}
              <div className="md:hidden space-y-3">
                {(tasksQuery.data ?? []).map(task => (
                  <TodoTaskCard key={task.id} task={task} canEdit={canCreate} onEdit={handleEdit} />
                ))}
                {(tasksQuery.data ?? []).length === 0 && (
                  <p className="text-center py-12 text-sm text-muted-fg">Không có công việc nào</p>
                )}
              </div>
              {/* Desktop table */}
              <div className="hidden md:block">
                <TodoTaskTable
                  tasks={tasksQuery.data ?? []}
                  canEdit={canCreate}
                  onEdit={handleEdit}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <CreateEditTaskModal
        open={modalOpen}
        mode={editTask ? 'edit' : 'create'}
        task={editTask}
        staffList={staffList}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        isSubmitting={createTask.isPending}
      />
    </div>
  )
}
