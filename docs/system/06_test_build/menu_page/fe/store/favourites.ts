// P-SYSTEST reference build — favourites store per menu_spec.md §② (fully persisted,
// stores only {id, type, qty, toppingIds} — names/prices re-resolved from catalog queries).
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../lib/storage-keys'

export interface FavItem {
  id:         string
  type:       'product' | 'combo'
  qty:        number
  toppingIds: string[]
}

interface FavouritesState {
  items:       FavItem[]
  toggleFav:   (id: string, type: 'product' | 'combo') => void
  isFavourite: (id: string, type: 'product' | 'combo') => boolean
}

export const useFavouritesStore = create<FavouritesState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleFav: (id, type) =>
        set((s) => {
          const exists = s.items.some(i => i.id === id && i.type === type)
          return {
            items: exists
              ? s.items.filter(i => !(i.id === id && i.type === type))
              : [...s.items, { id, type, qty: 1, toppingIds: [] }],
          }
        }),

      isFavourite: (id, type) =>
        get().items.some(i => i.id === id && i.type === type),
    }),
    // No partialize — the whole store survives reloads.
    { name: STORAGE_KEYS.FAVOURITES },
  ),
)
