'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  listIngredients, createIngredient, updateIngredient, deleteIngredient, postStockMovement,
} from '@/features/admin/admin.api'
import type { Ingredient, CreateIngredientInput, UpdateIngredientInput } from '@/features/admin/admin.api'
import { StoragePageHeader } from './_components/StoragePageHeader'
import { IngredientTable } from './_components/IngredientTable'
import { IngredientFormModal } from './_components/IngredientFormModal'

// ── Stock movement modal (kept for Nhập/Xuất flow, outside main spec) ─────────

const moveSchema = z.object({
  quantity: z.coerce.number().positive('Phải lớn hơn 0'),
  type:     z.enum(['in', 'out', 'adjustment']),
  note:     z.string().max(200).optional(),
})
type MoveForm = z.infer<typeof moveSchema>

function StockMoveModal({ ingredient, onClose }: { ingredient: Ingredient; onClose: () => void }) {
  const qc = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm<MoveForm>({
    resolver: zodResolver(moveSchema),
    defaultValues: { type: 'in' },
  })

  const mut = useMutation({
    mutationFn: (v: MoveForm) => postStockMovement({
      ingredient_id: ingredient.id,
      type:          v.type,
      quantity:      v.quantity,
      note:          v.note,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'ingredients'] })
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function IngredientsPage() {
  const qc = useQueryClient()

  const [searchQuery, setSearchQuery] = useState('')
  const [modal, setModal]             = useState<'add' | 'edit' | 'move' | null>(null)
  const [selected, setSelected]       = useState<Ingredient | null>(null)

  const { data: list = [], isLoading, isError } = useQuery({
    queryKey: ['admin', 'ingredients'],
    queryFn:  listIngredients,
    staleTime: 60_000,
  })

  const createMut = useMutation({
    mutationFn: (data: CreateIngredientInput) => createIngredient(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'ingredients'] })
      toast.success('Đã thêm nguyên liệu')
      closeModal()
    },
    onError: (err: Error & { response?: { status?: number } }) => {
      if (err?.response?.status === 409) {
        toast.error('Nguyên liệu này đã tồn tại.')
      } else {
        toast.error('Có lỗi xảy ra')
      }
    },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIngredientInput }) =>
      updateIngredient(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'ingredients'] })
      toast.success('Đã cập nhật nguyên liệu')
      closeModal()
    },
    onError: () => toast.error('Có lỗi xảy ra'),
  })

  const deleteMut = useMutation({
    mutationFn: deleteIngredient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'ingredients'] })
      toast.success('Đã xóa nguyên liệu')
    },
    onError: (err: Error & { response?: { status?: number } }) => {
      if (err?.response?.status === 422) {
        toast.error('Không thể xóa: nguyên liệu đang được sử dụng.')
      } else {
        toast.error('Có lỗi xảy ra')
      }
    },
  })

  const closeModal = () => { setModal(null); setSelected(null) }

  function handleFormSubmit(data: CreateIngredientInput | UpdateIngredientInput, id?: string) {
    if (id) {
      updateMut.mutate({ id, data: data as UpdateIngredientInput })
    } else {
      createMut.mutate(data as CreateIngredientInput)
    }
  }

  const filtered = list.filter(ing =>
    ing.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <StoragePageHeader
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        onAddClick={() => { setSelected(null); setModal('add') }}
      />

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Không tải được danh sách. Thử lại.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : searchQuery && filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center text-sm text-gray-400">
          Không tìm thấy nguyên liệu nào.
        </div>
      ) : (
        <IngredientTable
          ingredients={filtered}
          onEdit={ing => { setSelected(ing); setModal('edit') }}
          onDelete={id => deleteMut.mutate(id)}
        />
      )}

      <IngredientFormModal
        open={modal === 'add' || modal === 'edit'}
        mode={modal === 'edit' ? 'edit' : 'add'}
        ingredient={selected ?? undefined}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        isPending={createMut.isPending || updateMut.isPending}
      />

      {modal === 'move' && selected && (
        <StockMoveModal ingredient={selected} onClose={closeModal} />
      )}
    </div>
  )
}
