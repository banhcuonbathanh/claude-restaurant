'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { api } from '@/lib/api-client'
import { useCartStore } from '@/store/cart'
import { useOrderMonitorSSE } from '@/hooks/useOrderMonitorSSE'
import { MonitoringTopBar } from '@/features/order/components/MonitoringTopBar'
import { TableInfoBanner } from '@/features/order/components/TableInfoBanner'
import { WholeFloorPrepList } from '@/features/order/components/WholeFloorPrepList'
import { ConnectionErrorBanner } from '@/components/shared/ConnectionErrorBanner'
import { OrderDetailView } from '@/features/order/components/OrderDetailView'
import type { Order } from '@/types/order'

/**
 * /orders — merged "Đơn hàng & Theo dõi" screen.
 *
 * Combines the former `/order` (rich itemized order detail) and `/tracking`
 * (live floor queue + personal queue position) into one active-order-centric
 * screen. Targets the order from `?id=` when present, else `activeOrderId`.
 */
function OrdersContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const activeOrderId = useCartStore(s => s.activeOrderId)
  const orderId = searchParams.get('id') ?? activeOrderId
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
  const isOnline        = !!order && !order.table_id
  const tableLabel      = isOnline ? 'Online' : order?.table_name ?? order?.table_id ?? '?'

  // No order to show — point the customer back to the menu.
  if (!orderId) {
    return <EmptyOrders router={router} />
  }

  // 404 / fetch error
  if (isError && !order) {
    return (
      <ErrorScreen
        router={router}
        title="Đơn hàng không tồn tại"
        subtitle="Vui lòng quét lại mã QR để đặt đơn mới."
      />
    )
  }

  // 401 — guest session expired or never established (e.g. navigated directly)
  if (isUnauthorized) {
    return (
      <ErrorScreen
        router={router}
        title="Phiên làm việc hết hạn"
        subtitle="Vui lòng quét lại mã QR để tiếp tục."
      />
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
              {showTable
                ? (isOnline ? 'Ẩn đơn của bạn' : 'Ẩn bàn của bạn')
                : (isOnline ? 'Hiện đơn của bạn' : 'Hiện bàn của bạn')}
            </button>
            {showTable && (
              <div className="space-y-3">
                <TableInfoBanner
                  online={isOnline}
                  tableLabel={tableLabel}
                  status={effectiveStatus}
                  queuePosition={queueData?.position ?? null}
                  queueTotal={queueData?.total ?? null}
                  estimatedMinutes={queueData?.estimatedMinutes ?? null}
                />
                {/* Rich live order detail (former /order/[id] view) */}
                <OrderDetailView orderId={orderId} onCancelled={() => router.push('/menu')} />
              </div>
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

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <OrdersContent />
    </Suspense>
  )
}

// ── helper screens ──────────────────────────────────────────────────────────────

function EmptyOrders({ router }: { router: ReturnType<typeof useRouter> }) {
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

function ErrorScreen({
  router, title, subtitle,
}: {
  router:   ReturnType<typeof useRouter>
  title:    string
  subtitle: string
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <AlertTriangle size={28} className="text-muted-fg" />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-fg mt-1">{subtitle}</p>
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
