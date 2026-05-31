interface Props {
  totalCount: number
  onAdd:      () => void
}

export function StaffPageHeader({ totalCount, onAdd }: Props) {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-6 py-3 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        Nhân viên <span className="text-gray-400 font-normal">({totalCount})</span>
      </h2>
      <button
        onClick={onAdd}
        className="min-h-[44px] px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
      >
        + Thêm nhân viên
      </button>
    </div>
  )
}
