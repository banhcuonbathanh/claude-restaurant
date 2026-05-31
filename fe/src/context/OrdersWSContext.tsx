'use client'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/features/auth/auth.store'

export interface WsMsg {
  type:        string
  order_id:    string
  item_id?:    string
  qty_served?: number
  status?:     string
}

type Handler = (msg: WsMsg) => void

interface OrdersWSContextValue {
  connected: boolean | null
  subscribe: (fn: Handler) => () => void
}

const OrdersWSCtx = createContext<OrdersWSContextValue | null>(null)

export function OrdersWSProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.accessToken)
  const [connected, setConnected] = useState<boolean | null>(null)
  const handlersRef = useRef<Set<Handler>>(new Set())

  const subscribe = useCallback((fn: Handler) => {
    handlersRef.current.add(fn)
    return () => { handlersRef.current.delete(fn) }
  }, [])

  useEffect(() => {
    if (!token) return

    const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1')
      .replace(/^https/, 'wss')
      .replace(/^http/, 'ws')
    const url = `${base}/ws/orders-live?token=${encodeURIComponent(token)}`

    let stopped  = false
    let attempts = 0
    let retryId: ReturnType<typeof setTimeout>
    let ws: WebSocket

    function connect() {
      ws = new WebSocket(url)
      ws.onopen  = () => { attempts = 0; setConnected(true) }
      ws.onmessage = (evt: MessageEvent) => {
        let msg: WsMsg
        try { msg = JSON.parse(evt.data as string) } catch { return }
        handlersRef.current.forEach(fn => { try { fn(msg) } catch { /* ignore handler errors */ } })
      }
      ws.onclose = () => {
        setConnected(false)
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
  }, [token])

  return (
    <OrdersWSCtx.Provider value={{ connected, subscribe }}>
      {children}
    </OrdersWSCtx.Provider>
  )
}

export function useOrdersWSContext(): OrdersWSContextValue {
  const ctx = useContext(OrdersWSCtx)
  if (!ctx) throw new Error('useOrdersWSContext must be used within OrdersWSProvider')
  return ctx
}
