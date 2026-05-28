'use client'
import Image from 'next/image'
import type { Combo } from '@/types/product'
import { formatVND } from '@/lib/utils'

interface Props {
  combo:     Combo
  open:      boolean
  onClose:   () => void
  onConfirm: () => void
}

export function ComboModal({ combo, open, onClose, onConfirm }: Props) {
  if (!open) return null

  const imageUrl = combo.image_path
    ? `${process.env.NEXT_PUBLIC_STORAGE_URL ?? ''}/${combo.image_path}`
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-card rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-xl overflow-hidden">
        {imageUrl && (
          <div className="relative w-full h-48">
            <Image src={imageUrl} alt={combo.name} fill className="object-cover" />
          </div>
        )}

        <div className="p-5">
          <h2 className="font-display text-lg text-foreground font-semibold">{combo.name}</h2>
          <p className="text-primary font-bold text-base mb-4">{formatVND(combo.price)}</p>

          <div className="space-y-1 mb-5">
            {combo.items.map((item) => (
              <p key={item.product_id} className="text-muted-fg text-sm">
                {item.quantity}x {item.product_name}
              </p>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-border text-muted-fg text-sm hover:bg-muted transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={onConfirm}
              disabled={!combo.is_available}
              className="flex-1 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              Thêm combo vào giỏ
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
