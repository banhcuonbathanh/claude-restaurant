'use client'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { getStaffTasks, getTaskStats, createTask } from '@/features/admin/admin.api'
import type { CreateTaskPayload } from '@/types/task'

// Queries tasks for a specific staff member on a given date (used by todo-list page).
export function useTodoTasks(staffId: string | null, date: string) {
  return useQuery({
    queryKey: ['admin', 'tasks', staffId, date],
    queryFn: () => getStaffTasks(staffId!, date),
    enabled: !!staffId,
    staleTime: 15_000,
  })
}

export function useTaskStats(date: string) {
  return useQuery({
    queryKey: ['admin', 'tasks', 'stats', date],
    queryFn: () => getTaskStats(date),
    staleTime: 30_000,
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: (task) => {
      qc.invalidateQueries({ queryKey: ['admin', 'tasks', task.staffId, task.dueDate] })
      qc.invalidateQueries({ queryKey: ['admin', 'tasks', 'stats'] })
    },
  })
}
