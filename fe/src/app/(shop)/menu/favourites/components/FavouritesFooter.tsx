'use client'

interface Props {
  setCount:       number
  onViewSets:     () => void
  onSaveSet:      () => void
  onAddAllToCart: () => void
}

export function FavouritesFooter({ setCount, onViewSets, onSaveSet, onAddAllToCart }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#fff7ed] border-t border-border px-4 py-3 space-y-2">
      <button
        onClick={onViewSets}
        className="w-full text-sm text-primary font-medium text-left min-h-[44px] flex items-center"
      >
        📋 Xem các set đã lưu ({setCount}) →
      </button>
      <button
        onClick={onSaveSet}
        className="w-full min-h-[44px] rounded-xl border border-primary text-primary text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
      >
        💾 Lưu thành set mới...
      </button>
      <button
        onClick={onAddAllToCart}
        className="w-full min-h-[44px] rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
      >
        🛒 Thêm tất cả vào giỏ hàng
      </button>
    </div>
  )
}
