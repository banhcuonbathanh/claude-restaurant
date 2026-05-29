'use client'
import { useState, useEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import { useCartStore } from '@/store/cart'

export function OrderNote({ embedded }: { embedded?: boolean }) {
  const { orderNote, setOrderNote } = useCartStore()
  const [saved, setSaved] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (value: string) => {
    setOrderNote(value)
    setSaved(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setSaved(true), 800)
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return (
    <section className={embedded ? 'border-t border-border px-5 py-4' : 'mx-4 mt-4 bg-card rounded-xl p-4 shadow-sm'}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-muted-fg uppercase tracking-wide">Ghi chú</h2>
        {saved && orderNote.length > 0 && (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <Check size={12} />
            Đã lưu
          </span>
        )}
      </div>
      <textarea
        value={orderNote}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Nhập ghi chú cho nhà hàng... (tự động lưu)"
        rows={3}
        className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-fg outline-none focus:ring-2 focus:ring-primary/30 resize-none"
      />
      <p className="text-xs text-muted-fg mt-1.5">
        Ghi chú sẽ gửi cùng đơn hàng khi bạn thanh toán.
      </p>
    </section>
  )
}
