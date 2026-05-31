interface Props {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="min-h-[44px] min-w-[44px] px-4 rounded border text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
      >
        ←
      </button>

      <span className="text-sm text-gray-600 px-3">
        Trang {currentPage} / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="min-h-[44px] min-w-[44px] px-4 rounded border text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
      >
        →
      </button>
    </div>
  )
}
