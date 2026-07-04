'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Segmented view switch for the favourites suite. This replaces the old footer
// buttons ("Xem set đã lưu" / "Lưu thành set") as the ONLY navigation between the
// three favourites routes — dropping those buttons without this bar would orphan
// /sets and /build.
const SEGMENTS = [
  { href: '/menu/favourites',       label: 'Yêu thích' },
  { href: '/menu/favourites/sets',  label: 'Bộ đã lưu' },
  { href: '/menu/favourites/build', label: 'Tự tạo suất' },
] as const

export function FavouriteSegmentTabs() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-14 z-10 flex bg-background border-b border-border">
      {SEGMENTS.map(seg => {
        const active =
          seg.href === '/menu/favourites'
            ? pathname === '/menu/favourites'
            : pathname?.startsWith(seg.href)
        return (
          <Link
            key={seg.href}
            href={seg.href}
            aria-current={active ? 'page' : undefined}
            className={`flex-1 min-h-[44px] flex items-center justify-center text-sm font-medium border-b-2 transition-colors ${
              active ? 'text-primary border-primary' : 'text-muted-fg border-transparent'
            }`}
          >
            {seg.label}
          </Link>
        )
      })}
    </nav>
  )
}
