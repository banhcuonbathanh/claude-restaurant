// P-SYSTEST reference build — stand-in for features/auth (out of scope for the menu slice).
// Production: useAuthStore lives in fe/src/features/auth/auth.store.ts (Zustand, MEMORY ONLY —
// tokens never touch localStorage); logout() in auth.api.ts calls POST /auth/logout.
import { create } from 'zustand'

interface AuthUser { id: string; role: string; name: string }

interface AuthState {
  user:      AuthUser | null
  token:     string | null
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user:      null,
  token:     null,
  clearAuth: () => set({ user: null, token: null }),
}))

export async function logout(): Promise<void> {
  // POST /auth/logout via lib/api-client.ts in production.
}
