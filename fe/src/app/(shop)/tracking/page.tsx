'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { api } from '@/lib/api-client'
import { useCartStore } from '@/store/cart'
import { useOrderMonitorSSE } from '@/hooks/useOrderMonitorSSE'
import { MonitoringTopBar } from './components/MonitoringTopBar'
import { TableInfoBanner } from './components/TableInfoBanner'
import { OrderDetailCard } from './components/OrderDetailCard'
import { WholeFloorPrepList } from './components/WholeFloorPrepList'
import { ConnectionErrorBanner } from '@/components/shared/ConnectionErrorBanner'
import type { Order } from '@/types/order'

export default function TrackingPage() {
  const router  = useRouter()
  const orderId = useCartStore(s => s.activeOrderId)
  const [showTable, setShowTable] = useState(true)

  const { data: order, isLoading, isError, refetch } = useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${orderId}`)
      return data.data as Order
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
    enabled: !!orderId,
    retry: (count, err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status
      return status !== 404 && count < 3
    },
  })

  const { orderStatus, queueData, sseConnected, isUnauthorized, itemsChangedAt } =
    useOrderMonitorSSE(orderId ?? '')

  // Refetch order detail when items are added/updated/cancelled from POS or staff.
  useEffect(() => {
    if (itemsChangedAt) refetch()
  }, [itemsChangedAt, refetch])

  const effectiveStatus = orderStatus ?? order?.status
  const tableLabel      = order?.table_name ?? order?.table_id ?? '?'

  // No active order — redirect to menu
  if (!orderId) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <AlertTriangle size={28} className="text-muted-fg" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">Không có đơn hàng đang hoạt động</p>
          <p className="text-sm text-muted-fg mt-1">Vui lòng đặt món trước để theo dõi đơn hàng.</p>
        </div>
        <button
          onClick={() => router.push('/menu')}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold min-h-[44px]"
        >
          Về trang menu
        </button>
      </div>
    )
  }

  // 404 / fetch error
  if (isError && !order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <AlertTriangle size={28} className="text-muted-fg" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">Đơn hàng không tồn tại</p>
          <p className="text-sm text-muted-fg mt-1">Vui lòng quét lại mã QR để đặt đơn mới.</p>
        </div>
        <button
          onClick={() => router.push('/menu')}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold min-h-[44px]"
        >
          Về trang menu
        </button>
      </div>
    )
  }

  // 401 — guest session expired or never established (e.g. navigated directly)
  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <AlertTriangle size={28} className="text-muted-fg" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">Phiên làm việc hết hạn</p>
          <p className="text-sm text-muted-fg mt-1">Vui lòng quét lại mã QR để tiếp tục.</p>
        </div>
        <button
          onClick={() => router.push('/menu')}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold min-h-[44px]"
        >
          Về trang menu
        </button>
      </div>
    )
  }

  // Loading skeleton
  if (isLoading && !order) {
    return (
      <div className="min-h-screen bg-background pb-20 animate-pulse">
        <div className="sticky top-0 z-20 bg-card border-b border-border h-12" />
        <div className="max-w-lg mx-auto px-4 pt-4 space-y-3">
          <div className="bg-card rounded-2xl h-20 border border-border" />
          <div className="bg-card rounded-2xl h-40 border border-border" />
          <div className="bg-card rounded-2xl h-36 border border-border" />
        </div>
        <div className="fixed bottom-0 left-0 right-0 h-14 bg-card border-t border-border" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MonitoringTopBar sseConnected={sseConnected} />

      {!sseConnected && <ConnectionErrorBanner />}

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-3">
        {order && effectiveStatus && (
          <div className="space-y-2">
            <button
              onClick={() => setShowTable(v => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-fg hover:text-foreground min-h-[36px]"
            >
              {showTable ? <EyeOff size={14} /> : <Eye size={14} />}
              {showTable ? 'Ẩn bàn của bạn' : 'Hiện bàn của bạn'}
            </button>
            {showTable && (
              <>
                <TableInfoBanner
                  tableLabel={tableLabel}
                  status={effectiveStatus}
                  queuePosition={queueData?.position ?? null}
                  queueTotal={queueData?.total ?? null}
                  estimatedMinutes={queueData?.estimatedMinutes ?? null}
                />
                {order && <OrderDetailCard order={order} />}
              </>
            )}
          </div>
        )}

        {queueData && queueData.queue.length > 0 && (
          <WholeFloorPrepList
            queue={queueData.queue}
            currentOrderId={orderId}
          />
        )}
      </div>
    </div>
  )
}
