// @vitest-environment jsdom
/**
 * CLIENT QR FLOW — Live Update (SSE) Tests
 *
 * Covers: docs/work_flow/CLIENT_QR_FLOW.md
 *   Step 4 — useOrderSSE:        order detail page receives admin/chef status + item pushes
 *   Step 6 — useOrderMonitorSSE: tracking page receives queue position + table status pushes
 *
 * Strategy: mock fetchEventSource to give tests manual control over open/message/error.
 * No real network or running server needed.
 */

import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ── vi.hoisted: declare shared SSE state before any mock factory runs ────────

type SSEOpts = {
  signal?:    AbortSignal
  onopen?:    (res: Partial<Response>) => Promise<void>
  onmessage?: (evt: { event: string; data: string }) => void
  onerror?:   (err: unknown) => void
}

const sse = vi.hoisted(() => ({
  opts:   null as SSEOpts | null,
  reject: null as ((err: unknown) => void) | null,
}))

// ── Module mocks (hoisted before all imports by Vitest) ──────────────────────

vi.mock('@microsoft/fetch-event-source', () => ({
  fetchEventSource: vi.fn(async (_url: string, opts: SSEOpts) => {
    sse.opts = opts
    return new Promise<void>((resolve, reject) => {
      sse.reject = reject
      opts.signal?.addEventListener('abort', () => resolve())
    })
  }),
}))

vi.mock('@/lib/api-client', () => ({
  api: { get: vi.fn(), post: vi.fn() },
  addItemsToOrder:  vi.fn(),
  patchOrderItemQty: vi.fn(),
}))

// ── Imports (resolved after mocks are in place) ──────────────────────────────

import { useOrderSSE }        from '@/hooks/useOrderSSE'
import { useOrderMonitorSSE } from '@/hooks/useOrderMonitorSSE'
import { useAuthStore }       from '@/features/auth/auth.store'
import { STORAGE_KEYS }       from '@/lib/storage-keys'
import { api }                from '@/lib/api-client'
import type { Order }         from '@/types/order'

// ── Fixtures ─────────────────────────────────────────────────────────────────

const ORDER_ID = 'order-001'

const BASE_ORDER: Order = {
  id:             ORDER_ID,
  order_number:   'BC-001',
  status:         'confirmed',
  source:         'qr',
  table_id:       'table-1',
  table_name:     'Bàn 1',
  customer_name:  '',
  customer_phone: '',
  total_amount:   60_000,
  note:           null,
  created_at:     new Date().toISOString(),
  items: [
    {
      id: 'item-1', product_id: 'p1', combo_id: null, combo_ref_id: null,
      name: 'Bánh cuốn', quantity: 3, qty_served: 0, unit_price: 30_000,
      note: null, toppings_snapshot: null, flagged: false,
    },
    {
      id: 'item-2', product_id: 'p2', combo_id: null, combo_ref_id: null,
      name: 'Chả', quantity: 2, qty_served: 0, unit_price: 10_000,
      note: null, toppings_snapshot: null, flagged: false,
    },
  ],
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Simulate SSE connection opening (calls onopen callback).
 * If onopen throws (e.g. AuthError on 401), propagate through onerror
 * and reject the fetchEventSource promise so the hook's catch block fires.
 */
async function openSSE(ok = true, status = 200) {
  await act(async () => {
    try {
      await sse.opts?.onopen?.({ ok, status } as Response)
    } catch (thrown) {
      try { sse.opts?.onerror?.(thrown) } catch (rethrown) { sse.reject?.(rethrown) }
    }
  })
}

/** Simulate a server-sent event on the open connection */
function sendMessage(event: string, data: unknown) {
  act(() => {
    sse.opts?.onmessage?.({ event, data: JSON.stringify(data) })
  })
}

/** Mount useOrderSSE, wait for REST + SSE connection to be ready */
async function mountOrderSSE() {
  const hook = renderHook(() => useOrderSSE(ORDER_ID))
  await waitFor(() => expect(hook.result.current.order).not.toBeNull())
  await waitFor(() => expect(sse.opts).not.toBeNull())
  await openSSE()
  return hook
}

/** Mount useOrderMonitorSSE, wait for SSE to open */
async function mountMonitorSSE() {
  const hook = renderHook(() => useOrderMonitorSSE(ORDER_ID))
  await waitFor(() => expect(sse.opts).not.toBeNull())
  await openSSE()
  await waitFor(() => expect(hook.result.current.sseConnected).toBe(true))
  return hook
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  sse.opts   = null
  sse.reject = null
  vi.clearAllMocks()
  localStorage.clear()
  useAuthStore.setState({ user: null, accessToken: 'test-token' })
  vi.mocked(api.get).mockResolvedValue({ data: { data: BASE_ORDER } })
})

