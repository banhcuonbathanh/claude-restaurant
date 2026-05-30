import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface QuickNavCardData {
  icon: string
  title: string
  subtitle: string
  href: string
  highlighted?: boolean
}

const CARDS: QuickNavCardData[] = [
  { icon: '🍽️', title: 'Thực Đơn',    subtitle: 'Xem & đặt món',     href: '/menu',             highlighted: true },
  { icon: '❤️',  title: 'Yêu Thích',   subtitle: 'Món đã lưu',        href: '/menu/favourites',  highlighted: true },
  { icon: '📋', title: 'Lịch Sử Ăn',  subtitle: 'Các lần ghé thăm',  href: '/order',            highlighted: false },
  { icon: '🏠', title: 'Đặt Bàn',     subtitle: 'Đặt bàn về nhà',    href: '/menu',             highlighted: false },
]

export function QuickNavGrid() {
  return (
    <section className="px-4 pb-4">
      <h2 className="text-sm font-semibold text-muted-fg mb-3">Khám phá thêm</h2>
      <div className="grid grid-cols-2 gap-3">
        {CARDS.map(({ icon, title, subtitle, href, highlighted }) => (
          <Link
            key={title}
            href={href}
            className={`flex items-center gap-2 p-3 rounded-xl border transition-colors min-h-[64px] ${
              highlighted
                ? 'border-primary/40 bg-primary/5 hover:bg-primary/10'
                : 'border-border bg-card hover:bg-muted'
            }`}
          >
            <span className="text-xl shrink-0">{icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{title}</p>
              <p className="text-[11px] text-muted-fg truncate">{subtitle}</p>
            </div>
            <ChevronRight size={14} className="text-muted-fg shrink-0" />
          </Link>
        ))}
      </div>
    </section>
  )
}
