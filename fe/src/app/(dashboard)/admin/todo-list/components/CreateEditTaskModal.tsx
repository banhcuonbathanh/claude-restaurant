'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Task } from '@/types/task'
import type { Staff } from '@/types/staff'

const schema = z.object({
  name:         z.string().min(1, 'Bắt buộc').max(200),
  staffId:      z.string().min(1, 'Chọn nhân viên'),
  priority:     z.enum(['high', 'medium', 'low']),
  dueDate:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng YYYY-MM-DD'),
  dueTime:      z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Định dạng HH:MM'),
  dueTimeStart: z.string().optional(),
  dueTimeEnd:   z.string().optional(),
  description:  z.string().optional(),
  notes:        z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  mode: 'create' | 'edit'
  task?: Task | null
  staffList: Staff[]
  onClose: () => void
  onSubmit: (values: FormValues) => void
  isSubmitting?: boolean
}

export function CreateEditTaskModal({ open, mode, task, staffList, onClose, onSubmit, isSubmitting }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'medium' },
  })

  useEffect(() => {
    if (open && task && mode === 'edit') {
      reset({
        name:        task.name,
        staffId:     task.staffId,
        priority:    task.priority,
        dueDate:     task.dueDate,
        dueTime:     task.dueTimeStart || '09:00',
        dueTimeStart: task.dueTimeStart || '',
        dueTimeEnd:  task.dueTimeEnd || '',
        description: task.description ?? '',
        notes:       task.notes ?? '',
      })
    } else if (open && mode === 'create') {
      reset({ priority: 'medium', dueDate: new Date().toISOString().slice(0, 10), dueTime: '09:00' })
    }
  }, [open, task, mode, reset])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 id="modal-title" className="font-semibold text-gray-900">
            {mode === 'create' ? 'Tạo công việc mới' : 'Sửa công việc'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4 space-y-4">
          {/* Task name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên công việc *</label>
            <input
              {...register('name')}
              className="w-full min-h-[44px] border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Nhập tên công việc..."
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          {/* Staff */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giao cho *</label>
            <select
              {...register('staffId')}
              className="w-full min-h-[44px] border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Chọn nhân viên</option>
              {staffList.map(s => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
            {errors.staffId && <p className="text-xs text-red-600 mt-1">{errors.staffId.message}</p>}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ưu tiên *</label>
            <select
              {...register('priority')}
              className="w-full min-h-[44px] border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="high">🔴 Cao</option>
              <option value="medium">🟡 Trung bình</option>
              <option value="low">🟢 Thấp</option>
            </select>
          </div>

          {/* Due date + time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hạn *</label>
              <input
                type="date"
                {...register('dueDate')}
                className="w-full min-h-[44px] border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              {errors.dueDate && <p className="text-xs text-red-600 mt-1">{errors.dueDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giờ hạn *</label>
              <input
                type="time"
                {...register('dueTime')}
                className="w-full min-h-[44px] border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              {errors.dueTime && <p className="text-xs text-red-600 mt-1">{errors.dueTime.message}</p>}
            </div>
          </div>

          {/* Optional time window */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bắt đầu (tuỳ chọn)</label>
              <input
                type="time"
                {...register('dueTimeStart')}
                className="w-full min-h-[44px] border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kết thúc (tuỳ chọn)</label>
              <input
                type="time"
                {...register('dueTimeEnd')}
                className="w-full min-h-[44px] border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              placeholder="Mô tả thêm..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 border rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[44px] px-5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? 'Đang lưu...' : mode === 'create' ? 'Lưu công việc' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
