import { StatusBadge } from '@/components/shared/StatusBadge'
import type { QueueItem } from '@/types/order'

interface Props {
  item: QueueItem
  isCurrentOrder: boolean
}

export function ServiceQueueItem({ item, isCurrentOrder }: Props) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2.5 border-b border-border/40 last:border-0 ${
        isCurrentOrder ? 'bg-warning/10 border-l-2 border-l-warning' : ''
      }`}
    >
      <StatusBadge status={item.status} className="shrink-0" />

      <span className="text-xs font-semibold text-foreground shrink-0">
        #{item.orderId}
      </span>

      <span className="text-xs text-muted-fg shrink-0">
        · {item.tableLabel}
      </span>

      {item.itemCount > 0 && (
        <span className="text-xs text-muted-fg shrink-0">
          · {item.itemCount} món
        </span>
      )}

      {item.estimatedMinutes != null && item.status === 'pending' && (
        <span className="ml-auto text-xs text-muted-fg tabular-nums">
          ~{item.estimatedMinutes}&apos;
        </span>
      )}

      {isCurrentOrder && (
        <span className="ml-auto text-[10px] font-semibold text-warning border border-warning/50 px-1.5 py-0.5 rounded">
          &lt; Đơn của bàn
        </span>
      )}
    </div>
  )
}
