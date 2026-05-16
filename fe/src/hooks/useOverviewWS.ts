'use client'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Order } from '@/types/order'

const ACTIVE = new Set(['pending', 'confirmed', 'preparing', 'ready'])

interface WsMessage {
  type:        string
  order_id:    string
  item_id?:    string
  qty_served?: number
  status?:     string
}

export function useOverviewWS(token: string | null): void {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!token) return

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'
    const wsBase  = apiBase.replace(/^https/, 'wss').replace(/^http/, 'ws')
    const url     = `${wsBase}/ws/orders-live?token=${encodeURIComponent(token)}`

    let stopped = false
    let attempts = 0
    let retryId: ReturnType<typeof setTimeout>
    let ws: WebSocket

    function mutateOrders(updater: (prev: Order[]) => Order[]) {
      queryClient.setQueryData<Order[]>(['orders', 'live'], prev => updater(prev ?? []))
    }

    function connect() {
      ws = new WebSocket(url)
      ws.onopen = () => { attempts = 0 }

      ws.onmessage = async (evt: MessageEvent) => {
        let msg: WsMessage
        try { msg = JSON.parse(evt.data as string) } catch { return }

        switch (msg.type) {
          case 'new_order': {
            try {
              const res = await fetch(`${apiBase}/orders/${msg.order_id}`, {
                headers: { Authorization: `Bearer ${token}` },
              }).then(r => r.json())
              const order: Order = res?.data ?? res
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
      }

      ws.onclose = () => {
        if (stopped) return
        attempts++
        retryId = setTimeout(connect, Math.min(1000 * 2 ** (attempts - 1), 30_000))
      }
      ws.onerror = () => ws.close()
    }

    connect()
    return () => {
      stopped = true
      clearTimeout(retryId)
      ws?.close()
    }
  }, [token, queryClient])
}
