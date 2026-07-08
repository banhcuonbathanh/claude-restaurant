'use client'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

// Speed-dial FAB — a round trigger anchored on the RIGHT, just above the bottom bar.
// Rendered from the favourites layout so it persists across every favourites page and
// is the ONLY navigation between the sections (it replaces the old segment tabs):
// it slides links to whichever sections you are NOT currently on up in a vertical stack.
const SECTIONS = [
  { href: '/menu/favourites',       label: 'Yêu thích',  icon: '❤️' },
  { href: '/menu/favourites/build', label: 'Tạo suất',   icon: '🍽️' },
] as const

// Vertical stack geometry (px, bottom offset from the container's bottom = FAB).
const FIRST = 56      // gap above the FAB to the first action (FAB 44 + 12 gap)
const STEP = 52       // spacing between stacked actions (icon 40 + 12 gap)

export function FavouritesSpeedDial() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/menu/favourites' ? pathname === '/menu/favourites' : pathname?.startsWith(href)

  const actions = SECTIONS.filter(s => !isActive(s.href))

  return (
    <>
      {/* Click-away catcher — closes the dial when tapping anywhere else. */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/10"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div className="fixed bottom-[calc(96px+env(safe-area-inset-bottom))] right-4 z-30">
        {actions.map((a, i) => (
          <button
            key={a.href}
            onClick={() => { setOpen(false); router.push(a.href) }}
            style={{
              bottom: open ? FIRST + i * STEP : 0,
              transitionDelay: open ? `${i * 50}ms` : '0ms',
            }}
            className={`absolute right-[2px] flex items-center gap-2 transition-all duration-200 ${
              open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
            }`}
          >
            <span className="whitespace-nowrap rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-md">
              {a.label}
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base text-white shadow-md">
              {a.icon}
            </span>
          </button>
        ))}

        {/* Main trigger — plus rotates into a close (✕) when open. */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-label="Mở lối tắt yêu thích"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-xl text-white shadow-lg shadow-primary/30 transition-transform active:scale-95"
        >
          <span className={`transition-transform duration-200 ${open ? 'rotate-45' : ''}`}>➕</span>
        </button>
      </div>
    </>
  )
}
