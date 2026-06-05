import axios from 'axios'
import { useAuthStore } from '@/features/auth/auth.store'
import { useCartStore } from '@/store/cart'
import type { OrderItemPayload } from '@/lib/order-payload'

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
    const isAuthEndpoint = original?.url?.includes('/auth/login') || original?.url?.includes('/auth/register')
    if (err.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      // Guest exception — decode sub claim; guests must not refresh
      const token = useAuthStore.getState().accessToken
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          if (payload.sub === 'guest') {
            useAuthStore.getState().clearAuth()
            // Guests have no login page — redirect to menu so they can scan QR again
            window.location.href = '/menu'
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
          // If a tableId is set, this is a guest/QR context — guests have no login page
          const isGuestContext = !!useCartStore.getState().tableId
          window.location.href = isGuestContext ? '/menu' : '/login'
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

export interface AddItemsResult {
  order_id:          string
  added_items_count: number
  new_total_amount:  number
}

export async function addItemsToOrder(orderId: string, items: OrderItemPayload[]): Promise<AddItemsResult> {
  const { data } = await api.post(`/orders/${orderId}/items`, { items })
  return data.data
}

export async function patchOrderItemQty(itemId: string, quantity: number): Promise<void> {
  await api.patch(`/orders/items/${itemId}/quantity`, { quantity })
}
