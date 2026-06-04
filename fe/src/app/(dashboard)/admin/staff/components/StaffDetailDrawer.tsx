'use client'
import { useState } from 'react'
import { useQuery }  from '@tanstack/react-query'
import { fetchStaffDetail } from '@/features/admin/admin.api'
import { ProgressBar }      from '@/components/ui/progress-bar'
import type { ShiftSlot, StaffRole } from '@/types/staff'

const ROLE_LABELS: Record<StaffRole, string> = {
  chef: 'Bếp', cashier: 'Thu ngân', staff: 'Nhân viên', manager: 'Quản lý', admin: 'Admin',
}

const ROLE_BADGE: Record<StaffRole, string> = {
  chef:    'bg-red-100 text-red-700',
  cashier: 'bg-blue-100 text-blue-700',
  staff:   'bg-green-100 text-green-700',
  manager: 'bg-purple-100 text-purple-700',
  admin:   'bg-muted text-foreground',
}

const SHIFT_LABELS: Record<ShiftSlot, string> = {
  sang: 'Sáng (06:00–14:00)', chieu: 'Chiều (14:00–22:00)', toi: 'Tối (22:00–06:00)',
}

type Tab = 'info' | 'performance' | 'schedule' | 'responsibilities'
const TABS: { id: Tab; label: string }[] = [
  { id: 'info',             label: 'Thông tin' },
  { id: 'performance',      label: 'Hiệu suất' },
  { id: 'schedule',         label: 'Lịch làm việc' },
  { id: 'responsibilities', label: 'Trách nhiệm' },
]

function Avatar({ name, size = 60 }: { name: string; size?: number }) {
  const initials = name.split(' ').filter(Boolean).slice(-2).map(w => w[0].toUpperCase()).join('')
  return (
    <div
      className="rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.3 }}
    >
      {initials || '?'}
    </div>
  )
}

interface Props {
  open:     boolean
  staffId:  string | null
  onClose:  () => void
  onEdit:   (id: string) => void
}

export function StaffDetailDrawer({ open, staffId, onClose, onEdit }: Props) {
  const [tab, setTab] = useState<Tab>('info')

  const { data: staff, isLoading } = useQuery({
    queryKey: ['admin', 'staff', staffId],
    queryFn:  () => fetchStaffDetail(staffId!),
    enabled:  !!staffId && open,
    staleTime: 30_000,
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {isLoading || !staff ? (
          <div className="flex items-center justify-center h-48 text-muted-fg text-sm">Đang tải...</div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start gap-4 px-6 pt-6 pb-4 border-b border-border">
              <Avatar name={staff.full_name} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-base">{staff.full_name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE[staff.role] ?? 'bg-muted text-foreground'}`}>
                    {ROLE_LABELS[staff.role] ?? staff.role}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${staff.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {staff.is_active ? '● Đang HĐ' : '● Vô hiệu'}
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="text-muted-fg hover:text-foreground text-xl leading-none ml-2">✕</button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border px-6 gap-1">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`py-3 px-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                    tab === t.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-muted-fg hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="px-6 py-4 space-y-3 text-sm">
              {tab === 'info' && (
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div><dt className="text-muted-fg text-xs">Username</dt><dd className="font-medium text-foreground font-mono">{staff.username}</dd></div>
                  <div><dt className="text-muted-fg text-xs">Vai trò</dt><dd className="font-medium text-foreground">{ROLE_LABELS[staff.role] ?? staff.role}</dd></div>
                  <div><dt className="text-muted-fg text-xs">Vị trí</dt><dd className="font-medium text-foreground">{staff.job_title || '—'}</dd></div>
                  <div>
                    <dt className="text-muted-fg text-xs">Ca làm</dt>
                    <dd className="flex flex-wrap gap-1 mt-0.5">
                      {(staff.shifts ?? []).length > 0
                        ? staff.shifts.map(sh => (
                            <span key={sh} className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 text-xs">
                              {sh === 'sang' ? 'Sáng' : sh === 'chieu' ? 'Chiều' : 'Tối'}
                            </span>
                          ))
                        : <span className="text-muted-fg">—</span>
                      }
                    </dd>
                  </div>
                  <div><dt className="text-muted-fg text-xs">SĐT</dt><dd className="font-medium text-foreground">{staff.phone || '—'}</dd></div>
                  <div><dt className="text-muted-fg text-xs">Email</dt><dd className="font-medium text-foreground">{staff.email || '—'}</dd></div>
                  <div><dt className="text-muted-fg text-xs">Ngày tạo</dt><dd className="font-medium text-foreground">{new Date(staff.created_at).toLocaleDateString('vi-VN')}</dd></div>
                </dl>
              )}

              {tab === 'performance' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-fg">Điểm hiệu suất</span>
                    <span className="font-semibold text-foreground">{staff.performance_score}%</span>
                  </div>
                  <ProgressBar value={staff.performance_score} />
                  {staff.performance_score === 0 && (
                    <p className="text-muted-fg text-xs text-center py-4">Chưa có dữ liệu hiệu suất</p>
                  )}
                </div>
              )}

              {tab === 'schedule' && (
                <div className="space-y-2">
                  {(staff.shifts ?? []).length > 0 ? (
                    staff.shifts.map(sh => (
                      <div key={sh} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                        <span className="w-16 text-xs font-medium text-orange-700 bg-orange-50 dark:bg-orange-950 dark:text-orange-300 rounded px-1.5 py-0.5 text-center">
                          {sh === 'sang' ? 'Sáng' : sh === 'chieu' ? 'Chiều' : 'Tối'}
                        </span>
                        <span className="text-muted-fg text-xs">{SHIFT_LABELS[sh]}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-fg text-xs text-center py-4">Chưa có lịch làm việc</p>
                  )}
                </div>
              )}

              {tab === 'responsibilities' && (
                <div>
                  {staff.responsibilities ? (
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">{staff.responsibilities}</p>
                  ) : (
                    <p className="text-muted-fg text-xs text-center py-4">Chưa có mô tả trách nhiệm</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 pb-6 pt-2">
              <button
                onClick={() => { onClose(); onEdit(staff.id) }}
                className="flex-1 min-h-[44px] py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
              >
                Sửa thông tin
              </button>
              <button
                onClick={onClose}
                className="flex-1 min-h-[44px] py-2 border border-border text-foreground rounded-lg text-sm hover:bg-muted"
              >
                Đóng
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
