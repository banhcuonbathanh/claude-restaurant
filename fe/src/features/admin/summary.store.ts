import { create } from 'zustand'
import type { SummaryRange } from './admin.api'

interface SummaryStore {
  range: SummaryRange
  setRange: (r: SummaryRange) => void
}

export const useSummaryStore = create<SummaryStore>(set => ({
  range: 'today',
  setRange: r => set({ range: r }),
}))
