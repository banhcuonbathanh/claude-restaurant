interface Props {
  totalCount: number
  onAdd:      () => void
}

export function StaffPageHeader({ totalCount, onAdd }: Props) {
  return (
    <div className="flex items-center justify-between bg-card rounded-xl border border-border px-6 py-3 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">
        Nhân viên <span className="text-muted-fg font-normal">({totalCount})</span>
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
