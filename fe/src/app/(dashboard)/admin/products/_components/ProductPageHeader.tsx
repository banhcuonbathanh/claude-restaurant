interface Props {
  count:       number
  onAdd:       () => void
  onSeed:      () => void
  seedLoading: boolean
}

export function ProductPageHeader({ count, onAdd, onSeed, seedLoading }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-semibold text-foreground">Sản phẩm ({count})</h2>
      <div className="flex items-center gap-2">
        <button
          onClick={onSeed}
          disabled={seedLoading}
          className="px-4 py-2 bg-muted text-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
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
