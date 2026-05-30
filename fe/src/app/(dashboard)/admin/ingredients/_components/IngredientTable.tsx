'use client'
import type { Ingredient, IngredientStatus } from '@/features/admin/admin.api'

interface IngredientTableProps {
  ingredients: Ingredient[]
  onEdit: (item: Ingredient) => void
  onDelete: (id: string) => void
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function StatusBadge({ status }: { status: IngredientStatus }) {
  const map: Record<IngredientStatus, { label: string; className: string }> = {
    in_stock:      { label: 'Còn hàng ✓',   className: 'bg-green-100 text-green-700' },
    low_stock:     { label: 'Sắp hết',       className: 'bg-yellow-100 text-yellow-700' },
    expiring_soon: { label: 'Sắp hết hạn',   className: 'bg-orange-100 text-orange-700' },
    out_of_stock:  { label: 'Hết hàng',      className: 'bg-red-100 text-red-700' },
  }
  const { label, className } = map[status] ?? map.in_stock
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

function rowClass(item: Ingredient): string {
  return item.status === 'expiring_soon' ? 'bg-orange-50 border-orange-200' : ''
}

function qtyClass(item: Ingredient): string {
  return item.quantity <= item.warningThreshold ? 'text-red-600 font-medium' : 'text-slate-800'
}

function expiryClass(item: Ingredient): string {
  return item.status === 'expiring_soon' ? 'text-red-600 font-medium' : 'text-gray-500'
}

export function IngredientTable({ ingredients, onEdit, onDelete }: IngredientTableProps) {
  if (ingredients.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center text-sm text-gray-400">
        Chưa có nguyên liệu nào. Nhấn &apos;+ Thêm nguyên liệu&apos; để bắt đầu.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b bg-gray-50 text-xs text-gray-500">
          <tr>
            <th className="px-4 py-3 text-left font-medium">STT</th>
            <th className="px-4 py-3 text-left font-medium">Tên nguyên liệu</th>
            <th className="px-4 py-3 text-left font-medium">Đơn vị</th>
            <th className="px-4 py-3 text-right font-medium">Số lượng tồn</th>
            <th className="px-4 py-3 text-left font-medium">Ngày nhập</th>
            <th className="px-4 py-3 text-left font-medium">Hạn SD</th>
            <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
            <th className="px-4 py-3 text-right font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {ingredients.map((item, idx) => (
            <tr key={item.id} className={`${rowClass(item)} hover:brightness-95 transition-colors`}>
              <td className="px-4 py-3 text-gray-400 tabular-nums">
                {item.status === 'expiring_soon' && (
                  <span className="mr-1 text-orange-500">⚠</span>
                )}
                {idx + 1}
              </td>
              <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
              <td className="px-4 py-3 text-gray-500">{item.unit}</td>
              <td className={`px-4 py-3 text-right tabular-nums ${qtyClass(item)}`}>
                {item.quantity}
              </td>
              <td className="px-4 py-3 text-gray-500">{formatDate(item.importDate)}</td>
              <td className={`px-4 py-3 tabular-nums ${expiryClass(item)}`}>
                {formatDate(item.expiryDate)}
              </td>
              <td className="px-4 py-3 text-center">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 min-h-[44px] min-w-[44px]"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Xóa nguyên liệu "${item.name}"?`)) onDelete(item.id)
                    }}
                    className="rounded border border-red-200 px-3 py-1 text-xs text-red-500 hover:bg-red-50 min-h-[44px] min-w-[44px]"
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
