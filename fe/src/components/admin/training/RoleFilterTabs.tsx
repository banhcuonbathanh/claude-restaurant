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
    <div className="sticky top-[92px] z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-1 overflow-x-auto">
      {TABS.map(tab => (
        <button
          key={tab.value}
          onClick={() => onRoleChange(tab.value)}
          className={`min-h-[44px] px-4 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            activeRole === tab.value
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          aria-pressed={activeRole === tab.value}
        >
          {tab.label}
        </button>
      ))}
      <span className="ml-auto text-sm text-gray-400 whitespace-nowrap">
        {guideCount} hướng dẫn
      </span>
    </div>
  )
}
