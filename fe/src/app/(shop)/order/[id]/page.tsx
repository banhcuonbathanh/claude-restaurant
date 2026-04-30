'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useOrderSSE } from '@/hooks/useOrderSSE'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConnectionErrorBanner } from '@/components/shared/ConnectionErrorBanner'
import { api } from '@/lib/api-client'
import { formatVND, formatDateTime } from '@/lib/utils'
import { deriveItemStatus } from '@/types/order'

export default function OrderPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { order, progress, connectionError } = useOrderSSE(params.id)
  const [showCancel, setShowCancel] = useState(false)

  const cancelOrder = useMutation({
    mutationFn: () => api.delete(`/orders/${params.id}`),
    onSuccess: () => {
      toast.success('Đã huỷ đơn hàng')
      router.push('/menu')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message
      toast.error(msg ?? 'Không thể huỷ đơn')
      setShowCancel(false)
    },
  })

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-fg text-sm">Đang kết nối đơn hàng...</p>
        </div>
      </div>
    )
  }

  // Customer sees combo sub-items + regular product items; not combo parent rows
  const displayItems = order.items.filter(
    i => !(i.combo_id !== null && i.combo_ref_id === null)
  )

  const canCancel =
    progress < 30 &&
    order.status !== 'delivered' &&
    order.status !== 'cancelled'

  return (
    <div className="min-h-screen bg-background pb-8">
      {connectionError && <ConnectionErrorBanner />}

      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-foreground">Đơn {order.order_number}</h1>
            <p className="text-xs text-muted-fg mt-0.5">
              {order.table_id ? `Bàn ${order.table_id} · ` : ''}
              {formatDateTime(order.created_at)}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        {/* Progress bar */}
        <section className="bg-card rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-fg">Tiến độ</span>
            <span className="font-semibold text-success">{progress}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>

        {/* Item list */}
        <section className="bg-card rounded-xl divide-y divide-border overflow-hidden">
          {displayItems.map(item => {
            const st = deriveItemStatus(item.qty_served, item.quantity)
            return (
              <div key={item.id} className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-fg mt-0.5">
                    {item.quantity} phần · {item.qty_served} đã xong
                  </p>
                </div>
                <div className="text-right space-y-1 shrink-0">
                  <p className="text-sm text-primary font-medium">
                    {formatVND(item.unit_price * item.quantity)}
                  </p>
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded font-medium ${
                      st === 'done'
                        ? 'bg-green-900 text-success'
                        : st === 'preparing'
                        ? 'bg-yellow-900 text-warning'
                        : 'bg-muted text-muted-fg'
                    }`}
                  >
                    {st === 'done' ? 'Xong' : st === 'preparing' ? 'Đang làm' : 'Chờ'}
                  </span>
                </div>
              </div>
            )
          })}
        </section>

        {/* Total */}
        <div className="flex justify-between items-center px-1">
          <span className="text-muted-fg">Tổng cộng</span>
          <span className="text-primary text-xl font-bold">
            {formatVND(order.total_amount)}
          </span>
        </div>

        {/* Cancel button — only when progress < 30% */}
        {canCancel && (
          <button
            onClick={() => setShowCancel(true)}
            className="w-full border border-urgent text-urgent py-3 rounded-xl font-medium hover:bg-red-900/20 transition-colors"
          >
            Huỷ đơn
          </button>
        )}
      </div>

      {/* Cancel confirmation modal */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-bold text-lg text-foreground">Huỷ đơn hàng?</h3>
            <p className="text-muted-fg text-sm">
              Bạn có chắc muốn huỷ đơn hàng này không?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancel(false)}
                className="flex-1 border border-border py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
              >
                Không
              </button>
              <button
                onClick={() => cancelOrder.mutate()}
                disabled={cancelOrder.isPending}
                className="flex-1 bg-urgent text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-60 transition-opacity"
              >
                {cancelOrder.isPending ? 'Đang huỷ...' : 'Huỷ đơn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
