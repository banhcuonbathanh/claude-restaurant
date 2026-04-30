'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/features/auth/auth.store'
import { getMe } from '@/features/auth/auth.api'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const setAuth = useAuthStore((s) => s.setAuth)
  const router = useRouter()
  // Stable ref so the effect only fires once on mount
  const attempted = useRef(false)

  useEffect(() => {
    if (user || attempted.current) return
    attempted.current = true
    getMe()
      .then(u => setAuth(u, useAuthStore.getState().accessToken ?? ''))
      .catch(() => router.push('/login'))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!user) return null
  return <>{children}</>
}
