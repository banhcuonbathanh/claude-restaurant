import { cn } from '@/lib/utils'
import { ProgressBar } from '@/components/ui/progress-bar'
import type { MarketingSpendItem } from '@/types/marketing'

interface SpendBreakdownTableProps {
  items: MarketingSpendItem[]
}

function fmt(n: number): string {
  return `${(n / 1_000_000).toFixed(1)}M`
}

export function SpendBreakdownTable({ items }: SpendBreakdownTableProps) {
  const totalBudget    = items.reduce((s, i) => s + i.budget, 0)
  const totalSpent     = items.reduce((s, i) => s + i.spent, 0)
  const totalRemaining = items.reduce((s, i) => s + i.remaining, 0)

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted text-left text-xs text-muted-fg">
            <th className="px-4 py-3 font-medium">Hạng mục</th>
            <th className="px-4 py-3 text-right font-medium">Ngân sách</th>
            <th className="px-4 py-3 text-right font-medium">Đã chi</th>
            <th className="px-4 py-3 text-right font-medium">Còn lại</th>
            <th className="w-32 px-4 py-3 font-medium">Tiến độ</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            const overBudget = item.spent > item.budget
            return (
              <tr
                key={item.id}
                className={cn(
                  'border-b border-border transition-colors hover:bg-muted',
                  overBudget && 'bg-red-50 dark:bg-red-950/40'
                )}
              >
                <td className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    <span className="text-base leading-5">{item.icon}</span>
                    <div>
                      <p className={cn('font-medium text-foreground', overBudget && 'text-red-700 dark:text-red-400')}>
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-fg">{item.sub_items.join(' · ')}</p>
                    </div>
                  </div>
                  {overBudget && (
                    <span className="mt-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                      Vượt ngân sách
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-foreground">{fmt(item.budget)}</td>
                <td className="px-4 py-3 text-right font-medium text-foreground">{fmt(item.spent)}</td>
                <td className="px-4 py-3 text-right text-muted-fg">{fmt(item.remaining)}</td>
                <td className="px-4 py-3">
                  <ProgressBar value={item.progress_pct} max={100} colorHex={item.color} />
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-border bg-muted font-semibold">
            <td className="px-4 py-3 text-foreground">Tổng cộng</td>
            <td className="px-4 py-3 text-right text-foreground">{fmt(totalBudget)}</td>
            <td className="px-4 py-3 text-right text-foreground">{fmt(totalSpent)}</td>
            <td className="px-4 py-3 text-right text-muted-fg">{fmt(totalRemaining)}</td>
            <td className="px-4 py-3" />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
