'use client'
import { Button } from '@/components/ui/button'
import { formatVND } from '@/lib/utils'

interface Props {
  itemCount:      number
  total:          number
  onAddAllToCart: () => void
}

// Offset ABOVE the shared ClientBottomNav (fixed bottom-0, ~72px + safe area) so the
// CTA is never hidden behind it — previously both sat at `bottom-0 z-20` and collided.
export function FavouritesFooter({ itemCount, total, onAddAllToCart }: Props) {
  return (
    <div className="fixed bottom-[calc(72px+env(safe-area-inset-bottom))] left-0 right-0 z-20 bg-[#fff7ed] border-t border-border px-4 py-3 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-fg">{itemCount} món</span>
        <span className="text-foreground">
          Tổng: <span className="font-bold text-primary">{formatVND(total)}</span>
        </span>
      </div>
      <Button onClick={onAddAllToCart} size="lg" className="w-full">
        🛒 Thêm tất cả vào giỏ hàng
      </Button>
    </div>
  )
}
