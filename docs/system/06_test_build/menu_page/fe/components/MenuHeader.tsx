// P-SYSTEST reference build — Zone A per menu_spec_v3_visual.md (2026-06-11 redesign:
// title + table label + Đăng nhập/Đăng xuất only — no fav/settings/cart icons, no order dot).
'use client'
import { useRouter } from 'next/navigation'
import { LogIn, LogOut } from 'lucide-react'
import { useSettingsStore } from '../store/settings'
// In production these come from features/auth — referenced here for completeness:
// import { useAuthStore } from '@/features/auth/auth.store'
// import { logout } from '@/features/auth/auth.api'
import { useAuthStore, logout } from '../store/_auth-stub'

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
          <button onClick={handleLogout} className="min-h-[44px] flex items-center gap-1.5 border border-border rounded-lg px-3 text-sm text-foreground">
            <LogOut size={14} />
            Đăng xuất
          </button>
        ) : (
          <button onClick={() => router.push('/login')} className="min-h-[44px] flex items-center gap-1.5 border border-border rounded-lg px-3 text-sm text-foreground">
            <LogIn size={14} />
            Đăng nhập
          </button>
        )}
      </div>
    </header>
  )
}
