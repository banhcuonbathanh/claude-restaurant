import { create } from 'zustand'
import type { User } from '@/types/auth'

interface AuthState {
  user:         User | null
  accessToken:  string | null
  setAuth:      (user: User, token: string) => void
  setAccessToken: (token: string) => void
  clearAuth:    () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user:         null,
  accessToken:  null,
  setAuth:         (user, accessToken) => set({ user, accessToken }),
  setAccessToken:  (accessToken) => set({ accessToken }),
  clearAuth:       () => set({ user: null, accessToken: null }),
}))
