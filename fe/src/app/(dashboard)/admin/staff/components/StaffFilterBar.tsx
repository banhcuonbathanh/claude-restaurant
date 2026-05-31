import type { StaffRole } from '@/types/staff'

const ROLES: { value: StaffRole | ''; label: string }[] = [
  { value: '',         label: 'Tất cả vai trò' },
  { value: 'chef',     label: 'Bếp' },
  { value: 'cashier',  label: 'Thu ngân' },
  { value: 'staff',    label: 'Nhân viên' },
  { value: 'manager',  label: 'Quản lý' },
  { value: 'admin',    label: 'Admin' },
]

const STATUSES = [
  { value: '',       label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Vô hiệu hóa' },
]

interface Props {
  search:   string
  role:     string
  status:   string
  onSearch: (v: string) => void
  onRole:   (v: string) => void
  onStatus: (v: string) => void
}

export function StaffFilterBar({ search, role, status, onSearch, onRole, onStatus }: Props) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-2 shadow-sm">
      <input
        type="text"
        value={search}
        onChange={e => onSearch(e.target.value)}
        placeholder="🔍 Tìm tên / username..."
        className="flex-1 max-w-sm h-[44px] border border-gray-200 rounded-lg px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      <select
        value={role}
        onChange={e => onRole(e.target.value)}
        className="h-[44px] w-40 border border-gray-200 rounded-lg px-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        {ROLES.map(r => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>
      <select
        value={status}
        onChange={e => onStatus(e.target.value)}
        className="h-[44px] w-44 border border-gray-200 rounded-lg px-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        {STATUSES.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
  )
}
