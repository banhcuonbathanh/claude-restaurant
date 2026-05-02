'use client'
import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { formatVND } from '@/lib/utils'
import { listToppings, createTopping, updateTopping, deleteTopping, listProducts } from '@/features/admin/admin.api'
import type { Topping, Product } from '@/types/product'

const schema = z.object({
  name:  z.string().min(1, 'Nhập tên topping').max(100),
  price: z.coerce.number().min(0, 'Giá không hợp lệ'),
})
type FormValues = z.infer<typeof schema>

export default function ToppingsPage() {
  const qc = useQueryClient()
  const [editItem, setEditItem] = useState<Topping | null>(null)
  const [showModal, setShowModal] = useState(false)

  const { data: toppings = [], isLoading } = useQuery<Topping[]>({
    queryKey: ['admin', 'toppings'],
    queryFn:  listToppings,
  })
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['admin', 'products'],
    queryFn:  listProducts,
  })

  // reverse map: topping_id → product names
  const toppingProducts = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const p of products) {
      for (const t of p.toppings) {
        const names = map.get(t.id) ?? []
        names.push(p.name)
        map.set(t.id, names)
      }
    }
    return map
  }, [products])

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const openAdd = () => {
    reset({ name: '', price: 0 })
    setEditItem(null)
    setShowModal(true)
  }
  const openEdit = (t: Topping) => {
    reset({ name: t.name, price: t.price })
    setEditItem(t)
    setShowModal(true)
  }

  const saveMut = useMutation({
    mutationFn: (values: FormValues) =>
      editItem
        ? updateTopping(editItem.id, values)
        : createTopping(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'toppings'] })
      toast.success(editItem ? 'Đã cập nhật topping' : 'Đã thêm topping')
      setShowModal(false)
    },
    onError: () => toast.error('Có lỗi xảy ra'),
  })

  const deleteMut = useMutation({
    mutationFn: deleteTopping,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'toppings'] })
      toast.success('Đã xóa topping')
    },
    onError: () => toast.error('Không thể xóa topping'),
  })

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Xóa topping "${name}"?`)) return
    deleteMut.mutate(id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Topping ({toppings.length})</h2>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          + Thêm topping
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500 text-sm">Đang tải...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tên topping</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Áp dụng cho sản phẩm</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Giá thêm</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Trạng thái</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {toppings.map(t => {
                const linkedProducts = toppingProducts.get(t.id) ?? []
                return (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                    <td className="px-4 py-3">
                      {linkedProducts.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {linkedProducts.map(name => (
                            <span key={name} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                              {name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">Chưa gắn sản phẩm</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-orange-600 font-medium">+{formatVND(t.price)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        t.is_available
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {t.is_available ? 'Có sẵn' : 'Hết'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openEdit(t)}
                          className="px-3 py-1 text-xs border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(t.id, t.name)}
                          className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {toppings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                    Chưa có topping nào
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
                {editItem ? 'Sửa topping' : 'Thêm topping'}
              </h3>
            </div>
            <form onSubmit={handleSubmit(v => saveMut.mutate(v))} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên topping</label>
                <input
                  {...register('name')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Hành phi, Trứng, Giò..."
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá thêm (₫)</label>
                <input
                  type="number"
                  {...register('price')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="5000"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <p className="text-xs text-gray-400">Gắn topping vào sản phẩm từ trang Sản phẩm → Sửa.</p>
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
