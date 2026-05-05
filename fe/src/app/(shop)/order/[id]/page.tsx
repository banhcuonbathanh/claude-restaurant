'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AlertTriangle } from 'lucide-react'
import { useOrderSSE } from '@/hooks/useOrderSSE'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConnectionErrorBanner } from '@/components/shared/ConnectionErrorBanner'
import { api } from '@/lib/api-client'
import { formatVND } from '@/lib/utils'
import type { OrderItem } from '@/types/order'

interface CancelTarget {
  type:            'item' | 'combo-remaining' | 'order'
  itemId?:         string
  itemName?:       string
  comboName?:      string
  remainingItems?: OrderItem[]
}

export default function OrderPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { order, progress, connectionError } = useOrderSSE(params.id)
  const [cancelTarget, setCancelTarget] = useState<CancelTarget | null>(null)

  const cancelOrderMutation = useMutation({
    mutationFn: () => api.delete(`/orders/${params.id}`),
    onSuccess: () => { toast.success('Đã huỷ đơn hàng'); router.push('/menu') },
    onError: (err: unknown) => {
      toast.error(errMsg(err) ?? 'Không thể huỷ đơn')
      setCancelTarget(null)
    },
  })

  const cancelItemMutation = useMutation({
    mutationFn: (itemId: string) => api.delete(`/orders/items/${itemId}`),
    onSuccess: () => { toast.success('Đã huỷ món'); setCancelTarget(null) },
    onError: (err: unknown) => {
      toast.error(errMsg(err) ?? 'Không thể huỷ món')
      setCancelTarget(null)
    },
  })

  const cancelMultiMutation = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map(id => api.delete(`/orders/items/${id}`))),
    onSuccess: () => { toast.success('Đã huỷ các món còn lại'); setCancelTarget(null) },
    onError: (err: unknown) => {
      toast.error(errMsg(err) ?? 'Không thể huỷ món')
      setCancelTarget(null)
    },
  })

  const { displayRows, eatenAmount, remainingAmount, totalQty, totalServed } = useMemo(() => {
    if (!order) return { displayRows: [], eatenAmount: 0, remainingAmount: 0, totalQty: 0, totalServed: 0 }

    // Build combo name map from parent rows
    const comboNameMap = new Map<string, string>()
    for (const i of order.items) {
      if (i.combo_id !== null && i.combo_ref_id === null) comboNameMap.set(i.id, i.name)
    }

    // Only countable rows (no combo parent rows)
    const rows = order.items.filter(i => !(i.combo_id !== null && i.combo_ref_id === null))

    let eatenAmount    = 0
    let remainingAmount = 0
    let totalQty       = 0
    let totalServed    = 0

    for (const i of rows) {
      const remaining = i.quantity - i.qty_served
      eatenAmount    += i.unit_price * i.qty_served
      remainingAmount += i.unit_price * remaining
      totalQty       += i.quantity
      totalServed    += i.qty_served
    }

    return { displayRows: rows, eatenAmount, remainingAmount, totalQty, totalServed }
  }, [order])

  const handleConfirm = () => {
    if (!cancelTarget) return
    if (cancelTarget.type === 'order') {
      cancelOrderMutation.mutate()
    } else if (cancelTarget.type === 'item' && cancelTarget.itemId) {
      cancelItemMutation.mutate(cancelTarget.itemId)
    } else if (cancelTarget.type === 'combo-remaining' && cancelTarget.remainingItems) {
      cancelMultiMutation.mutate(cancelTarget.remainingItems.map(i => i.id))
    }
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-fg text-sm">Đang tải đơn hàng...</p>
        </div>
      </div>
    )
  }

  const isActive       = order.status !== 'delivered' && order.status !== 'cancelled'
  const canCancelOrder = progress < 30 && isActive
  const isPending      = cancelOrderMutation.isPending || cancelItemMutation.isPending || cancelMultiMutation.isPending
  const elapsed        = minutesElapsed(order.created_at)

  // Group rows by combo_ref_id so we can render combo-level cancel buttons
  const comboGroups = new Map<string, OrderItem[]>()
  const standalone: OrderItem[] = []
  for (const item of displayRows) {
    if (item.combo_ref_id) {
      const g = comboGroups.get(item.combo_ref_id) ?? []
      g.push(item)
      comboGroups.set(item.combo_ref_id, g)
    } else {
      standalone.push(item)
    }
  }

  // Build render list: interleave combo groups + standalone in original order
  type RenderEntry =
    | { kind: 'item'; item: OrderItem; comboName?: string; isLastInCombo?: boolean }
    | { kind: 'combo-cancel'; comboRefId: string; comboName: string; remainingItems: OrderItem[] }

  const renderList: RenderEntry[] = []
  const seenComboRefs = new Set<string>()

  // Build combo name map (from parent rows)
  const comboNameMap = new Map<string, string>()
  for (const i of order.items) {
    if (i.combo_id !== null && i.combo_ref_id === null) comboNameMap.set(i.id, i.name)
  }

  for (const item of displayRows) {
    if (item.combo_ref_id) {
      const refId = item.combo_ref_id
      if (!seenComboRefs.has(refId)) {
        seenComboRefs.add(refId)
        const groupItems = comboGroups.get(refId) ?? []
        // Emit all items in this combo group
        groupItems.forEach((gi, idx) => {
          renderList.push({
            kind:        'item',
            item:        gi,
            comboName:   idx === 0 ? (comboNameMap.get(refId) ?? 'Combo') : undefined,
            isLastInCombo: idx === groupItems.length - 1,
          })
        })
        // Emit combo-cancel button after last item if any remaining
        const remaining = groupItems.filter(i => i.qty_served < i.quantity)
        if (remaining.length > 0 && isActive) {
          renderList.push({
            kind:          'combo-cancel',
            comboRefId:    refId,
            comboName:     comboNameMap.get(refId) ?? 'Combo',
            remainingItems: remaining,
          })
        }
      }
    } else {
      renderList.push({ kind: 'item', item })
    }
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      {connectionError && <ConnectionErrorBanner />}

      {/* ── Header card ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {order.table_id && (
                <span className="font-bold text-foreground shrink-0">
                  Bàn {order.table_id}
                </span>
              )}
              <span className="text-xs text-muted-fg shrink-0">{order.order_number}</span>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm font-bold text-foreground">{formatVND(order.total_amount)}</span>
              <span className="text-xs text-primary font-semibold">{elapsed} phút</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">

        {/* ── Dish list ───────────────────────────────────────────────── */}
        <div className="bg-card rounded-xl overflow-hidden border-l-4 border-primary">
          {renderList.map((entry, idx) => {
            if (entry.kind === 'combo-cancel') {
              return (
                <div key={`cc-${entry.comboRefId}`} className="px-4 py-2 bg-background/40 border-t border-border/50">
                  <button
                    onClick={() => setCancelTarget({
                      type:          'combo-remaining',
                      comboName:     entry.comboName,
                      remainingItems: entry.remainingItems,
                    })}
                    className="w-full text-xs text-urgent border border-urgent/40 py-1.5 rounded-lg hover:bg-red-900/20 transition-colors font-medium"
                  >
                    Huỷ {entry.remainingItems.length} món còn lại của {entry.comboName}
                  </button>
                </div>
              )
            }

            const { item, comboName, isLastInCombo } = entry
            const remaining  = item.quantity - item.qty_served
            const isLast     = idx === renderList.length - 1
            const showDivider = !isLast && renderList[idx + 1]?.kind !== 'combo-cancel'

            return (
              <div
                key={item.id}
                className={`px-4 py-3 ${showDivider ? 'border-b border-border/50' : ''}`}
              >
                {/* Combo label above first item in group */}
                {comboName && (
                  <p className="text-[11px] font-semibold text-primary uppercase tracking-wide mb-1.5">
                    {comboName}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  {/* Bullet */}
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-fg shrink-0 mt-px" />

                  {/* Name */}
                  <span className="flex-1 text-sm text-foreground font-medium leading-snug min-w-0 truncate">
                    {item.name}
                  </span>

                  {/* tổng / ra / còn */}
                  <div className="flex items-center gap-2 shrink-0 text-xs">
                    <span className="text-muted-fg">
                      tổng <span className="text-foreground font-medium">×{item.quantity}</span>
                    </span>
                    <span className="text-muted-fg">
                      ra <span className="text-success font-medium">×{item.qty_served}</span>
                    </span>
                    {remaining > 0 ? (
                      <span className="bg-primary/20 text-primary font-semibold px-1.5 py-0.5 rounded">
                        còn ×{remaining}
                      </span>
                    ) : (
                      <span className="text-success font-semibold text-xs">✓ xong</span>
                    )}
                  </div>

                  {/* Cancel button — only when còn > 0 and order active */}
                  {remaining > 0 && isActive && (
                    <button
                      onClick={() => setCancelTarget({ type: 'item', itemId: item.id, itemName: item.name })}
                      className="shrink-0 text-xs text-urgent border border-urgent/50 px-2 py-0.5 rounded-md hover:bg-red-900/20 transition-colors font-medium ml-1"
                    >
                      Huỷ
                    </button>
                  )}
                </div>

                {/* Price row */}
                <div className="flex items-center justify-between mt-1 pl-3.5">
                  <span className="text-xs text-muted-fg">
                    {formatVND(item.unit_price)} × {item.quantity}
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {formatVND(item.unit_price * item.quantity)}
                  </span>
                </div>
              </div>
            )
          })}

          {/* Bottom: X/Y phần đã ra */}
          <div className="px-4 py-2.5 border-t border-border/50 bg-background/30">
            <p className="text-xs text-muted-fg">
              <span className="text-foreground font-semibold">{totalServed}/{totalQty}</span> phần đã ra
            </p>
          </div>
        </div>

        {/* ── Money summary ────────────────────────────────────────────── */}
        <div className="bg-card rounded-xl overflow-hidden border-l-4 border-border">
          <div className="divide-y divide-border/50">
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-sm text-muted-fg">Đã dùng</span>
              <span className="text-sm font-semibold text-success">{formatVND(eatenAmount)}</span>
            </div>
            {remainingAmount > 0 && (
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-muted-fg">Còn lại (chưa ra)</span>
                <span className="text-sm font-semibold text-primary">{formatVND(remainingAmount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-semibold text-foreground">Tổng cộng</span>
              <span className="text-lg font-bold text-foreground">{formatVND(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* ── Cancel whole order ───────────────────────────────────────── */}
        {canCancelOrder && (
          <button
            onClick={() => setCancelTarget({ type: 'order' })}
            className="w-full border border-urgent text-urgent py-3 rounded-xl text-sm font-medium hover:bg-red-900/20 transition-colors"
          >
            Huỷ toàn bộ đơn hàng
          </button>
        )}
      </div>

      {/* ── Confirm modal ────────────────────────────────────────────── */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-urgent" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-foreground">
                  {cancelTarget.type === 'order'
                    ? 'Huỷ đơn hàng?'
                    : cancelTarget.type === 'combo-remaining'
                    ? `Huỷ món còn lại?`
                    : 'Huỷ món này?'}
                </h3>
                <p className="text-muted-fg text-sm mt-1">
                  {cancelTarget.type === 'order'
                    ? 'Toàn bộ đơn sẽ bị huỷ. Không thể hoàn tác.'
                    : cancelTarget.type === 'combo-remaining'
                    ? `Huỷ ${cancelTarget.remainingItems?.length} món chưa ra của "${cancelTarget.comboName}".`
                    : `"${cancelTarget.itemName}" sẽ bị huỷ. Không thể hoàn tác.`}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelTarget(null)}
                disabled={isPending}
                className="flex-1 border border-border py-2.5 rounded-xl text-sm hover:bg-muted transition-colors disabled:opacity-50"
              >
                Giữ lại
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className="flex-1 bg-urgent text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-60"
              >
                {isPending ? 'Đang huỷ...' : 'Xác nhận huỷ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function minutesElapsed(dateStr: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 60_000))
}

function errMsg(err: unknown): string | undefined {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message
}
