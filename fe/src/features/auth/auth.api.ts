import { api } from '@/lib/api-client'
import type { User } from '@/types/auth'

export interface LoginResponse {
  user:         User
  access_token: string
}

export const login = (username: string, password: string): Promise<LoginResponse> =>
  api.post('/auth/login', { username, password }).then(r => r.data.data)

export const logout = (): Promise<void> =>
  api.post('/auth/logout').then(r => r.data)

export const getMe = (): Promise<User> =>
  api.get('/auth/me').then(r => r.data.data)

export const refreshToken = (): Promise<{ access_token: string }> =>
  api.post('/auth/refresh').then(r => r.data.data)
