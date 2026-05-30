import { formatVND } from '@/lib/utils'
import type { Order } from '@/types/order'

interface Props {
  order: Order
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('vi-VN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
  } catch {
    return iso
  }
}

export function OrderDetailCard({ order }: Props) {
  const displayItems = order.items.filter(
    i => !(i.combo_id && !i.combo_ref_id)
  )
  const totalQty = displayItems.reduce((s, i) => s + i.quantity, 0)

  return (
    <section className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border/60 bg-background/20">
        <p className="text-sm font-semibold text-foreground">
          Chi tiết đơn hàng: #{order.order_number}
        </p>
        <p className="text-xs text-muted-fg mt-0.5">
          {order.order_number} · Bàn {order.table_name ?? order.table_id ?? '?'} · Đặt lúc {formatTime(order.created_at)}
        </p>
      </div>

      <div className="divide-y divide-border/40">
        {displayItems.map(item => {
          const toppings = (item.toppings_snapshot ?? []).filter(t => t.name?.trim())
          return (
            <div key={item.id} className="px-4 py-3">
              <div className="flex items-start gap-2">
                <span className="shrink-0 text-xs font-semibold text-muted-fg w-6">
                  x{item.quantity}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-foreground">{item.name}</span>
                  {toppings.length > 0 && (
                    <p className="text-xs text-muted-fg mt-0.5">
                      {toppings.map((t, i) => (
                        <span key={t.id}>
                          + {t.name}
                          {t.price > 0 ? ` x1` : ''}
                          {i < toppings.length - 1 ? ' · ' : ''}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-sm font-medium text-foreground tabular-nums">
                  {formatVND(item.unit_price * item.quantity)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-4 py-3 border-t border-border bg-background/20 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          Tổng cộng · {totalQty} sản phẩm
        </span>
        <span className="text-base font-bold text-foreground tabular-nums">
          {formatVND(order.total_amount)}
        </span>
      </div>
    </section>
  )
}
