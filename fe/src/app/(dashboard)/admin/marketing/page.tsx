'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { useMarketingSpend } from '@/hooks/useMarketingSpend'
import { MarketingPageHeader } from '@/components/marketing/MarketingPageHeader'
import { BudgetSummaryCards } from '@/components/marketing/BudgetSummaryCards'
import { SpendBreakdownTable } from '@/components/marketing/SpendBreakdownTable'
import { BudgetDonutChart } from '@/components/marketing/BudgetDonutChart'
import { LoveScoreSection } from '@/components/marketing/LoveScoreSection'
import { CampaignTimeline } from '@/components/marketing/CampaignTimeline'
import { EmptyState } from '@/components/shared/EmptyState'
import type { DateRange, CampaignMilestone } from '@/types/marketing'

const CAMPAIGN_MILESTONES: CampaignMilestone[] = [
  { id: 'w1',   label: 'Tuần 1-2',       activities: ['Social Ads', 'Tờ rơi'],         isKeyEvent: false, color: 'bg-slate-500' },
  { id: 'w3',   label: 'Tuần 3',          activities: ['Seeding KOL', 'Influencer'],    isKeyEvent: false, color: 'bg-violet-600' },
  { id: 'w4',   label: 'Tuần 4',          activities: ['Tạo buzz', 'Teaser video'],     isKeyEvent: false, color: 'bg-slate-500' },
  { id: 'open', label: '🎊 Khai trương',  activities: ['Sự kiện lớn', 'Khuyến mãi'],   isKeyEvent: true,  color: 'bg-orange-500' },
  { id: 'post', label: 'Sau khai trương', activities: ['Retargeting', 'Loyalty + Review'], isKeyEvent: false, color: 'bg-slate-400' },
]

function getCurrentMonthRange(): DateRange {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
  const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const fmt  = (d: Date) => d.toISOString().split('T')[0]
  return { from: fmt(from), to: fmt(to) }
}

export default function MarketingDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>(getCurrentMonthRange)
  const { data, isLoading, isError, refetch } = useMarketingSpend(dateRange)

  return (
    <div className="space-y-6">
      {/* Zone B — Header + date filter + actions */}
      <MarketingPageHeader
        dateRange={dateRange}
        onDateChange={setDateRange}
        onExport={() => toast.info('Chức năng xuất báo cáo đang phát triển')}
        onAddSpend={() => toast.info('Chức năng nhập chi tiêu đang phát triển')}
      />

      {/* Error banner */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Không thể tải dữ liệu.{' '}
          <button onClick={() => refetch()} className="underline hover:no-underline">
            Thử lại
          </button>
        </div>
      )}

      {/* Zone C — Budget KPI cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : data?.summary ? (
        <BudgetSummaryCards summary={data.summary} />
      ) : null}

      {/* Zone D — Spend table (left) + donut chart (right) */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex-1">
          {isLoading ? (
            <div className="h-72 animate-pulse rounded-xl bg-gray-100" />
          ) : data?.items && data.items.length > 0 ? (
            <SpendBreakdownTable items={data.items} />
          ) : !isError ? (
            <EmptyState message="Chưa có hạng mục chi tiêu nào." />
          ) : null}
        </div>

        {!isLoading && data?.items && data.items.length > 0 && (
          <div className="w-full lg:w-64">
            <BudgetDonutChart items={data.items} spentPct={data.summary?.spent_pct ?? 0} />
          </div>
        )}
      </div>

      {/* Zone E — Campaign effectiveness metrics */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : data?.love_score ? (
        <LoveScoreSection loveScore={data.love_score} />
      ) : null}

      {/* Zone F — Campaign timeline (always visible — static data) */}
      <CampaignTimeline milestones={CAMPAIGN_MILESTONES} />
    </div>
  )
}
