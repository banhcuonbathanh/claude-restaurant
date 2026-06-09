import { StatusBadge } from '@/components/shared/StatusBadge'
import type { OrderStatus } from '@/types/order'

interface Props {
  tableLabel: string
  status: OrderStatus
  queuePosition: number | null
  queueTotal: number | null
  estimatedMinutes: number | null
}

export function TableInfoBanner({ tableLabel, status, queuePosition, queueTotal, estimatedMinutes }: Props) {
  const isDelivered = status === 'delivered'

  return (
    <section className="bg-card rounded-2xl p-4 border border-border shadow-sm">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-20 h-16 rounded-xl border border-primary/40 flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
          <span className="text-[10px] font-medium text-primary/70 uppercase tracking-wide">Bàn</span>
          <span className="text-base font-bold text-primary leading-tight">{tableLabel}</span>
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          {isDelivered ? (
            <p className="text-sm font-semibold text-success">
              Đơn của bạn đã được phục vụ — Cảm ơn!
            </p>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-fg">Trạng thái:</span>
                <StatusBadge status={status} />
                {estimatedMinutes != null && estimatedMinutes > 0 && (
                  <span
                    className={`text-xs font-semibold text-muted-fg ${
                      queuePosition === 1 ? 'animate-pulse text-warning' : ''
                    }`}
                  >
                    ~{estimatedMinutes} phút
                  </span>
                )}
              </div>

              {queuePosition != null && queueTotal != null && (
                <p className="mt-1 text-xs text-muted-fg" aria-live="polite">
                  Vị trí hàng chờ:{' '}
                  <span className="font-semibold text-foreground">
                    #{queuePosition} trong {queueTotal} đơn
                  </span>
                  {estimatedMinutes != null && estimatedMinutes > 0 && (
                    <> | Chờ ~{estimatedMinutes} phút</>
                  )}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
