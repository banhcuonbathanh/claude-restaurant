'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, ClipboardList, Settings, Heart } from 'lucide-react'
import { useSettingsStore } from '@/store/settings'
import { useFavouritesStore } from '@/store/favourites'
import { useCartStore } from '@/store/cart'

interface Props {
  hasOrders: boolean
  onCartClick: () => void
}

export function MenuHeader({ hasOrders, onCartClick }: Props) {
  const router               = useRouter()
  const { tableLabel }       = useSettingsStore()
  const { items: favItems }  = useFavouritesStore()
  const count                = useCartStore(s => s.itemCount())

  return (
    <header className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex flex-col leading-none min-w-0">
        <h1 className="font-display text-xl text-foreground font-semibold truncate">Quán Bánh Cuốn</h1>
        {tableLabel && (
          <span className="text-xs text-muted-fg mt-0.5 truncate">{tableLabel}</span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href="/menu/favourites"
          className="relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors"
          aria-label="Yêu thích"
        >
          <Heart
            size={18}
            className={favItems.length > 0 ? 'text-red-500 fill-red-500' : 'text-red-400/60'}
          />
          {favItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
              {favItems.length > 9 ? '9+' : favItems.length}
            </span>
          )}
        </Link>
        <Link
          href="/menu/settings"
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors"
          aria-label="Cài đặt"
        >
          <Settings size={18} className="text-muted-fg" />
        </Link>
        <button
          onClick={() => router.push('/order')}
          className="relative flex items-center gap-1.5 bg-muted text-foreground px-3 py-1.5 rounded-full text-sm font-medium"
        >
          <ClipboardList size={16} />
          <span className="hidden sm:inline">Đơn hàng</span>
          {hasOrders && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full" />
          )}
        </button>
        <button
          onClick={onCartClick}
          aria-label="Giỏ hàng"
          className="relative flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium"
        >
          <ShoppingCart size={16} />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
