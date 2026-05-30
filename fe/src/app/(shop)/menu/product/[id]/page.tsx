'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { useProductDetail } from '@/hooks/useProductDetail'
import { CustomerTopNav } from '@/components/shared/CustomerTopNav'
import { ProductHeroImage } from '@/components/product-detail/ProductHeroImage'
import { ProductInfo } from '@/components/product-detail/ProductInfo'
import { ToppingSelector } from '@/components/product-detail/ToppingSelector'
import { QuantityStepper } from '@/components/shared/QuantityStepper'
import { CTAFooter } from '@/components/product-detail/CTAFooter'
import { ProductDetailSkeleton } from '@/components/product-detail/ProductDetailSkeleton'

export default function ProductDetailPage() {
  const { id }    = useParams<{ id: string }>()
  const router    = useRouter()
  const addItem   = useCartStore(s => s.addItem)
  const itemCount = useCartStore(s => s.itemCount())
  const [selectedToppingIds, setSelectedToppingIds] = useState<string[]>([])
  const [qty, setQty] = useState(1)

  const { data: product, isLoading, isError } = useProductDetail(id)

  const imageUrl = product?.image_path
    ? `${process.env.NEXT_PUBLIC_STORAGE_URL ?? ''}/${product.image_path}`
    : null

  const selectedToppings = product?.toppings.filter(t => selectedToppingIds.includes(t.id)) ?? []
  const toppingSum       = selectedToppings.reduce((s, t) => s + t.price, 0)
  const unitPrice        = (product?.price ?? 0) + toppingSum
  const total            = unitPrice * qty

  function handleAddToCart() {
    if (!product) return
    const toppingKey = [...selectedToppingIds].sort().join('-')
    addItem({
      id:         `product_${product.id}_${toppingKey || 'plain'}`,
      type:       'product',
      product_id: product.id,
      name:       product.name,
      quantity:   qty,
      price:      unitPrice,
      toppings:   selectedToppings,
    })
    router.back()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <CustomerTopNav
        title="Chi tiết sản phẩm"
        cartCount={itemCount}
        onBack={() => router.back()}
      />

      {isLoading && <ProductDetailSkeleton />}

      {isError && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
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
          {/* Zone A */}
          <ProductHeroImage src={imageUrl} alt={product.name} />

          {/* Zone B */}
          <ProductInfo product={product} />

          {/* Zone C — only when toppings exist */}
          {product.toppings.length > 0 && (
            <ToppingSelector
              toppings={product.toppings}
              selected={selectedToppingIds}
              basePrice={product.price}
              onChange={setSelectedToppingIds}
            />
          )}

          {/* Zone D */}
          <div className="px-4 pt-4 pb-32 flex items-center gap-4">
            <span className="text-sm font-semibold text-foreground">Số lượng</span>
            <div className="ml-auto">
              <QuantityStepper value={qty} min={1} onChange={setQty} />
            </div>
          </div>

          {/* Zone E */}
          <CTAFooter
            total={total}
            isAvailable={product.is_available}
            onAddToCart={handleAddToCart}
          />
        </>
      )}
    </div>
  )
}
