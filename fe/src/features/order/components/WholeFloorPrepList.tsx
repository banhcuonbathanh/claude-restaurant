'use client'
import type { QueueItem, OrderStatus } from '@/types/order'
import { statusColors, statusLabel } from '@/features/admin/overview.helpers'

// All active statuses shown in the waiting list.
const ACTIVE_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready']

interface Props {
  queue: QueueItem[]
  currentOrderId: string
}

export function WholeFloorPrepList({ queue, currentOrderId }: Props) {
  // Show all active orders; sort by createdAt asc (oldest first) so the most
  // recent order — i.e. the current guest who just ordered — sits at the bottom.
  const activeItems = queue
    .filter(item => ACTIVE_STATUSES.includes(item.status))
    .sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return ta - tb
    })

  return (
    <section className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Hàng chờ phục vụ</p>
        <span className="shrink-0 text-xs font-bold bg-primary text-primary-foreground px-2.5 py-1 rounded-full">
          {activeItems.length} đơn
        </span>
      </div>

      {/* Rows — table number + status + order number only */}
      <div className="divide-y divide-border/60">
        {activeItems.length === 0 && (
          <p className="px-4 py-4 text-sm text-muted-fg text-center">
            Chưa có đơn nào đang chờ.
          </p>
        )}

        {activeItems.map((item, idx) => {
          const isOwn = item.orderId === currentOrderId
          const position = idx + 1
          const orderSuffix = item.orderNumber
            ? item.orderNumber.split('-').pop()
            : null

          return (
            <div
              key={item.orderId}
              className={`px-4 py-3 flex items-center gap-2 flex-wrap ${
                isOwn ? 'border-2 border-primary rounded-xl bg-primary/5' : ''
              }`}
            >
              <span
                className={`shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold tabular-nums ${
                  isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-fg'
                }`}
              >
                {position}
              </span>

              <span className={`font-bold text-base ${isOwn ? 'text-primary' : 'text-foreground'}`}>
                {item.tableLabel || 'Đơn online'}
                {isOwn && (
                  <span className="ml-1.5 text-xs font-normal text-primary">
                    {item.tableLabel ? '(bàn bạn)' : '(đơn bạn)'}
                  </span>
                )}
              </span>

              <span
                className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${statusColors(item.status)}`}
              >
                {statusLabel(item.status)}
              </span>

              {orderSuffix && (
                <span className="ml-auto text-xs font-mono text-muted-fg">#{orderSuffix}</span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
