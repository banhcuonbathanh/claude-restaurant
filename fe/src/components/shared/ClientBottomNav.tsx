'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UtensilsCrossed, ReceiptText, Heart, RefreshCw } from 'lucide-react'

interface Props {
  /** Current order id — enables the "Đơn Hàng" tab to deep-link to the order detail. */
  orderId?: string | null
  onRefresh?: () => void
}

const itemBase =
  'flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] transition-colors group'

function pill(active: boolean) {
  return `flex items-center justify-center w-11 h-7 rounded-full transition-all ${
    active
      ? 'bg-primary/15 text-primary'
      : 'text-muted-fg group-hover:bg-muted group-hover:text-foreground group-active:scale-95'
  }`
}

function label(active: boolean) {
  return `text-[11px] font-medium transition-colors ${
    active ? 'text-primary' : 'text-muted-fg group-hover:text-foreground'
  }`
}

export function ClientBottomNav({ orderId, onRefresh }: Props) {
  const pathname = usePathname()
  const [spinning, setSpinning] = useState(false)

  const isMenu  = pathname?.startsWith('/menu') && !pathname.startsWith('/menu/favourites')
  const isOrder = pathname?.startsWith('/order') || pathname?.startsWith('/tracking')
  const isFav   = pathname?.startsWith('/menu/favourites')

  const handleRefresh = () => {
    onRefresh?.()
    setSpinning(true)
    setTimeout(() => setSpinning(false), 600)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-card/95 backdrop-blur-sm shadow-[0_-4px_24px_-10px_rgba(0,0,0,0.7)] pb-safe">
      <div className="max-w-lg mx-auto flex">
        <Link href="/menu" className={itemBase} aria-current={isMenu ? 'page' : undefined}>
          <span className={pill(!!isMenu)}>
            <UtensilsCrossed size={19} />
          </span>
          <span className={label(!!isMenu)}>Menu</span>
        </Link>

        <Link
          href={orderId ? `/order/${orderId}` : '/tracking'}
          className={itemBase}
          aria-current={isOrder ? 'page' : undefined}
        >
          <span className={pill(!!isOrder)}>
            <ReceiptText size={19} />
          </span>
          <span className={label(!!isOrder)}>Đơn Hàng</span>
        </Link>

        <Link
          href="/menu/favourites"
          className={itemBase}
          aria-current={isFav ? 'page' : undefined}
        >
          <span className={pill(!!isFav)}>
            <Heart size={19} />
          </span>
          <span className={label(!!isFav)}>Yêu Thích</span>
        </Link>

        <button onClick={handleRefresh} className={itemBase} aria-label="Làm mới">
          <span className={pill(false)}>
            <RefreshCw size={19} className={spinning ? 'animate-spin' : ''} />
          </span>
          <span className={label(false)}>Làm Mới</span>
        </button>
      </div>
    </nav>
  )
}
