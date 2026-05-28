'use client'
import { useCartStore } from '@/store/cart'

export function OrderNote() {
  const { orderNote, setOrderNote } = useCartStore()

  return (
    <section className="mx-4 mt-4 bg-card rounded-xl p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-muted-fg uppercase tracking-wide mb-3">Ghi chú</h2>
      <textarea
        value={orderNote}
        onChange={(e) => setOrderNote(e.target.value)}
        placeholder="Nhập ghi chú cho nhà hàng..."
        rows={3}
        className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-fg outline-none focus:ring-2 focus:ring-primary/30 resize-none"
      />
    </section>
  )
}
