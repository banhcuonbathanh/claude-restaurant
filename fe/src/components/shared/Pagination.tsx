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
        className="min-h-[44px] min-w-[44px] px-4 rounded border border-border text-foreground text-sm disabled:opacity-40 hover:bg-muted transition-colors"
      >
        ←
      </button>

      <span className="text-sm text-muted-fg px-3">
        Trang {currentPage} / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="min-h-[44px] min-w-[44px] px-4 rounded border border-border text-foreground text-sm disabled:opacity-40 hover:bg-muted transition-colors"
      >
        →
      </button>
    </div>
  )
}
