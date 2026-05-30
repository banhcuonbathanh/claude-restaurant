import { KPICard } from '@/components/shared/KPICard'
import { formatVND } from '@/lib/utils'
import type { MarketingBudgetSummary } from '@/types/marketing'

interface BudgetSummaryCardsProps {
  summary: MarketingBudgetSummary
}

export function BudgetSummaryCards({ summary }: BudgetSummaryCardsProps) {
  const spentVariant =
    summary.spent_pct > 80 ? 'danger' : summary.spent_pct > 50 ? 'warning' : 'success'
  const remainingBadge =
    summary.total_remaining <= 0 ? 'Hết ngân sách' : `${100 - summary.spent_pct}% ngân sách`
  const remainingVariant = summary.total_remaining <= 0 ? 'danger' : 'success'

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KPICard label="Tổng ngân sách" value={formatVND(summary.total_budget)} badge="Kế hoạch" badgeVariant="secondary" />
      <KPICard label="Đã chi tiêu" value={formatVND(summary.total_spent)} badge={`${summary.spent_pct}%`} badgeVariant={spentVariant} />
      <KPICard label="Còn lại" value={formatVND(summary.total_remaining)} badge={remainingBadge} badgeVariant={remainingVariant} />
      <KPICard label="ROI dự kiến" value={`${summary.roi}×`} subLabel={summary.roi_base} />
    </div>
  )
}
