import axios from 'axios'
import { useAuthStore } from '@/features/auth/auth.store'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      // Guest exception — decode sub claim; guests must not refresh
      const token = useAuthStore.getState().accessToken
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          if (payload.sub === 'guest') {
            useAuthStore.getState().clearAuth()
            window.location.href = '/login'
            return Promise.reject(err)
          }
        } catch { /* malformed token — fall through */ }
      }

      original._retry = true
      if (!isRefreshing) {
        isRefreshing = true
        try {
          const { data } = await api.post('/auth/refresh')
          useAuthStore.getState().setAccessToken(data.data.access_token)
        } catch {
          useAuthStore.getState().clearAuth()
          window.location.href = '/login'
          return Promise.reject(err)
        } finally {
          isRefreshing = false
        }
      }
      return api(original)
    }
    return Promise.reject(err)
  },
)

interface AddItemInput {
  product_id:       string | null
  combo_id:         string | null
  quantity:         number
  unit_price:       number
  topping_snapshot: { id: string; name: string; price_delta: number }[] | null
}

export interface AddItemsResult {
  order_id:          string
  added_items_count: number
  new_total_amount:  number
}

export async function addItemsToOrder(orderId: string, items: AddItemInput[]): Promise<AddItemsResult> {
  const { data } = await api.post(`/orders/${orderId}/items`, { items })
  return data.data
}
