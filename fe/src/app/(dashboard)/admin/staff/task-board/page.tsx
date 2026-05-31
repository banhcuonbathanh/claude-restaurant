'use client'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { KPICard } from '@/components/shared/KPICard'
import { EmptyState } from '@/components/shared/EmptyState'
import { BreadcrumbPageHeader } from './components/BreadcrumbPageHeader'
import { StaffTaskFilterBar } from './components/StaffTaskFilterBar'
import { StaffTaskTable } from './components/StaffTaskTable'
import dynamic from 'next/dynamic'
const CreateTaskModal = dynamic(() =>
  import('./components/CreateTaskModal').then(m => ({ default: m.CreateTaskModal }))
)
import { getTaskStats, getStaffTasks } from '@/features/admin/admin.api'
import type { TaskBoardFilters } from '@/types/task'

const TODAY = new Date().toISOString().slice(0, 10)

export default function StaffTaskBoardPage() {
  const [filters, setFilters] = useState<TaskBoardFilters>({
    date:   TODAY,
    role:   'all',
    status: 'all',
    search: '',
  })
  const [expandedStaffId, setExpandedStaffId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [defaultStaffId, setDefaultStaffId] = useState<string | undefined>()

  // Zone D + E — daily stats + staff list
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'tasks', 'stats', filters.date],
    queryFn:  () => getTaskStats(filters.date),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })

  // Zone F — individual staff tasks, lazy on row expand
  const { data: expandedTasks = [], isLoading: expandedLoading, isError: expandedError } = useQuery({
    queryKey: ['admin', 'tasks', expandedStaffId, filters.date],
    queryFn:  () => getStaffTasks(expandedStaffId!, filters.date),
    enabled:  !!expandedStaffId,
    staleTime: 15 * 1000,
  })

  const metrics = statsData?.metrics
  const allStaff = statsData?.staffStats ?? []

  // Client-side filter (role / status / search) — no extra API call
  const filteredStaff = useMemo(() => {
    return allStaff.filter(s => {
      if (filters.role !== 'all' && s.role !== filters.role) return false
      if (filters.status !== 'all') {
        // "overdue" filter → only rows with hasOverdue
        if (filters.status === 'overdue' && !s.hasOverdue) return false
      }
      if (filters.search && !s.staffName.toLowerCase().includes(filters.search.toLowerCase())) return false
      return true
    })
  }, [allStaff, filters])

  function handleToggleExpand(staffId: string) {
    setExpandedStaffId(prev => (prev === staffId ? null : staffId))
  }

  function handleAssign(staffId: string) {
    setDefaultStaffId(staffId)
    setModalOpen(true)
  }

  function handleAddTask() {
    setDefaultStaffId(undefined)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Zone B — Breadcrumb + CTA */}
      <BreadcrumbPageHeader
        breadcrumbs={['Admin', 'Nhân viên', 'Bảng công việc']}
        onAddTask={handleAddTask}
      />

      {/* Zone C — Filters */}
      <StaffTaskFilterBar filters={filters} onChange={setFilters} />

      {/* Zone D — KPI row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPICard
          label="Tổng công việc hôm nay"
          value={statsLoading ? '…' : String(metrics?.totalTasks ?? 0)}
        />
        <KPICard
          label="Hoàn thành"
          value={statsLoading ? '…' : String(metrics?.completedTasks ?? 0)}
          badge="✓"
          badgeVariant="success"
        />
        <KPICard
          label="Đang thực hiện"
          value={statsLoading ? '…' : String(metrics?.inProgressTasks ?? 0)}
          badgeVariant="secondary"
        />
        <KPICard
          label="Quá hạn"
          value={statsLoading ? '…' : String(metrics?.overdueTasks ?? 0)}
          badge="!"
          badgeVariant="danger"
        />
      </div>

      {/* Zone E / G — Staff table or empty state */}
      {!statsLoading && filteredStaff.length === 0 ? (
        <EmptyState
          icon="📋"
          message="Không tìm thấy kết quả — thử đổi bộ lọc hoặc thêm công việc mới"
        />
      ) : (
        <StaffTaskTable
          rows={filteredStaff}
          expandedId={expandedStaffId}
          expandedTasks={expandedTasks}
          isExpandedLoading={expandedLoading}
          isExpandedError={expandedError}
          onToggleExpand={handleToggleExpand}
          onAssign={handleAssign}
        />
      )}

      {/* Modal M1 — conditionally mounted so useForm re-initialises with correct defaultStaffId each open */}
      {modalOpen && (
        <CreateTaskModal
          open={modalOpen}
          defaultStaffId={defaultStaffId}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  )
}
