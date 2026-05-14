import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  customerName: string
  tableLabel:   string
  setCustomerName: (name: string) => void
  setTableLabel:   (label: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      customerName: '',
      tableLabel:   '',
      setCustomerName: (name)  => set({ customerName: name }),
      setTableLabel:   (label) => set({ tableLabel: label }),
    }),
    { name: 'customer-settings' },
  ),
)
