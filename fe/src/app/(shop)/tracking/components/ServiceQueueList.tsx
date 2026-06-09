import { ServiceQueueItem } from './ServiceQueueItem'
import type { OrderStatus, QueueItem } from '@/types/order'

// Tables currently "đang phục vụ / đang chuẩn bị" — active orders being worked on or ready to serve.
const ACTIVE_STATUSES: OrderStatus[] = ['confirmed', 'preparing', 'ready']

interface Props {
  queue: QueueItem[]
  currentOrderId: string
}

export function ServiceQueueList({ queue, currentOrderId }: Props) {
  // Show only tables in service, plus the client's own order so its highlighted
  // row is always present even if its status falls outside the active set.
  const activeQueue = queue.filter(
    item => ACTIVE_STATUSES.includes(item.status) || item.orderId === currentOrderId,
  )

  return (
    <section className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border/60 bg-background/20 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Bàn đang phục vụ</p>
        <span className="text-xs text-muted-fg">{activeQueue.length} bàn</span>
      </div>

      <div>
        {activeQueue.map(item => (
          <ServiceQueueItem
            key={item.orderId}
            item={item}
            isCurrentOrder={item.orderId === currentOrderId}
          />
        ))}
        {activeQueue.length === 0 && (
          <p className="px-4 py-3 text-sm text-muted-fg">Chưa có bàn nào đang được phục vụ.</p>
        )}
      </div>
    </section>
  )
}
