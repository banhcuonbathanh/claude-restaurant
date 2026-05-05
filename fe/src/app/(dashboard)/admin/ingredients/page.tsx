'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { formatVND } from '@/lib/utils'
import {
  listIngredients, createIngredient, updateIngredient, deleteIngredient, postStockMovement,
} from '@/features/admin/admin.api'
import type { Ingredient } from '@/features/admin/admin.api'
import { useAuthStore } from '@/features/auth/auth.store'
import { Role } from '@/types/auth'

// ── Schemas ───────────────────────────────────────────────────────────────────

const ingSchema = z.object({
  name:          z.string().min(1, 'Bắt buộc').max(150),
  unit:          z.string().min(1, 'Bắt buộc').max(30),
  current_stock: z.coerce.number().min(0),
  min_stock:     z.coerce.number().min(0),
  cost_per_unit: z.coerce.number().min(0),
})
type IngForm = z.infer<typeof ingSchema>

const moveSchema = z.object({
  quantity: z.coerce.number().positive('Phải lớn hơn 0'),
  type:     z.enum(['in', 'out', 'adjustment']),
  note:     z.string().max(200).optional(),
})
type MoveForm = z.infer<typeof moveSchema>

// ── Stock movement modal ──────────────────────────────────────────────────────

function StockMoveModal({ ingredient, onClose }: { ingredient: Ingredient; onClose: () => void }) {
  const qc = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm<MoveForm>({
    resolver: zodResolver(moveSchema),
    defaultValues: { type: 'in' },
  })

  const mut = useMutation({
    mutationFn: (v: MoveForm) => postStockMovement({
      ingredient_id: ingredient.id,
      type: v.type,
      quantity: v.quantity,
      note: v.note,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'ingredients'] })
      qc.invalidateQueries({ queryKey: ['admin', 'low-stock'] })
      toast.success('Đã cập nhật tồn kho')
      onClose()
    },
    onError: () => toast.error('Có lỗi xảy ra'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="font-semibold text-gray-900">Điều chỉnh kho — {ingredient.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={handleSubmit(v => mut.mutate(v))} className="space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Loại thao tác</label>
            <select
              {...register('type')}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="in">Nhập hàng (+)</option>
              <option value="out">Xuất hàng (-)</option>
              <option value="adjustment">Điều chỉnh (+)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Số lượng ({ingredient.unit})
            </label>
            <input
              type="number"
              step="0.001"
              {...register('quantity')}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="0"
            />
            {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
            <input
              {...register('note')}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Tùy chọn"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              Huỷ
            </button>
            <button type="submit" disabled={mut.isPending}
              className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50">
              {mut.isPending ? 'Đang lưu...' : '✓ Xác nhận'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Add / Edit ingredient modal ───────────────────────────────────────────────

function IngredientModal({
  item, onClose,
}: { item: Ingredient | null; onClose: () => void }) {
  const qc = useQueryClient()
  const isEdit = item !== null

  const { register, handleSubmit, formState: { errors } } = useForm<IngForm>({
    resolver: zodResolver(ingSchema),
    defaultValues: item
      ? { name: item.name, unit: item.unit, current_stock: item.current_stock, min_stock: item.min_stock, cost_per_unit: item.cost_per_unit }
      : { name: '', unit: '', current_stock: 0, min_stock: 0, cost_per_unit: 0 },
  })

  const mut = useMutation({
    mutationFn: (v: IngForm) =>
      isEdit
        ? updateIngredient(item!.id, { name: v.name, unit: v.unit, min_stock: v.min_stock, cost_per_unit: v.cost_per_unit })
        : createIngredient(v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'ingredients'] })
      toast.success(isEdit ? 'Đã cập nhật nguyên liệu' : 'Đã thêm nguyên liệu')
      onClose()
    },
    onError: () => toast.error('Có lỗi xảy ra'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="font-semibold text-gray-900">
            {isEdit ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={handleSubmit(v => mut.mutate(v))} className="space-y-4 p-6">
          {[
            { label: 'Tên nguyên liệu', key: 'name' as const, type: 'text' },
            { label: 'Đơn vị (kg, L, cái…)', key: 'unit' as const, type: 'text' },
            { label: 'Tồn kho hiện tại', key: 'current_stock' as const, type: 'number', disabled: isEdit },
            { label: 'Tồn kho tối thiểu (cảnh báo)', key: 'min_stock' as const, type: 'number' },
            { label: 'Giá nhập / đơn vị (₫)', key: 'cost_per_unit' as const, type: 'number' },
          ].map(({ label, key, type, disabled }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700">{label}</label>
              <input
                type={type}
                step={type === 'number' ? '0.001' : undefined}
                disabled={disabled}
                {...register(key)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50 disabled:text-gray-400"
              />
              {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]?.message}</p>}
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              Huỷ
            </button>
            <button type="submit" disabled={mut.isPending}
              className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50">
              {mut.isPending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : '+ Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function IngredientsPage() {
  const qc = useQueryClient()
  const me = useAuthStore(s => s.user)
  const isAdmin = me ? (Role[me.role.toUpperCase() as keyof typeof Role] ?? 0) >= Role.ADMIN : false

  const [modal, setModal]     = useState<'add' | 'edit' | 'move' | null>(null)
  const [selected, setSelected] = useState<Ingredient | null>(null)

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['admin', 'ingredients'],
    queryFn:  listIngredients,
    staleTime: 30_000,
  })

  const deleteMut = useMutation({
    mutationFn: deleteIngredient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'ingredients'] })
      toast.success('Đã xóa nguyên liệu')
    },
    onError: () => toast.error('Có lỗi xảy ra'),
  })

  const openEdit = (ing: Ingredient) => { setSelected(ing); setModal('edit') }
  const openMove = (ing: Ingredient) => { setSelected(ing); setModal('move') }
  const closeModal = () => { setModal(null); setSelected(null) }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Kho nguyên liệu</h1>
        <button
          onClick={() => setModal('add')}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          + Thêm nguyên liệu
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center text-sm text-gray-400">
          Chưa có nguyên liệu nào. Thêm nguyên liệu đầu tiên.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nguyên liệu</th>
                <th className="px-4 py-3 text-left font-medium">Đơn vị</th>
                <th className="px-4 py-3 text-right font-medium">Tồn hiện tại</th>
                <th className="px-4 py-3 text-right font-medium">Tồn tối thiểu</th>
                <th className="px-4 py-3 text-right font-medium">Giá nhập</th>
                <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
                <th className="px-4 py-3 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map(ing => {
                const isCritical = ing.current_stock < ing.min_stock
                const isWarning  = !isCritical && ing.current_stock <= ing.min_stock * 1.2
                const pct = ing.min_stock > 0 ? Math.min((ing.current_stock / ing.min_stock) * 100, 100) : 100
                return (
                  <tr key={ing.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{ing.name}</td>
                    <td className="px-4 py-3 text-gray-500">{ing.unit}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`font-medium ${isCritical ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-gray-800'}`}>
                          {ing.current_stock}
                        </span>
                        <div className="h-1.5 w-20 rounded-full bg-gray-200">
                          <div
                            className={`h-1.5 rounded-full ${isCritical ? 'bg-red-400' : isWarning ? 'bg-yellow-400' : 'bg-green-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">{ing.min_stock}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{formatVND(ing.cost_per_unit)}</td>
                    <td className="px-4 py-3 text-center">
                      {isCritical
                        ? <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Thiếu hàng</span>
                        : isWarning
                          ? <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">Sắp hết</span>
                          : <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Đủ hàng</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openMove(ing)}
                          className="rounded border border-orange-300 px-2 py-1 text-xs text-orange-600 hover:bg-orange-50"
                        >
                          Nhập/Xuất
                        </button>
                        <button
                          onClick={() => openEdit(ing)}
                          className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                        >
                          Sửa
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              if (confirm(`Xóa nguyên liệu "${ing.name}"?`)) deleteMut.mutate(ing.id)
                            }}
                            className="rounded border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal === 'add'  && <IngredientModal item={null} onClose={closeModal} />}
      {modal === 'edit' && selected && <IngredientModal item={selected} onClose={closeModal} />}
      {modal === 'move' && selected && <StockMoveModal ingredient={selected} onClose={closeModal} />}
    </div>
  )
}
