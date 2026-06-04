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
      <div className="bg-card rounded-xl shadow-sm">
        <EmptyState message="Chưa có sản phẩm nào" />
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted border-b border-border">
          <tr>
            <th className="px-4 py-3 w-14" />
            <th className="text-left px-4 py-3 font-medium text-muted-fg">Tên sản phẩm</th>
            <th className="text-left px-4 py-3 font-medium text-muted-fg">Danh mục</th>
            <th className="text-left px-4 py-3 font-medium text-muted-fg">Topping</th>
            <th className="text-right px-4 py-3 font-medium text-muted-fg">Giá</th>
            <th className="text-center px-4 py-3 font-medium text-muted-fg">Trạng thái</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map(p => {
            const visibleToppings = p.toppings.slice(0, MAX_TOPPING_PILLS)
            const overflow = p.toppings.length - MAX_TOPPING_PILLS

            return (
              <tr key={p.id} className="hover:bg-muted">
                <td className="px-4 py-3">
                  {p.image_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getImageUrl(p.image_path) ?? ''}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover bg-muted"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-fg text-lg">
                      🍜
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                <td className="px-4 py-3 text-muted-fg">{p.category_name}</td>
                <td className="px-4 py-3">
                  {p.toppings.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {visibleToppings.map(t => (
                        <span key={t.id} className="px-1.5 py-0.5 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 text-xs rounded">
                          {t.name}
                        </span>
                      ))}
                      {overflow > 0 && (
                        <span className="px-1.5 py-0.5 bg-muted text-muted-fg text-xs rounded">
                          +{overflow} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-fg text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-foreground">{formatVND(p.price)}</td>
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
                      className="px-3 py-1 text-xs border border-border text-foreground rounded-lg hover:bg-muted min-h-[32px]"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => onDelete(p.id, p.name)}
                      className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 min-h-[32px]"
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
