import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavouritesState {
  ids: string[]
  toggle: (id: string) => void
  isFavourite: (id: string) => boolean
}

export const useFavouritesStore = create<FavouritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set(s => ({
          ids: s.ids.includes(id) ? s.ids.filter(i => i !== id) : [...s.ids, id],
        })),
      isFavourite: (id) => get().ids.includes(id),
    }),
    { name: 'favourites' },
  ),
)
