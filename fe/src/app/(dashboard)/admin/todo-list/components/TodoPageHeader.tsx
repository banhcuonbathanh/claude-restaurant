interface Props {
  canCreate: boolean
  onCreateClick: () => void
}

export function TodoPageHeader({ canCreate, onCreateClick }: Props) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-gray-900">Danh sách Công Việc</h2>
      {canCreate && (
        <button
          onClick={onCreateClick}
          className="min-h-[44px] min-w-[44px] px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          + Tạo công việc
        </button>
      )}
    </div>
  )
}
