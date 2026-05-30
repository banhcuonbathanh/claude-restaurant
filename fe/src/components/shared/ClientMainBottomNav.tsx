'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, UtensilsCrossed, Heart, ClipboardList, User } from 'lucide-react'

const TABS = [
  { href: '/menu',            icon: Home,           label: 'Trang Chủ' },
  { href: '/menu',            icon: UtensilsCrossed, label: 'Thực Đơn' },
  { href: '/menu/favourites', icon: Heart,           label: 'Yêu Thích' },
  { href: '/order',           icon: ClipboardList,   label: 'Lịch Sử' },
  { href: '/profile',         icon: User,            label: 'Hồ Sơ' },
] as const

export function ClientMainBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky bottom-0 z-10 bg-card border-t border-border">
      <div className="max-w-[420px] mx-auto flex">
        {TABS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/menu' && pathname.startsWith(href))
          return (
            <Link
              key={label}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] min-w-[44px] transition-colors ${
                active ? 'text-primary' : 'text-muted-fg hover:text-foreground'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
