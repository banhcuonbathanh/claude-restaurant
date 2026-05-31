import { ProgressBar } from '@/components/ui/progress-bar'
import { EmptyState }  from '@/components/shared/EmptyState'
import type { Staff, StaffRole, ShiftSlot } from '@/types/staff'

const ROLE_LABELS: Record<StaffRole, string> = {
  chef:     'Bếp',
  cashier:  'Thu ngân',
  staff:    'Nhân viên',
  manager:  'Quản lý',
  admin:    'Admin',
}

const ROLE_BADGE: Record<StaffRole, string> = {
  chef:     'bg-red-100 text-red-700',
  cashier:  'bg-blue-100 text-blue-700',
  staff:    'bg-green-100 text-green-700',
  manager:  'bg-purple-100 text-purple-700',
  admin:    'bg-gray-100 text-gray-700',
}

const SHIFT_LABELS: Record<ShiftSlot, string> = {
  sang:  'Sáng',
  chieu: 'Chiều',
  toi:   'Tối',
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map(w => w[0].toUpperCase())
    .join('')
  return (
    <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold flex items-center justify-center shrink-0">
      {initials || '?'}
    </div>
  )
}

interface Props {
  staff:           Staff[]
  currentUserId:   string | undefined
  currentUserRole: StaffRole | undefined
  onDetail:  (s: Staff) => void
  onEdit:    (s: Staff) => void
  onDelete:  (s: Staff) => void
  onToggle:  (s: Staff) => void
}

export function StaffTable({ staff, currentUserId, currentUserRole, onDetail, onEdit, onDelete, onToggle }: Props) {
  if (staff.length === 0) {
    return <EmptyState message="Không có nhân viên nào phù hợp." />
  }

  const roleLevels: Record<string, number> = {
    customer: 1, chef: 2, cashier: 2, staff: 3, manager: 4, admin: 5,
  }
  const callerLevel = roleLevels[currentUserRole ?? ''] ?? 0

  const canDelete = (s: Staff) => {
    if (s.role === 'manager') return false
    if (s.id === currentUserId) return false
    if (roleLevels[s.role] >= callerLevel) return false
    return true
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Nhân viên</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Username</th>
            <th className="text-center px-4 py-3 font-medium text-gray-600">Vai trò</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Ca làm</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600 w-32">Hiệu suất</th>
            <th className="text-center px-4 py-3 font-medium text-gray-600">Trạng thái</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {staff.map(s => (
            <tr key={s.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Avatar name={s.full_name} />
                  <div>
                    <p className="font-medium text-gray-900 leading-tight">{s.full_name}</p>
                    {s.job_title && (
                      <p className="text-xs text-gray-400 leading-tight">{s.job_title}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-500 font-mono text-xs">{s.username}</td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE[s.role] ?? 'bg-gray-100 text-gray-700'}`}
                  aria-label={`Vai trò: ${ROLE_LABELS[s.role] ?? s.role}`}
                >
                  {ROLE_LABELS[s.role] ?? s.role}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {(s.shifts ?? []).length > 0
                    ? s.shifts.map(sh => (
                        <span key={sh} className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 text-xs">
                          {SHIFT_LABELS[sh] ?? sh}
                        </span>
                      ))
                    : <span className="text-gray-400 text-xs">—</span>
                  }
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="space-y-0.5">
                  <ProgressBar value={s.performance_score} className="w-28" />
                  <p className="text-xs text-gray-400">{s.performance_score}%</p>
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => onToggle(s)}
                  disabled={s.id === currentUserId}
                  className={`min-h-[36px] px-2 py-1 rounded-full text-xs font-medium transition-colors disabled:cursor-not-allowed ${
                    s.is_active
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {s.is_active ? 'Đang HĐ' : 'Vô hiệu'}
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1.5 justify-end">
                  <button
                    onClick={() => onDetail(s)}
                    className="min-h-[36px] px-3 py-1 text-xs border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Chi tiết
                  </button>
                  <button
                    onClick={() => onEdit(s)}
                    className="min-h-[36px] px-3 py-1 text-xs border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Sửa
                  </button>
                  {canDelete(s) && (
                    <button
                      onClick={() => onDelete(s)}
                      className="min-h-[36px] px-3 py-1 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
