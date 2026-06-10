'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UtensilsCrossed, ReceiptText, Heart, MapPin } from 'lucide-react'

/** Springy easing shared by the indicator + pills — overshoots, then settles. */
const SPRING = '[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]'

const itemBase =
  'relative flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] transition-colors group'

function pill(active: boolean) {
  return `flex items-center justify-center w-11 h-7 rounded-full duration-300 ${SPRING} transition-all ${
    active
      ? 'bg-primary/15 text-primary scale-110 shadow-[0_0_20px_-6px_var(--color-primary)]'
      : 'text-muted-fg scale-100 group-hover:bg-muted group-hover:text-foreground group-active:scale-90'
  }`
}

function label(active: boolean) {
  return `text-[11px] transition-colors ${
    active ? 'text-primary font-semibold' : 'text-muted-fg font-medium group-hover:text-foreground'
  }`
}

/** active index among the 4 nav tabs (-1 = none active, indicator hidden) */
function indicatorClass(active: number) {
  const visible = active >= 0
  return `pointer-events-none absolute top-0 left-0 h-[3px] w-1/4 px-3 duration-500 ${SPRING} transition-all ${
    visible ? 'opacity-100' : 'opacity-0'
  }`
}

export function ClientBottomNav() {
  const pathname = usePathname()

  const isMenu     = pathname?.startsWith('/menu') && !pathname.startsWith('/menu/favourites')
  const isOrder    = pathname?.startsWith('/order')
  const isFav      = pathname?.startsWith('/menu/favourites')
  const isTracking = pathname?.startsWith('/tracking')

  const activeIndex = isMenu ? 0 : isOrder ? 1 : isFav ? 2 : isTracking ? 3 : -1

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-card shadow-[0_-4px_24px_-10px_rgba(0,0,0,0.7)] pb-safe">
      <div className="relative max-w-lg mx-auto flex">
        {/* Sliding active indicator — glides between tabs with a spring */}
        <span
          className={indicatorClass(activeIndex)}
          style={{ transform: `translateX(${Math.max(activeIndex, 0) * 100}%)` }}
        >
          <span className="block h-full w-full rounded-full bg-primary shadow-[0_0_12px_0_var(--color-primary)]" />
        </span>

        <Link href="/menu" className={itemBase} aria-current={isMenu ? 'page' : undefined}>
          <span className={pill(!!isMenu)}>
            <UtensilsCrossed size={19} />
          </span>
          <span className={label(!!isMenu)}>Menu</span>
        </Link>

        <Link href="/order" className={itemBase} aria-current={isOrder ? 'page' : undefined}>
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
            <Heart size={19} className={isFav ? 'fill-primary' : ''} />
          </span>
          <span className={label(!!isFav)}>Yêu Thích</span>
        </Link>

        <Link href="/tracking" className={itemBase} aria-current={isTracking ? 'page' : undefined}>
          <span className={pill(!!isTracking)}>
            <MapPin size={19} />
          </span>
          <span className={label(!!isTracking)}>Theo Dõi</span>
        </Link>
      </div>
    </nav>
  )
}
