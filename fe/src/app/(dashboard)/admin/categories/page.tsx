'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { listCategories, createCategory, updateCategory, deleteCategory } from '@/features/admin/admin.api'
import type { Category } from '@/types/product'

const schema = z.object({
  name:       z.string().min(1, 'Nhập tên danh mục').max(100),
  sort_order: z.coerce.number().int().default(0),
})
type FormValues = z.infer<typeof schema>

export default function CategoriesPage() {
  const qc = useQueryClient()
  const [editItem, setEditItem] = useState<Category | null>(null)
  const [showModal, setShowModal] = useState(false)

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['admin', 'categories'],
    queryFn:  listCategories,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const openAdd = () => {
    reset({ name: '', sort_order: 0 })
    setEditItem(null)
    setShowModal(true)
  }
  const openEdit = (c: Category) => {
    reset({ name: c.name, sort_order: c.sort_order })
    setEditItem(c)
    setShowModal(true)
  }

  const saveMut = useMutation({
    mutationFn: (values: FormValues) =>
      editItem
        ? updateCategory(editItem.id, values)
        : createCategory(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] })
      toast.success(editItem ? 'Đã cập nhật danh mục' : 'Đã thêm danh mục')
      setShowModal(false)
    },
    onError: () => toast.error('Có lỗi xảy ra'),
  })

  const deleteMut = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] })
      toast.success('Đã xóa danh mục')
    },
    onError: () => toast.error('Không thể xóa danh mục'),
  })

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Xóa danh mục "${name}"?`)) return
    deleteMut.mutate(id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Danh mục ({categories.length})</h2>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          + Thêm danh mục
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500 text-sm">Đang tải...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tên danh mục</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Thứ tự</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{c.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEdit(c)}
                        className="px-3 py-1 text-xs border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-gray-400">
                    Chưa có danh mục nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-900">
                {editItem ? 'Sửa danh mục' : 'Thêm danh mục'}
              </h3>
            </div>
            <form onSubmit={handleSubmit(v => saveMut.mutate(v))} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
                <input
                  {...register('name')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Bánh cuốn, Bún bò..."
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự hiển thị</label>
                <input
                  type="number"
                  {...register('sort_order')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
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
