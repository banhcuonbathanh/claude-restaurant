'use client'

interface StoragePageHeaderProps {
  searchQuery: string
  onSearch: (q: string) => void
  onAddClick: () => void
}

export function StoragePageHeader({ searchQuery, onSearch, onAddClick }: StoragePageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-lg font-bold text-gray-900 shrink-0">Kho nguyên liệu</h1>
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.65 10.65z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
            placeholder="Tìm nguyên liệu..."
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 min-h-[44px]"
          />
        </div>
      </div>
      <button
        onClick={onAddClick}
        className="shrink-0 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 min-h-[44px]"
      >
        + Thêm NL
      </button>
    </div>
  )
}
