interface Props {
  count:       number
  onAdd:       () => void
  onSeed:      () => void
  seedLoading: boolean
}

export function ProductPageHeader({ count, onAdd, onSeed, seedLoading }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-semibold text-gray-900">Sản phẩm ({count})</h2>
      <div className="flex items-center gap-2">
        <button
          onClick={onSeed}
          disabled={seedLoading}
          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {seedLoading ? 'Đang tạo...' : '🌱 Dữ liệu mẫu'}
        </button>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          + Thêm sản phẩm
        </button>
      </div>
    </div>
  )
}
