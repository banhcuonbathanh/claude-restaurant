import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/lib/storage-keys'

interface SettingsState {
  customerName: string
  setCustomerName: (name: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      customerName: '',
      setCustomerName: (name)  => set({ customerName: name }),
    }),
    { name: STORAGE_KEYS.CUSTOMER_SETTINGS },
  ),
)
