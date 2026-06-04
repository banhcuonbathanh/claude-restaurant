'use client'
import { useState } from 'react'
import { useJobGuides, useCreateGuide, useUpdateGuide, useDeleteGuide, useStaffProgressDetail } from '@/hooks/useTrainingQueries'
import { RoleFilterTabs } from '@/components/admin/training/RoleFilterTabs'
import { JobGuideCardGrid } from '@/components/admin/training/JobGuideCardGrid'
import { CompletionTrackingTable } from '@/components/admin/training/CompletionTrackingTable'
import dynamic from 'next/dynamic'
const CreateEditGuideModal = dynamic(() =>
  import('@/components/admin/training/CreateEditGuideModal').then(m => ({ default: m.CreateEditGuideModal }))
)
const TrainingProgressModal = dynamic(() =>
  import('@/components/admin/training/TrainingProgressModal').then(m => ({ default: m.TrainingProgressModal }))
)
import type { JobGuide, StaffRole } from '@/types/training'

export default function TrainingPage() {
  const [activeRole, setActiveRole] = useState<StaffRole | 'all'>('all')

  // Modal 1 state
  const [guideModalOpen, setGuideModalOpen] = useState(false)
  const [editingGuide, setEditingGuide] = useState<JobGuide | null>(null)

  // Modal 2 state
  const [progressModalOpen, setProgressModalOpen] = useState(false)
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [selectedGuideId, setSelectedGuideId] = useState('')
  const [selectedStaffName, setSelectedStaffName] = useState('')
  const [selectedStaffRole, setSelectedStaffRole] = useState<StaffRole>('staff')

  // Queries
  const { data: guides = [], isLoading, isError } = useJobGuides(activeRole)
  const createGuide = useCreateGuide()
  const updateGuide = useUpdateGuide()
  const deleteGuide = useDeleteGuide()

  const { data: progressDetail, isLoading: progressLoading } = useStaffProgressDetail(
    selectedStaffId,
    selectedGuideId,
    progressModalOpen,
  )

  const handleViewProgress = (_guide: JobGuide) => {
    document.getElementById('completion-tracking')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleViewStaffProgress = (staffId: string, guideId: string, staffName: string, staffRole: StaffRole) => {
    setSelectedStaffId(staffId)
    setSelectedGuideId(guideId)
    setSelectedStaffName(staffName)
    setSelectedStaffRole(staffRole)
    setProgressModalOpen(true)
  }

  const handleEdit = (guide: JobGuide) => {
    setEditingGuide(guide)
    setGuideModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá hướng dẫn này?')) return
    deleteGuide.mutate(id)
  }

  const handleNewGuide = () => {
    setEditingGuide(null)
    setGuideModalOpen(true)
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-red-500 text-sm mb-3">Kết nối mạng yếu. Nhấn thử lại.</p>
          <button
            onClick={() => window.location.reload()}
            className="min-h-[44px] px-4 rounded-lg bg-orange-500 text-white text-sm"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Zone A — Page Header (sticky) */}
      <div className="sticky top-0 z-20 bg-card border-b border-border px-6 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-foreground">Đào tạo nhân viên</h1>
          <p className="text-sm text-muted-fg mt-0.5">Quản lý hướng dẫn và theo dõi tiến trình</p>
        </div>
        <button
          onClick={handleNewGuide}
          className="min-h-[44px] px-4 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          + New Guide
        </button>
      </div>

      {/* Zone B — Role Filter Tabs (sticky below header) */}
      <RoleFilterTabs
        activeRole={activeRole}
        guideCount={guides.length}
        onRoleChange={setActiveRole}
      />

      {/* Zone C — Job Guide Cards */}
      <div className="p-6">
        <JobGuideCardGrid
          guides={guides}
          isLoading={isLoading}
          onViewProgress={handleViewProgress}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onNewGuide={handleNewGuide}
        />
      </div>

      {/* Zone D — Completion Tracking Table */}
      {guides.length > 0 && (
        <div id="completion-tracking" className="px-6 pb-8">
          <CompletionTrackingTable
            guides={guides}
            onViewStaffProgress={(staffId, guideId) => {
              const guide = guides.find(g => g.id === guideId)
              handleViewStaffProgress(staffId, guideId, '', (guide?.role ?? 'staff') as StaffRole)
            }}
          />
        </div>
      )}

      {/* Modal 1 — Create / Edit Guide */}
      <CreateEditGuideModal
        open={guideModalOpen}
        guide={editingGuide}
        onClose={() => setGuideModalOpen(false)}
        onCreate={async (data) => { await createGuide.mutateAsync(data) }}
        onUpdate={async (id, data) => { await updateGuide.mutateAsync({ id, body: data }) }}
      />

      {/* Modal 2 — Staff Training Progress Detail */}
      <TrainingProgressModal
        open={progressModalOpen}
        staffId={selectedStaffId}
        staffName={selectedStaffName}
        staffRole={selectedStaffRole}
        detail={progressDetail}
        isLoading={progressLoading}
        onClose={() => setProgressModalOpen(false)}
      />
    </div>
  )
}
