'use client'
import { useEffect, useState } from 'react'
import { ClipboardList, Trash2, ShoppingBag, ChevronRight } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatVND } from '@/lib/utils'
import { OrderDetailSheet } from '@/components/order/OrderDetailSheet'
import type { Order } from '@/types/order'

function loadCachedOrders(): Order[] {
  const orders: Order[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith('order_cache_')) continue
      const raw = localStorage.getItem(key)
      if (!raw) continue
      orders.push(JSON.parse(raw))
    }
  } catch {}
  return orders.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
}

function timeAgo(dateStr: string): string {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 60_000))
  if (mins < 60) return `${mins} phút trước`
  if (mins < 1440) return `${Math.floor(mins / 60)} giờ trước`
  return `${Math.floor(mins / 1440)} ngày trước`
}

export default function OrderListPage() {
  const [orders, setOrders]               = useState<Order[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  useEffect(() => {
    setOrders(loadCachedOrders())
  }, [])

  const clearAll = () => {
    try {
      const toRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('order_cache_')) toRemove.push(key)
      }
      toRemove.forEach(k => localStorage.removeItem(k))
    } catch {}
    setOrders([])
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="px-4 pt-6 space-y-4">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList size={20} className="text-primary" />
            <h1 className="text-lg font-bold text-foreground">Đơn hàng của bạn</h1>
          </div>
          {orders.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 text-xs text-muted-fg hover:text-urgent transition-colors"
            >
              <Trash2 size={13} />
              Xoá lịch sử
            </button>
          )}
        </div>

        {/* ── Empty state ─────────────────────────────────────────────── */}
        {orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag size={28} className="text-muted-fg" />
            </div>
            <div>
              <p className="text-foreground font-semibold">Chưa có đơn hàng nào</p>
              <p className="text-muted-fg text-sm mt-1">
                Quét mã QR tại bàn để bắt đầu đặt món
              </p>
            </div>
          </div>
        )}

        {/* ── Order cards ─────────────────────────────────────────────── */}
        {orders.map((order) => {
          const displayItems = order.items.filter(i => !(i.combo_id && !i.combo_ref_id))
          const totalQty     = displayItems.reduce((s, i) => s + i.quantity,   0)
          const totalServed  = displayItems.reduce((s, i) => s + i.qty_served, 0)
          const progress     = totalQty > 0 ? Math.round((totalServed / totalQty) * 100) : 0
          const isActive     = order.status !== 'delivered' && order.status !== 'cancelled'

          return (
            <button
              key={order.id}
              onClick={() => setSelectedOrderId(order.id)}
              className="w-full text-left bg-card rounded-xl overflow-hidden border-l-4 border-primary hover:opacity-90 transition-opacity"
            >
              {/* Name + status + total + chevron */}
              <div className="flex items-center gap-2 px-4 py-3">
                <span className="font-bold text-foreground text-sm shrink-0">
                  {order.table_name ? `Bàn ${order.table_name}` : 'Mang về'}
                </span>
                <span className="text-xs text-muted-fg shrink-0">{order.order_number}</span>
                <StatusBadge status={order.status} />
                <span className="flex-1" />
                <span className="text-sm font-bold text-foreground tabular-nums">
                  {formatVND(order.total_amount)}
                </span>
                <ChevronRight size={14} className="text-muted-fg shrink-0" />
              </div>

              {/* Progress bar — only for active orders */}
              {isActive && (
                <div className="h-1 bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              {/* Served count + time */}
              <div className="flex items-center justify-between px-4 py-2 bg-background/20">
                <span className="text-xs text-muted-fg">
                  <span className="text-foreground font-medium">{totalServed}/{totalQty}</span>{' '}
                  phần đã ra
                </span>
                <span className="text-xs text-muted-fg">{timeAgo(order.created_at)}</span>
              </div>

              {/* Item name preview */}
              {displayItems.length > 0 && (
                <div className="px-4 pb-3">
                  <p className="text-xs text-muted-fg truncate">
                    {displayItems.slice(0, 3).map(i => i.name).join(' · ')}
                    {displayItems.length > 3 ? ` +${displayItems.length - 3} món` : ''}
                  </p>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Detail sheet ────────────────────────────────────────────────── */}
      {selectedOrderId && (
        <OrderDetailSheet
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  )
}
