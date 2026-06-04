import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, DrinkConfig } from '@/types/cart'
import { STORAGE_KEYS } from '@/lib/storage-keys'

const DEFAULT_DRINK_CONFIG: DrinkConfig = { bowls: 0, vegBowls: 0 }

interface CartState {
  items:            CartItem[]
  tableId:          string | null
  tableName:        string | null
  activeOrderId:    string | null
  paymentMethod:    string | null
  drinkConfig:      DrinkConfig
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
  setDrinkConfig:   (config: DrinkConfig) => void
  setOrderNote:     (note: string) => void
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
      drinkConfig:   DEFAULT_DRINK_CONFIG,
      orderNote:     '',

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

      clearCart: () => set({ items: [], tableId: null, tableName: null, activeOrderId: null, paymentMethod: null, drinkConfig: DEFAULT_DRINK_CONFIG, orderNote: '' }),

      setTableId:       (id)     => set({ tableId: id }),
      setTableName:     (name)   => set({ tableName: name }),
      setActiveOrderId: (id)     => set({ activeOrderId: id }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setDrinkConfig:   (config) => set({ drinkConfig: config }),
      setOrderNote:     (note)   => set({ orderNote: note }),

      total:     () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name:       STORAGE_KEYS.CART_CONFIG,
      version:    3,
      migrate:    (persisted: unknown, fromVersion: number) => {
        const s = (persisted ?? {}) as Record<string, unknown>
        if (fromVersion < 2) {
          s.drinkConfig = DEFAULT_DRINK_CONFIG
        }
        if (fromVersion < 3) {
          s.drinkConfig = DEFAULT_DRINK_CONFIG
          s.orderNote   = ''
        }
        return s
      },
      partialize: (s) => ({ drinkConfig: s.drinkConfig, orderNote: s.orderNote, activeOrderId: s.activeOrderId }),
    },
  ),
)
