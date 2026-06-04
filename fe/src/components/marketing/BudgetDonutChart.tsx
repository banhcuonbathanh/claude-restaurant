import type { MarketingSpendItem } from '@/types/marketing'

interface BudgetDonutChartProps {
  items: MarketingSpendItem[]
  spentPct: number
}

// SVG donut chart — no external library required
export function BudgetDonutChart({ items, spentPct }: BudgetDonutChartProps) {
  const r = 44
  const cx = 60
  const cy = 60
  const circumference = 2 * Math.PI * r

  const totalBudget = items.reduce((s, i) => s + i.budget, 0)

  let cumulative = 0
  const segments = items.map(item => {
    const arcLength = totalBudget > 0 ? (item.budget / totalBudget) * circumference : 0
    const startAngle = totalBudget > 0 ? (cumulative / circumference) * 360 : 0
    cumulative += arcLength
    const pct = totalBudget > 0 ? Math.round((item.budget / totalBudget) * 100) : 0
    return { ...item, arcLength, startAngle, pct }
  })

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-sm font-semibold text-foreground">Phân bổ ngân sách</p>

      <div className="flex justify-center">
        <svg
          width={120}
          height={120}
          viewBox="0 0 120 120"
          aria-label={`Biểu đồ phân bổ ngân sách: ${spentPct}% đã chi`}
        >
          {segments.map(seg => (
            <circle
              key={seg.id}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={18}
              strokeDasharray={`${seg.arcLength} ${circumference - seg.arcLength}`}
              transform={`rotate(${seg.startAngle - 90}, ${cx}, ${cy})`}
            />
          ))}
          {/* Donut hole */}
          <circle cx={cx} cy={cy} r={26} fill="white" />
          {/* Center label */}
          <text x={cx} y={cy - 5} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#111827">
            {spentPct}%
          </text>
          <text x={cx} y={cy + 9} textAnchor="middle" fontSize="9" fill="#6b7280">
            đã chi
          </text>
        </svg>
      </div>

      <div className="space-y-1.5">
        {segments.map(seg => (
          <div key={seg.id} className="flex items-center justify-between text-xs">
            <div className="flex min-w-0 items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="truncate text-gray-600">{seg.icon} {seg.name.split('/')[0].trim()}</span>
            </div>
            <span className="ml-2 flex-shrink-0 font-medium text-gray-700">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
