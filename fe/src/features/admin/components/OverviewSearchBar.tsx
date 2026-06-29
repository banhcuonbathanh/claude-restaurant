'use client'

interface Props {
  value:      string
  onChange:   (value: string) => void
  orderCount: number
  tableCount: number
}

export function OverviewSearchBar({ value, onChange, orderCount, tableCount }: Props) {
  const q = value.toLowerCase().trim()
  return (
    <>
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Tìm theo mã đơn, số bàn, tên khách..."
          className="w-full pl-9 pr-9 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {q && (
        <p className="text-xs text-gray-400 dark:text-gray-500 -mt-2">
          {orderCount} đơn · {tableCount} bàn phù hợp với &ldquo;{q}&rdquo;
        </p>
      )}
    </>
  )
}
