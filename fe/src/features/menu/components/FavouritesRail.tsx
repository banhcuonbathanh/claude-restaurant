'use client'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { Heart, Pin } from 'lucide-react'
import { useFavouritesStore } from '@/store/favourites'
import { useCartStore, canhCartId } from '@/store/cart'
import { favouriteSetToCartItems } from '@/lib/favourite-set-cart'
import { resolveSuatToCart, suatTotals } from '@/lib/favourite-suat-cart'
import type { FavouriteSet, CustomSuat } from '@/store/favourites'
import type { Product, Combo } from '@/types/product'
import { formatVND } from '@/lib/utils'

interface Props {
  products: Product[]
  combos:   Combo[]
}

export function FavouritesRail({ products, combos }: Props) {
  const { items, sets, suats, toggleFav } = useFavouritesStore()
  const addToCart = useCartStore(s => s.addItem)
  const setCanhQty = useCartStore(s => s.setCanhQty)

  const pinnedSets  = sets.filter(s => s.pinned)
  const favProducts = products.filter(p => items.some(i => i.id === p.id && i.type === 'product'))
  const favCombos   = combos.filter(c => items.some(i => i.id === c.id && i.type === 'combo'))

  if (pinnedSets.length === 0 && suats.length === 0 && favProducts.length === 0 && favCombos.length === 0) return null

  const handleApplySet = (set: FavouriteSet) => {
    const cartItems = favouriteSetToCartItems(set.items, products, combos)
    if (cartItems.length === 0) {
      toast.error('Các món trong set không còn khả dụng')
      return
    }
    cartItems.forEach(addToCart)
    toast.success(`✓ Đã thêm "${set.name}" vào giỏ`)
  }

  const handleApplySuat = (suat: CustomSuat) => {
    const { productItems, canhOps, missing } = resolveSuatToCart(suat.lines, products)
    if (productItems.length === 0 && canhOps.length === 0) {
      toast.error('Các món trong suất không còn khả dụng')
      return
    }
    productItems.forEach(addToCart)
    canhOps.forEach(op => {
      const current = useCartStore.getState().items
        .find(i => i.id === canhCartId(op.productId, op.kind))?.quantity ?? 0
      setCanhQty(op.productId, null, op.kind, current + op.qty)
    })
    toast.success(
      missing > 0
        ? `✓ Đã thêm "${suat.name}" (một số món không còn phục vụ)`
        : `✓ Đã thêm "${suat.name}" vào giỏ`,
    )
  }

  return (
    <section className="py-3">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-muted-fg uppercase tracking-wide px-4 mb-2">
        <Heart size={12} className="fill-primary text-primary" />
        Yêu thích
      </h2>
      <div className="flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
        {pinnedSets.map(set => (
          <PinnedSetCard key={`set_${set.id}`} set={set} onApply={() => handleApplySet(set)} />
        ))}
        {suats.map(suat => (
          <SuatRailCard
            key={`suat_${suat.id}`}
            suat={suat}
            products={products}
            onApply={() => handleApplySuat(suat)}
          />
        ))}
        {favProducts.map(p => (
          <FavCard
            key={`product_${p.id}`}
            id={p.id}
            name={p.name}
            price={p.price}
            imagePath={p.image_path}
            type="product"
            onToggle={toggleFav}
          />
        ))}
        {favCombos.map(c => (
          <FavCard
            key={`combo_${c.id}`}
            id={c.id}
            name={c.name}
            price={c.price}
            imagePath={c.image_path}
            type="combo"
            onToggle={toggleFav}
          />
        ))}
      </div>
    </section>
  )
}

interface PinnedSetCardProps {
  set:     FavouriteSet
  onApply: () => void
}

function PinnedSetCard({ set, onApply }: PinnedSetCardProps) {
  const count = set.items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <button
      onClick={onApply}
      className="flex-shrink-0 w-28 bg-card rounded-xl overflow-hidden shadow-sm text-left border border-primary/30"
      aria-label={`Thêm set ${set.name} vào giỏ`}
    >
      <div className="relative w-full h-20 bg-primary/10 flex items-center justify-center">
        <span className="text-2xl">📋</span>
        <span className="absolute top-1 right-1 bg-white/80 rounded-full p-1 flex items-center justify-center">
          <Pin size={12} className="fill-primary text-primary" />
        </span>
      </div>
      <div className="p-2">
        <p className="text-xs font-medium text-foreground line-clamp-1 leading-snug">{set.name}</p>
        <p className="text-xs text-primary font-bold mt-0.5">{count} món · ＋ Thêm</p>
      </div>
    </button>
  )
}

interface SuatRailCardProps {
  suat:     CustomSuat
  products: Product[]
  onApply:  () => void
}

function SuatRailCard({ suat, products, onApply }: SuatRailCardProps) {
  const { count } = suatTotals(suat.lines, products)

  return (
    <button
      onClick={onApply}
      className="flex-shrink-0 w-28 bg-card rounded-xl overflow-hidden shadow-sm text-left border border-primary/30"
      aria-label={`Thêm suất ${suat.name} vào giỏ`}
    >
      <div className="relative w-full h-20 bg-primary/10 flex items-center justify-center">
        {suat.image ? (
          <Image
            src={suat.image}
            alt={suat.name}
            fill
            className="object-cover"
            sizes="112px"
            unoptimized={suat.image.startsWith('data:')}
          />
        ) : (
          <span className="text-2xl">🍽️</span>
        )}
      </div>
      <div className="p-2">
        <p className="text-xs font-medium text-foreground line-clamp-1 leading-snug">{suat.name}</p>
        <p className="text-xs text-primary font-bold mt-0.5">{count} món · ＋ Thêm</p>
      </div>
    </button>
  )
}

interface FavCardProps {
  id:        string
  name:      string
  price:     number
  imagePath: string | null
  type:      'product' | 'combo'
  onToggle:  (id: string, type: 'product' | 'combo') => void
}

function FavCard({ id, name, price, imagePath, type, onToggle }: FavCardProps) {
  const imageUrl = imagePath
    ? `${process.env.NEXT_PUBLIC_STORAGE_URL ?? ''}/${imagePath}`
    : null

  const detailHref = type === 'combo' ? `/menu/combo/${id}` : `/menu/product/${id}`

  return (
    <div className="relative flex-shrink-0 w-28 bg-card rounded-xl overflow-hidden shadow-sm">
      <Link href={detailHref} className="block">
        <div className="relative w-full h-20 bg-muted">
          {imageUrl ? (
            <Image src={imageUrl} alt={name} fill className="object-cover" sizes="112px" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-2xl">🍜</div>
          )}
        </div>
        <div className="p-2">
          <p className="text-xs font-medium text-foreground line-clamp-1 leading-snug">{name}</p>
          <p className="text-xs text-primary font-bold mt-0.5">{formatVND(price)}</p>
        </div>
      </Link>
      <button
        onClick={() => onToggle(id, type)}
        className="absolute top-1 right-1 bg-white/80 rounded-full p-1 min-w-[28px] min-h-[28px] flex items-center justify-center"
        aria-label="Bỏ yêu thích"
      >
        <Heart size={12} className="fill-primary text-primary" />
      </button>
    </div>
  )
}
