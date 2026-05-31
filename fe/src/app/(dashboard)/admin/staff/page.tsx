'use client'
import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/features/auth/auth.store'
import {
  listStaff, createStaff, updateStaff, setStaffStatus, deleteStaff,
} from '@/features/admin/admin.api'
import type { Staff, StaffRole } from '@/types/staff'
import { StaffPageHeader }   from './components/StaffPageHeader'
import { StaffStatsBar }     from './components/StaffStatsBar'
import { StaffFilterBar }    from './components/StaffFilterBar'
import { StaffTable }        from './components/StaffTable'
import dynamic from 'next/dynamic'
const AddEditStaffModal = dynamic(() =>
  import('./components/AddEditStaffModal').then(m => ({ default: m.AddEditStaffModal }))
)
const StaffDetailDrawer = dynamic(() =>
  import('./components/StaffDetailDrawer').then(m => ({ default: m.StaffDetailDrawer }))
)
import { Pagination }        from '@/components/shared/Pagination'
import { EmptyState }        from '@/components/shared/EmptyState'

const PAGE_SIZE = 10

export default function StaffPage() {
  const qc   = useQueryClient()
  const user = useAuthStore(s => s.user)

  // ── filter state ─────────────────────────────────────────────────────────────
  const [search,     setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page,       setPage]       = useState(1)

  // ── modal state ───────────────────────────────────────────────────────────────
  const [modal,      setModal]      = useState<'add' | 'edit' | null>(null)
  const [editStaff,  setEditStaff]  = useState<Staff | null>(null)
  const [detailId,   setDetailId]   = useState<string | null>(null)

  // ── data ─────────────────────────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'staff'],
    queryFn:  listStaff,
    staleTime: 0,
    refetchOnWindowFocus: true,
  })
  const allStaff: Staff[] = data?.data ?? []

  // ── client-side filter + paginate ────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return allStaff.filter(s => {
      if (q && !s.full_name.toLowerCase().includes(q) && !s.username.toLowerCase().includes(q)) return false
      if (roleFilter && s.role !== roleFilter) return false
      if (statusFilter === 'active'   && !s.is_active) return false
      if (statusFilter === 'inactive' &&  s.is_active) return false
      return true
    })
  }, [allStaff, search, roleFilter, statusFilter])

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage    = Math.min(page, totalPages)
  const paginated   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // ── mutations ─────────────────────────────────────────────────────────────────
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'staff'] })

  const createMut = useMutation({
    mutationFn: createStaff,
    onSuccess: () => { invalidate(); toast.success('Đã tạo tài khoản nhân viên'); closeModal() },
    onError:   (err: any) => {
      const code = err?.response?.data?.error
      if (code === 'USERNAME_TAKEN') {
        toast.error('Tên đăng nhập đã tồn tại')
      } else {
        toast.error('Có lỗi xảy ra')
      }
    },
  })

  const editMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updateStaff>[1] }) =>
      updateStaff(id, body),
    onSuccess: () => { invalidate(); toast.success('Đã cập nhật nhân viên'); closeModal() },
    onError:   () => toast.error('Có lỗi xảy ra'),
  })

  const statusMut = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      setStaffStatus(id, is_active),
    onSuccess: () => { invalidate(); toast.success('Đã cập nhật trạng thái') },
    onError:   (err: any) => {
      const code = err?.response?.data?.error
      toast.error(code === 'SELF_DEACTIVATION_FORBIDDEN' ? 'Không thể vô hiệu hóa chính mình' : 'Không đủ quyền')
    },
  })

  const deleteMut = useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => { invalidate(); toast.success('Đã xóa tài khoản') },
    onError:   (err: any) => {
      const code = err?.response?.data?.error
      toast.error(code === 'LAST_ADMIN' ? 'Không thể xóa admin cuối cùng' : 'Không đủ quyền')
    },
  })

  // ── handlers ──────────────────────────────────────────────────────────────────
  const openAdd  = () => { setEditStaff(null); setModal('add') }
  const openEdit = (s: Staff) => { setEditStaff(s); setModal('edit') }
  const closeModal = () => { setModal(null); setEditStaff(null) }

  const handleFormSubmit = (values: any) => {
    if (modal === 'add') {
      createMut.mutate(values)
    } else if (modal === 'edit' && editStaff) {
      editMut.mutate({ id: editStaff.id, body: values })
    }
  }

  const handleToggle = (s: Staff) => {
    if (!s.is_active) {
      if (!confirm('Kích hoạt lại nhân viên này?')) return
    }
    statusMut.mutate({ id: s.id, is_active: !s.is_active })
  }

  const handleDelete = (s: Staff) => {
    if (!confirm(`Xóa tài khoản "${s.username}"? Thao tác này không thể phục hồi.`)) return
    deleteMut.mutate(s.id)
  }

  const handleEditFromDetail = (id: string) => {
    const s = allStaff.find(x => x.id === id)
    if (s) openEdit(s)
  }

  // ── render ────────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="space-y-4">
        <EmptyState message="Không tải được danh sách. Thử lại." />
        <div className="flex justify-center">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  const isMutating = createMut.isPending || editMut.isPending

  return (
    <div className="space-y-4">
      {/* Zone A — PageHeader */}
      <StaffPageHeader totalCount={allStaff.length} onAdd={openAdd} />

      {/* Zone B — StatsBar */}
      {!isLoading && <StaffStatsBar staffList={allStaff} />}

      {/* Zone C — FilterBar */}
      <StaffFilterBar
        search={search}     onSearch={v => { setSearch(v); setPage(1) }}
        role={roleFilter}   onRole={v => { setRoleFilter(v); setPage(1) }}
        status={statusFilter} onStatus={v => { setStatusFilter(v); setPage(1) }}
      />

      {/* Zone D — StaffTable */}
      {isLoading ? (
        <p className="text-gray-500 text-sm py-8 text-center">Đang tải...</p>
      ) : (
        <StaffTable
          staff={paginated}
          currentUserId={user?.id}
          currentUserRole={user?.role as StaffRole | undefined}
          onDetail={s => setDetailId(s.id)}
          onEdit={openEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      )}

      {/* Zone E — Pagination */}
      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Modal M1 — Add / Edit */}
      <AddEditStaffModal
        open={modal !== null}
        mode={modal ?? 'add'}
        staff={editStaff}
        loading={isMutating}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
      />

      {/* Modal M2 — Detail */}
      <StaffDetailDrawer
        open={detailId !== null}
        staffId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={handleEditFromDetail}
      />
    </div>
  )
}
