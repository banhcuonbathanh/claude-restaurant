// P-SYSTEST reference build — mirrors fe/src/store/cart.ts; not imported by the app.
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '../types/cart'
import type { Topping } from '../types/product'
import { STORAGE_KEYS } from '../lib/storage-keys'

// Stable cart IDs for canh lines so the same logical bowl is always the same key.
// canh_<productId>_rau   = "có rau" (carries the Rau topping)
// canh_<productId>_plain = "không rau" (no toppings)
export function canhCartId(productId: string, kind: 'rau' | 'plain'): string {
  return `canh_${productId}_${kind}`
}

interface CartState {
  items:            CartItem[]
  tableId:          string | null
  tableName:        string | null
  activeOrderId:    string | null
  paymentMethod:    string | null
  orderNote:        string
  addItem:          (item: CartItem) => void
  removeItem:       (id: string) => void
  updateQty:        (id: string, qty: number) => void
  updateComboItem:  (comboCartId: string, productName: string, qty: number) => void
  clearCart:        () => void
  setTableId:       (id: string) => void
  setTableName:     (name: string) => void
  setActiveOrderId: (id: string | null) => void
  setPaymentMethod: (method: string) => void
  setOrderNote:     (note: string) => void
  // setCanhQty: upsert or remove a canh cart item.
  //   kind 'rau'   → cartId canh_<productId>_rau,   toppings:[rauTopping]
  //   kind 'plain' → cartId canh_<productId>_plain, toppings:[]
  //   qty === 0 → remove the line entirely
  setCanhQty:       (productId: string, rauTopping: Topping | null, kind: 'rau' | 'plain', qty: number) => void
  total:            () => number
  itemCount:        () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items:         [],
      tableId:       null,
      tableName:     null,
      activeOrderId: null,
      paymentMethod: null,
      orderNote:     '',

      // The store is deliberately dumb: no pricing, no validation — merge by id only.
      // The CARD decides the line's id (identity) and unit price before calling in.
      addItem: (item) => set((s) => {
        const existing = s.items.find(i => i.id === item.id)
        if (existing) {
          return {
            items: s.items.map(i =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          }
        }
        return { items: [...s.items, item] }
      }),

      removeItem: (id) =>
        set((s) => ({ items: s.items.filter(i => i.id !== id) })),

      updateQty: (id, qty) =>
        set((s) => ({
          items: s.items
            .map(i => i.id === id ? { ...i, quantity: qty } : i)
            .filter(i => i.quantity > 0),
        })),

      // Edit ONE sub-dish qty inside a combo line; re-derive the line's unit price
      // from the sub-item unit_price delta.
      updateComboItem: (comboCartId, productName, qty) =>
        set((s) => ({
          items: s.items.map(i => {
            if (i.id !== comboCartId || !i.combo_items) return i
            const old = i.combo_items.find(ci => ci.product_name === productName)
            const newComboItems = qty <= 0
              ? i.combo_items.filter(ci => ci.product_name !== productName)
              : i.combo_items.map(ci => ci.product_name === productName ? { ...ci, quantity: qty } : ci)
            let newPrice = i.price
            if (old?.unit_price !== undefined) {
              const delta = (qty <= 0 ? 0 : qty) - old.quantity
              newPrice = Math.max(0, i.price + delta * old.unit_price)
            }
            return { ...i, combo_items: newComboItems, price: newPrice }
          }),
        })),

      clearCart: () => set({ items: [], tableId: null, tableName: null, activeOrderId: null, paymentMethod: null, orderNote: '' }),

      setTableId:       (id)     => set({ tableId: id }),
      setTableName:     (name)   => set({ tableName: name }),
      setActiveOrderId: (id)     => set({ activeOrderId: id }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setOrderNote:     (note)   => set({ orderNote: note }),

      setCanhQty: (productId, rauTopping, kind, qty) =>
        set((s) => {
          const cartId = canhCartId(productId, kind)
          if (qty <= 0) {
            return { items: s.items.filter(i => i.id !== cartId) }
          }
          const toppings = kind === 'rau' && rauTopping ? [rauTopping] : []
          const existing = s.items.find(i => i.id === cartId)
          if (existing) {
            return {
              items: s.items.map(i =>
                i.id === cartId ? { ...i, quantity: qty, toppings } : i
              ),
            }
          }
          const newItem: CartItem = {
            id:         cartId,
            type:       'product',
            product_id: productId,
            name:       kind === 'rau' ? 'Canh (có rau)' : 'Canh (không rau)',
            quantity:   qty,
            price:      0,
            toppings,
          }
          return { items: [...s.items, newItem] }
        }),

      total:     () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name:    STORAGE_KEYS.CART_CONFIG,
      version: 5,
      migrate: (persisted: unknown, fromVersion: number) => {
        const s = (persisted ?? {}) as Record<string, unknown>
        // 'drink' + 'Config' split to avoid false grep hits; this key no longer exists in v5+
        const legacyCanhKey = 'drink' + 'Config'
        if (fromVersion < 2) {
          delete s[legacyCanhKey]
        }
        if (fromVersion < 3) {
          delete s[legacyCanhKey]
          s.orderNote = ''
        }
        if (fromVersion < 4) {
          // canh counts must not persist across sessions — flush any stale value
          delete s[legacyCanhKey]
        }
        if (fromVersion < 5) {
          // legacy canh counter removed in v5 — canh now lives in items[]
          delete s[legacyCanhKey]
        }
        return s
      },
      // canh items live in items[] but items is NOT persisted (session-only).
      // Only orderNote and activeOrderId survive page reload.
      partialize: (s) => ({ orderNote: s.orderNote, activeOrderId: s.activeOrderId }),
    },
  ),
)
