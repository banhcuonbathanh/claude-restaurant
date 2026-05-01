'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { formatVND } from '@/lib/utils'
import {
  listProducts, createProduct, updateProduct, deleteProduct, toggleAvailability,
  listCategories,
} from '@/features/admin/admin.api'
import type { Product, Category } from '@/types/product'

const schema = z.object({
  category_id:  z.string().min(1, 'Chọn danh mục'),
  name:         z.string().min(1, 'Nhập tên').max(100),
  description:  z.string().optional(),
  price:        z.coerce.number().min(0, 'Giá không hợp lệ'),
  sort_order:   z.coerce.number().int().default(0),
})
type FormValues = z.infer<typeof schema>

export default function ProductsPage() {
  const qc = useQueryClient()
  const [editItem, setEditItem] = useState<Product | null>(null)
  const [showModal, setShowModal] = useState(false)

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['admin', 'products'],
    queryFn:  listProducts,
  })
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['admin', 'categories'],
    queryFn:  listCategories,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const openAdd = () => {
    reset({ category_id: '', name: '', description: '', price: 0, sort_order: 0 })
    setEditItem(null)
    setShowModal(true)
  }
  const openEdit = (p: Product) => {
    reset({ category_id: p.category_id, name: p.name, description: p.description ?? '', price: p.price, sort_order: p.sort_order })
    setEditItem(p)
    setShowModal(true)
  }
  const closeModal = () => setShowModal(false)

  const saveMut = useMutation({
    mutationFn: (values: FormValues) =>
      editItem
        ? updateProduct(editItem.id, values)
        : createProduct(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      toast.success(editItem ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm')
      closeModal()
    },
    onError: () => toast.error('Có lỗi xảy ra'),
  })

  const deleteMut = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      toast.success('Đã xóa sản phẩm')
    },
    onError: () => toast.error('Không thể xóa sản phẩm'),
  })

  const toggleMut = useMutation({
    mutationFn: ({ id, is_available }: { id: string; is_available: boolean }) =>
      toggleAvailability(id, is_available),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
    onError: () => toast.error('Không thể cập nhật trạng thái'),
  })

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Xóa sản phẩm "${name}"?`)) return
    deleteMut.mutate(id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Sản phẩm ({products.length})</h2>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          + Thêm sản phẩm
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500 text-sm">Đang tải...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tên sản phẩm</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Danh mục</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Giá</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Trạng thái</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category_name}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{formatVND(p.price)}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleMut.mutate({ id: p.id, is_available: !p.is_available })}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.is_available
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {p.is_available ? 'Đang bán' : 'Hết hàng'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEdit(p)}
                        className="px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                    Chưa có sản phẩm nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-900">
                {editItem ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
              </h3>
            </div>
            <form onSubmit={handleSubmit(v => saveMut.mutate(v))} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select
                  {...register('category_id')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                <input
                  {...register('name')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Bánh cuốn nhân tôm"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả (tuỳ chọn)</label>
                <textarea
                  {...register('description')}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (₫)</label>
                  <input
                    type="number"
                    {...register('price')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="35000"
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
                  <input
                    type="number"
                    {...register('sort_order')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={saveMut.isPending}
                  className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
                >
                  {saveMut.isPending ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
