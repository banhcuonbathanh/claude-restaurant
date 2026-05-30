import Link from 'next/link'
import { UtensilsCrossed, Heart, RefreshCw } from 'lucide-react'

interface Props {
  onRefresh?: () => void
}

export function ClientBottomNav({ onRefresh }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-card border-t border-border">
      <div className="max-w-lg mx-auto flex">
        <Link
          href="/menu"
          className="flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] text-muted-fg hover:text-foreground transition-colors"
        >
          <UtensilsCrossed size={20} />
          <span className="text-[11px] font-medium">Menu</span>
        </Link>

        <Link
          href="/menu/favourites"
          className="flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] text-muted-fg hover:text-foreground transition-colors"
        >
          <Heart size={20} />
          <span className="text-[11px] font-medium">Yêu Thích</span>
        </Link>

        <button
          onClick={onRefresh}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] text-muted-fg hover:text-foreground transition-colors"
        >
          <RefreshCw size={20} />
          <span className="text-[11px] font-medium">Làm Mới</span>
        </button>
      </div>
    </nav>
  )
}
