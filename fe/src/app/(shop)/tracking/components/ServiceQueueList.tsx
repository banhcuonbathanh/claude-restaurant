import { ServiceQueueItem } from './ServiceQueueItem'
import type { QueueItem } from '@/types/order'

interface Props {
  queue: QueueItem[]
  currentOrderId: string
  queuePosition?: number
  queueTotal?: number
}

export function ServiceQueueList({ queue, currentOrderId, queuePosition, queueTotal }: Props) {
  return (
    <section className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border/60 bg-background/20 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Hàng chờ phục vụ</p>
        {queuePosition != null && queueTotal != null && (
          <span className="text-xs text-muted-fg">
            Vị trí #{queuePosition} / {queueTotal}
          </span>
        )}
      </div>

      <div>
        {queue.map(item => (
          <ServiceQueueItem
            key={item.orderId}
            item={item}
            isCurrentOrder={item.orderId === currentOrderId}
          />
        ))}
        {queue.length === 0 && (
          <p className="px-4 py-3 text-sm text-muted-fg">Không có đơn nào trong hàng chờ.</p>
        )}
      </div>
    </section>
  )
}
