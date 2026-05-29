'use client'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart'

interface Props {
  title:     string
  showCart?: boolean
  onBack:    () => void
}

export function FavouritesTopNav({ title, showCart, onBack }: Props) {
  const itemCount = useCartStore(s => s.itemCount())

  return (
    <header className="sticky top-0 z-20 flex items-center h-14 px-4 bg-[#1e293b] text-white shadow-sm">
      <button
        onClick={onBack}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full -ml-2 hover:bg-white/10 active:bg-white/20 transition-colors"
        aria-label="Quay lại"
      >
        <ArrowLeft size={20} />
      </button>

      <h1 className="flex-1 text-center text-sm font-semibold truncate px-2">{title}</h1>

      <div className="min-h-[44px] min-w-[44px] flex items-center justify-center relative -mr-2">
        {showCart && (
          <>
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-primary text-white text-[10px] font-bold leading-none rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </>
        )}
      </div>
    </header>
  )
}
