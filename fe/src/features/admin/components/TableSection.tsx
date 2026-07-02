'use client'
import { useState, type ReactNode } from 'react'
import type { Order } from '@/types/order'
import type { Table } from '@/features/admin/admin.api'
import { TableList } from './TableList'
import { TableGrid } from './TableGrid'
import { ViewToggleHeader } from './ViewToggleHeader'
import { DishSummaryStrip } from './DishSummaryStrip'
import { ConfirmedPrepList } from './ConfirmedPrepList'

// Zone D shell — owns viewMode and composes D1 (ViewToggleHeader) · D2 (DishSummaryStrip) ·
// belowSummary slot (WaitingSection / Zone B) · D4 (ConfirmedPrepList) · D3 (TableList | TableGrid).
interface Props {
  tables:          Table[]
  listOrders:      Order[]   // TableList view
  gridOrders:      Order[]   // TableGrid view
  now:             number
  loadingIds:      Set<string>
  checkedTableIds: Set<string>
  onAction:        (orderId: string, status: string) => Promise<void>
  onToggleCheck:   (tableId: string) => void
  onPaymentDone:   (orderId: string) => void
  onCancel:        (orderId: string) => Promise<void>
  belowSummary?:   ReactNode   // rendered between the dish summary and the Bàn list
  kiemTraTableIds?: Set<string>   // tables marked 🔍 Kiểm tra — shown as a +N delta in Tổng món
  onClearKiemTra?: () => void     // clears all Kiểm tra selections
  kiemTraIds?:     Set<string>    // order ids marked 🔍 Kiểm tra — forwarded to TableList rows
  onKiemTra?:      (orderId: string) => void
  prepPreviewIds?: Set<string>    // pending orders previewed in Zone D4 "Đơn hàng cần làm"
}

export function TableSection({
  tables,
  listOrders,
  gridOrders,
  now,
  loadingIds,
  checkedTableIds,
  onAction,
  onToggleCheck,
  onPaymentDone,
  onCancel,
  belowSummary,
  kiemTraTableIds,
  onClearKiemTra,
  kiemTraIds,
  onKiemTra,
  prepPreviewIds,
}: Props) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  return (
    <div>
      <ViewToggleHeader viewMode={viewMode} onViewMode={setViewMode} />

      <DishSummaryStrip
        tables={tables}
        listOrders={listOrders}
        kiemTraTableIds={kiemTraTableIds}
        onClearKiemTra={onClearKiemTra}
      />

      {belowSummary && <div className="mb-3">{belowSummary}</div>}

      {/* Zone D4 — dishes to prepare for confirmed orders (Canh/Giò excluded; self-guards on empty) */}
      <ConfirmedPrepList orders={listOrders} previewIds={prepPreviewIds} />

      {viewMode === 'list' ? (
        <TableList
          tables={tables}
          orders={listOrders}
          now={now}
          loadingIds={loadingIds}
          checkedTableIds={checkedTableIds}
          onAction={onAction}
          onToggleCheck={onToggleCheck}
          onPaymentDone={onPaymentDone}
          onCancel={onCancel}
          kiemTraIds={kiemTraIds}
          onKiemTra={onKiemTra}
        />
      ) : (
        <TableGrid
          tables={tables}
          orders={gridOrders}
          now={now}
          loadingIds={loadingIds}
          checkedTableIds={checkedTableIds}
          onAction={onAction}
          onToggleCheck={onToggleCheck}
        />
      )}
    </div>
  )
}
