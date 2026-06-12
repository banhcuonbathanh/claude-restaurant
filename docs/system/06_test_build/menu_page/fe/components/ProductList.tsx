// P-SYSTEST reference build — Zone F wrapper (dual layout: <sm list / ≥sm grid); not imported by the app.
'use client'
import type { Product } from '../types/product'
import { ProductCard } from './ProductCard'
import { ProductGridCard } from './ProductGridCard'

interface Props {
  products:         Product[]
  withComboHeading: boolean   // show the "Món lẻ" header only when ComboSection is also visible
}

export function ProductList({ products, withComboHeading }: Props) {
  if (products.length === 0) return null

  return (
    <section>
      {withComboHeading && (
        <p className="text-xs font-semibold text-muted-fg uppercase tracking-wide mb-2">Món lẻ</p>
      )}
      {/* Mobile — 1-col horizontal cards */}
      <div className="flex flex-col gap-3 sm:hidden">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
      {/* Tablet / Desktop — responsive grid */}
      <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {products.map(p => <ProductGridCard key={p.id} product={p} />)}
      </div>
    </section>
  )
}
