import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types/order'

const STYLES: Record<OrderStatus, string> = {
  pending:   'bg-gray-700 text-gray-300',
  confirmed: 'bg-blue-900 text-blue-300',
  preparing: 'bg-yellow-900 text-warning',
  ready:     'bg-green-900 text-success',
  delivered: 'bg-teal-900 text-teal-300',
  cancelled: 'bg-red-900 text-urgent',
}

const LABELS: Record<OrderStatus, string> = {
  pending:   'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  preparing: 'Đang làm',
  ready:     'Sẵn sàng',
  delivered: 'Đã giao',
  cancelled: 'Đã huỷ',
}

interface Props {
  status: OrderStatus
  className?: string
}

export function StatusBadge({ status, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        STYLES[status],
        className,
      )}
    >
      {LABELS[status]}
    </span>
  )
}
