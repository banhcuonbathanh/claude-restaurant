import { ProgressBar } from '@/components/ui/progress-bar'
import { formatVND } from '@/lib/utils'
import type { MarketingLoveScore } from '@/types/marketing'

interface LoveScoreSectionProps {
  loveScore: MarketingLoveScore
}

export function LoveScoreSection({ loveScore }: LoveScoreSectionProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs text-muted-fg">💰 Chi phí/Khách mới</p>
        <p className="mt-1 text-xl font-bold text-foreground">
          {formatVND(loveScore.cost_per_new_customer)}/khách
        </p>
        <div className="mt-2 space-y-0.5 text-xs text-gray-400">
          <p>Mục tiêu: {loveScore.target_customers.toLocaleString('vi-VN')}/tháng</p>
          <p>Chi {formatVND(loveScore.current_customers * loveScore.cost_per_new_customer)}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs text-muted-fg">❤️ Mục tiêu Followers</p>
        <p className="mt-1 text-xl font-bold text-foreground">
          {loveScore.target_followers.toLocaleString('vi-VN')}
        </p>
        <ProgressBar
          value={loveScore.follower_progress_pct}
          max={100}
          colorHex="#f97316"
          className="my-2"
        />
        <p className="text-xs text-muted-fg">
          Đã đạt: {loveScore.current_followers.toLocaleString('vi-VN')} ({loveScore.follower_progress_pct}%)
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs text-muted-fg">⭐ Điểm hài lòng</p>
        <p className="mt-1 text-xl font-bold text-foreground">
          {loveScore.satisfaction_score} / {loveScore.satisfaction_max} ⭐
        </p>
        <p className="mt-2 text-xs text-muted-fg">chất lượng + KM + UX</p>
      </div>
    </div>
  )
}
