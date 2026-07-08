import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/lib/storage-keys'

export type FavouriteTab = 'all' | 'product' | 'combo'

export interface FavouriteItem {
  id:         string                 // product_id or combo_id (UUID)
  type:       'product' | 'combo'
  qty:        number                 // min: 1
  toppingIds: string[]
}

export interface FavouriteSet {
  id:        string                  // UUID generated client-side
  name:      string
  createdAt: string                  // ISO timestamp
  items:     FavouriteItem[]         // snapshot at save time
  pinned?:   boolean                 // 📌 pinned → surfaces in the menu "Yêu thích" rail for one-tap re-add
}

// A "Tự tạo suất" (custom suất) — personal recipe built in the favourites builder.
// Ordered as món-lẻ lines (one order item per line), never as a combo.
export interface SuatLine {
  productId: string
  quantity:  number
  toppingId: string | null           // chosen nhân topping (null = no nhân / canh)
  note:      string                  // free-text ghi chú (empty if none)
}

// A whole combo included in a custom suất (ordered as a real combo, like the menu).
export interface SuatComboLine {
  comboId:    string
  quantity:   number
  toppingIds: string[]               // chosen nhân toppings on the combo
}

export interface CustomSuat {
  id:         string                 // UUID generated client-side
  name:       string
  createdAt:  string                 // ISO timestamp
  lines:      SuatLine[]
  comboLines?: SuatComboLine[]       // combos picked in the builder (real combo lines)
  image?:     string                 // cover image: a menu image URL, or an uploaded data URL (empty = 🍽️ default)
}

export interface FavouriteItemResolved extends FavouriteItem {
  name:              string
  imageUrl:          string | null
  basePrice:         number
  selectedToppings:  Array<{ id: string; name: string; price: number }>
  comboItems:        Array<{ name: string; qty: number }>
  subtotalPerPortion: number
}

interface FavouritesState {
  items:       FavouriteItem[]
  sets:        FavouriteSet[]
  suats:       CustomSuat[]
  addItem:     (item: FavouriteItem) => void
  removeItem:  (id: string) => void
  updateQty:   (id: string, qty: number) => void
  addSet:      (name: string) => void
  renameSet:   (id: string, name: string) => void
  deleteSet:   (id: string) => void
  togglePinSet:(id: string) => void
  addSuat:     (name: string, lines: SuatLine[], comboLines?: SuatComboLine[], image?: string) => void
  deleteSuat:  (id: string) => void
  isFavourite: (id: string, type: 'product' | 'combo') => boolean
  toggleFav:   (id: string, type: 'product' | 'combo') => void
}

export const useFavouritesStore = create<FavouritesState>()(
  persist(
    (set, get) => ({
      items: [],
      sets:  [],
      suats: [],

      addItem: (item) => set(s => {
        if (s.items.some(i => i.id === item.id && i.type === item.type)) return s
        return { items: [...s.items, item] }
      }),

      removeItem: (id) =>
        set(s => ({ items: s.items.filter(i => i.id !== id) })),

      updateQty: (id, qty) =>
        set(s => ({
          items: s.items.map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i),
        })),

      addSet: (name) =>
        set(s => ({
          sets: [...s.sets, {
            id:        crypto.randomUUID(),
            name,
            createdAt: new Date().toISOString(),
            items:     [...s.items],
          }],
        })),

      renameSet: (id, name) =>
        set(s => ({
          sets: s.sets.map(set => set.id === id ? { ...set, name } : set),
        })),

      deleteSet: (id) =>
        set(s => ({ sets: s.sets.filter(set => set.id !== id) })),

      togglePinSet: (id) =>
        set(s => ({
          sets: s.sets.map(set => set.id === id ? { ...set, pinned: !set.pinned } : set),
        })),

      addSuat: (name, lines, comboLines, image) =>
        set(s => ({
          suats: [...s.suats, {
            id:        crypto.randomUUID(),
            name,
            createdAt: new Date().toISOString(),
            lines,
            ...(comboLines && comboLines.length > 0 ? { comboLines } : {}),
            ...(image ? { image } : {}),
          }],
        })),

      deleteSuat: (id) =>
        set(s => ({ suats: s.suats.filter(su => su.id !== id) })),

      isFavourite: (id, type) =>
        get().items.some(i => i.id === id && i.type === type),

      toggleFav: (id, type) => {
        const exists = get().isFavourite(id, type)
        if (exists) {
          set(s => ({ items: s.items.filter(i => !(i.id === id && i.type === type)) }))
        } else {
          set(s => ({ items: [...s.items, { id, type, qty: 1, toppingIds: [] }] }))
        }
      },
    }),
    { name: STORAGE_KEYS.FAVOURITES },
  ),
)
