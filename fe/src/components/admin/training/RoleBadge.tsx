import type { StaffRole } from '@/types/training'

const ROLE_CONFIG: Record<StaffRole | 'all', { label: string; className: string }> = {
  all:      { label: 'Tất cả',     className: 'bg-gray-100 text-gray-700' },
  chef:     { label: 'Bếp',        className: 'bg-green-100 text-green-700' },
  cashier:  { label: 'Thu ngân',   className: 'bg-blue-100 text-blue-700' },
  staff:    { label: 'Nhân viên',  className: 'bg-purple-100 text-purple-700' },
  manager:  { label: 'Quản lý',   className: 'bg-orange-100 text-orange-700' },
}

interface RoleBadgeProps {
  role: StaffRole | 'all'
  className?: string
}

export function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.all
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className} ${className}`}
      aria-label={`Vai trò: ${config.label}`}
    >
      {config.label}
    </span>
  )
}

export { ROLE_CONFIG }
