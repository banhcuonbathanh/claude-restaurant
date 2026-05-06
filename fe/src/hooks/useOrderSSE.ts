'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { useAuthStore } from '@/features/auth/auth.store'
import { api } from '@/lib/api-client'
import type { Order } from '@/types/order'

export type OrderNotification =
  | { kind: 'confirmed'; eta?: number }
  | { kind: 'ready' }

const RECONNECT = {
  maxAttempts:     5,
  baseDelay:       1000,
  maxDelay:        30_000,
  showBannerAfter: 3,
}

export function useOrderSSE(orderId: string) {
  const [order, setOrder]                     = useState<Order | null>(null)
  const [connectionError, setConnectionError] = useState(false)
  const [notification, setNotification]       = useState<OrderNotification | null>(null)
  const attemptsRef = useRef(0)
  const abortRef    = useRef<AbortController | null>(null)
  const token       = useAuthStore(state => state.accessToken)

  useEffect(() => {
    let stopped = false

    // Fetch current order snapshot via REST, then open SSE for live patches.
    // The SSE handler only relays Redis pub/sub — it never sends order_init —
    // so we must seed the state ourselves before listening for deltas.
    async function connect() {
      try {
        const { data } = await api.get(`/orders/${orderId}`)
        if (!stopped) setOrder(data.data)
      } catch {
        // If the fetch fails we still open SSE and wait; spinner stays until
        // SSE also fails, at which point the banner shows.
      }

      while (!stopped && attemptsRef.current < RECONNECT.maxAttempts) {
        const ctrl = new AbortController()
        abortRef.current = ctrl

        try {
          await fetchEventSource(
            `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'}/orders/${orderId}/events`,
            {
              headers: { Authorization: `Bearer ${token ?? ''}` },
              signal:  ctrl.signal,
              async onopen(res) {
                if (!res.ok) throw new Error(`SSE ${res.status}`)
                attemptsRef.current = 0
                setConnectionError(false)
              },
              onmessage(evt) {
                if (!evt.event) return
                try {
                  const data = evt.data ? JSON.parse(evt.data) : {}
                  switch (evt.event) {
                    case 'order_init':
                      setOrder(data)
                      break
                    case 'order_status_changed':
                      if (data.status) {
                        setOrder(prev => prev ? { ...prev, status: data.status } : prev)
                        if (data.status === 'confirmed')
                          setNotification({ kind: 'confirmed', eta: data.eta })
                        else if (data.status === 'ready')
                          setNotification({ kind: 'ready' })
                      }
                      break
                    case 'item_progress':
                      setOrder(prev =>
                        prev
                          ? {
                              ...prev,
                              items: prev.items.map(i =>
                                i.id === data.item_id
                                  ? { ...i, qty_served: data.qty_served }
                                  : i
                              ),
                            }
                          : prev
                      )
                      break
                    case 'order_completed':
                      setOrder(prev => prev ? { ...prev, status: 'delivered' } : prev)
                      stopped = true
                      ctrl.abort()
                      break
                  }
                } catch { /* ignore parse errors */ }
              },
              onerror(err) {
                throw err
              },
            }
          )
        } catch {
          if (stopped || ctrl.signal.aborted) break
          attemptsRef.current++
          if (attemptsRef.current >= RECONNECT.showBannerAfter) setConnectionError(true)
          if (attemptsRef.current >= RECONNECT.maxAttempts) break
          const delay = Math.min(
            RECONNECT.baseDelay * Math.pow(2, attemptsRef.current - 1),
            RECONNECT.maxDelay,
          )
          await new Promise<void>(res => setTimeout(res, delay))
        }
      }
    }

    connect()
    return () => {
      stopped = true
      abortRef.current?.abort()
    }
  }, [orderId, token])

  const progress = useMemo(() => {
    if (!order?.items?.length) return 0
    const total  = order.items.reduce((s, i) => s + i.quantity, 0)
    const served = order.items.reduce((s, i) => s + i.qty_served, 0)
    return total === 0 ? 0 : Math.round((served / total) * 100)
  }, [order])

  return { order, progress, connectionError, notification, clearNotification: () => setNotification(null) }
}
