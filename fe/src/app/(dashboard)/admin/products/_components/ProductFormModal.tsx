'use client'
import { useRef, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { formatVND, getImageUrl } from '@/lib/utils'
import {
  listCategories, listToppings,
  createProduct, updateProduct, uploadFile,
} from '@/features/admin/admin.api'
import type { Product, Category, Topping } from '@/types/product'

const schema = z.object({
  category_id:  z.string().min(1, 'Chọn danh mục'),
  name:         z.string().min(1, 'Nhập tên').max(100),
  description:  z.string().optional(),
  price:        z.coerce.number().min(1, 'Giá sản phẩm phải lớn hơn 0'),
  sort_order:   z.coerce.number().int().default(0),
  topping_ids:  z.array(z.string()).default([]),
})
type FormValues = z.infer<typeof schema>

interface Props {
  mode:     'add' | 'edit'
  product?: Product | null
  open:     boolean
  onClose:  () => void
}

export function ProductFormModal({ mode, product, open, onClose }: Props) {
  const qc = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePath, setImagePath]     = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading]     = useState(false)

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn:  listCategories,
    staleTime: 60_000,
  })
  const { data: toppings = [] } = useQuery<Topping[]>({
    queryKey: ['admin', 'toppings'],
    queryFn:  listToppings,
    staleTime: 60_000,
  })

  const { register, handleSubmit, reset, watch, setValue, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && product) {
      reset({
        category_id:  product.category_id,
        name:         product.name,
        description:  product.description ?? '',
        price:        product.price,
        sort_order:   product.sort_order,
        topping_ids:  product.toppings.map(t => t.id),
      })
      setImagePath(product.image_path ?? null)
      setImagePreview(getImageUrl(product.image_path))
    } else {
      reset({ category_id: '', name: '', description: '', price: 0, sort_order: 0, topping_ids: [] })
      setImagePath(null)
      setImagePreview(null)
    }
  }, [open, mode, product, reset])

  const selectedToppingIds = watch('topping_ids') ?? []

  const toggleTopping = (id: string) => {
    const next = selectedToppingIds.includes(id)
      ? selectedToppingIds.filter(t => t !== id)
      : [...selectedToppingIds, id]
    setValue('topping_ids', next)
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImagePreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const result = await uploadFile(file)
      setImagePath(result.object_path)
    } catch {
      toast.error('Không thể tải ảnh lên. Vui lòng thử lại.')
      setImagePreview(null)
      setImagePath(null)
    } finally {
      setUploading(false)
    }
  }

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'products'] })

  const saveMut = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = { ...values, image_path: imagePath ?? undefined }
      return mode === 'edit' && product
        ? updateProduct(product.id, payload)
        : createProduct(payload)
    },
    onSuccess: () => {
      invalidate()
      toast.success(mode === 'edit' ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm')
      onClose()
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status: number } }).response?.status
      if (status === 409) {
        setError('name', { message: 'Tên sản phẩm đã tồn tại' })
      } else {
        toast.error('Lưu không thành công, vui lòng thử lại')
      }
    },
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b sticky top-0 bg-white">
          <h3 className="font-semibold text-gray-900">
            {mode === 'edit' ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
          </h3>
        </div>
        <form onSubmit={handleSubmit(v => saveMut.mutate(v))} className="px-6 py-4 space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
            {categories.length === 0 ? (
              <p className="text-xs text-gray-400">Chưa có danh mục nào. Vui lòng thêm danh mục trước.</p>
            ) : (
              <select
                {...register('category_id')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
            {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
            <input
              {...register('name')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Bánh cuốn nhân tôm"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả (tuỳ chọn)</label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-16 h-16 rounded-lg object-cover bg-gray-100 border border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs text-center">
                  Chưa có ảnh
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-1.5 text-xs border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  {uploading ? 'Đang tải...' : imagePreview ? 'Đổi ảnh' : 'Chọn ảnh'}
                </button>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => { setImagePath(null); setImagePreview(null) }}
                    className="px-3 py-1.5 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50"
                  >
                    Xoá ảnh
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá (₫)</label>
              <input
                type="number"
                {...register('price')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="35000"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
              <input
                type="number"
                {...register('sort_order')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topping áp dụng</label>
            {toppings.length === 0 ? (
              <p className="text-xs text-gray-400">Chưa có topping nào được thiết lập.</p>
            ) : (
              <div className="border border-gray-200 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                {toppings.map(t => (
                  <label key={t.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5">
                    <input
                      type="checkbox"
                      checked={selectedToppingIds.includes(t.id)}
                      onChange={() => toggleTopping(t.id)}
                      className="accent-orange-500 w-4 h-4"
                    />
                    <span className="text-sm text-gray-800">{t.name}</span>
                    <span className="ml-auto text-xs">
                      {t.price === 0
                        ? <span className="text-green-600">Miễn phí</span>
                        : <span className="text-orange-600">+{formatVND(t.price)}</span>}
                    </span>
                  </label>
                ))}
              </div>
            )}
            {selectedToppingIds.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">{selectedToppingIds.length} topping đã chọn</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={saveMut.isPending || categories.length === 0}
              className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              {saveMut.isPending ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
