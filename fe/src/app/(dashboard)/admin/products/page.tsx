'use client'
import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { formatVND, getImageUrl } from '@/lib/utils'
import {
  listProducts, createProduct, updateProduct, deleteProduct, toggleAvailability,
  listCategories, createCategory,
  listToppings, createTopping,
  createStaff,
  uploadFile,
} from '@/features/admin/admin.api'
import type { Product, Category, Topping } from '@/types/product'

const schema = z.object({
  category_id:  z.string().min(1, 'Chọn danh mục'),
  name:         z.string().min(1, 'Nhập tên').max(100),
  description:  z.string().optional(),
  price:        z.coerce.number().min(0, 'Giá không hợp lệ'),
  sort_order:   z.coerce.number().int().default(0),
  topping_ids:  z.array(z.string()).default([]),
})
type FormValues = z.infer<typeof schema>

export default function ProductsPage() {
  const qc = useQueryClient()
  const [editItem, setEditItem] = useState<Product | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [imagePath, setImagePath] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [seedLoading, setSeedLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['admin', 'products'],
    queryFn:  listProducts,
  })
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['admin', 'categories'],
    queryFn:  listCategories,
  })
  const { data: toppings = [] } = useQuery<Topping[]>({
    queryKey: ['admin', 'toppings'],
    queryFn:  listToppings,
  })

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const selectedToppingIds = watch('topping_ids') ?? []

  const toggleTopping = (id: string) => {
    const next = selectedToppingIds.includes(id)
      ? selectedToppingIds.filter(t => t !== id)
      : [...selectedToppingIds, id]
    setValue('topping_ids', next)
  }

  const openAdd = () => {
    reset({ category_id: '', name: '', description: '', price: 0, sort_order: 0, topping_ids: [] })
    setEditItem(null)
    setImagePath(null)
    setImagePreview(null)
    setShowModal(true)
  }
  const openEdit = (p: Product) => {
    reset({
      category_id: p.category_id,
      name: p.name,
      description: p.description ?? '',
      price: p.price,
      sort_order: p.sort_order,
      topping_ids: p.toppings.map(t => t.id),
    })
    setEditItem(p)
    setImagePath(p.image_path ?? null)
    setImagePreview(getImageUrl(p.image_path))
    setShowModal(true)
  }
  const closeModal = () => setShowModal(false)

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImagePreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const result = await uploadFile(file)
      setImagePath(result.object_path)
    } catch {
      toast.error('Tải ảnh thất bại')
      setImagePreview(null)
      setImagePath(null)
    } finally {
      setUploading(false)
    }
  }

  const saveMut = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = { ...values, image_path: imagePath ?? undefined }
      return editItem
        ? updateProduct(editItem.id, payload)
        : createProduct(payload)
    },
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

  const handleSeed = async () => {
    setSeedLoading(true)
    try {
      // Step 1: categories
      const catResults = await Promise.allSettled([
        createCategory({ name: 'Bánh cuốn', sort_order: 1 }),
        createCategory({ name: 'Đồ uống', sort_order: 2 }),
        createCategory({ name: 'Món thêm', sort_order: 3 }),
      ])
      const newCats = catResults
        .filter((r): r is PromiseFulfilledResult<Category> => r.status === 'fulfilled')
        .map(r => r.value)

      // Step 2: toppings + staff in parallel
      const [topResults] = await Promise.all([
        Promise.allSettled([
          createTopping({ name: 'Hành phi', price: 0 }),
          createTopping({ name: 'Trứng chiên', price: 5000 }),
          createTopping({ name: 'Giò lụa', price: 10000 }),
          createTopping({ name: 'Chả quế', price: 8000 }),
          createTopping({ name: 'Tôm tươi', price: 15000 }),
        ]),
        Promise.allSettled([
          createStaff({ username: 'chef_demo01', password: 'DemoPass1', full_name: 'Nguyễn Văn Bếp', role: 'chef' }),
          createStaff({ username: 'cashier01', password: 'DemoPass1', full_name: 'Trần Thị Thu', role: 'cashier' }),
          createStaff({ username: 'staff_demo01', password: 'DemoPass1', full_name: 'Lê Văn Phục', role: 'staff' }),
        ]),
      ])
      const topIds = topResults
        .filter((r): r is PromiseFulfilledResult<Topping> => r.status === 'fulfilled')
        .map(r => r.value.id)

      // Step 3: products — use newly created cats, fall back to existing
      const usableCats = newCats.length > 0 ? newCats : categories
      if (usableCats.length === 0) {
        toast.warning('Không có danh mục — sản phẩm mẫu chưa được tạo')
      } else {
        const c0 = usableCats[0].id
        const c1 = (usableCats[1] ?? usableCats[0]).id
        const c2 = (usableCats[2] ?? usableCats[0]).id
        await Promise.allSettled([
          createProduct({ category_id: c0, name: 'Bánh cuốn nhân tôm', description: 'Bánh cuốn truyền thống nhân tôm tươi', price: 45000, sort_order: 1, topping_ids: topIds.slice(0, 3) }),
          createProduct({ category_id: c0, name: 'Bánh cuốn nhân thịt', description: 'Bánh cuốn nhân thịt băm đặc biệt', price: 40000, sort_order: 2, topping_ids: topIds.slice(0, 2) }),
          createProduct({ category_id: c0, name: 'Bánh cuốn chay', description: 'Bánh cuốn chay không nhân', price: 30000, sort_order: 3, topping_ids: topIds.slice(0, 1) }),
          createProduct({ category_id: c0, name: 'Bánh cuốn đặc biệt', description: 'Combo đặc biệt đủ nhân, đủ topping', price: 65000, sort_order: 4, topping_ids: topIds }),
          createProduct({ category_id: c1, name: 'Trà đá', description: 'Trà đá truyền thống', price: 10000, sort_order: 1, topping_ids: [] }),
          createProduct({ category_id: c1, name: 'Nước cam', description: 'Nước cam tươi ép', price: 25000, sort_order: 2, topping_ids: [] }),
          createProduct({ category_id: c1, name: 'Soda chanh', description: 'Soda chanh bạc hà mát lạnh', price: 20000, sort_order: 3, topping_ids: [] }),
          createProduct({ category_id: c2, name: 'Chả lụa thái lát', description: 'Chả lụa thái lát kèm dưa leo', price: 15000, sort_order: 1, topping_ids: [] }),
        ])
      }

      qc.invalidateQueries({ queryKey: ['admin'] })
      toast.success('Đã tạo dữ liệu mẫu thành công!')
    } catch {
      toast.error('Có lỗi khi tạo dữ liệu mẫu')
    } finally {
      setSeedLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Sản phẩm ({products.length})</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSeed}
            disabled={seedLoading}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {seedLoading ? 'Đang tạo...' : '🌱 Dữ liệu mẫu'}
          </button>
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            + Thêm sản phẩm
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-gray-500 text-sm">Đang tải...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 w-14" />
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tên sản phẩm</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Danh mục</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Topping</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Giá</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Trạng thái</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {p.image_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getImageUrl(p.image_path) ?? ''}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-lg">
                        🖼
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category_name}</td>
                  <td className="px-4 py-3">
                    {p.toppings.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {p.toppings.map(t => (
                          <span key={t.id} className="px-1.5 py-0.5 bg-orange-50 text-orange-700 text-xs rounded">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
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
                        className="px-3 py-1 text-xs border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
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
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
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
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-900">
                {editItem ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
              </h3>
            </div>
            <form onSubmit={handleSubmit(v => saveMut.mutate(v))} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select
                  {...register('category_id')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  <p className="text-xs text-gray-400">Chưa có topping nào — thêm ở trang Topping trước</p>
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
                  onClick={closeModal}
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
