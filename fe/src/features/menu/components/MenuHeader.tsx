'use client'
import { useRouter } from 'next/navigation'
import { LogIn, LogOut } from 'lucide-react'
import { useSettingsStore } from '@/store/settings'
import { useAuthStore } from '@/features/auth/auth.store'
import { logout } from '@/features/auth/auth.api'
import { Button } from '@/components/ui/button'

export function MenuHeader() {
  const router         = useRouter()
  const { tableLabel } = useSettingsStore()
  const user           = useAuthStore(s => s.user)
  const clearAuth      = useAuthStore(s => s.clearAuth)

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // session may already be expired server-side — still clear locally
    }
    clearAuth()
  }

  return (
    <header className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex flex-col leading-none min-w-0">
        <h1 className="font-display text-xl text-foreground font-semibold truncate">Quán Bánh Cuốn</h1>
        {tableLabel && (
          <span className="text-xs text-muted-fg mt-0.5 truncate">{tableLabel}</span>
        )}
      </div>
      <div className="flex-shrink-0">
        {user ? (
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
            <LogOut size={14} />
            Đăng xuất
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => router.push('/login')} className="gap-1.5">
            <LogIn size={14} />
            Đăng nhập
          </Button>
        )}
      </div>
    </header>
  )
}
