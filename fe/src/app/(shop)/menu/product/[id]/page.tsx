'use client'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { formatVND } from '@/lib/utils'
import type { Product } from '@/types/product'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn:  () => api.get(`/products/${id}`).then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const imageUrl = product?.image_path
    ? `${process.env.NEXT_PUBLIC_STORAGE_URL ?? ''}/${product.image_path}`
    : null

  return (
    <div className="min-h-screen bg-background">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow"
        aria-label="Quay lại"
      >
        <ArrowLeft size={20} className="text-foreground" />
      </button>

      {isLoading && <ProductDetailSkeleton />}

      {isError && (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
          <p className="text-muted-fg text-center">Không tìm thấy sản phẩm.</p>
          <button
            onClick={() => router.back()}
            className="text-primary text-sm underline"
          >
            Quay lại menu
          </button>
        </div>
      )}

      {product && (
        <>
          {/* Zone A — Hero image */}
          <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-6xl bg-muted">
                🍜
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>

          {/* Zone B — Name, badge, price, description */}
          <div className="px-4 pt-4 pb-32 flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <h1 className="text-xl font-bold text-foreground flex-1 leading-snug">
                {product.name}
              </h1>
              {!product.is_available && (
                <span className="flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-600">
                  Hết hàng
                </span>
              )}
            </div>

            <p className="text-2xl font-bold text-primary">
              {formatVND(product.price)}
            </p>

            {product.description && (
              <p className="text-sm text-muted-fg leading-relaxed">
                {product.description}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Zone A skeleton */}
      <div className="w-full aspect-[4/3] bg-muted" />

      {/* Zone B skeleton */}
      <div className="px-4 pt-4 flex flex-col gap-3">
        <div className="h-7 bg-muted rounded w-3/4" />
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
          <div className="h-4 bg-muted rounded w-4/6" />
        </div>
      </div>
    </div>
  )
}
