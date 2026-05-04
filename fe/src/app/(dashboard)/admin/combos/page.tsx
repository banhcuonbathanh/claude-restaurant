'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { formatVND } from '@/lib/utils'
import {
  listCombos, createCombo, deleteCombo,
  listProducts,
} from '@/features/admin/admin.api'
import type { Combo, Product } from '@/types/product'

const schema = z.object({
  name:        z.string().min(1, 'Nhập tên combo'),
  price:       z.coerce.number().min(0, 'Giá không hợp lệ'),
  description: z.string().optional(),
  sort_order:  z.coerce.number().int().default(0),
})
type FormValues = z.infer<typeof schema>

// productId → quantity
type SelectedItems = Record<string, number>

const COMBO_NAMES = [
  'Combo Bữa Sáng', 'Combo Gia Đình', 'Combo Văn Phòng', 'Combo Đặc Biệt',
  'Combo Tiết Kiệm', 'Combo Đôi', 'Combo Cuối Tuần', 'Combo Học Sinh',
]

function randomComboName(existing: string[]) {
  const unused = COMBO_NAMES.filter(n => !existing.includes(n))
  const pool = unused.length > 0 ? unused : COMBO_NAMES
  return pool[Math.floor(Math.random() * pool.length)]
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export default function CombosPage() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [selectedItems, setSelectedItems] = useState<SelectedItems>({})
  const [itemsError, setItemsError] = useState<string | null>(null)
  const [randomLoading, setRandomLoading] = useState(false)

  const { data: combos = [], isLoading } = useQuery<Combo[]>({
    queryKey: ['admin', 'combos'],
    queryFn:  listCombos,
  })
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['admin', 'products'],
    queryFn:  listProducts,
  })

  const productMap = Object.fromEntries(products.map(p => [p.id, p]))

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', price: 0, description: '', sort_order: 0 },
  })

  const watchedItems = selectedItems
  const retailTotal = Object.entries(watchedItems).reduce((sum, [id, qty]) => {
    const p = productMap[id]
    return sum + (p ? p.price * qty : 0)
  }, 0)

  const openAdd = () => {
    reset({ name: '', price: 0, description: '', sort_order: 0 })
    setSelectedItems({})
    setItemsError(null)
    setShowModal(true)
  }

  const toggleProduct = (productId: string) => {
    setSelectedItems(prev => {
      if (prev[productId] !== undefined) {
        const next = { ...prev }
        delete next[productId]
        return next
      }
      return { ...prev, [productId]: 1 }
    })
    setItemsError(null)
  }

  const setQty = (productId: string, qty: number) => {
    setSelectedItems(prev => ({ ...prev, [productId]: Math.max(1, qty) }))
  }

  const createMut = useMutation({
    mutationFn: (values: FormValues) => createCombo({
      name:        values.name,
      price:       values.price,
      description: values.description,
      sort_order:  values.sort_order,
      items: Object.entries(selectedItems).map(([product_id, quantity]) => ({ product_id, quantity })),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'combos'] })
      toast.success('Đã tạo combo')
      setShowModal(false)
    },
    onError: () => toast.error('Có lỗi xảy ra'),
  })

  const onSubmit = (values: FormValues) => {
    if (Object.keys(selectedItems).length === 0) {
      setItemsError('Chọn ít nhất 1 sản phẩm')
      return
    }
    createMut.mutate(values)
  }

  const deleteMut = useMutation({
    mutationFn: deleteCombo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'combos'] })
      toast.success('Đã xóa combo')
    },
    onError: () => toast.error('Không thể xóa combo'),
  })

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Xóa combo "${name}"?`)) return
    deleteMut.mutate(id)
  }

  // Unique products by name (de-dup from seed data)
  const uniqueProducts = products.filter((p, i, arr) =>
    arr.findIndex(x => x.name === p.name) === i
  )

  const handleRandomCombos = async () => {
    if (uniqueProducts.length < 2) {
      toast.error('Cần có ít nhất 2 sản phẩm để tạo combo ngẫu nhiên')
      return
    }
    setRandomLoading(true)
    const existingNames = combos.map(c => c.name)
    const templates = [
      { count: 2, qtyRange: [1, 2], discount: 0.12 },
      { count: 3, qtyRange: [1, 2], discount: 0.15 },
      { count: 2, qtyRange: [2, 2], discount: 0.10 },
    ]
    try {
      await Promise.allSettled(templates.map(async (tpl, i) => {
        const picked = pickRandom(uniqueProducts, tpl.count)
        const items = picked.map(p => ({
          product_id: p.id,
          quantity: tpl.qtyRange[0] + Math.floor(Math.random() * (tpl.qtyRange[1] - tpl.qtyRange[0] + 1)),
        }))
        const retail = items.reduce((s, it) => {
          const p = productMap[it.product_id]
          return s + (p ? p.price * it.quantity : 0)
        }, 0)
        const price = Math.round(retail * (1 - tpl.discount) / 1000) * 1000
        const name = randomComboName([...existingNames])
        existingNames.push(name)
        return createCombo({ name, price, items, sort_order: i + 1 })
      }))
      qc.invalidateQueries({ queryKey: ['admin', 'combos'] })
      toast.success('Đã tạo 3 combo ngẫu nhiên!')
    } catch {
      toast.error('Có lỗi khi tạo combo ngẫu nhiên')
    } finally {
      setRandomLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Combo ({combos.length})</h2>
        <div className="flex gap-2">
          <button
            onClick={handleRandomCombos}
            disabled={randomLoading}
            className="px-4 py-2 bg-purple-100 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
          >
            {randomLoading ? 'Đang tạo...' : '🎲 Random combo'}
          </button>
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            + Thêm combo
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
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tên combo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Sản phẩm trong combo</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Giá combo</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Giá lẻ</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Tiết kiệm</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {combos.map(combo => {
                const retailTotal = combo.items.reduce((sum, item) => {
                  const p = productMap[item.product_id]
                  return sum + (p ? p.price * item.quantity : 0)
                }, 0)
                const savings = retailTotal - combo.price
                return (
                  <tr key={combo.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{combo.name}</p>
                      {combo.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{combo.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {combo.items.map((item, idx) => {
                          const p = productMap[item.product_id]
                          return (
                            <span key={idx} className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded-full">
                              {p?.name ?? item.product_id} ×{item.quantity}
                            </span>
                          )
                        })}
                        {combo.items.length === 0 && (
                          <span className="text-gray-400 text-xs">Chưa có sản phẩm</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatVND(combo.price)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {retailTotal > 0 ? formatVND(retailTotal) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {savings > 0 ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          -{formatVND(savings)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(combo.id, combo.name)}
                        className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                )
              })}
              {combos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    Chưa có combo nào — hãy tạo combo đầu tiên
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-900">Tạo combo mới</h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col overflow-hidden flex-1">
              <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">

                {/* Name + Description */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên combo</label>
                    <input
                      {...register('name')}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Combo gia đình"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả (tuỳ chọn)</label>
                    <input
                      {...register('description')}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Mô tả ngắn về combo"
                    />
                  </div>
                </div>

                {/* Product checkbox list */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Chọn sản phẩm
                      {Object.keys(selectedItems).length > 0 && (
                        <span className="ml-2 text-orange-600 font-normal">
                          ({Object.keys(selectedItems).length} món đã chọn)
                        </span>
                      )}
                    </label>
                    {Object.keys(selectedItems).length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedItems({})}
                        className="text-xs text-gray-400 hover:text-red-500"
                      >
                        Bỏ chọn tất cả
                      </button>
                    )}
                  </div>
                  {itemsError && (
                    <p className="text-red-500 text-xs mb-2">{itemsError}</p>
                  )}

                  <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 max-h-72 overflow-y-auto">
                    {uniqueProducts.map(product => {
                      const isChecked = selectedItems[product.id] !== undefined
                      return (
                        <div
                          key={product.id}
                          className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer ${
                            isChecked ? 'bg-orange-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => toggleProduct(product.id)}
                        >
                          {/* Checkbox */}
                          <div className="mt-0.5 flex-shrink-0">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                              isChecked
                                ? 'bg-orange-500 border-orange-500'
                                : 'border-gray-300'
                            }`}>
                              {isChecked && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
                                  <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                          </div>

                          {/* Product info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-sm font-medium ${isChecked ? 'text-orange-700' : 'text-gray-900'}`}>
                                {product.name}
                              </span>
                              <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                                {formatVND(product.price)}
                              </span>
                            </div>
                            {product.toppings.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {product.toppings.map(t => (
                                  <span key={t.id} className="px-1.5 py-0.5 bg-orange-100 text-orange-600 text-xs rounded">
                                    {t.name}{t.price > 0 ? ` +${formatVND(t.price)}` : ''}
                                  </span>
                                ))}
                              </div>
                            )}
                            {product.description && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate">{product.description}</p>
                            )}
                          </div>

                          {/* Quantity (shown when checked) */}
                          {isChecked && (
                            <div
                              className="flex items-center gap-1.5 flex-shrink-0"
                              onClick={e => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => setQty(product.id, (selectedItems[product.id] ?? 1) - 1)}
                                className="w-6 h-6 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center text-sm leading-none"
                              >
                                −
                              </button>
                              <span className="w-6 text-center text-sm font-medium text-gray-900">
                                {selectedItems[product.id]}
                              </span>
                              <button
                                type="button"
                                onClick={() => setQty(product.id, (selectedItems[product.id] ?? 1) + 1)}
                                className="w-6 h-6 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center text-sm leading-none"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Selected summary */}
                {Object.keys(selectedItems).length > 0 && (
                  <div className="bg-orange-50 rounded-xl p-3 space-y-1.5">
                    <p className="text-xs font-medium text-orange-700 mb-2">Các món đã chọn:</p>
                    {Object.entries(selectedItems).map(([id, qty]) => {
                      const p = productMap[id]
                      if (!p) return null
                      return (
                        <div key={id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{p.name} <span className="text-gray-400">×{qty}</span></span>
                          <span className="text-gray-900 font-medium">{formatVND(p.price * qty)}</span>
                        </div>
                      )
                    })}
                    <div className="border-t border-orange-200 pt-1.5 mt-1.5 flex items-center justify-between text-sm font-semibold">
                      <span className="text-gray-700">Tổng giá lẻ</span>
                      <span className="text-gray-900">{formatVND(retailTotal)}</span>
                    </div>
                  </div>
                )}

                {/* Price + sort */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá combo (₫)
                      {retailTotal > 0 && (
                        <span className="ml-1 text-xs text-gray-400 font-normal">
                          — gợi ý: {formatVND(Math.round(retailTotal * 0.9 / 1000) * 1000)}
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      {...register('price')}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="85000"
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
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t flex gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={createMut.isPending}
                  className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
                >
                  {createMut.isPending ? 'Đang lưu...' : 'Tạo combo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
