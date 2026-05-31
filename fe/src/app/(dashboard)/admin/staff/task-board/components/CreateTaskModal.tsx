'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { listStaff, createTask } from '@/features/admin/admin.api'
import type { TaskPriority } from '@/types/task'

const schema = z.object({
  staffId:      z.string().min(1, 'Chọn nhân viên'),
  name:         z.string().min(1, 'Nhập tên công việc').max(200),
  description:  z.string().optional(),
  priority:     z.enum(['high', 'medium', 'low']),
  dueDate:      z.string().min(1, 'Chọn ngày hạn'),
  dueTime:      z.string().min(1, 'Chọn giờ hạn'),
  dueTimeStart: z.string().optional(),
  dueTimeEnd:   z.string().optional(),
  notes:        z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  defaultStaffId?: string
  onClose: () => void
  onSuccess: () => void
}

export function CreateTaskModal({ open, defaultStaffId, onClose, onSuccess }: Props) {
  const qc = useQueryClient()

  const { data: staffData } = useQuery({
    queryKey: ['admin', 'staff'],
    queryFn: () => listStaff(),
    staleTime: 5 * 60 * 1000,
    enabled: open,
  })
  const staffList = staffData?.data ?? []

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      staffId:  defaultStaffId ?? '',
      priority: 'medium',
      dueDate:  new Date().toISOString().slice(0, 10),
      dueTime:  '08:00',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        staffId:  defaultStaffId ?? '',
        priority: 'medium',
        dueDate:  new Date().toISOString().slice(0, 10),
        dueTime:  '08:00',
        name: '', description: '', dueTimeStart: '', dueTimeEnd: '', notes: '',
      })
      const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
      window.addEventListener('keydown', handleKey)
      return () => window.removeEventListener('keydown', handleKey)
    }
  }, [open, defaultStaffId, reset, onClose])

  const mutation = useMutation({
    mutationFn: (v: FormValues) => createTask({
      staffId:      v.staffId,
      name:         v.name,
      description:  v.description,
      priority:     v.priority as TaskPriority,
      dueDateTime:  `${v.dueDate}T${v.dueTime}:00Z`,
      dueTimeStart: v.dueTimeStart,
      dueTimeEnd:   v.dueTimeEnd,
      notes:        v.notes,
    }),
    onSuccess: (task) => {
      const date = task.dueDate
      qc.invalidateQueries({ queryKey: ['admin', 'tasks', 'stats', date] })
      qc.invalidateQueries({ queryKey: ['admin', 'tasks', task.staffId, date] })
      toast.success('Đã tạo công việc thành công')
      onSuccess()
      onClose()
    },
    onError: () => {
      toast.error('Không thể tạo công việc — thử lại')
    },
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Tạo công việc mới</h2>
          <button onClick={onClose} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="px-6 py-4 space-y-4">
          {/* Staff */}
          <div className="space-y-1">
            <Label htmlFor="staffId">Nhân viên *</Label>
            <select
              id="staffId"
              {...register('staffId')}
              className="w-full min-h-[44px] rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Chọn nhân viên…</option>
              {staffList.map(s => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
            {errors.staffId && <p className="text-xs text-red-500">{errors.staffId.message}</p>}
          </div>

          {/* Task name */}
          <div className="space-y-1">
            <Label htmlFor="name">Tên công việc *</Label>
            <Input id="name" placeholder="Ví dụ: Dọn dẹp bếp sau ca sáng" className="min-h-[44px]" {...register('name')} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description">Mô tả</Label>
            <textarea
              id="description"
              rows={2}
              placeholder="Hướng dẫn hoặc ghi chú thêm…"
              {...register('description')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Priority + Due date/time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="priority">Ưu tiên *</Label>
              <select
                id="priority"
                {...register('priority')}
                className="w-full min-h-[44px] rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="high">Cao</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
              </select>
              {errors.priority && <p className="text-xs text-red-500">{errors.priority.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="dueDate">Ngày hạn *</Label>
              <Input id="dueDate" type="date" className="min-h-[44px]" {...register('dueDate')} />
              {errors.dueDate && <p className="text-xs text-red-500">{errors.dueDate.message}</p>}
            </div>
          </div>

          {/* Due time */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="dueTime">Giờ hoàn thành *</Label>
              <Input id="dueTime" type="time" className="min-h-[44px]" {...register('dueTime')} />
              {errors.dueTime && <p className="text-xs text-red-500">{errors.dueTime.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="dueTimeStart">Giờ bắt đầu</Label>
              <Input id="dueTimeStart" type="time" className="min-h-[44px]" {...register('dueTimeStart')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dueTimeEnd">Giờ kết thúc</Label>
              <Input id="dueTimeEnd" type="time" className="min-h-[44px]" {...register('dueTimeEnd')} />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="notes">Ghi chú</Label>
            <Input id="notes" placeholder="Ghi chú thêm (tùy chọn)…" className="min-h-[44px]" {...register('notes')} />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="min-h-[44px]">
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="min-h-[44px] bg-orange-500 hover:bg-orange-600 text-white"
            >
              {mutation.isPending ? 'Đang tạo…' : 'Tạo công việc'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