afterEach(() => {
  // Signal any pending SSE promise to resolve so hooks unmount cleanly
  // (cleanup is also called automatically by @testing-library/react)
})

// ═══════════════════════════════════════════════════════════════════════════════
// useOrderSSE — Step 4: Order Detail
// ═══════════════════════════════════════════════════════════════════════════════

describe('useOrderSSE — Step 4: Order Detail Live Updates', () => {

  describe('Initial load', () => {
    it('shows stale cached order instantly from localStorage before SSE connects', async () => {
      localStorage.setItem(
        STORAGE_KEYS.ORDER_CACHE + ORDER_ID,
        JSON.stringify({ ...BASE_ORDER, status: 'pending' }),
      )

      const { result } = renderHook(() => useOrderSSE(ORDER_ID))

      // Stale cache visible immediately — no API wait
      await waitFor(() => expect(result.current.order?.status).toBe('pending'))
    })

    it('fetches REST snapshot on mount and overwrites stale cache', async () => {
      const { result } = renderHook(() => useOrderSSE(ORDER_ID))

      await waitFor(() => {
        expect(vi.mocked(api.get)).toHaveBeenCalledWith(`/orders/${ORDER_ID}`)
        expect(result.current.order?.status).toBe('confirmed') // from BASE_ORDER
      })
    })

    it('sets isNotFound when REST returns 404', async () => {
      vi.mocked(api.get).mockRejectedValue({ response: { status: 404 } })

      const { result } = renderHook(() => useOrderSSE(ORDER_ID))

      await waitFor(() => expect(result.current.isNotFound).toBe(true))
    })

    it('opens SSE after REST snapshot (fetchEventSource is called)', async () => {
      renderHook(() => useOrderSSE(ORDER_ID))

      await waitFor(() => expect(sse.opts).not.toBeNull())
      // SSE auth header uses guest JWT
      expect(sse.opts?.onopen).toBeInstanceOf(Function)
    })
  })

  describe('SSE: order_status_changed (admin confirms / chef marks ready)', () => {
    it('confirmed → status + notification { kind: confirmed, eta }', async () => {
      const { result } = await mountOrderSSE()

      sendMessage('order_status_changed', { status: 'confirmed', eta: 5 })

      await waitFor(() => {
        expect(result.current.order?.status).toBe('confirmed')
        expect(result.current.notification).toEqual({ kind: 'confirmed', eta: 5 })
      })
    })

    it('ready → status + notification { kind: ready }', async () => {
      const { result } = await mountOrderSSE()

      sendMessage('order_status_changed', { status: 'ready' })

      await waitFor(() => {
        expect(result.current.order?.status).toBe('ready')
        expect(result.current.notification).toEqual({ kind: 'ready' })
      })
    })

    it('cancelled → status + notification { kind: cancelled }', async () => {
      const { result } = await mountOrderSSE()

      sendMessage('order_status_changed', { status: 'cancelled' })

      await waitFor(() => {
        expect(result.current.order?.status).toBe('cancelled')
        expect(result.current.notification).toEqual({ kind: 'cancelled' })
      })
    })

    it('clearNotification() resets notification to null', async () => {
      const { result } = await mountOrderSSE()
      sendMessage('order_status_changed', { status: 'ready' })
      await waitFor(() => expect(result.current.notification).not.toBeNull())

      act(() => result.current.clearNotification())

      expect(result.current.notification).toBeNull()
    })
  })

  describe('SSE: item_progress (chef marks individual dish done — no full refetch)', () => {
    it('updates qty_served only for the specific item_id', async () => {
      const { result } = await mountOrderSSE()

      sendMessage('item_progress', { item_id: 'item-1', qty_served: 2 })

      await waitFor(() => {
        const item1 = result.current.order?.items.find(i => i.id === 'item-1')
        expect(item1?.qty_served).toBe(2)
      })
    })

    it('leaves other items unchanged when one item progresses', async () => {
      const { result } = await mountOrderSSE()

      sendMessage('item_progress', { item_id: 'item-1', qty_served: 3 })

      await waitFor(() => {
        const item2 = result.current.order?.items.find(i => i.id === 'item-2')
        expect(item2?.qty_served).toBe(0)
      })
    })

    it('progress % increases correctly after each item_progress event', async () => {
      const { result } = await mountOrderSSE()

      // 5 total items (3 + 2). Initially 0% served.
      expect(result.current.progress).toBe(0)

      sendMessage('item_progress', { item_id: 'item-1', qty_served: 3 }) // 3/5 = 60%
      await waitFor(() => expect(result.current.progress).toBe(60))

      sendMessage('item_progress', { item_id: 'item-2', qty_served: 2 }) // 5/5 = 100%
      await waitFor(() => expect(result.current.progress).toBe(100))
    })
  })

  describe('SSE: terminal events (order_cancelled / order_completed)', () => {
    it('order_cancelled → status = cancelled + notification', async () => {
      const { result } = await mountOrderSSE()

      sendMessage('order_cancelled', {})

      await waitFor(() => {
        expect(result.current.order?.status).toBe('cancelled')
        expect(result.current.notification).toEqual({ kind: 'cancelled' })
      })
    })

    it('order_completed → status = delivered', async () => {
      const { result } = await mountOrderSSE()

      sendMessage('order_completed', {})

      await waitFor(() => expect(result.current.order?.status).toBe('delivered'))
    })
  })

  describe('SSE: order_init (hydrate from SSE when REST missed it)', () => {
    it('order_init replaces current order state with server payload', async () => {
      const { result } = await mountOrderSSE()
      const freshOrder = { ...BASE_ORDER, status: 'preparing' as const }

      sendMessage('order_init', freshOrder)

      await waitFor(() => expect(result.current.order?.status).toBe('preparing'))
    })
  })

  describe('localStorage persistence', () => {
    it('writes updated order to ORDER_CACHE whenever SSE changes state', async () => {
      const { result } = await mountOrderSSE()

      sendMessage('order_status_changed', { status: 'ready' })

      await waitFor(() => {
        const raw = localStorage.getItem(STORAGE_KEYS.ORDER_CACHE + ORDER_ID)
        expect(JSON.parse(raw ?? 'null')?.status).toBe('ready')
      })

      // Verify result state also reflects the change
      expect(result.current.order?.status).toBe('ready')
    })

    it('item_progress updates are also persisted to localStorage', async () => {
      await mountOrderSSE()

      sendMessage('item_progress', { item_id: 'item-1', qty_served: 2 })

      await waitFor(() => {
        const raw = localStorage.getItem(STORAGE_KEYS.ORDER_CACHE + ORDER_ID)
        const cached = JSON.parse(raw ?? 'null') as Order | null
        const item = cached?.items?.find(i => i.id === 'item-1')
        expect(item?.qty_served).toBe(2)
      })
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// useOrderMonitorSSE — Step 6: Tracking Page
// ═══════════════════════════════════════════════════════════════════════════════

describe('useOrderMonitorSSE — Step 6: Tracking Page Live Updates', () => {

  /** useOrderMonitorSSE uses data.type (not evt.event) to dispatch events */
  function send(type: string, extra?: Record<string, unknown>) {
    sendMessage('', { type, ...extra })
  }

  describe('sseConnected state', () => {
    it('false before SSE opens', () => {
      const { result } = renderHook(() => useOrderMonitorSSE(ORDER_ID))
      expect(result.current.sseConnected).toBe(false)
    })

    it('true after successful onopen', async () => {
      const { result } = await mountMonitorSSE()
      expect(result.current.sseConnected).toBe(true)
    })
  })

  describe('SSE: order.status (chef marks order ready → client tracking updates)', () => {
    it('sets orderStatus to the pushed value', async () => {
      const { result } = await mountMonitorSSE()

      send('order.status', { status: 'ready' })

      await waitFor(() => expect(result.current.orderStatus).toBe('ready'))
    })

    it('transitions from null → confirmed → preparing → ready', async () => {
      const { result } = await mountMonitorSSE()

      expect(result.current.orderStatus).toBeNull()

      send('order.status', { status: 'confirmed' })
      await waitFor(() => expect(result.current.orderStatus).toBe('confirmed'))

      send('order.status', { status: 'preparing' })
      await waitFor(() => expect(result.current.orderStatus).toBe('preparing'))

      send('order.status', { status: 'ready' })
      await waitFor(() => expect(result.current.orderStatus).toBe('ready'))
    })
  })

  describe('SSE: queue.update (position + estimatedMinutes)', () => {
    it('position = 1-based index of ORDER_ID in queue', async () => {
      const { result } = await mountMonitorSSE()

      send('queue.update', {
        total: 3,
        queue: [
          { orderId: 'before-1', status: 'preparing', itemCount: 1 },
          { orderId: ORDER_ID,   status: 'confirmed', itemCount: 2 },
          { orderId: 'after-1',  status: 'confirmed', itemCount: 1 },
        ],
      })

      await waitFor(() => {
        expect(result.current.queueData?.position).toBe(2) // index 1 → 1-based 2
        expect(result.current.queueData?.total).toBe(3)
      })
    })

    it('position = 0 when ORDER_ID is not in the queue', async () => {
      const { result } = await mountMonitorSSE()

      send('queue.update', {
        total: 1,
        queue: [{ orderId: 'someone-else', status: 'preparing', itemCount: 2 }],
      })

      await waitFor(() => expect(result.current.queueData?.position).toBe(0))
    })

    it('estimatedMinutes = 0 when ORDER_ID is first in queue (idx = 0)', async () => {
      const { result } = await mountMonitorSSE()

      send('queue.update', {
        total: 2,
        queue: [
          { orderId: ORDER_ID, status: 'preparing', itemCount: 2 },
          { orderId: 'other',  status: 'confirmed', itemCount: 1 },
        ],
      })

      await waitFor(() => expect(result.current.queueData?.estimatedMinutes).toBe(0))
    })

    it('estimatedMinutes = idx × 3 when idx > 0', async () => {
      const { result } = await mountMonitorSSE()

      // ORDER_ID at index 2 → 2 × 3 = 6 minutes
      send('queue.update', {
        total: 3,
        queue: [
          { orderId: 'a', status: 'preparing', itemCount: 1 },
          { orderId: 'b', status: 'preparing', itemCount: 1 },
          { orderId: ORDER_ID, status: 'confirmed', itemCount: 2 },
        ],
      })

      await waitFor(() => expect(result.current.queueData?.estimatedMinutes).toBe(6))
    })
  })

  describe('SSE: tables.status (floor map updates)', () => {
    it('replaces tableStatuses with the server payload', async () => {
      const { result } = await mountMonitorSSE()

      send('tables.status', {
        tables: [
          { id: 't1', status: 'serving',  orderCount: 1 },
          { id: 't2', status: 'waiting' },
          { id: 't3', status: 'empty' },
        ],
      })

      await waitFor(() => {
        expect(result.current.tableStatuses).toHaveLength(3)
        expect(result.current.tableStatuses[0]).toMatchObject({ id: 't1', status: 'serving' })
        expect(result.current.tableStatuses[2]).toMatchObject({ id: 't3', status: 'empty' })
      })
    })
  })

  describe('SSE: items_added / item_updated / item_cancelled', () => {
    it.each(['items_added', 'item_updated', 'item_cancelled'])(
      '%s sets itemsChangedAt to a positive timestamp',
      async (type) => {
        const { result } = await mountMonitorSSE()
        expect(result.current.itemsChangedAt).toBeNull()

        send(type)

        await waitFor(() => {
          expect(result.current.itemsChangedAt).not.toBeNull()
          expect(result.current.itemsChangedAt).toBeGreaterThan(0)
        })
      },
    )

    it('successive item events update itemsChangedAt each time', async () => {
      const { result } = await mountMonitorSSE()

      send('items_added')
      await waitFor(() => expect(result.current.itemsChangedAt).not.toBeNull())
      const first = result.current.itemsChangedAt

      // Advance timer slightly to get a different timestamp
      await new Promise(r => setTimeout(r, 2))
      send('item_updated')
      await waitFor(() => expect(result.current.itemsChangedAt).not.toBe(first))
    })
  })

  describe('Auth failure — Invariant: 401/403 stops retry permanently', () => {
    it('401 → isUnauthorized = true, sseConnected stays false', async () => {
      const { result } = renderHook(() => useOrderMonitorSSE(ORDER_ID))
      await waitFor(() => expect(sse.opts).not.toBeNull())

      await openSSE(false, 401)

      await waitFor(() => {
        expect(result.current.isUnauthorized).toBe(true)
        expect(result.current.sseConnected).toBe(false)
      })
    })

    it('403 → isUnauthorized = true', async () => {
      const { result } = renderHook(() => useOrderMonitorSSE(ORDER_ID))
      await waitFor(() => expect(sse.opts).not.toBeNull())

      await openSSE(false, 403)

      await waitFor(() => expect(result.current.isUnauthorized).toBe(true))
    })
  })

  describe('reconnect() — resets state and re-opens SSE', () => {
    it('clears isUnauthorized and triggers a new fetchEventSource call', async () => {
      const { result } = renderHook(() => useOrderMonitorSSE(ORDER_ID))
      await waitFor(() => expect(sse.opts).not.toBeNull())

      await openSSE(false, 401)
      await waitFor(() => expect(result.current.isUnauthorized).toBe(true))

      // Reset so we can detect the new connection attempt
      sse.opts = null

      act(() => result.current.reconnect())

      await waitFor(() => {
        expect(result.current.isUnauthorized).toBe(false)
        expect(sse.opts).not.toBeNull() // new fetchEventSource call made
      })
    })
  })
})
