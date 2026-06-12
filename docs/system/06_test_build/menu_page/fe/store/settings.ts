// P-SYSTEST reference build — settings store per FE_STRUCTURE Store Fields (fully persisted).
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../lib/storage-keys'

interface SettingsState {
  customerName:    string
  tableLabel:      string
  setCustomerName: (name: string) => void
  setTableLabel:   (label: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      customerName:    '',
      tableLabel:      '',
      setCustomerName: (name)  => set({ customerName: name }),
      setTableLabel:   (label) => set({ tableLabel: label }),
    }),
    { name: STORAGE_KEYS.CUSTOMER_SETTINGS },
  ),
)
