'use client'
import { Input } from '@/components/ui/input'
import type { TaskBoardFilters } from '@/types/task'

interface Props {
  filters: TaskBoardFilters
  onChange: (f: TaskBoardFilters) => void
}

const ROLES = [
  { value: 'all',     label: 'Tất cả vai trò' },
  { value: 'kitchen', label: 'Bếp' },
  { value: 'cashier', label: 'Thu ngân' },
  { value: 'server',  label: 'Phục vụ' },
  { value: 'chef',    label: 'Đầu bếp' },
  { value: 'staff',   label: 'Nhân viên' },
]

const STATUSES = [
  { value: 'all',        label: 'Tất cả trạng thái' },
  { value: 'pending',     label: 'Chờ' },
  { value: 'in_progress', label: 'Đang làm' },
  { value: 'completed',   label: 'Hoàn thành' },
  { value: 'overdue',     label: 'Quá hạn' },
]

export function StaffTaskFilterBar({ filters, onChange }: Props) {
  const set = (patch: Partial<TaskBoardFilters>) => onChange({ ...filters, ...patch })

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="date"
        value={filters.date}
        onChange={e => set({ date: e.target.value })}
        className="min-h-[44px] rounded-md border border-border bg-card text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
      <select
        value={filters.role}
        onChange={e => set({ role: e.target.value })}
        className="min-h-[44px] rounded-md border border-border bg-card text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
      >
        {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
      </select>
      <select
        value={filters.status}
        onChange={e => set({ status: e.target.value })}
        className="min-h-[44px] rounded-md border border-border bg-card text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
      >
        {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      <Input
        placeholder="Tìm tên nhân viên…"
        value={filters.search}
        onChange={e => set({ search: e.target.value })}
        className="min-h-[44px] w-56"
      />
    </div>
  )
}
