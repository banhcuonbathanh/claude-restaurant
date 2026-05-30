import { cn } from '@/lib/utils'
import type { MonitorTableStatus } from '@/types/order'

interface Props {
  tables: MonitorTableStatus[]
  highlightTableId?: string
  columns?: number
}

const STATUS_STYLES: Record<MonitorTableStatus['status'], string> = {
  serving: 'bg-orange-900/40 border-orange-500/60 text-orange-300',
  waiting: 'bg-red-900/40 border-red-500/60 text-red-300',
  empty:   'bg-green-900/30 border-green-700/40 text-green-400',
}

const STATUS_LABELS: Record<MonitorTableStatus['status'], string> = {
  serving: 'Phục vụ',
  waiting: 'Chờ món',
  empty:   'Trống',
}

const STATUS_ICONS: Record<MonitorTableStatus['status'], string> = {
  serving: '🟠',
  waiting: '🔴',
  empty:   '🟢',
}

export function TableLayoutMap({ tables, highlightTableId, columns = 3 }: Props) {
  if (tables.length === 0) {
    return (
      <section className="bg-card rounded-xl border border-border p-4">
        <p className="text-sm font-semibold text-foreground mb-2">Sơ đồ bàn hiện tại</p>
        <p className="text-sm text-muted-fg">Đang tải sơ đồ bàn...</p>
      </section>
    )
  }

  return (
    <section className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border/60 bg-background/20">
        <p className="text-sm font-semibold text-foreground">Sơ đồ bàn hiện tại</p>
        <p className="text-xs text-muted-fg mt-0.5">
          🟠=phục vụ · 🔴=chờ món · 🟢=trống
        </p>
      </div>

      <div
        className="grid gap-px bg-border/20 p-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {tables.map(table => {
          const isHighlighted = highlightTableId === table.id
          return (
            <div
              key={table.id}
              className={cn(
                'rounded-lg border p-2 min-h-[64px] flex flex-col items-center justify-center gap-0.5',
                STATUS_STYLES[table.status],
                isHighlighted && 'ring-2 ring-warning ring-offset-1 ring-offset-card',
              )}
            >
              <span className="text-[10px]">{STATUS_ICONS[table.status]}</span>
              <span className="text-xs font-bold">{table.id}</span>
              {isHighlighted && (
                <span className="text-[9px] font-bold text-warning">BÀN BẠN ★</span>
              )}
              <span className="text-[10px] opacity-80">{STATUS_LABELS[table.status]}</span>
              {table.orderCount != null && table.orderCount > 0 && (
                <span className="text-[10px] opacity-70">·{table.orderCount}</span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
