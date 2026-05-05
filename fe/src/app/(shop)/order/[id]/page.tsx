'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp, Package, Utensils, AlertTriangle } from 'lucide-react'
import { useOrderSSE } from '@/hooks/useOrderSSE'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConnectionErrorBanner } from '@/components/shared/ConnectionErrorBanner'
import { api } from '@/lib/api-client'
import { formatVND, formatDateTime } from '@/lib/utils'
import type { OrderItem } from '@/types/order'

interface ComboGroup {
  comboRefId: string
  comboName:  string
  items:      OrderItem[]
  totalPrice: number
}

interface CancelTarget {
  type:           'item' | 'combo-remaining' | 'order'
  itemId?:        string
  itemName?:      string
  comboRefId?:    string
  comboName?:     string
  remainingCount?: number
}

export default function OrderPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { order, progress, connectionError } = useOrderSSE(params.id)
  const [cancelTarget, setCancelTarget]     = useState<CancelTarget | null>(null)
  const [expandedCombos, setExpandedCombos] = useState<Set<string>>(new Set())

  const cancelOrderMutation = useMutation({
    mutationFn: () => api.delete(`/orders/${params.id}`),
    onSuccess: () => {
      toast.success('Đã huỷ đơn hàng')
      router.push('/menu')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message
      toast.error(msg ?? 'Không thể huỷ đơn')
      setCancelTarget(null)
    },
  })

  const cancelItemMutation = useMutation({
    mutationFn: (itemId: string) => api.delete(`/orders/items/${itemId}`),
    onSuccess: () => {
      toast.success('Đã huỷ món')
      setCancelTarget(null)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message
      toast.error(msg ?? 'Không thể huỷ món này')
      setCancelTarget(null)
    },
  })

  const cancelComboRemainingMutation = useMutation({
    mutationFn: (itemIds: string[]) =>
      Promise.all(itemIds.map(id => api.delete(`/orders/items/${id}`))),
    onSuccess: () => {
      toast.success('Đã huỷ các món còn lại trong combo')
      setCancelTarget(null)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message
      toast.error(msg ?? 'Không thể huỷ món')
      setCancelTarget(null)
    },
  })

  const { comboGroups, standaloneItems, totalServed, totalRemaining } = useMemo(() => {
    if (!order) return { comboGroups: [], standaloneItems: [], totalServed: 0, totalRemaining: 0 }

    const comboParentMap = new Map<string, string>()
    for (const item of order.items) {
      if (item.combo_id !== null && item.combo_ref_id === null) {
        comboParentMap.set(item.id, item.name)
      }
    }

    const comboSubItems  = order.items.filter(i => i.combo_id !== null && i.combo_ref_id !== null)
    const standalone     = order.items.filter(i => i.combo_id === null)
    const countableItems = [...comboSubItems, ...standalone]

    const groupMap = new Map<string, ComboGroup>()
    for (const item of comboSubItems) {
      const refId = item.combo_ref_id!
      if (!groupMap.has(refId)) {
        groupMap.set(refId, {
          comboRefId: refId,
          comboName:  comboParentMap.get(refId) ?? 'Combo',
          items:      [],
          totalPrice: 0,
        })
      }
      const grp = groupMap.get(refId)!
      grp.items.push(item)
      grp.totalPrice += item.unit_price * item.quantity
    }

    let totalServed    = 0
    let totalRemaining = 0
    for (const item of countableItems) {
      totalServed    += item.qty_served
      totalRemaining += item.quantity - item.qty_served
    }

    return {
      comboGroups:     Array.from(groupMap.values()),
      standaloneItems: standalone,
      totalServed,
      totalRemaining,
    }
  }, [order])

  const toggleCombo = (id: string) =>
    setExpandedCombos(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleConfirmCancel = () => {
    if (!cancelTarget) return
    if (cancelTarget.type === 'order') {
      cancelOrderMutation.mutate()
    } else if (cancelTarget.type === 'item' && cancelTarget.itemId) {
      cancelItemMutation.mutate(cancelTarget.itemId)
    } else if (cancelTarget.type === 'combo-remaining' && cancelTarget.comboRefId) {
      const group = comboGroups.find(g => g.comboRefId === cancelTarget.comboRefId)
      if (!group) return
      const ids = group.items.filter(i => i.qty_served < i.quantity).map(i => i.id)
      cancelComboRemainingMutation.mutate(ids)
    }
  }

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

  const isActive       = order.status !== 'delivered' && order.status !== 'cancelled'
  const canCancelOrder = progress < 30 && isActive
  const isPending      =
    cancelOrderMutation.isPending ||
    cancelItemMutation.isPending  ||
    cancelComboRemainingMutation.isPending

  return (
    <div className="min-h-screen bg-background pb-10">
      {connectionError && <ConnectionErrorBanner />}

      {/* Sticky header */}
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

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">

        {/* Progress section */}
        <section className="bg-card rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-fg">Tiến độ đơn hàng</span>
            <span className="font-bold text-success text-base">{progress}%</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex gap-5 text-xs">
            <span className="text-muted-fg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success inline-block" />
              Đã ra: <span className="text-foreground font-medium ml-0.5">{totalServed} phần</span>
            </span>
            <span className="text-muted-fg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-warning inline-block" />
              Đang làm: <span className="text-foreground font-medium ml-0.5">{totalRemaining} phần</span>
            </span>
          </div>
        </section>

        {/* Combos */}
        {comboGroups.length > 0 && (
          <section>
            <SectionLabel icon={<Package size={13} />} label="Combo" />
            <div className="space-y-3">
              {comboGroups.map(group => {
                const isExpanded  = expandedCombos.has(group.comboRefId)
                const allDone     = group.items.every(i => i.qty_served >= i.quantity)
                const hasPartial  = group.items.some(i => i.qty_served > 0 && i.qty_served < i.quantity)
                const hasRemaining = group.items.some(i => i.qty_served < i.quantity)

                return (
                  <div key={group.comboRefId} className="bg-card rounded-xl overflow-hidden">
                    {/* Combo header row */}
                    <button
                      onClick={() => toggleCombo(group.comboRefId)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-background/40 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-semibold text-sm text-foreground truncate">
                          {group.comboName}
                        </span>
                        <ItemStatusBadge
                          status={allDone ? 'done' : hasPartial ? 'preparing' : 'pending'}
                        />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {formatVND(group.totalPrice)}
                        </span>
                        {isExpanded
                          ? <ChevronUp  size={14} className="text-muted-fg" />
                          : <ChevronDown size={14} className="text-muted-fg" />}
                      </div>
                    </button>

                    {/* Combo sub-items */}
                    {isExpanded && (
                      <div className="border-t border-border">
                        {group.items.map((item, idx) => {
                          const remaining  = item.quantity - item.qty_served
                          const itemStatus = deriveStatus(item.qty_served, item.quantity)
                          return (
                            <div
                              key={item.id}
                              className={`px-4 py-3 ${idx < group.items.length - 1 ? 'border-b border-border/50' : ''}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-foreground font-medium">{item.name}</p>
                                  <div className="flex flex-wrap items-center gap-3 mt-1">
                                    <span className="text-xs text-muted-fg">
                                      Đã ra:{' '}
                                      <span className="text-success font-medium">
                                        {item.qty_served}/{item.quantity}
                                      </span>
                                    </span>
                                    {remaining > 0 && (
                                      <span className="text-xs text-muted-fg">
                                        Còn:{' '}
                                        <span className="text-warning font-medium">{remaining}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right shrink-0 space-y-1">
                                  <p className="text-xs text-muted-fg">
                                    {formatVND(item.unit_price)} × {item.quantity}
                                  </p>
                                  <ItemStatusBadge status={itemStatus} />
                                </div>
                              </div>
                              {remaining > 0 && isActive && (
                                <button
                                  onClick={() =>
                                    setCancelTarget({
                                      type:     'item',
                                      itemId:   item.id,
                                      itemName: item.name,
                                    })
                                  }
                                  className="mt-2.5 w-full text-xs text-urgent border border-urgent/40 py-1.5 rounded-lg hover:bg-red-900/20 transition-colors font-medium"
                                >
                                  Huỷ món này
                                </button>
                              )}
                            </div>
                          )
                        })}

                        {/* Cancel all remaining dishes in this combo */}
                        {hasRemaining && isActive && (
                          <div className="px-4 py-3 border-t border-border/50 bg-background/30">
                            <button
                              onClick={() =>
                                setCancelTarget({
                                  type:           'combo-remaining',
                                  comboRefId:     group.comboRefId,
                                  comboName:      group.comboName,
                                  remainingCount: group.items.filter(
                                    i => i.qty_served < i.quantity,
                                  ).length,
                                })
                              }
                              className="w-full text-xs text-urgent border border-urgent/40 py-2 rounded-lg hover:bg-red-900/20 transition-colors font-medium"
                            >
                              Huỷ tất cả món còn lại trong combo này
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Standalone products */}
        {standaloneItems.length > 0 && (
          <section>
            <SectionLabel icon={<Utensils size={13} />} label="Món lẻ" />
            <div className="bg-card rounded-xl divide-y divide-border overflow-hidden">
              {standaloneItems.map(item => {
                const remaining  = item.quantity - item.qty_served
                const itemStatus = deriveStatus(item.qty_served, item.quantity)
                const toppings   = toppingNames(item.topping_snapshot)
                return (
                  <div key={item.id} className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        {toppings && (
                          <p className="text-xs text-muted-fg mt-0.5">+ {toppings}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                          <span className="text-xs text-muted-fg">
                            Đã ra:{' '}
                            <span className="text-success font-medium">
                              {item.qty_served}/{item.quantity}
                            </span>
                          </span>
                          {remaining > 0 && (
                            <span className="text-xs text-muted-fg">
                              Còn:{' '}
                              <span className="text-warning font-medium">{remaining} phần</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-1 shrink-0">
                        <p className="text-sm font-semibold text-primary">
                          {formatVND(item.unit_price * item.quantity)}
                        </p>
                        <p className="text-xs text-muted-fg">
                          {formatVND(item.unit_price)} × {item.quantity}
                        </p>
                        <ItemStatusBadge status={itemStatus} />
                      </div>
                    </div>
                    {remaining > 0 && isActive && (
                      <button
                        onClick={() =>
                          setCancelTarget({
                            type:     'item',
                            itemId:   item.id,
                            itemName: item.name,
                          })
                        }
                        className="mt-2.5 w-full text-xs text-urgent border border-urgent/40 py-1.5 rounded-lg hover:bg-red-900/20 transition-colors font-medium"
                      >
                        Huỷ món này
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Order total */}
        <div className="flex items-center justify-between bg-card rounded-xl px-4 py-3">
          <span className="text-muted-fg text-sm">Tổng cộng</span>
          <span className="text-primary text-xl font-bold">{formatVND(order.total_amount)}</span>
        </div>

        {/* Cancel whole order */}
        {canCancelOrder && (
          <button
            onClick={() => setCancelTarget({ type: 'order' })}
            className="w-full border border-urgent text-urgent py-3 rounded-xl font-medium hover:bg-red-900/20 transition-colors text-sm"
          >
            Huỷ toàn bộ đơn hàng
          </button>
        )}
      </div>

      {/* Confirm modal */}
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
                    ? 'Huỷ các món còn lại?'
                    : 'Huỷ món này?'}
                </h3>
                <p className="text-muted-fg text-sm mt-1">
                  {cancelTarget.type === 'order'
                    ? 'Toàn bộ đơn hàng sẽ bị huỷ. Không thể hoàn tác.'
                    : cancelTarget.type === 'combo-remaining'
                    ? `Huỷ ${cancelTarget.remainingCount} món chưa ra của combo "${cancelTarget.comboName}".`
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
                onClick={handleConfirmCancel}
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

// ─── helpers ───────────────────────────────────────────────────────────────

type ItemStatus = 'pending' | 'preparing' | 'done'

function deriveStatus(qtyServed: number, quantity: number): ItemStatus {
  if (qtyServed === 0)          return 'pending'
  if (qtyServed >= quantity)    return 'done'
  return 'preparing'
}

function toppingNames(snapshot: object | null): string | null {
  if (!snapshot) return null
  const vals = Object.values(snapshot as Record<string, unknown>)
    .filter((v): v is string => typeof v === 'string')
  return vals.length > 0 ? vals.join(', ') : null
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2 px-1">
      <span className="text-muted-fg">{icon}</span>
      <span className="text-xs font-semibold text-muted-fg uppercase tracking-wide">{label}</span>
    </div>
  )
}

function ItemStatusBadge({ status }: { status: ItemStatus }) {
  const styles: Record<ItemStatus, string> = {
    done:      'bg-green-900 text-success',
    preparing: 'bg-yellow-900 text-warning',
    pending:   'bg-muted text-muted-fg',
  }
  const labels: Record<ItemStatus, string> = {
    done:      'Xong',
    preparing: 'Đang làm',
    pending:   'Chờ',
  }
  return (
    <span className={`inline-block text-xs px-1.5 py-0.5 rounded font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}
