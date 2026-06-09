'use client'
import { Fragment } from 'react'
import type { QueueItem, OrderStatus } from '@/types/order'
import {
  elapsedMins,
  isKitchenItem,
  statusColors,
  statusLabel,
  summarizePending,
} from '@/features/admin/overview.helpers'

// All active statuses shown in the floor prep list.
const ACTIVE_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready']

interface Props {
  queue: QueueItem[]
  currentOrderId: string
}

export function WholeFloorPrepList({ queue, currentOrderId }: Props) {
  const now = Date.now()

  // Show all active orders; sort by createdAt desc (most recent first).
  const activeItems = queue
    .filter(item => ACTIVE_STATUSES.includes(item.status))
    .sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return tb - ta
    })

  // Summary counts across all tables.
  const allKitItems = activeItems.flatMap(item =>
    (item.dishes ?? []).filter(isKitchenItem),
  )
  const dishTypes  = new Set(allKitItems.map(i => i.name)).size
  const totalRemain = allKitItems.reduce(
    (s, i) => s + Math.max(0, i.quantity - i.qty_served),
    0,
  )

  return (
    <section className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/60 bg-background/20 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Danh sách bàn cần chuẩn bị</p>
          <p className="text-xs text-muted-fg mt-0.5">
            {activeItems.length} bàn · {dishTypes} loại món · {totalRemain} phần còn lại
          </p>
        </div>
        <span className="text-xs font-bold bg-primary text-primary-foreground px-2.5 py-1 rounded-lg">
          {totalRemain} phần
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/60">
        {activeItems.length === 0 && (
          <p className="px-4 py-4 text-sm text-muted-fg text-center">
            Chưa có đơn hàng nào đang hoạt động.
          </p>
        )}

        {activeItems.map(item => {
          const isOwn      = item.orderId === currentOrderId
          const dishes     = item.dishes ?? []
          const kitItems   = dishes.filter(isKitchenItem)
          const pending    = kitItems.filter(i => i.quantity - i.qty_served > 0)
          const summaryRows = summarizePending(pending)

          const mins = item.createdAt ? elapsedMins(item.createdAt, now) : null
          const timeColor =
            mins === null      ? 'text-muted-fg'
            : mins > 20        ? 'text-red-600 font-semibold dark:text-red-400'
            : mins >= 10       ? 'text-yellow-600 dark:text-yellow-400'
            :                    'text-orange-500 dark:text-orange-400'

          const borderL =
            mins === null ? ''
            : mins > 20   ? 'border-l-4 border-l-red-400'
            : mins >= 10  ? 'border-l-4 border-l-yellow-400'
            :               'border-l-4 border-l-orange-400'

          const orderSuffix = item.orderNumber
            ? item.orderNumber.split('-').pop()
            : null

          return (
            <div
              key={item.orderId}
              className={`px-4 py-3 transition-colors ${borderL} ${isOwn ? 'bg-primary/5' : ''}`}
            >
              {/* Top row: table label + status badge + (own order highlight) */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-bold text-base ${isOwn ? 'text-primary' : 'text-foreground'}`}>
                  {item.tableLabel || '?'}
                  {isOwn && (
                    <span className="ml-1.5 text-xs font-normal text-primary">(bàn bạn)</span>
                  )}
                </span>

                <span
                  className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${statusColors(item.status)}`}
                >
                  {statusLabel(item.status)}
                </span>

                {orderSuffix && (
                  <span className="text-xs font-mono text-muted-fg">#{orderSuffix}</span>
                )}

                {mins !== null && (
                  <span className={`ml-auto text-xs ${timeColor}`}>{mins} phút</span>
                )}
              </div>

              {/* Dish summary rows (only if dishes payload is present) */}
              {dishes.length === 0 ? null : pending.length === 0 ? (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1.5">
                  Xong hết
                </p>
              ) : (
                <div className="mt-1.5 grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-0.5 text-xs text-muted-fg">
                  {summaryRows.map(r => (
                    <Fragment key={r.key}>
                      <span className="truncate text-foreground">
                        {r.name}
                        {r.note && (
                          <span className="text-amber-500 dark:text-amber-400 italic ml-1">
                            ({r.note})
                          </span>
                        )}
                      </span>
                      <span className="italic whitespace-nowrap">{r.topping}</span>
                      <span className="font-semibold text-right tabular-nums text-foreground">
                        ×{r.qty}
                      </span>
                    </Fragment>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
