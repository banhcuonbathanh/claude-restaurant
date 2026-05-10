import { create } from 'zustand'
import type { CartItem } from '@/types/cart'

interface CartState {
  items:            CartItem[]
  tableId:          string | null
  activeOrderId:    string | null
  paymentMethod:    string | null
  addItem:          (item: CartItem) => void
  removeItem:       (id: string) => void
  updateQty:        (id: string, qty: number) => void
  clearCart:        () => void
  setTableId:       (id: string) => void
  setActiveOrderId: (id: string | null) => void
  setPaymentMethod: (method: string) => void
  total:            () => number
  itemCount:        () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items:         [],
  tableId:       null,
  activeOrderId: null,
  paymentMethod: null,

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

  clearCart: () => set({ items: [], tableId: null, activeOrderId: null, paymentMethod: null }),

  setTableId:       (id)     => set({ tableId: id }),
  setActiveOrderId: (id)     => set({ activeOrderId: id }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),

  total:     () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}))
