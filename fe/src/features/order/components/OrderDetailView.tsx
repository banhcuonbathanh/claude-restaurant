'use client'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ChevronDown, ChevronRight, ChevronUp, AlertTriangle, CheckCircle, Bell, XCircle, Plus } from 'lucide-react'
import { useOrderSSE } from '@/hooks/useOrderSSE'
import { api } from '@/lib/api-client'
import { formatVND } from '@/lib/utils'
import { useCartStore } from '@/store/cart'
import { type OrderItem, type ToppingSnapshotEntry } from '@/types/order'

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
  toppings:         ToppingSnapshotEntry[]
  notes:            string[]
}

/**
 * OrderDetailView — the rich, live, itemized view of a single placed order.
 *
 * Lifted from the former `/order/[id]` page so it can be embedded in the merged
 * `/orders` screen (and anywhere a full order detail is needed). It owns its own
 * realtime stream (`useOrderSSE`), cancel mutations and modals. Page chrome
 * (sticky header, connection pill) is the host's responsibility.
 */
export function OrderDetailView({
  orderId,
  onCancelled,
}: {
  orderId: string
  /** Called after the WHOLE order is cancelled. Defaults to navigating to /menu. */
  onCancelled?: () => void
}) {
  const router = useRouter()
  const { order, progress, connectionError, isNotFound, notification, clearNotification } = useOrderSSE(orderId)
  const setTableId       = useCartStore(s => s.setTableId)
  const setActiveOrderId = useCartStore(s => s.setActiveOrderId)
  const [cancelTarget, setCancelTarget]   = useState<CancelTarget | null>(null)
  const [itemsOpen, setItemsOpen]         = useState(false)
  const [summaryOpen, setSummaryOpen]     = useState(false)
  const [collapsedCombos, setCollapsedCombos] = useState<Set<string>>(new Set())

  const toggleCombo = (refId: string) =>
    setCollapsedCombos(prev => {
      const next = new Set(prev)
      next.has(refId) ? next.delete(refId) : next.add(refId)
      return next
    })

  // Once the order is terminal it is no longer the "recoverable active order" — drop the
  // pointer so the menu/recovery surfaces stop offering a dead order.
  useEffect(() => {
    if (order?.status === 'paid' || order?.status === 'cancelled') {
      setActiveOrderId(null)
    }
  }, [order?.status, setActiveOrderId])

  const cancelOrderMutation = useMutation({
    mutationFn: () => api.delete(`/orders/${orderId}`),
    onSuccess: () => {
      setActiveOrderId(null)
      toast.success('Đã huỷ đơn hàng')
      onCancelled ? onCancelled() : router.push('/menu')
    },
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

  const { displayRows, eatenAmount, remainingAmount, totalQty, totalServed, comboNameMap, summaryRows, noteCounts } = useMemo(() => {
    if (!order) return {
      displayRows: [], eatenAmount: 0, remainingAmount: 0,
      totalQty: 0, totalServed: 0, comboNameMap: new Map<string, string>(),
      summaryRows: [] as SummaryRow[],
      noteCounts: [] as { label: string; count: number }[],
    }

    const comboNameMap = new Map<string, string>()
    for (const i of order.items) {
      if (i.combo_id && !i.combo_ref_id) comboNameMap.set(i.id, i.name)
    }

    const rows = order.items.filter(i => !(i.combo_id && !i.combo_ref_id))

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
      const key = i.product_id || i.name
      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          key, name: i.name, unitPrice: i.unit_price,
          totalQty: 0, totalServed: 0, remaining: 0,
          totalMoney: 0, remainingMoney: 0, remainingItemIds: [],
          toppings: [], notes: [],
        })
      }
      const row = summaryMap.get(key)!
      row.totalQty    += i.quantity
      row.totalServed += i.qty_served
      row.remaining    = row.totalQty - row.totalServed
      row.totalMoney   = row.unitPrice * row.totalQty
      row.remainingMoney = row.unitPrice * row.remaining
      if (i.qty_served < i.quantity) row.remainingItemIds.push(i.id)
      // Collect unique toppings + notes across all items in this group
      for (const t of (i.toppings_snapshot ?? []).filter(t => t.name?.trim())) {
        if (!row.toppings.some(existing => existing.name === t.name)) {
          row.toppings.push(t)
        }
      }
      if (i.note?.trim() && !row.notes.includes(i.note.trim())) {
        row.notes.push(i.note.trim())
      }
    }

    const summaryRows          = Array.from(summaryMap.values()).sort((a, b) => b.totalQty - a.totalQty)

    // Count items by note (rau/không rau etc.)
    const noteCountMap = new Map<string, number>()
    for (const i of rows) {
      const n = i.note?.trim()
      if (n) noteCountMap.set(n, (noteCountMap.get(n) ?? 0) + i.quantity)
    }
    const noteCounts = Array.from(noteCountMap.entries()).map(([label, count]) => ({ label, count }))

    return { displayRows: rows, eatenAmount, remainingAmount, totalQty, totalServed, comboNameMap, summaryRows, noteCounts }
  }, [order])

  const handleConfirm = () => {
    if (!cancelTarget) return
    if (cancelTarget.type === 'order')                                    cancelOrderMutation.mutate()
    else if (cancelTarget.type === 'item' && cancelTarget.itemId)         cancelItemMutation.mutate(cancelTarget.itemId)
    else if (cancelTarget.type === 'combo-remaining' && cancelTarget.remainingItems)
      cancelMultiMutation.mutate(cancelTarget.remainingItems.map(i => i.id))
  }

  if (isNotFound) {
    return (
      <div className="bg-card rounded-xl border border-border px-6 py-10 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <AlertTriangle size={22} className="text-muted-fg" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Không tìm thấy đơn hàng</p>
          <p className="text-xs text-muted-fg mt-1">Mã đơn hàng không hợp lệ hoặc đã bị xoá.</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="bg-card rounded-xl overflow-hidden border-l-4 border-primary/30 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 bg-muted rounded" />
            <div className="h-4 w-12 bg-muted rounded" />
            <div className="h-5 w-20 bg-muted rounded-full ml-auto" />
          </div>
          <div className="h-1 bg-muted rounded" />
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-2 pt-2 border-t border-border/30">
              <div className="w-2 h-2 rounded-full bg-muted shrink-0" />
              <div className="flex-1 h-4 bg-muted rounded" />
              <div className="w-20 h-4 bg-muted rounded" />
              <div className="w-8 h-6 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const isActive       = order.status !== 'delivered' && order.status !== 'cancelled'
  const canCancelOrder = progress < 30 && (order.status === 'confirmed' || order.status === 'preparing')
  const isPending      = cancelOrderMutation.isPending || cancelItemMutation.isPending || cancelMultiMutation.isPending

  // Group combo sub-items by combo_ref_id
  const comboGroups = new Map<string, OrderItem[]>()
  for (const item of displayRows) {
    if (item.combo_ref_id) {
      const g = comboGroups.get(item.combo_ref_id) ?? []
      g.push(item)
      comboGroups.set(item.combo_ref_id, g)
    }
  }
  // Sort items inside each combo by quantity (largest on top)
  Array.from(comboGroups.values()).forEach(g => g.sort((a, b) => b.quantity - a.quantity))

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
  // Sort sections by quantity (largest on top): combos use their total quantity,
  // standalone items use their own quantity. Combos stay grouped.
  const sectionQty = (s: Section) =>
    s.kind === 'combo' ? s.items.reduce((sum, i) => sum + i.quantity, 0) : s.item.quantity
  sections.sort((a, b) => sectionQty(b) - sectionQty(a))

  return (
    <div className="space-y-3">
      {/* ── Summary card — mirrors the menu OrderSummary manner ──────── */}
      <section className="bg-card rounded-xl p-4 shadow-sm">

        {/* Header */}
        <div className="flex items-center gap-2 min-w-0 min-h-[44px]">
          <h2 className="text-sm font-semibold text-foreground shrink-0">Tóm tắt đơn hàng</h2>
        </div>

        <div className="mt-3 space-y-3">
            {/* Progress bar */}
            <div className="h-1 bg-muted rounded">
              <div className="h-full bg-primary rounded transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>

            {/* Section: Món đã chọn */}
            <button
              onClick={() => setItemsOpen(o => !o)}
              className="w-full flex items-center justify-between min-h-[36px]"
            >
              <span className="text-xs font-semibold text-muted-fg uppercase tracking-wide">Món đã chọn</span>
              <span className="text-muted-fg text-xs flex items-center gap-1">
                {itemsOpen ? <><ChevronDown size={14} /> Ẩn</> : <><ChevronRight size={14} /> Hiện</>}
              </span>
            </button>

            {itemsOpen && (
              <div>
                {/* Column headers */}
                <div className="flex items-center gap-2 py-2 border-b border-border bg-background/30 text-[10px] font-bold text-muted-fg uppercase tracking-wide">
                  <span className="flex-1">Món</span>
                  <span className="w-10 text-center">Tổng</span>
                  <span className="w-12 text-center">Còn</span>
                  <span className="w-12" />
                </div>

                {sections.map((section) => {
                  if (section.kind === 'combo') {
                    const remaining = section.items.filter(i => i.qty_served < i.quantity)
                    const isComboCollapsed = collapsedCombos.has(section.refId)
                    return (
                      <div key={section.refId} className="border-t border-border/40">
                        {/* Combo header with toggle */}
                        <button
                          onClick={() => toggleCombo(section.refId)}
                          className="w-full flex items-center gap-2 py-2 hover:bg-background/30 transition-colors"
                        >
                          <span className="text-[11px] font-bold text-primary uppercase tracking-wide flex-1 text-left">
                            {section.name}
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
                              <div className="pb-2">
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

                {/* X/Y phần đã ra + note summary */}
                <div className="py-2 border-t border-border/40 flex items-center gap-3 flex-wrap">
                  <p className="text-xs text-muted-fg">
                    <span className="text-foreground font-semibold">{totalServed}/{totalQty}</span> phần đã ra
                  </p>
                  {noteCounts.map(({ label, count }) => (
                    <span key={label} className="text-xs font-semibold text-foreground">
                      {label} <span className="text-primary">×{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Section: Chi tiết món */}
            <div className="pt-2 border-t border-border">
              <button
                onClick={() => setSummaryOpen(o => !o)}
                className="w-full flex items-center justify-between min-h-[36px] mb-2"
              >
                <span className="text-xs font-semibold text-muted-fg uppercase tracking-wide">
                  Chi tiết món ({summaryRows.length} loại)
                </span>
                <span className="text-muted-fg text-xs flex items-center gap-1">
                  {summaryOpen ? <><ChevronDown size={14} /> Ẩn</> : <><ChevronRight size={14} /> Hiện</>}
                </span>
              </button>

              {summaryOpen && (
                <>
        {/* Column headers — same as Món đã chọn */}
        <div className="flex items-center gap-2 py-2 border-b border-border bg-background/30 text-[10px] font-bold text-muted-fg uppercase tracking-wide">
          <span className="flex-1">Món</span>
          <span className="w-10 text-center">Tổng</span>
          <span className="w-12 text-center">Còn</span>
          <span className="w-12" />
        </div>

        {/* One row per product */}
        {summaryRows.map((row) => (
          <div key={row.key} className="flex items-start gap-2 py-2 border-t border-border/40 text-xs">
            {/* Món — name + toppings */}
            <div className="flex-1 min-w-0">
              <span className="block text-sm text-foreground truncate leading-snug">
                {row.name}
              </span>
              {row.toppings.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {row.toppings.map((t, ti) => (
                    <span key={ti} className="inline-flex items-center text-[10px] text-muted-fg bg-muted/60 px-1.5 py-0.5 rounded">
                      + {t.name}
                      {t.price > 0 && <span className="ml-0.5 text-primary">&nbsp;{formatVND(t.price)}</span>}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tổng */}
            <span className="w-10 text-center font-medium text-foreground shrink-0">×{row.totalQty}</span>

            {/* Còn */}
            <span className="w-12 text-center shrink-0">
              {row.remaining > 0
                ? <span className="bg-primary/20 text-primary font-semibold px-1.5 py-0.5 rounded">×{row.remaining}</span>
                : <span className="text-success font-medium">✓</span>}
            </span>

            {/* Action */}
            <span className="w-12 flex justify-end shrink-0">
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
                </>
              )}
            </div>

            {/* Money summary */}
            <div className="pt-2 border-t border-border divide-y divide-border/50">
              <div className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-muted-fg">Đã dùng ({totalServed} phần)</span>
                <span className="font-semibold text-success">{formatVND(eatenAmount)}</span>
              </div>
              {remainingAmount > 0 && (
                <div className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-muted-fg">Còn lại ({totalQty - totalServed} phần chưa ra)</span>
                  <span className="font-semibold text-primary">{formatVND(remainingAmount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-bold text-foreground">Tổng cộng</span>
                <span className="text-lg font-bold text-foreground">{formatVND(order.total_amount)}</span>
              </div>
            </div>
          </div>
      </section>

      {/* ── Completed banner ────────────────────────────────────────── */}
      {order.status === 'delivered' && (
        <div className="bg-green-900/20 border border-success/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <CheckCircle size={18} className="text-success shrink-0" />
          <div>
            <p className="text-sm font-semibold text-success">Đơn hàng đã hoàn thành</p>
            <p className="text-xs text-muted-fg mt-0.5">Cảm ơn bạn đã dùng bữa! Bạn có thể đặt thêm bên dưới.</p>
          </div>
        </div>
      )}

      {/* ── Cancel whole order ──────────────────────────────────────── */}
      {canCancelOrder && (
        <button
          onClick={() => setCancelTarget({ type: 'order' })}
          className="w-full border border-urgent text-urgent py-3 rounded-xl text-sm font-medium hover:bg-red-900/20 transition-colors"
        >
          Huỷ toàn bộ đơn hàng
        </button>
      )}

      {/* ── Add more dishes ─────────────────────────────────────────── */}
      {order.table_id && (
        <button
          onClick={() => {
            setTableId(order.table_id!)
            setActiveOrderId(isActive ? orderId : null)
            router.push(isActive ? `/menu?add_to_order=${orderId}` : '/menu')
          }}
          className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          {isActive ? 'Thêm món' : 'Đặt thêm món'}
        </button>
      )}

      {/* ── Order notification modal ────────────────────────────────── */}
      {notification && (
        <div role="dialog" aria-modal="true" aria-labelledby="modal-a-title" className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm space-y-4 text-center">
            {notification.kind === 'confirmed' ? (
              <>
                <div className="w-14 h-14 rounded-full bg-green-900/40 flex items-center justify-center mx-auto">
                  <CheckCircle size={28} className="text-green-400" />
                </div>
                <div>
                  <h3 id="modal-a-title" className="font-bold text-lg text-foreground">Nhà hàng đã nhận đơn!</h3>
                  <p className="text-muted-fg text-sm mt-1">
                    {notification.eta
                      ? `Dự kiến phục vụ trong khoảng ${notification.eta} phút.`
                      : 'Chúng tôi đang chuẩn bị món cho bạn.'}
                  </p>
                </div>
              </>
            ) : notification.kind === 'ready' ? (
              <>
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <Bell size={28} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Đến lượt bàn của bạn!</h3>
                  <p className="text-muted-fg text-sm mt-1">
                    Món của bạn sắp được mang ra. Hãy chuẩn bị nhé!
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-red-900/40 flex items-center justify-center mx-auto">
                  <XCircle size={28} className="text-urgent" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Đơn hàng đã bị huỷ</h3>
                  <p className="text-muted-fg text-sm mt-1">
                    Nhà hàng đã huỷ đơn của bạn. Vui lòng liên hệ nhân viên.
                  </p>
                </div>
              </>
            )}
            <button
              onClick={clearNotification}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* ── Confirm modal ───────────────────────────────────────────── */}
      {cancelTarget && (
        <div role="dialog" aria-modal="true" aria-labelledby="modal-b-title" className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-urgent" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 id="modal-b-title" className="font-bold text-base text-foreground">
                  {cancelTarget.type === 'order' ? 'Huỷ đơn hàng?'
                    : cancelTarget.type === 'combo-remaining' ? 'Huỷ món còn lại?'
                    : 'Huỷ món này?'}
                </h3>
                <p className="text-muted-fg text-sm mt-1">
                  {cancelTarget.type === 'order'
                    ? 'Toàn bộ đơn sẽ bị huỷ. Không thể hoàn tác.'
                    : cancelTarget.type === 'combo-remaining'
                    ? `Huỷ ${cancelTarget.remainingItems?.length} món chưa ra của "${cancelTarget.comboName ?? cancelTarget.itemName}".`
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
  item:        OrderItem
  isActive:    boolean
  indent?:     boolean
  onCancel:    () => void
}) {
  const remaining   = item.quantity - item.qty_served
  const toppings    = (item.toppings_snapshot ?? []).filter(
    (t: ToppingSnapshotEntry) => t.name && t.name.trim() !== ''
  )

  return (
    <div className={`flex items-start gap-2 py-2 border-t border-border/40 text-xs ${indent ? 'pl-3' : ''}`}>
      {/* Món — name + toppings */}
      <div className="flex-1 min-w-0">
        <span className="text-sm text-foreground leading-snug">{item.name}</span>
        {toppings.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {toppings.map((t: ToppingSnapshotEntry) => (
              <span
                key={t.id}
                className="inline-flex items-center text-[10px] text-muted-fg bg-muted/60 px-1.5 py-0.5 rounded"
              >
                + {t.name}
                {t.price > 0 && (
                  <span className="ml-0.5 text-primary">&nbsp;{formatVND(t.price)}</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tổng */}
      <span className="w-10 text-center font-medium text-foreground shrink-0">×{item.quantity}</span>

      {/* Còn */}
      <span className="w-12 text-center shrink-0">
        {remaining > 0
          ? <span className="bg-primary/20 text-primary font-semibold px-1.5 py-0.5 rounded">×{remaining}</span>
          : <span className="text-success font-medium">✓</span>}
      </span>

      {/* Action */}
      <span className="w-12 flex justify-end shrink-0">
        {remaining > 0 && isActive && (
          <button
            onClick={onCancel}
            className="text-[11px] text-urgent border border-urgent/50 px-1.5 py-0.5 rounded hover:bg-red-900/20 transition-colors font-medium"
          >
            Huỷ
          </button>
        )}
      </span>
    </div>
  )
}

// ── helpers ───────────────────────────────────────────────────────────────────

function errMsg(err: unknown): string | undefined {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message
}
