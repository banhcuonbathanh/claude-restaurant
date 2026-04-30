'use client'
import { useAuthStore } from '@/features/auth/auth.store'
import { Role, type RoleValue } from '@/types/auth'

interface Props {
  minRole:  RoleValue
  children: React.ReactNode
}

export function RoleGuard({ minRole, children }: Props) {
  const user = useAuthStore((s) => s.user)
  const roleValue = user
    ? (Role[user.role.toUpperCase() as keyof typeof Role] ?? 0)
    : 0

  if (roleValue < minRole) {
    return (
      <div className="text-urgent p-8 text-center font-body">
        Không có quyền truy cập trang này
      </div>
    )
  }
  return <>{children}</>
}
