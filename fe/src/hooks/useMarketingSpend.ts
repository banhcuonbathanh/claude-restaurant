import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { MarketingSpendResponse, DateRange } from '@/types/marketing'

export function useMarketingSpend(dateRange: DateRange) {
  return useQuery({
    queryKey: ['marketing', 'spend', dateRange],
    queryFn: async () => {
      const { data } = await api.get<{ data: MarketingSpendResponse }>('/admin/marketing/spend', {
        params: { from: dateRange.from, to: dateRange.to },
      })
      return data.data
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!dateRange.from && !!dateRange.to,
  })
}
