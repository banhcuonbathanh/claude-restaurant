'use client'
import { useEffect, useRef } from 'react'
import { fetchEventSource } from '@microsoft/fetch-event-source'

interface AdminOrderEvent {
  type:         string
  order_id:     string
  order_number: string
  table_id:     string
}

interface UseAdminSSEOptions {
  token:       string | null
  onNewOrder:  (evt: AdminOrderEvent) => void
}

export function useAdminSSE({ token, onNewOrder }: UseAdminSSEOptions) {
  const onNewOrderRef = useRef(onNewOrder)
  onNewOrderRef.current = onNewOrder

  useEffect(() => {
    if (!token) return
    let stopped = false
    let attempts = 0
    const abortCtrl = new AbortController()

    async function connect() {
      while (!stopped && attempts < 10) {
        try {
          await fetchEventSource(
            `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'}/sse/admin`,
            {
              headers: { Authorization: `Bearer ${token}` },
              signal:  abortCtrl.signal,
              async onopen(res) {
                if (!res.ok) throw new Error(`SSE ${res.status}`)
                attempts = 0
              },
              onmessage(evt) {
                if (evt.event !== 'new_order') return
                try {
                  const data: AdminOrderEvent = JSON.parse(evt.data)
                  onNewOrderRef.current(data)
                } catch { /* ignore */ }
              },
              onerror(err) { throw err },
            }
          )
        } catch {
          if (stopped || abortCtrl.signal.aborted) break
          attempts++
          await new Promise<void>(r => setTimeout(r, Math.min(1000 * 2 ** (attempts - 1), 30_000)))
        }
      }
    }

    connect()
    return () => { stopped = true; abortCtrl.abort() }
  }, [token])
}
