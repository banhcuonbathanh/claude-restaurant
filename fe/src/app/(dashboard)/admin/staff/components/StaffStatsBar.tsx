import { KPICard } from '@/components/shared/KPICard'
import type { Staff, StaffRole } from '@/types/staff'

const ROLE_LABELS: Record<StaffRole, string> = {
  chef:     'Bếp',
  cashier:  'Thu ngân',
  staff:    'NV',
  manager:  'QL',
  admin:    'Admin',
}

interface Props {
  staffList: Staff[]
}

export function StaffStatsBar({ staffList }: Props) {
  const total    = staffList.length
  const active   = staffList.filter(s => s.is_active).length
  const inactive = total - active

  const byRole = staffList.reduce<Record<string, number>>((acc, s) => {
    acc[s.role] = (acc[s.role] ?? 0) + 1
    return acc
  }, {})

  const roleBreakdown = Object.entries(byRole)
    .map(([role, count]) => `${ROLE_LABELS[role as StaffRole] ?? role}:${count}`)
    .join(' · ')

  return (
    <div className="grid grid-cols-4 gap-4">
      <KPICard label="Tổng nhân viên" value={String(total)} />
      <KPICard
        label="Đang hoạt động"
        value={String(active)}
        badge={active > 0 ? 'Đang HĐ' : undefined}
        badgeVariant="success"
      />
      <KPICard
        label="Vô hiệu hóa"
        value={String(inactive)}
        badge={inactive > 0 ? 'Vô hiệu' : undefined}
        badgeVariant="danger"
      />
      <KPICard
        label="Theo vai trò"
        value={String(total)}
        subLabel={roleBreakdown || '—'}
      />
    </div>
  )
}
