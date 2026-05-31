'use client'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Order } from '@/types/order'
import { useOrdersWSContext, type WsMsg } from '@/context/OrdersWSContext'

const ACTIVE = new Set(['pending', 'confirmed', 'preparing', 'ready'])

export function useOverviewWS(): boolean | null {
  const { connected, subscribe } = useOrdersWSContext()
  const queryClient = useQueryClient()

  useEffect(() => {
    function mutateOrders(updater: (prev: Order[]) => Order[]) {
      queryClient.setQueryData<Order[]>(['orders', 'live'], prev => updater(prev ?? []))
    }

    return subscribe(async (msg: WsMsg) => {
      switch (msg.type) {
        case 'new_order': {
          try {
            const res   = await api.get(`/orders/${msg.order_id}`)
            const order: Order = res.data?.data ?? res.data
            if (ACTIVE.has(order.status)) {
              mutateOrders(prev =>
                prev.find(o => o.id === order.id) ? prev : [order, ...prev]
              )
            }
          } catch { /* skip */ }
          break
        }

        case 'item_progress': {
          if (!msg.item_id) break
          mutateOrders(prev =>
            prev.map(o =>
              o.id !== msg.order_id ? o : {
                ...o,
                items: o.items.map(i =>
                  i.id === msg.item_id
                    ? { ...i, qty_served: msg.qty_served ?? i.qty_served }
                    : i
                ),
              }
            )
          )
          break
        }

        case 'order_status_changed':
        case 'order_updated': {
          if (!msg.status) break
          if (!ACTIVE.has(msg.status)) {
            mutateOrders(prev => prev.filter(o => o.id !== msg.order_id))
          } else {
            mutateOrders(prev =>
              prev.map(o =>
                o.id === msg.order_id ? { ...o, status: msg.status as Order['status'] } : o
              )
            )
          }
          break
        }

        case 'order_cancelled':
        case 'order_completed':
          mutateOrders(prev => prev.filter(o => o.id !== msg.order_id))
          break
      }
    })
  }, [subscribe, queryClient])

  return connected
}
