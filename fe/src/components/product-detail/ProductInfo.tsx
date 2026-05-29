import { Badge } from '@/components/ui/badge'
import { formatVND } from '@/lib/utils'
import type { Product } from '@/types/product'

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  return (
    <div className="px-4 pt-4 pb-4 flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <h1 className="text-xl font-bold text-foreground flex-1 leading-snug">
          {product.name}
        </h1>
        {product.is_available ? (
          <Badge variant="success" className="flex-shrink-0 mt-0.5">✓ Còn hàng</Badge>
        ) : (
          <Badge variant="urgent" className="flex-shrink-0 mt-0.5">Hết hàng</Badge>
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
  )
}
