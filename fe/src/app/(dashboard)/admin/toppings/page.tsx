'use client'
import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { listToppings, listProducts, deleteTopping } from '@/features/admin/admin.api'
import type { Topping, Product } from '@/types/product'
import dynamic from 'next/dynamic'
import { ToppingPageHeader } from './_components/ToppingPageHeader'
import { ToppingTable }      from './_components/ToppingTable'
const ToppingFormModal = dynamic(() =>
  import('./_components/ToppingFormModal').then(m => ({ default: m.ToppingFormModal }))
)

export default function ToppingsPage() {
  const qc = useQueryClient()
  const [editTopping, setEditTopping] = useState<Topping | null>(null)
  const [showModal, setShowModal]     = useState(false)

  const { data: toppings = [], isLoading } = useQuery<Topping[]>({
    queryKey: ['admin', 'toppings'],
    queryFn:  listToppings,
    staleTime: 60_000,
  })

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['admin', 'products'],
    queryFn:  listProducts,
    staleTime: 60_000,
  })

  const productNames = useMemo(() => {
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

  const deleteMut = useMutation({
    mutationFn: deleteTopping,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'toppings'] })
      toast.success('Đã xóa topping')
    },
    onError: () => toast.error('Xóa topping thất bại. Vui lòng thử lại.'),
  })

  const handleDelete = (t: Topping) => {
    const linked = productNames.get(t.id) ?? []
    const warning = linked.length > 0
      ? ` Topping này đang áp dụng cho ${linked.length} sản phẩm. Xóa sẽ gỡ liên kết.`
      : ''
    if (!confirm(`Xóa topping "${t.name}"?${warning}`)) return
    deleteMut.mutate(t.id)
  }

  const openAdd = () => {
    setEditTopping(null)
    setShowModal(true)
  }

  const openEdit = (t: Topping) => {
    setEditTopping(t)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditTopping(null)
  }

  return (
    <div>
      <ToppingPageHeader count={toppings.length} onAdd={openAdd} />
      <ToppingTable
        toppings={toppings}
        isLoading={isLoading}
        productNames={productNames}
        onEdit={openEdit}
        onDelete={handleDelete}
      />
      <ToppingFormModal
        open={showModal}
        topping={editTopping}
        onClose={closeModal}
      />
    </div>
  )
}
