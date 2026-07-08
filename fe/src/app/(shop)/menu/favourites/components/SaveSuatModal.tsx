'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatVND } from '@/lib/utils'

export interface SuatSummaryLine {
  name: string
  qty:  number
  nhan?: string   // chosen nhân label
  note?: string   // ghi chú
}

interface Props {
  lines:     SuatSummaryLine[]
  count:     number
  total:     number
  onClose:   () => void
  onConfirm: (name: string) => void
}

// "Lưu suất này" modal — names the custom suất, shows its món-lẻ summary, then
// (per owner decision) both saves the recipe and adds the lines to the cart.
export function SaveSuatModal({ lines, count, total, onClose, onConfirm }: Props) {
  const [name, setName] = useState('')
  const canSave = name.trim().length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 py-6"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-background border border-border p-4 space-y-4">
        <h2 className="text-base font-bold text-foreground">Lưu suất tự tạo</h2>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Đặt tên cho suất này</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="vd: Suất sáng của tôi, Suất 2 người..."
            autoFocus
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-card text-foreground placeholder:text-muted-fg focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="max-h-52 overflow-y-auto rounded-xl border border-border divide-y divide-border">
          {lines.map((l, i) => (
            <div key={i} className="px-3 py-2">
              <div className="flex justify-between text-sm text-foreground">
                <span className="min-w-0 truncate">{l.name}</span>
                <span className="flex-shrink-0 tabular-nums text-muted-fg">× {l.qty}</span>
              </div>
              {(l.nhan || l.note) && (
                <p className="text-[11.5px] text-muted-fg mt-0.5">
                  {l.nhan && <span>{l.nhan}</span>}
                  {l.nhan && l.note && <span> · </span>}
                  {l.note && <span className="italic">“{l.note}”</span>}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-fg">{count} món</span>
          <span className="text-foreground">
            Tổng: <span className="font-bold text-primary tabular-nums">{formatVND(total)}</span>
          </span>
        </div>

        <div className="flex gap-2.5">
          <Button variant="outline" className="flex-1" onClick={onClose}>Huỷ</Button>
          <Button className="flex-1" disabled={!canSave} onClick={() => onConfirm(name.trim())}>
            Lưu &amp; thêm vào giỏ
          </Button>
        </div>
      </div>
    </div>
  )
}
