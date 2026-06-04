'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Ingredient, CreateIngredientInput, UpdateIngredientInput } from '@/features/admin/admin.api'

const ingredientSchema = z.object({
  name:             z.string().min(1, 'Tên nguyên liệu không được trống').max(150),
  unit:             z.string().min(1, 'Chọn đơn vị').max(30),
  initialQuantity:  z.coerce.number().min(0, 'Số lượng không âm'),
  warningThreshold: z.coerce.number().min(0, 'Ngưỡng không âm'),
  importDate:       z.string().min(1, 'Chọn ngày nhập'),
  shelfDays:        z.coerce.number().int().min(1, 'Số ngày bảo quản tối thiểu là 1'),
})

type FormData = z.infer<typeof ingredientSchema>

interface IngredientFormModalProps {
  open:        boolean
  mode:        'add' | 'edit'
  ingredient?: Ingredient
  onClose:     () => void
  onSubmit:    (data: CreateIngredientInput | UpdateIngredientInput, id?: string) => void
  isPending:   boolean
}

const COMMON_UNITS = ['kg', 'g', 'lít', 'ml', 'cái', 'gói', 'hộp', 'bó']

export function IngredientFormModal({
  open, mode, ingredient, onClose, onSubmit, isPending,
}: IngredientFormModalProps) {
  const isEdit = mode === 'edit'

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name:             '',
      unit:             'kg',
      initialQuantity:  0,
      warningThreshold: 0,
      importDate:       new Date().toISOString().slice(0, 10),
      shelfDays:        90,
    },
  })

  useEffect(() => {
    if (!open) return
    if (isEdit && ingredient) {
      reset({
        name:             ingredient.name,
        unit:             ingredient.unit,
        initialQuantity:  ingredient.quantity,
        warningThreshold: ingredient.warningThreshold,
        importDate:       ingredient.importDate,
        shelfDays:        ingredient.shelfDays,
      })
    } else {
      reset({
        name:             '',
        unit:             'kg',
        initialQuantity:  0,
        warningThreshold: 0,
        importDate:       new Date().toISOString().slice(0, 10),
        shelfDays:        90,
      })
    }
  }, [open, isEdit, ingredient, reset])

  if (!open) return null

  function submit(data: FormData) {
    if (isEdit && ingredient) {
      onSubmit({
        name:             data.name,
        unit:             data.unit,
        importDate:       data.importDate,
        shelfDays:        data.shelfDays,
        warningThreshold: data.warningThreshold,
      } satisfies UpdateIngredientInput, ingredient.id)
    } else {
      onSubmit({
        name:             data.name,
        unit:             data.unit,
        importDate:       data.importDate,
        shelfDays:        data.shelfDays,
        initialQuantity:  data.initialQuantity,
        warningThreshold: data.warningThreshold,
      } satisfies CreateIngredientInput)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onKeyDown={e => e.key === 'Escape' && onClose()}
    >
      <div className="w-full max-w-md rounded-xl bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="font-semibold text-foreground">
            {isEdit ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu'}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-fg hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-4 p-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground">
              Tên nguyên liệu <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              placeholder="Nhập tên nguyên liệu..."
              className="mt-1 w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* Unit + Initial Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground">
                Đơn vị <span className="text-red-500">*</span>
              </label>
              <select
                {...register('unit')}
                className="mt-1 w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {COMMON_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              {errors.unit && <p className="mt-1 text-xs text-red-500">{errors.unit.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                Số lượng ban đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.001"
                disabled={isEdit}
                {...register('initialQuantity')}
                className="mt-1 w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-muted disabled:text-muted-fg"
              />
              {errors.initialQuantity && (
                <p className="mt-1 text-xs text-red-500">{errors.initialQuantity.message}</p>
              )}
            </div>
          </div>

          {/* Warning Threshold */}
          <div>
            <label className="block text-sm font-medium text-foreground">
              Ngưỡng cảnh báo <span className="text-red-500">*</span>
              <span
                title="Hệ thống sẽ cảnh báo khi tồn kho xuống dưới mức này"
                className="ml-1 cursor-help text-muted-fg hover:text-foreground"
              >
                (?)
              </span>
            </label>
            <input
              type="number"
              step="0.001"
              {...register('warningThreshold')}
              className="mt-1 w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <p className="mt-0.5 text-xs text-muted-fg">
              cảnh báo khi tồn kho dưới mức này
            </p>
            {errors.warningThreshold && (
              <p className="mt-1 text-xs text-red-500">{errors.warningThreshold.message}</p>
            )}
          </div>

          {/* Import Date + Shelf Days */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground">
                Ngày nhập kho <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('importDate')}
                className="mt-1 w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              {errors.importDate && (
                <p className="mt-1 text-xs text-red-500">{errors.importDate.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                Số ngày bảo quản <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  type="number"
                  min={1}
                  {...register('shelfDays')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-fg pointer-events-none">
                  ngày
                </span>
              </div>
              {errors.shelfDays && (
                <p className="mt-1 text-xs text-red-500">{errors.shelfDays.message}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted min-h-[44px]"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50 min-h-[44px]"
            >
              {isPending ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
