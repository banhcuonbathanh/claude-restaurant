'use client'
import type { StaffRole } from '@/types/training'

type RoleTab = StaffRole | 'all'

const TABS: { value: RoleTab; label: string }[] = [
  { value: 'all',     label: 'Tất cả' },
  { value: 'chef',    label: 'Bếp' },
  { value: 'cashier', label: 'Thu ngân' },
  { value: 'staff',   label: 'Nhân viên' },
  { value: 'manager', label: 'Quản lý' },
]

interface RoleFilterTabsProps {
  activeRole: RoleTab
  guideCount: number
  onRoleChange: (role: RoleTab) => void
}

export function RoleFilterTabs({ activeRole, guideCount, onRoleChange }: RoleFilterTabsProps) {
  return (
    <div className="sticky top-[92px] z-10 bg-card border-b border-border px-6 py-3 flex items-center gap-1 overflow-x-auto">
      {TABS.map(tab => (
        <button
          key={tab.value}
          onClick={() => onRoleChange(tab.value)}
          className={`min-h-[44px] px-4 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            activeRole === tab.value
              ? 'bg-orange-500 text-white'
              : 'bg-muted text-muted-fg hover:opacity-90'
          }`}
          aria-pressed={activeRole === tab.value}
        >
          {tab.label}
        </button>
      ))}
      <span className="ml-auto text-sm text-muted-fg whitespace-nowrap">
        {guideCount} hướng dẫn
      </span>
    </div>
  )
}
