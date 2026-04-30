'use client'
import Image from 'next/image'
import type { Product } from '@/types/product'
import { formatVND } from '@/lib/utils'

interface Props {
  product: Product
  onAdd:   () => void
}

export function ProductCard({ product, onAdd }: Props) {
  const imageUrl = product.image_path
    ? `${process.env.NEXT_PUBLIC_STORAGE_URL ?? ''}/${product.image_path}`
    : null

  return (
    <div className="bg-card rounded-xl overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-3xl">🍜</div>
        )}
        {!product.is_available && (
          <span className="absolute top-2 left-2 bg-urgent/20 text-urgent text-xs font-semibold px-2 py-0.5 rounded-full">
            Hết
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-foreground text-sm font-semibold leading-snug line-clamp-2">
          {product.name}
        </p>
        <p className="text-primary font-bold text-sm">{formatVND(product.price)}</p>
        <button
          onClick={onAdd}
          disabled={!product.is_available}
          className="mt-auto w-full bg-card border border-primary text-primary text-sm font-semibold rounded-full py-1.5
                     hover:bg-primary hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Thêm
        </button>
      </div>
    </div>
  )
}
