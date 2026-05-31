'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  listProducts, deleteProduct, toggleAvailability,
  listCategories, createCategory, createTopping, createProduct, createStaff,
} from '@/features/admin/admin.api'
import type { Product, Category, Topping } from '@/types/product'
import dynamic from 'next/dynamic'
import { ProductPageHeader } from './_components/ProductPageHeader'
import { ProductsTable }     from './_components/ProductsTable'
const ProductFormModal = dynamic(() =>
  import('./_components/ProductFormModal').then(m => ({ default: m.ProductFormModal }))
)

export default function ProductsPage() {
  const qc = useQueryClient()
  const [modal, setModal]         = useState<{ open: boolean; product?: Product }>({ open: false })
  const [seedLoading, setSeedLoading] = useState(false)

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['admin', 'products'],
    queryFn:  listProducts,
    staleTime: 30_000,
  })

  const deleteMut = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      toast.success('Đã xóa sản phẩm')
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status: number } }).response?.status
      if (status === 409) {
        toast.error('Sản phẩm đang có đơn hàng đang xử lý, không thể xoá')
      } else {
        toast.error('Không thể xóa sản phẩm')
      }
    },
  })

  const toggleMut = useMutation({
    mutationFn: ({ id, is_available }: { id: string; is_available: boolean }) =>
      toggleAvailability(id, is_available),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
    onError:   () => toast.error('Không thể cập nhật trạng thái'),
  })

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Xóa sản phẩm "${name}"?`)) return
    deleteMut.mutate(id)
  }

  const handleSeed = async () => {
    setSeedLoading(true)
    try {
      const catResults = await Promise.allSettled([
        createCategory({ name: 'Bánh cuốn', sort_order: 1 }),
        createCategory({ name: 'Đồ uống',   sort_order: 2 }),
        createCategory({ name: 'Món thêm',  sort_order: 3 }),
      ])
      const newCats = catResults
        .filter((r): r is PromiseFulfilledResult<Category> => r.status === 'fulfilled')
        .map(r => r.value)

      const [topResults] = await Promise.all([
        Promise.allSettled([
          createTopping({ name: 'Hành phi',   price: 0 }),
          createTopping({ name: 'Trứng chiên', price: 5000 }),
          createTopping({ name: 'Giò lụa',    price: 10000 }),
          createTopping({ name: 'Chả quế',    price: 8000 }),
          createTopping({ name: 'Tôm tươi',   price: 15000 }),
        ]),
        Promise.allSettled([
          createStaff({ username: 'chef_demo01',   password: 'DemoPass1', full_name: 'Nguyễn Văn Bếp', role: 'chef' }),
          createStaff({ username: 'cashier01',     password: 'DemoPass1', full_name: 'Trần Thị Thu',   role: 'cashier' }),
          createStaff({ username: 'staff_demo01',  password: 'DemoPass1', full_name: 'Lê Văn Phục',   role: 'staff' }),
        ]),
      ])
      const topIds = topResults
        .filter((r): r is PromiseFulfilledResult<Topping> => r.status === 'fulfilled')
        .map(r => r.value.id)

      const usableCats = newCats.length > 0
        ? newCats
        : await listCategories().catch(() => [] as Category[])
      if (usableCats.length === 0) {
        toast.warning('Không có danh mục — sản phẩm mẫu chưa được tạo')
      } else {
        const c0 = usableCats[0].id
        const c1 = (usableCats[1] ?? usableCats[0]).id
        const c2 = (usableCats[2] ?? usableCats[0]).id
        await Promise.allSettled([
          createProduct({ category_id: c0, name: 'Bánh cuốn nhân tôm',    description: 'Bánh cuốn truyền thống nhân tôm tươi',       price: 45000, sort_order: 1, topping_ids: topIds.slice(0, 3) }),
          createProduct({ category_id: c0, name: 'Bánh cuốn nhân thịt',   description: 'Bánh cuốn nhân thịt băm đặc biệt',           price: 40000, sort_order: 2, topping_ids: topIds.slice(0, 2) }),
          createProduct({ category_id: c0, name: 'Bánh cuốn chay',        description: 'Bánh cuốn chay không nhân',                  price: 30000, sort_order: 3, topping_ids: topIds.slice(0, 1) }),
          createProduct({ category_id: c0, name: 'Bánh cuốn đặc biệt',    description: 'Combo đặc biệt đủ nhân, đủ topping',         price: 65000, sort_order: 4, topping_ids: topIds }),
          createProduct({ category_id: c1, name: 'Trà đá',                description: 'Trà đá truyền thống',                        price: 10000, sort_order: 1, topping_ids: [] }),
          createProduct({ category_id: c1, name: 'Nước cam',              description: 'Nước cam tươi ép',                           price: 25000, sort_order: 2, topping_ids: [] }),
          createProduct({ category_id: c1, name: 'Soda chanh',            description: 'Soda chanh bạc hà mát lạnh',                 price: 20000, sort_order: 3, topping_ids: [] }),
          createProduct({ category_id: c2, name: 'Chả lụa thái lát',     description: 'Chả lụa thái lát kèm dưa leo',              price: 15000, sort_order: 1, topping_ids: [] }),
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
      <ProductPageHeader
        count={products.length}
        onAdd={() => setModal({ open: true })}
        onSeed={handleSeed}
        seedLoading={seedLoading}
      />
      <ProductsTable
        products={products}
        isLoading={isLoading}
        onEdit={(p) => setModal({ open: true, product: p })}
        onDelete={handleDelete}
        onToggle={(id, is_available) => toggleMut.mutate({ id, is_available })}
      />
      <ProductFormModal
        mode={modal.product ? 'edit' : 'add'}
        product={modal.product}
        open={modal.open}
        onClose={() => setModal({ open: false })}
      />
    </div>
  )
}
