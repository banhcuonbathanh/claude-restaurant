import { formatVND } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Topping } from '@/types/product'

interface Props {
  toppings:      Topping[]
  isLoading:     boolean
  productNames:  Map<string, string[]>
  onEdit:        (t: Topping) => void
  onDelete:      (t: Topping) => void
}

export function ToppingTable({ toppings, isLoading, productNames, onEdit, onDelete }: Props) {
  if (isLoading) {
    return <p className="text-gray-500 text-sm">Đang tải...</p>
  }

  if (toppings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm">
        <EmptyState message="Chưa có topping nào — nhấn + Thêm topping để bắt đầu" />
      </div>
    )
  }

  return (
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
            const linked = productNames.get(t.id) ?? []
            return (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px] truncate" title={t.name}>
                  {t.name}
                </td>
                <td className="px-4 py-3">
                  {linked.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {linked.map(name => (
                        <span key={name} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                          {name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">Chưa gắn sản phẩm</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {t.price === 0
                    ? <span className="text-green-600">Miễn phí</span>
                    : <span className="text-orange-600">+{formatVND(t.price)}</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={t.is_available ? 'success' : 'muted'}>
                    {t.is_available ? 'Có sẵn' : 'Hết'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => onEdit(t)}
                      className="px-3 py-1 text-xs border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 min-h-[32px]"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => onDelete(t)}
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
