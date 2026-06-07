'use client'
import { ProductCard } from './ProductCard'
import { ProductGridCard } from './ProductGridCard'
import type { Product } from '@/types/product'

interface Props {
  products: Product[]
  withComboHeading: boolean
}

export function ProductList({ products, withComboHeading }: Props) {
  if (products.length === 0) return null

  return (
    <section>
      {withComboHeading && (
        <h2 className="text-muted-fg font-semibold mb-2 mt-2 text-sm uppercase tracking-wide">
          Món lẻ
        </h2>
      )}
      {/* Mobile: 1-col list */}
      <div className="flex flex-col gap-3 sm:hidden">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {/* Tablet / Desktop: responsive grid (2 → 3 → 4 cols) */}
      <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {products.map(product => (
          <ProductGridCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
