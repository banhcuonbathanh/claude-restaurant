'use client'
import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { api } from '@/lib/api-client'
import { useCartStore } from '@/store/cart'
import { formatVND } from '@/lib/utils'
import { buildOrderItemsPayload } from '@/lib/order-payload'
import { STORAGE_KEYS } from '@/lib/storage-keys'

export function TableConfirmModal({ onClose }: { onClose: () => void }) {
  const router  = useRouter()
  const cart    = useCartStore()
  const [note, setNote] = useState('')
  const done    = useRef(false)

  const submitOrder = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/orders', {
        customer_name:  '',
        customer_phone: '',
        note:           note.trim() || null,
        table_id:       cart.tableId,
        source:         'qr',
        items: buildOrderItemsPayload(cart.items),
      })
      return data
    },
    onSuccess: async (data) => {
      done.current = true
      const order = data?.data
      if (order?.id) {
        try {
          const { data: fullRes } = await api.get(`/orders/${order.id}`)
          const fullOrder = fullRes?.data ?? order
          localStorage.setItem(`${STORAGE_KEYS.ORDER_CACHE}${order.id}`, JSON.stringify(fullOrder))
        } catch {
          try { localStorage.setItem(`${STORAGE_KEYS.ORDER_CACHE}${order.id}`, JSON.stringify(order)) } catch {}
        }
      }
      // table_busy: the table already had another active guest's order. This order is
      // still placed and tracked on its OWN page — show a short notice that it will be
      // served after the current order.
      if (order?.table_busy) {
        toast.info('Bàn đang phục vụ khách khác — đơn của bạn đã được ghi nhận và sẽ phục vụ sau.', { duration: 6000 })
      }
      cart.clearCart()
      // Point the (now cleared) cart at the order we just placed so it stays recoverable
      // from any page until it is paid/cancelled.
      if (order?.id) cart.setActiveOrderId(order.id)
      // Use router.replace (client-side nav) to preserve auth token in Zustand across navigation
      router.replace(order?.id ? `/orders?id=${order.id}` : '/orders')
    },
    onError: (err: unknown) => {
      const resp = (err as { response?: { data?: { message?: string } } }).response
      toast.error(resp?.data?.message ?? 'Đặt hàng thất bại')
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-4 pb-4">
      <div className="bg-card rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
        <h2 className="font-semibold text-foreground text-lg">Xác nhận đặt hàng</h2>

        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {cart.items.map(item => (
            <div key={item.id} className="flex justify-between text-sm gap-2">
              <span className="text-foreground flex-1 truncate">{item.quantity}× {item.name}</span>
              <span className="text-primary font-medium whitespace-nowrap">{formatVND(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-3 flex justify-between font-bold">
          <span className="text-foreground">Tổng cộng</span>
          <span className="text-primary text-lg">{formatVND(cart.total())}</span>
        </div>

        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Ghi chú cho bếp (tuỳ chọn)"
          rows={2}
          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-fg focus:outline-none focus:border-primary resize-none transition-colors"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={submitOrder.isPending}
            className="flex-1 py-3 rounded-xl border border-border text-muted-fg text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40"
          >
            Hủy
          </button>
          <button
            onClick={() => submitOrder.mutate()}
            disabled={submitOrder.isPending}
            className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold text-sm disabled:opacity-60 transition-opacity"
          >
            {submitOrder.isPending ? 'Đang đặt...' : 'Đặt hàng'}
          </button>
        </div>
      </div>
    </div>
  )
}
