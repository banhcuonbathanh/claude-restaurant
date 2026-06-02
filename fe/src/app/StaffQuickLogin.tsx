'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/features/auth/auth.api'
import { useAuthStore } from '@/features/auth/auth.store'
import { Loader2 } from 'lucide-react'

const STAFF = [
  { label: 'Quản Trị Viên', role: 'admin',   username: 'admin',   redirect: '/admin' },
  { label: 'Quản Lý',       role: 'manager', username: 'manager', redirect: '/admin' },
  { label: 'Thu Ngân',      role: 'cashier', username: 'cashier', redirect: '/pos'   },
  { label: 'Đầu Bếp',      role: 'chef',    username: 'chef',    redirect: '/kds'   },
  { label: 'Nhân Viên',     role: 'staff',   username: 'staff',   redirect: '/admin' },
]

const ROLE_STYLE: Record<string, string> = {
  admin:   'border-primary/40   bg-primary/10   text-primary   hover:bg-primary/20',
  manager: 'border-success/40   bg-success/10   text-success   hover:bg-success/20',
  cashier: 'border-warning/40   bg-warning/10   text-warning   hover:bg-warning/20',
  chef:    'border-urgent/40    bg-urgent/10    text-urgent    hover:bg-urgent/20',
  staff:   'border-border       bg-card         text-foreground hover:bg-muted',
}

export default function StaffQuickLogin() {
  const router   = useRouter()
  const setAuth  = useAuthStore(s => s.setAuth)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)

  const handleLogin = async (s: typeof STAFF[number]) => {
    setLoading(s.username)
    setError(null)
    try {
      const { user, access_token } = await login(s.username, 'Admin@123')
      setAuth(user, access_token)
      router.push(s.redirect)
    } catch {
      setError(`Đăng nhập thất bại cho ${s.label}`)
      setLoading(null)
    }
  }

  return (
    <section className="border-b border-border bg-card/20 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 text-center">
          <span className="inline-block rounded-full border border-border px-3 py-0.5 text-xs text-muted-fg mb-2">
            Đăng Nhập Nhanh
          </span>
          <h2 className="font-display text-2xl font-bold">Chọn Vai Trò Để Vào Hệ Thống</h2>
          <p className="mt-1 text-sm text-muted-fg">Click vào vai trò để tự động đăng nhập</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {STAFF.map((s) => (
            <button
              key={s.username}
              onClick={() => handleLogin(s)}
              disabled={loading !== null}
              className={`flex items-center gap-2.5 rounded-xl border px-5 py-3 text-sm font-semibold transition-all disabled:opacity-50 ${ROLE_STYLE[s.role]}`}
            >
              {loading === s.username
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <span className="h-2 w-2 rounded-full bg-current opacity-70" />
              }
              {s.label}
              <span className="text-xs font-normal opacity-60">({s.role})</span>
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-urgent">{error}</p>
        )}
      </div>
    </section>
  )
}
