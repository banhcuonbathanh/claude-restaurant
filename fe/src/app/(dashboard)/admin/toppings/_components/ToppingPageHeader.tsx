interface Props {
  count: number
  onAdd: () => void
}

export function ToppingPageHeader({ count, onAdd }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-semibold text-gray-900">Topping ({count})</h2>
      <button
        onClick={onAdd}
        className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
      >
        + Thêm topping
      </button>
    </div>
  )
}
