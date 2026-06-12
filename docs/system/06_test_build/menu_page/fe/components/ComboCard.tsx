// P-SYSTEST reference build — Zone E card (TOP epic: nhân pills from sub-item toppings,
// cart id combo_<id>_<toppingId|plain>, ComboModal confirm path); not imported by the app.
'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Plus, Minus, Heart } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '../store/cart'
import { useFavouritesStore } from '../store/favourites'
import type { Combo, Topping } from '../types/product'
import { formatVND } from '../lib/utils'
import { ComboModal } from './ComboModal'

interface Props {
  combo: Combo
}

export function ComboCard({ combo }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [nhanId, setNhanId]       = useState<string>('')
  const { items, addItem, updateQty } = useCartStore()
  const { toggleFav, isFavourite } = useFavouritesStore()
  const fav = isFavourite(combo.id, 'combo')

  const comboItems = combo.items ?? []

  // Derive nhân options from the BÁNH sub-items' toppings (dedup by id). Canh is excluded —
  // its "Rau" topping is driven by the global canh stepper, not the combo nhân picker.
  const isSoupName = (name: string) =>
    name.toLowerCase().includes('canh') || name.toLowerCase().includes('nước dùng')
  const nhanOptions: Topping[] = Array.from(
    new Map(
      comboItems
        .filter(ci => !isSoupName(ci.product_name))
        .flatMap(ci => ci.toppings ?? [])
        .filter(t => t.is_available)
        .map(t => [t.id, t])
    ).values()
  )

  const selectedNhan = nhanOptions.find(t => t.id === nhanId) ?? nhanOptions[0]

  const cartId   = `combo_${combo.id}_${selectedNhan?.id ?? 'plain'}`
  const cartItem = items.find(i => i.id === cartId)
  const qty      = cartItem?.quantity ?? 0

  const imageUrl = combo.image_path
    ? `${process.env.NEXT_PUBLIC_STORAGE_URL ?? ''}/${combo.image_path}`
    : null

  const handleAdd = () => {
    if (qty === 0) {
      // First add carries the FULL combo_items snapshot — OrderSummary edits it,
      // order-payload.ts turns it into combo_items overrides.
      addItem({
        id:          cartId,
        type:        'combo',
        combo_id:    combo.id,
        name:        combo.name,
        quantity:    1,
        price:       combo.price,
        toppings:    selectedNhan ? [selectedNhan] : [],
        combo_items: comboItems.map(i => ({
          product_id:   i.product_id,
          product_name: i.product_name,
          quantity:     i.quantity,
          unit_price:   i.unit_price,
          toppings:     i.toppings,
        })),
      })
    } else {
      updateQty(cartId, qty + 1)
    }
  }

  const handleModalConfirm = () => {
    handleAdd()
    setModalOpen(false)
  }

  return (
    <div className="bg-card rounded-xl flex gap-3 p-3 shadow-sm">
      {/* Image */}
      <div className="relative w-20 flex-shrink-0" style={{ minHeight: '80px' }}>
        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
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
        <button
          onClick={() => toggleFav(combo.id, 'combo')}
          className="absolute top-1 right-1 bg-white/80 rounded-full p-1.5"
          aria-label={fav ? 'Bỏ yêu thích' : 'Yêu thích'}
        >
          <Heart size={16} className={fav ? 'fill-red-500 text-red-500' : 'text-muted-fg'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-foreground text-sm font-semibold leading-snug">{combo.name}</p>

        {/* Combo items — always visible, one per line */}
        {comboItems.length > 0 && (
          <ul className="space-y-0.5 mt-1">
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

        <div className="mt-2">
          <Link
            href={`/menu/combo/${combo.id}`}
            className="text-xs text-primary underline underline-offset-2"
          >
            Chi tiết
          </Link>
        </div>
      </div>

      {/* Right column — price · qty control · nhân pills */}
      <div className="flex-shrink-0 w-28 flex flex-col items-stretch gap-2.5">
        <p className="text-primary font-bold text-sm text-center">{formatVND(combo.price)}</p>

        <div className="flex-1 flex items-center justify-between">
          <button
            onClick={() => updateQty(cartId, qty - 1)}
            disabled={qty === 0}
            className="bg-muted text-foreground w-8 h-8 rounded-full flex items-center justify-center
                       hover:bg-muted/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Minus size={14} />
          </button>
          <span className="text-foreground text-sm font-bold text-center">{qty}</span>
          <button
            onClick={handleAdd}
            disabled={!combo.is_available}
            className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center
                       hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Nhân selector — data-driven pills, single-select; switching pills switches cartId */}
        {nhanOptions.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {nhanOptions.map(nhan => (
              <button
                key={nhan.id}
                onClick={() => setNhanId(nhan.id)}
                className={`w-full text-center text-[11px] px-2 py-1 rounded-full border transition-colors ${
                  (selectedNhan?.id === nhan.id)
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-muted-fg hover:border-primary/50'
                }`}
              >
                {nhan.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <ComboModal
        combo={combo}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleModalConfirm}
      />
    </div>
  )
}
