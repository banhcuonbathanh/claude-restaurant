'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { useAuthStore } from '@/features/auth/auth.store'
import type { MonitorTableStatus, OrderStatus, QueueItem, QueueState } from '@/types/order'

const RECONNECT = {
  maxAttempts:     5,
  baseDelay:       1000,
  maxDelay:        30_000,
  showBannerAfter: 3,
}

// Sentinel thrown inside onopen to signal a permanent auth failure — not retryable.
class AuthError extends Error {}

export function useOrderMonitorSSE(orderId: string) {
  const [orderStatus, setOrderStatus]       = useState<OrderStatus | null>(null)
  const [queueData, setQueueData]           = useState<QueueState | null>(null)
  const [tableStatuses, setTableStatuses]   = useState<MonitorTableStatus[]>([])
  const [sseConnected, setSseConnected]     = useState(false)
  const [isUnauthorized, setIsUnauthorized] = useState(false)
  const [itemsChangedAt, setItemsChangedAt] = useState<number | null>(null)

  const token        = useAuthStore(state => state.accessToken)
  const attemptsRef  = useRef(0)
  const abortRef     = useRef<AbortController | null>(null)
  const [reconnectKey, setReconnectKey] = useState(0)

  const reconnect = useCallback(() => {
    abortRef.current?.abort()
    attemptsRef.current = 0
    setSseConnected(false)
    setIsUnauthorized(false)
    setReconnectKey(k => k + 1)
  }, [])

  useEffect(() => {
    if (!orderId) return
    let stopped = false

    async function connect() {
      while (!stopped && attemptsRef.current < RECONNECT.maxAttempts) {
        const ctrl = new AbortController()
        abortRef.current = ctrl

        try {
          await fetchEventSource(
            `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'}/sse/order-monitor/${orderId}`,
            {
              headers: { Authorization: `Bearer ${token ?? ''}` },
              signal:  ctrl.signal,
              async onopen(res) {
                if (res.status === 401 || res.status === 403) {
                  setIsUnauthorized(true)
                  setSseConnected(false)
                  throw new AuthError(`SSE auth failed: ${res.status}`)
                }
                if (!res.ok) throw new Error(`SSE ${res.status}`)
                attemptsRef.current = 0
                setSseConnected(true)
              },
              onmessage(evt) {
                try {
                  const data = evt.data ? JSON.parse(evt.data) : {}
                  switch (data.type) {
                    case 'order.status':
                      if (data.status) setOrderStatus(data.status as OrderStatus)
                      break
                    case 'queue.update': {
                      const queue = (data.queue ?? []) as QueueItem[]
                      const idx   = queue.findIndex(q => q.orderId === orderId)
                      setQueueData({
                        queue,
                        position:         idx >= 0 ? idx + 1 : 0,
                        total:            data.total ?? 0,
                        estimatedMinutes: idx > 0 ? idx * 3 : 0,
                      })
                      break
                    }
                    case 'tables.status':
                      if (Array.isArray(data.tables)) setTableStatuses(data.tables)
                      break
                    case 'items_added':
                    case 'item_updated':
                    case 'item_cancelled':
                      setItemsChangedAt(Date.now())
                      break
                  }
                } catch { /* ignore parse errors */ }
              },
              onerror(err) {
                throw err
              },
            }
          )
        } catch (err) {
          // Auth failures are permanent — stop the retry loop immediately.
          if (err instanceof AuthError || stopped || ctrl.signal.aborted) break
          attemptsRef.current++
          setSseConnected(false)
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
      setSseConnected(false)
    }
  }, [orderId, token, reconnectKey])

  return { orderStatus, queueData, tableStatuses, sseConnected, isUnauthorized, itemsChangedAt, reconnect }
}
