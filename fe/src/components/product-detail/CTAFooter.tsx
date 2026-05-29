import { formatVND } from '@/lib/utils'

interface CTAFooterProps {
  total: number
  isAvailable: boolean
  loading?: boolean
  onAddToCart: () => void
}

export function CTAFooter({ total, isAvailable, loading, onAddToCart }: CTAFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 pt-3 pb-safe-4">
      <button
        onClick={onAddToCart}
        disabled={!isAvailable || loading}
        aria-label={loading ? 'Đang thêm vào giỏ hàng' : undefined}
        className="w-full bg-primary text-primary-fg font-semibold text-sm rounded-xl py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[.98] transition-transform min-h-[44px]"
      >
        {isAvailable
          ? `Thêm vào giỏ hàng · ${formatVND(total)}`
          : 'Sản phẩm tạm hết'}
      </button>
    </div>
  )
}
