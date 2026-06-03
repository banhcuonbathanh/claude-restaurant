'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { login } from '@/features/auth/auth.api'
import { useAuthStore } from '@/features/auth/auth.store'
import { Loader2 } from 'lucide-react'

const ACCOUNTS: Record<string, { username: string; redirect: string; label: string }> = {
  admin:   { username: 'admin',   redirect: '/admin', label: 'Quản Trị Viên' },
  manager: { username: 'manager', redirect: '/admin', label: 'Quản Lý' },
  cashier: { username: 'cashier', redirect: '/pos',   label: 'Thu Ngân' },
  chef:    { username: 'chef',    redirect: '/kds',   label: 'Đầu Bếp' },
  staff:   { username: 'staff',   redirect: '/admin', label: 'Nhân Viên' },
}

function DevLoginInner() {
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const setAuth       = useAuthStore(s => s.setAuth)
  const [error, setError] = useState<string | null>(null)

  const role = searchParams.get('role') ?? ''
  const account = ACCOUNTS[role]

  useEffect(() => {
    if (!account) {
      setError(`Role không hợp lệ: "${role}". Dùng: admin | manager | cashier | chef | staff`)
      return
    }

    login(account.username, 'Admin@123')
      .then(({ user, access_token }) => {
        setAuth(user, access_token)
        router.replace(account.redirect)
      })
      .catch(() => setError(`Đăng nhập thất bại cho "${role}" — BE có đang chạy không?`))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card rounded-2xl p-8 w-full max-w-sm shadow-lg text-center space-y-4">
          <p className="text-urgent text-sm">{error}</p>
          <div className="flex flex-col gap-2 text-xs text-muted-fg">
            {Object.entries(ACCOUNTS).map(([r, a]) => (
              <a key={r} href={`/dev-login?role=${r}`} className="text-primary hover:underline">
                /dev-login?role={r} → {a.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-fg">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Đang đăng nhập {account?.label ?? role}…</p>
      </div>
    </div>
  )
}

export default function DevLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-fg" />
      </div>
    }>
      <DevLoginInner />
    </Suspense>
  )
}
