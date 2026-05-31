import { create } from 'zustand'
import type { StaffRole } from '@/types/training'

interface TrainingStore {
  activeRole: StaffRole | 'all'
  selectedGuideId: string
  setActiveRole: (role: StaffRole | 'all') => void
  setSelectedGuideId: (id: string) => void
}

export const useTrainingStore = create<TrainingStore>((set) => ({
  activeRole: 'all',
  selectedGuideId: '',
  setActiveRole: (role) => set({ activeRole: role }),
  setSelectedGuideId: (id) => set({ selectedGuideId: id }),
}))
