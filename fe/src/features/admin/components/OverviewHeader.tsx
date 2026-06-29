'use client'

export function OverviewHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Tổng quan sàn</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Tất cả bàn — cập nhật theo thời gian thực</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
      </div>
    </div>
  )
}
