'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createTopping, updateTopping } from '@/features/admin/admin.api'
import type { Topping } from '@/types/product'

const schema = z.object({
  name:        z.string().min(1, 'Tên topping không được để trống').max(100),
  price:       z.coerce.number().min(0, 'Giá không được âm'),
  isAvailable: z.boolean(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open:     boolean
  topping?: Topping | null
  onClose:  () => void
}

export function ToppingFormModal({ open, topping, onClose }: Props) {
  const qc = useQueryClient()
  const isEdit = !!topping

  const { register, handleSubmit, reset, watch, setValue, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', price: 0, isAvailable: true },
  })

  useEffect(() => {
    if (!open) return
    if (topping) {
      reset({ name: topping.name, price: topping.price, isAvailable: topping.is_available })
    } else {
      reset({ name: '', price: 0, isAvailable: true })
    }
  }, [open, topping, reset])

  const isAvailable = watch('isAvailable')

  const saveMut = useMutation({
    mutationFn: (values: FormValues) =>
      isEdit && topping
        ? updateTopping(topping.id, { name: values.name, price: values.price, is_available: values.isAvailable })
        : createTopping({ name: values.name, price: values.price }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'toppings'] })
      toast.success(isEdit ? 'Đã cập nhật topping' : 'Đã thêm topping')
      onClose()
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status: number } }).response?.status
      if (status === 409) {
        setError('name', { message: 'Tên topping đã tồn tại' })
      } else {
        toast.error('Có lỗi xảy ra, vui lòng thử lại')
      }
    },
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-sm shadow-xl">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            {isEdit ? 'Sửa topping' : 'Thêm topping'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit(v => saveMut.mutate(v))} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên topping *</label>
            <input
              {...register('name')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Nhập tên topping..."
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá thêm (đ)</label>
            <input
              type="number"
              {...register('price')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="0"
            />
            <p className="text-xs text-gray-400 mt-1">0 = Miễn phí</p>
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <button
              type="button"
              onClick={() => setValue('isAvailable', !isAvailable)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isAvailable ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAvailable ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
            <span className="ml-2 text-sm text-gray-700">{isAvailable ? 'Có sẵn' : 'Hết'}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saveMut.isPending}
              className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              {saveMut.isPending ? 'Đang lưu...' : 'Lưu topping'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
