'use client'
import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { JobGuide, StaffRole, CreateGuideInput } from '@/types/training'

const ROLES: StaffRole[] = ['chef', 'cashier', 'staff', 'manager']
const ROLE_LABELS: Record<StaffRole, string> = {
  chef: 'Bếp', cashier: 'Thu ngân', staff: 'Nhân viên', manager: 'Quản lý',
}

const schema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc'),
  role: z.enum(['chef', 'cashier', 'staff', 'manager'], { required_error: 'Vai trò là bắt buộc' }),
  description: z.string().optional(),
  coverImageUrl: z.string().url('URL ảnh không hợp lệ').or(z.literal('')).optional(),
  youtubeUrl: z.string().url('URL YouTube không hợp lệ').or(z.literal('')).optional(),
  qualityKpiTarget: z.string().optional(),
  quantityKpiTarget: z.string().optional(),
  passThreshold: z.coerce.number().min(1).max(100).default(75),
  maxAttempts: z.coerce.number().min(1).max(10).default(3),
  published: z.boolean().default(false),
  responsibleRoles: z.array(z.enum(['chef', 'cashier', 'staff', 'manager'])).min(1, 'Chọn ít nhất một vai trò phụ trách'),
})

type FormValues = z.infer<typeof schema>

interface CreateEditGuideModalProps {
  open: boolean
  guide?: JobGuide | null
  onClose: () => void
  onCreate: (data: CreateGuideInput) => Promise<void>
  onUpdate: (id: string, data: CreateGuideInput) => Promise<void>
}

export function CreateEditGuideModal({
  open,
  guide,
  onClose,
  onCreate,
  onUpdate,
}: CreateEditGuideModalProps) {
  const isEdit = !!guide

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) {
      reset(isEdit
        ? {
            title: guide.title,
            role: guide.role,
            description: guide.description,
            coverImageUrl: guide.coverImageUrl,
            youtubeUrl: guide.youtubeUrl,
            qualityKpiTarget: guide.qualityKpiTarget,
            quantityKpiTarget: guide.quantityKpiTarget,
            passThreshold: guide.passThreshold,
            maxAttempts: guide.maxAttempts,
            published: guide.published,
            responsibleRoles: guide.responsibleRoles,
          }
        : { passThreshold: 75, maxAttempts: 3, published: false, responsibleRoles: [] }
      )
    }
  }, [open, guide, isEdit, reset])

  if (!open) return null

  const onSubmit = async (values: FormValues) => {
    const body: CreateGuideInput = {
      title: values.title,
      role: values.role,
      description: values.description,
      coverImageUrl: values.coverImageUrl,
      youtubeUrl: values.youtubeUrl,
      qualityKpiTarget: values.qualityKpiTarget,
      quantityKpiTarget: values.quantityKpiTarget,
      passThreshold: values.passThreshold,
      maxAttempts: values.maxAttempts,
      published: values.published,
      responsibleRoles: values.responsibleRoles as StaffRole[],
    }
    if (isEdit) {
      await onUpdate(guide.id, body)
    } else {
      await onCreate(body)
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg bg-card rounded-2xl shadow-xl overflow-y-auto max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Chỉnh sửa hướng dẫn' : 'Tạo hướng dẫn'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            {isEdit ? 'Chỉnh sửa hướng dẫn' : 'Tạo hướng dẫn'}
          </h2>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-muted text-muted-fg"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title')}
              className="w-full min-h-[44px] rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Tên hướng dẫn đào tạo"
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Vai trò chính <span className="text-red-500">*</span>
            </label>
            <select
              {...register('role')}
              className="w-full min-h-[44px] rounded-lg border border-border bg-card text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Chọn vai trò...</option>
              {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
            {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Mô tả</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              placeholder="Mô tả nội dung hướng dẫn..."
            />
          </div>

          {/* Cover image URL */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">URL ảnh bìa</label>
            <input
              {...register('coverImageUrl')}
              className="w-full min-h-[44px] rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="https://..."
            />
            {errors.coverImageUrl && <p className="mt-1 text-xs text-red-500">{errors.coverImageUrl.message}</p>}
          </div>

          {/* YouTube URL */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">URL YouTube</label>
            <input
              {...register('youtubeUrl')}
              className="w-full min-h-[44px] rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="https://youtube.com/..."
            />
            {errors.youtubeUrl && <p className="mt-1 text-xs text-red-500">{errors.youtubeUrl.message}</p>}
          </div>

          {/* KPI targets */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">KPI Chất lượng</label>
              <input
                {...register('qualityKpiTarget')}
                className="w-full min-h-[44px] rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="≥ 95% rating"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">KPI Số lượng</label>
              <input
                {...register('quantityKpiTarget')}
                className="w-full min-h-[44px] rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="≥ 80 bánh/ca"
              />
            </div>
          </div>

          {/* Pass threshold + max attempts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Điểm đậu (%)</label>
              <input
                {...register('passThreshold')}
                type="number"
                min={1} max={100}
                className="w-full min-h-[44px] rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Số lần thi tối đa</label>
              <input
                {...register('maxAttempts')}
                type="number"
                min={1} max={10}
                className="w-full min-h-[44px] rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {/* Responsible roles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vai trò phụ trách <span className="text-red-500">*</span>
            </label>
            <Controller
              name="responsibleRoles"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {ROLES.map(r => {
                    const selected = field.value?.includes(r)
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          const next = selected
                            ? field.value.filter((v: StaffRole) => v !== r)
                            : [...(field.value ?? []), r]
                          field.onChange(next)
                        }}
                        className={`min-h-[44px] px-3 rounded-full text-sm font-medium transition-colors ${
                          selected
                            ? 'bg-orange-500 text-white'
                            : 'bg-muted text-muted-fg hover:opacity-90'
                        }`}
                      >
                        {ROLE_LABELS[r]} {selected ? '×' : '+'}
                      </button>
                    )
                  })}
                </div>
              )}
            />
            {errors.responsibleRoles && (
              <p className="mt-1 text-xs text-red-500">{errors.responsibleRoles.message}</p>
            )}
          </div>

          {/* Published toggle */}
          <div className="flex items-center justify-between py-2">
            <label className="text-sm font-medium text-foreground">Đã xuất bản</label>
            <Controller
              name="published"
              control={control}
              render={({ field }) => (
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${field.value ? 'bg-green-500' : 'bg-muted'}`}
                  aria-label={field.value ? 'Đã xuất bản' : 'Nháp'}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${field.value ? 'translate-x-5' : ''}`} />
                </button>
              )}
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[44px] rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 min-h-[44px] rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu hướng dẫn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
