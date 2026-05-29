import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Product } from '@/types/product'

export function useProductDetail(id: string) {
  return useQuery<Product>({
    queryKey: ['products', id],
    queryFn: () => api.get(`/products/${id}`).then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}
