'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
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

interface SummaryRow {
  key:              string
  name:             string
  unitPrice:        number
  totalQty:         number
  totalServed:      number
  remaining:        number
  totalMoney:       number
  remainingMoney:   number
  remainingItemIds: string[]
}

export default function OrderPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { order, progress, connectionError } = useOrderSSE(params.id)
  const [cancelTarget, setCancelTarget]       = useState<CancelTarget | null>(null)
  const [collapsed, setCollapsed]             = useState(false)
  const [collapsedCombos, setCollapsedCombos] = useState<Set<string>>(new Set())

  const toggleCombo = (refId: string) =>
    setCollapsedCombos(prev => {
      const next = new Set(prev)
      next.has(refId) ? next.delete(refId) : next.add(refId)
      return next
    })

  const cancelOrderMutation = useMutation({
    mutationFn: () => api.delete(`/orders/${params.id}`),
    onSuccess: () => { toast.success('Đã huỷ đơn hàng'); router.push('/menu') },
    onError:   (err: unknown) => { toast.error(errMsg(err) ?? 'Không thể huỷ đơn'); setCancelTarget(null) },
  })
  const cancelItemMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/orders/items/${id}`),
    onSuccess: () => { toast.success('Đã huỷ món'); setCancelTarget(null) },
    onError:   (err: unknown) => { toast.error(errMsg(err) ?? 'Không thể huỷ món'); setCancelTarget(null) },
  })
  const cancelMultiMutation = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map(id => api.delete(`/orders/items/${id}`))),
    onSuccess: () => { toast.success('Đã huỷ các món còn lại'); setCancelTarget(null) },
    onError:   (err: unknown) => { toast.error(errMsg(err) ?? 'Không thể huỷ món'); setCancelTarget(null) },
  })

  const { displayRows, eatenAmount, remainingAmount, totalQty, totalServed, comboNameMap, summaryRows, summaryRemainingTotal, summaryGrandTotal } = useMemo(() => {
    if (!order) return {
      displayRows: [], eatenAmount: 0, remainingAmount: 0,
      totalQty: 0, totalServed: 0, comboNameMap: new Map<string, string>(),
      summaryRows: [] as SummaryRow[], summaryRemainingTotal: 0, summaryGrandTotal: 0,
    }

    const comboNameMap = new Map<string, string>()
    for (const i of order.items) {
      if (i.combo_id !== null && i.combo_ref_id === null) comboNameMap.set(i.id, i.name)
    }

    const rows = order.items.filter(i => !(i.combo_id !== null && i.combo_ref_id === null))

    let eatenAmount = 0, remainingAmount = 0, totalQty = 0, totalServed = 0
    for (const i of rows) {
      eatenAmount    += i.unit_price * i.qty_served
      remainingAmount += i.unit_price * (i.quantity - i.qty_served)
      totalQty       += i.quantity
      totalServed    += i.qty_served
    }

    // Build summary: group same products by product_id (fallback: name)
    const summaryMap = new Map<string, SummaryRow>()
    for (const i of rows) {
      const key = i.product_id ?? i.name
      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          key, name: i.name, unitPrice: i.unit_price,
          totalQty: 0, totalServed: 0, remaining: 0,
          totalMoney: 0, remainingMoney: 0, remainingItemIds: [],
        })
      }
      const row = summaryMap.get(key)!
      row.totalQty    += i.quantity
      row.totalServed += i.qty_served
      row.remaining    = row.totalQty - row.totalServed
      row.totalMoney   = row.unitPrice * row.totalQty
      row.remainingMoney = row.unitPrice * row.remaining
      if (i.qty_served < i.quantity) row.remainingItemIds.push(i.id)
    }

    const summaryRows          = Array.from(summaryMap.values())
    const summaryRemainingTotal = summaryRows.reduce((s, r) => s + r.remainingMoney, 0)
    const summaryGrandTotal     = summaryRows.reduce((s, r) => s + r.totalMoney, 0)

    return { displayRows: rows, eatenAmount, remainingAmount, totalQty, totalServed, comboNameMap, summaryRows, summaryRemainingTotal, summaryGrandTotal }
  }, [order])

  const handleConfirm = () => {
    if (!cancelTarget) return
    if (cancelTarget.type === 'order')                                    cancelOrderMutation.mutate()
    else if (cancelTarget.type === 'item' && cancelTarget.itemId)         cancelItemMutation.mutate(cancelTarget.itemId)
    else if (cancelTarget.type === 'combo-remaining' && cancelTarget.remainingItems)
      cancelMultiMutation.mutate(cancelTarget.remainingItems.map(i => i.id))
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

  // Group combo sub-items by combo_ref_id
  const comboGroups = new Map<string, OrderItem[]>()
  for (const item of displayRows) {
    if (item.combo_ref_id) {
      const g = comboGroups.get(item.combo_ref_id) ?? []
      g.push(item)
      comboGroups.set(item.combo_ref_id, g)
    }
  }

  // Build ordered render sections
  type Section =
    | { kind: 'combo'; refId: string; name: string; items: OrderItem[] }
    | { kind: 'standalone'; item: OrderItem }

  const sections: Section[] = []
  const seen = new Set<string>()
  for (const item of displayRows) {
    if (item.combo_ref_id) {
      if (!seen.has(item.combo_ref_id)) {
        seen.add(item.combo_ref_id)
        sections.push({
          kind:  'combo',
          refId: item.combo_ref_id,
          name:  comboNameMap.get(item.combo_ref_id) ?? 'Combo',
          items: comboGroups.get(item.combo_ref_id) ?? [],
        })
      }
    } else {
      sections.push({ kind: 'standalone', item })
    }
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      {connectionError && <ConnectionErrorBanner />}

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-3">

        {/* ── Order card ─────────────────────────────────────────────── */}
        <div className="bg-card rounded-xl overflow-hidden border-l-4 border-primary">

          {/* Header row */}
          <button
            onClick={() => setCollapsed(v => !v)}
            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-background/30 transition-colors"
          >
            {order.table_id && (
              <span className="font-bold text-foreground text-sm shrink-0">Bàn {order.table_id}</span>
            )}
            <span className="text-xs text-muted-fg shrink-0">{order.order_number}</span>
            <StatusBadge status={order.status} />
            <span className="flex-1" />
            <span className="text-sm font-bold text-foreground">{formatVND(order.total_amount)}</span>
            <span className="text-xs font-semibold text-primary">{elapsed} phút</span>
            {collapsed
              ? <ChevronDown size={14} className="text-muted-fg" />
              : <ChevronUp   size={14} className="text-muted-fg" />}
          </button>

          {/* Progress bar */}
          <div className="h-1 bg-muted">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          {/* Dish rows */}
          {!collapsed && (
            <>
              {sections.map((section, si) => {
                if (section.kind === 'combo') {
                  const remaining = section.items.filter(i => i.qty_served < i.quantity)
                  const isComboCollapsed = collapsedCombos.has(section.refId)
                  return (
                    <div key={section.refId} className="border-t border-border/40">
                      {/* Combo header with toggle */}
                      <button
                        onClick={() => toggleCombo(section.refId)}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-background/30 transition-colors"
                      >
                        <span className="text-[11px] font-bold text-primary uppercase tracking-wide flex-1 text-left">
                          {section.name}
                        </span>
                        <span className="text-xs text-muted-fg">
                          {section.items.length} món
                        </span>
                        {isComboCollapsed
                          ? <ChevronDown size={13} className="text-muted-fg" />
                          : <ChevronUp   size={13} className="text-muted-fg" />}
                      </button>

                      {/* Combo dish rows — collapsible */}
                      {!isComboCollapsed && (
                        <>
                          {section.items.map((item) => (
                            <DishRow
                              key={item.id}
                              item={item}
                              isActive={isActive}
                              indent
                              onCancel={() => setCancelTarget({ type: 'item', itemId: item.id, itemName: item.name })}
                            />
                          ))}
                          {remaining.length > 0 && isActive && (
                            <div className="px-4 pb-2">
                              <button
                                onClick={() => setCancelTarget({ type: 'combo-remaining', comboName: section.name, remainingItems: remaining })}
                                className="w-full text-xs text-urgent border border-urgent/40 py-1.5 rounded-lg hover:bg-red-900/20 transition-colors font-medium"
                              >
                                Huỷ {remaining.length} món còn lại của {section.name}
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                }
                return (
                  <DishRow
                    key={section.item.id}
                    item={section.item}
                    isActive={isActive}
                    onCancel={() => setCancelTarget({ type: 'item', itemId: section.item.id, itemName: section.item.name })}
                  />
                )
              })}

              {/* X/Y phần đã ra */}
              <div className="px-4 py-2 border-t border-border/40 bg-background/20">
                <p className="text-xs text-muted-fg">
                  <span className="text-foreground font-semibold">{totalServed}/{totalQty}</span> phần đã ra
                </p>
              </div>
            </>
          )}
        </div>

        {/* ── Dish summary table ──────────────────────────────────────── */}
        <div className="bg-card rounded-xl overflow-hidden border-l-4 border-border">

          {/* Column headers */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-background/30 text-[10px] font-bold text-muted-fg uppercase tracking-wide">
            <span className="flex-1">Tên món</span>
            <span className="w-8  text-center">SL</span>
            <span className="w-8  text-center">Ra</span>
            <span className="w-12 text-center">Còn</span>
            <span className="w-20 text-right">Đơn giá</span>
            <span className="w-20 text-right">Tổng</span>
            <span className="w-10" />
          </div>

          {/* One row per product */}
          {summaryRows.map((row, idx) => (
            <div
              key={row.key}
              className={`flex items-center gap-2 px-3 py-2.5 text-xs ${idx < summaryRows.length - 1 ? 'border-b border-border/40' : ''}`}
            >
              {/* Name */}
              <span className="flex-1 text-sm font-medium text-foreground min-w-0 truncate leading-snug">
                {row.name}
              </span>

              {/* SL */}
              <span className="w-8 text-center font-semibold text-foreground shrink-0">
                {row.totalQty}
              </span>

              {/* Đã ra */}
              <span className="w-8 text-center font-semibold text-success shrink-0">
                {row.totalServed}
              </span>

              {/* Còn */}
              <span className="w-12 text-center shrink-0">
                {row.remaining > 0
                  ? <span className="bg-primary/20 text-primary font-bold px-1.5 py-0.5 rounded text-[11px]">×{row.remaining}</span>
                  : <span className="text-success font-semibold">✓</span>}
              </span>

              {/* Đơn giá */}
              <span className="w-20 text-right text-muted-fg shrink-0 tabular-nums">
                {formatVND(row.unitPrice)}
              </span>

              {/* Tổng tiền */}
              <span className="w-20 text-right font-semibold text-foreground shrink-0 tabular-nums">
                {formatVND(row.totalMoney)}
              </span>

              {/* Cancel button */}
              <span className="w-10 flex justify-end shrink-0">
                {row.remaining > 0 && isActive && (
                  <button
                    onClick={() => setCancelTarget({
                      type:           'combo-remaining',
                      itemName:       row.name,
                      remainingItems: order!.items.filter(i => row.remainingItemIds.includes(i.id)),
                    })}
                    className="text-[11px] text-urgent border border-urgent/50 px-1.5 py-0.5 rounded hover:bg-red-900/20 transition-colors font-medium"
                  >
                    Huỷ
                  </button>
                )}
              </span>
            </div>
          ))}

          {/* Totals footer */}
          <div className="border-t border-border bg-background/20 divide-y divide-border/40">
            {summaryRemainingTotal > 0 && (
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs text-muted-fg">Tổng tiền còn lại</span>
                <span className="text-sm font-bold text-primary tabular-nums">{formatVND(summaryRemainingTotal)}</span>
              </div>
            )}
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-sm font-bold text-foreground">Tổng tất cả món</span>
              <span className="text-base font-bold text-foreground tabular-nums">{formatVND(summaryGrandTotal)}</span>
            </div>
          </div>
        </div>

        {/* ── Money summary ───────────────────────────────────────────── */}
        <div className="bg-card rounded-xl overflow-hidden border-l-4 border-border">
          <div className="divide-y divide-border/50">
            <div className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="text-muted-fg">Đã dùng ({totalServed} phần)</span>
              <span className="font-semibold text-success">{formatVND(eatenAmount)}</span>
            </div>
            {remainingAmount > 0 && (
              <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-muted-fg">Còn lại ({totalQty - totalServed} phần chưa ra)</span>
                <span className="font-semibold text-primary">{formatVND(remainingAmount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-bold text-foreground">Tổng cộng</span>
              <span className="text-lg font-bold text-foreground">{formatVND(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* ── Cancel whole order ──────────────────────────────────────── */}
        {canCancelOrder && (
          <button
            onClick={() => setCancelTarget({ type: 'order' })}
            className="w-full border border-urgent text-urgent py-3 rounded-xl text-sm font-medium hover:bg-red-900/20 transition-colors"
          >
            Huỷ toàn bộ đơn hàng
          </button>
        )}
      </div>

      {/* ── Confirm modal ───────────────────────────────────────────── */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-urgent" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-foreground">
                  {cancelTarget.type === 'order' ? 'Huỷ đơn hàng?'
                    : cancelTarget.type === 'combo-remaining' ? 'Huỷ món còn lại?'
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
              <button onClick={() => setCancelTarget(null)} disabled={isPending}
                className="flex-1 border border-border py-2.5 rounded-xl text-sm hover:bg-muted transition-colors disabled:opacity-50">
                Giữ lại
              </button>
              <button onClick={handleConfirm} disabled={isPending}
                className="flex-1 bg-urgent text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-60">
                {isPending ? 'Đang huỷ...' : 'Xác nhận huỷ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── DishRow component ─────────────────────────────────────────────────────────

function DishRow({
  item,
  isActive,
  indent = false,
  onCancel,
}: {
  item:     OrderItem
  isActive: boolean
  indent?:  boolean
  onCancel: () => void
}) {
  const remaining = item.quantity - item.qty_served

  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 border-t border-border/40 ${indent ? 'pl-6' : ''}`}>
      {/* Bullet */}
      <span className="w-1.5 h-1.5 rounded-full bg-muted-fg shrink-0" />

      {/* Dish name */}
      <span className="flex-1 text-sm text-foreground leading-snug min-w-0 truncate">
        {item.name}
      </span>

      {/* tổng / ra / còn — inline */}
      <div className="flex items-center gap-2 shrink-0 text-xs whitespace-nowrap">
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
          <span className="text-success font-medium">✓ xong</span>
        )}
      </div>

      {/* Cancel button — same row, only when còn > 0 */}
      {remaining > 0 && isActive ? (
        <button
          onClick={onCancel}
          className="shrink-0 text-xs text-urgent border border-urgent/50 px-2 py-0.5 rounded-md hover:bg-red-900/20 transition-colors font-medium"
        >
          Huỷ
        </button>
      ) : (
        <span className="w-[38px] shrink-0" /> // spacer to keep alignment
      )}
    </div>
  )
}

// ── helpers ───────────────────────────────────────────────────────────────────

function minutesElapsed(dateStr: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 60_000))
}

function errMsg(err: unknown): string | undefined {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message
}
