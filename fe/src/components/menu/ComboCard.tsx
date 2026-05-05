'use client'
import Image from 'next/image'
import { Plus, Minus } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import type { Combo } from '@/types/product'
import { formatVND } from '@/lib/utils'

interface Props {
  combo: Combo
}

export function ComboCard({ combo }: Props) {
  const { items, addItem, updateQty } = useCartStore()

  const cartId   = `combo_${combo.id}`
  const cartItem = items.find(i => i.id === cartId)
  const qty      = cartItem?.quantity ?? 0

  const imageUrl = combo.image_path
    ? `${process.env.NEXT_PUBLIC_STORAGE_URL ?? ''}/${combo.image_path}`
    : null

  const handleAdd = () => {
    if (qty === 0) {
      addItem({
        id:          cartId,
        type:        'combo',
        combo_id:    combo.id,
        name:        combo.name,
        quantity:    1,
        price:       combo.price,
        toppings:    [],
        combo_items: comboItems.map(i => ({ product_name: i.product_name, quantity: i.quantity })),
      })
    } else {
      updateQty(cartId, qty + 1)
    }
  }

  const comboItems = combo.items ?? []

  return (
    <div className="bg-card rounded-xl flex gap-3 p-3 shadow-sm">
      {/* Image */}
      <div className="relative w-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted" style={{ minHeight: '80px' }}>
        {imageUrl ? (
          <Image src={imageUrl} alt={combo.name} fill className="object-cover" sizes="80px" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🍱</div>
        )}
        {!combo.is_available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">Hết</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Name + price */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-foreground text-sm font-semibold leading-snug flex-1">{combo.name}</p>
          <p className="text-primary font-bold text-sm flex-shrink-0">{formatVND(combo.price)}</p>
        </div>

        {/* Combo items — always visible, one per line */}
        {comboItems.length > 0 && (
          <ul className="space-y-0.5 mt-0.5">
            {comboItems.map(item => (
              <li key={item.product_id} className="text-muted-fg text-xs flex items-center gap-1.5">
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  ×{item.quantity}
                </span>
                <span>{item.product_name}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Qty control */}
        <div className="flex items-center justify-end mt-2">
          {qty === 0 ? (
            <button
              onClick={handleAdd}
              disabled={!combo.is_available}
              className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center
                         hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQty(cartId, qty - 1)}
                className="bg-muted text-foreground w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="text-foreground text-sm font-bold w-4 text-center">{qty}</span>
              <button
                onClick={handleAdd}
                className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
