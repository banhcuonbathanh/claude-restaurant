import { Download, Plus } from 'lucide-react'
import { DateRangePicker } from '@/components/shared/DateRangePicker'
import type { DateRange } from '@/types/marketing'

interface MarketingPageHeaderProps {
  dateRange: DateRange
  onDateChange: (range: DateRange) => void
  onExport: () => void
  onAddSpend: () => void
}

export function MarketingPageHeader({ dateRange, onDateChange, onExport, onAddSpend }: MarketingPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Marketing — Khai trương nhà hàng mới</h2>
        <p className="mt-1 text-sm text-gray-500">Theo dõi ngân sách &amp; hiệu quả chiến dịch marketing</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <DateRangePicker value={dateRange} onChange={onDateChange} />
        <button
          onClick={onExport}
          className="flex min-h-[36px] items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 shadow-sm transition hover:bg-gray-50"
        >
          <Download className="h-4 w-4" />
          Xuất BC
        </button>
        <button
          onClick={onAddSpend}
          className="flex min-h-[36px] items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          Nhập chi tiêu
        </button>
      </div>
    </div>
  )
}
