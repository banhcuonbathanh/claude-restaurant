import { formatVND, getImageUrl } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Product } from '@/types/product'

const MAX_TOPPING_PILLS = 2

interface Props {
  products:  Product[]
  isLoading: boolean
  onEdit:    (p: Product) => void
  onDelete:  (id: string, name: string) => void
  onToggle:  (id: string, is_available: boolean) => void
}

export function ProductsTable({ products, isLoading, onEdit, onDelete, onToggle }: Props) {
  if (isLoading) {
    return <p className="text-gray-500 text-sm">Đang tải...</p>
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm">
        <EmptyState message="Chưa có sản phẩm nào" />
      </div>
    )
  }

  return (
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
          {products.map(p => {
            const visibleToppings = p.toppings.slice(0, MAX_TOPPING_PILLS)
            const overflow = p.toppings.length - MAX_TOPPING_PILLS

            return (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {p.image_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getImageUrl(p.image_path) ?? ''}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-lg">
                      🍜
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.category_name}</td>
                <td className="px-4 py-3">
                  {p.toppings.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {visibleToppings.map(t => (
                        <span key={t.id} className="px-1.5 py-0.5 bg-orange-50 text-orange-700 text-xs rounded">
                          {t.name}
                        </span>
                      ))}
                      {overflow > 0 && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                          +{overflow} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-gray-900">{formatVND(p.price)}</td>
                <td className="px-4 py-3 text-center">
                  <Badge
                    variant={p.is_available ? 'success' : 'muted'}
                    onClick={() => onToggle(p.id, !p.is_available)}
                    className="cursor-pointer hover:opacity-75 transition-opacity"
                  >
                    {p.is_available ? 'Đang bán' : 'Hết hàng'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => onEdit(p)}
                      className="px-3 py-1 text-xs border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 min-h-[32px]"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => onDelete(p.id, p.name)}
                      className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 min-h-[32px]"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
