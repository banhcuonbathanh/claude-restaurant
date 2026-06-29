'use client'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { PlusCircle } from 'lucide-react'
import { api } from '@/lib/api-client'
import { useCartStore } from '@/store/cart'
import type { Order } from '@/types/order'

// Shown on /menu when the customer has a persisted activeOrderId but is NOT already in
// explicit add-to-order mode (no ?add_to_order=). Lets them resume their live order after
// navigating away (order → settings → menu) without re-scanning the QR — it bridges the
// persisted pointer into the existing add_to_order flow.
//
// Self-cleaning: it validates the pointer against the backend (GET /orders/:id). If the
// order is paid/cancelled/gone, it drops the stale pointer and renders nothing — so a
// finished order never haunts the next visit. (Backend stays the single source of truth;
// the persisted id is only a pointer, always re-validated, never trusted blindly.)
export function ActiveOrderRecoveryBanner({ suppressed = false }: { suppressed?: boolean }) {
  const router           = useRouter()
  const activeOrderId    = useCartStore(s => s.activeOrderId)
  const setActiveOrderId = useCartStore(s => s.setActiveOrderId)
  const setTableId       = useCartStore(s => s.setTableId)

  const enabled = !!activeOrderId && !suppressed

  const { data: order, isLoading } = useQuery<Order | null>({
    queryKey: ['order', activeOrderId],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/orders/${activeOrderId}`)
        return data?.data ?? null
      } catch {
        return null // 404 / auth gone → not recoverable
      }
    },
    enabled,
    staleTime: 30_000,
  })

  const terminal = !!order && (order.status === 'paid' || order.status === 'cancelled')
  const gone     = enabled && !isLoading && order === null

  // Drop the stale pointer once we know the order is finished or no longer reachable.
  useEffect(() => {
    if (terminal || gone) setActiveOrderId(null)
  }, [terminal, gone, setActiveOrderId])

  if (!enabled || isLoading || !order || terminal) return null

  return (
    <div className="mx-4 mt-3 flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-xl px-4 py-2.5">
      <PlusCircle size={16} className="text-primary shrink-0" />
      <p className="text-sm text-primary font-medium flex-1 truncate">
        Đơn hàng <span className="font-semibold">#{order.order_number}</span> đang xử lý — thêm món?
      </p>
      <button
        onClick={() => router.push(`/orders?id=${activeOrderId}`)}
        className="text-xs text-primary underline underline-offset-2 shrink-0"
      >
        Xem đơn
      </button>
      <button
        onClick={() => {
          if (order.table_id) setTableId(order.table_id)
          router.push(`/menu?add_to_order=${activeOrderId}`)
        }}
        className="text-xs bg-primary text-white rounded-lg px-3 py-1.5 shrink-0 font-medium"
      >
        Thêm món
      </button>
    </div>
  )
}
