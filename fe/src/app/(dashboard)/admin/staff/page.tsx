'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/features/auth/auth.store'
import { Role } from '@/types/auth'
import {
  listStaff, createStaff, updateStaff, setStaffStatus, deleteStaff,
} from '@/features/admin/admin.api'
import type { Staff, StaffRole } from '@/types/staff'

const ROLE_LABELS: Record<StaffRole, string> = {
  chef:     'Bếp',
  cashier:  'Thu ngân',
  staff:    'Nhân viên',
  manager:  'Quản lý',
  admin:    'Admin',
}

const createSchema = z.object({
  username:  z.string().min(3, 'Tối thiểu 3 ký tự').max(50).regex(/^[a-z0-9_-]+$/, 'Chỉ dùng a-z, 0-9, _, -'),
  password:  z.string().min(8, 'Tối thiểu 8 ký tự').regex(/(?=.*[A-Z])/, 'Cần ít nhất 1 chữ hoa').regex(/(?=.*[0-9])/, 'Cần ít nhất 1 số'),
  full_name: z.string().min(2, 'Tối thiểu 2 ký tự').max(100),
  role:      z.enum(['chef', 'cashier', 'staff', 'manager']),
  phone:     z.string().max(11).optional().or(z.literal('')),
  email:     z.string().email('Email không hợp lệ').optional().or(z.literal('')),
})

const editSchema = z.object({
  full_name: z.string().min(2).max(100),
  role:      z.enum(['chef', 'cashier', 'staff', 'manager']),
  phone:     z.string().max(11).optional().or(z.literal('')),
  email:     z.string().email('Email không hợp lệ').optional().or(z.literal('')),
})

type CreateValues = z.infer<typeof createSchema>
type EditValues   = z.infer<typeof editSchema>

export default function StaffPage() {
  const qc      = useQueryClient()
  const me      = useAuthStore(s => s.user)
  const isAdmin = me ? (Role[me.role.toUpperCase() as keyof typeof Role] ?? 0) >= Role.ADMIN : false

  const [mode,     setMode]     = useState<'add' | 'edit' | null>(null)
  const [editItem, setEditItem] = useState<Staff | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'staff'],
    queryFn:  listStaff,
  })
  const staffList: Staff[] = data?.data ?? []

  const createForm = useForm<CreateValues>({ resolver: zodResolver(createSchema) })
  const editForm   = useForm<EditValues>({ resolver: zodResolver(editSchema) })

  const openAdd = () => {
    createForm.reset({ username: '', password: '', full_name: '', role: 'cashier', phone: '', email: '' })
    setMode('add')
  }
  const openEdit = (s: Staff) => {
    editForm.reset({ full_name: s.full_name, role: s.role as EditValues['role'], phone: s.phone ?? '', email: s.email ?? '' })
    setEditItem(s)
    setMode('edit')
  }
  const closeModal = () => { setMode(null); setEditItem(null) }

  const createMut = useMutation({
    mutationFn: createStaff,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'staff'] })
      toast.success('Đã tạo tài khoản nhân viên')
      closeModal()
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error
      toast.error(code === 'USERNAME_TAKEN' ? 'Tên đăng nhập đã tồn tại' : 'Có lỗi xảy ra')
    },
  })

  const editMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: EditValues }) => updateStaff(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'staff'] })
      toast.success('Đã cập nhật nhân viên')
      closeModal()
    },
    onError: () => toast.error('Có lỗi xảy ra'),
  })

  const statusMut = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      setStaffStatus(id, is_active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'staff'] })
      toast.success('Đã cập nhật trạng thái')
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error
      toast.error(code === 'SELF_DEACTIVATION_FORBIDDEN' ? 'Không thể vô hiệu hóa chính mình' : 'Không đủ quyền')
    },
  })

  const deleteMut = useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'staff'] })
      toast.success('Đã xóa tài khoản')
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error
      toast.error(code === 'LAST_ADMIN' ? 'Không thể xóa admin cuối cùng' : 'Không đủ quyền')
    },
  })

  const handleDelete = (s: Staff) => {
    if (!confirm(`Xóa tài khoản "${s.username}"? Thao tác này không thể phục hồi.`)) return
    deleteMut.mutate(s.id)
  }

  const roles: CreateValues['role'][] = ['chef', 'cashier', 'staff', 'manager']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Nhân viên ({staffList.length})</h2>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          + Thêm nhân viên
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500 text-sm">Đang tải...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tên đầy đủ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Username</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Vai trò</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Trạng thái</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staffList.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.full_name}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{s.username}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {ROLE_LABELS[s.role] ?? s.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => statusMut.mutate({ id: s.id, is_active: !s.is_active })}
                      disabled={s.id === me?.id}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-colors disabled:cursor-not-allowed ${
                        s.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                      title={s.id === me?.id ? 'Không thể thay đổi trạng thái của chính mình' : undefined}
                    >
                      {s.is_active ? 'Đang hoạt động' : 'Vô hiệu'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEdit(s)}
                        className="px-3 py-1 text-xs border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Sửa
                      </button>
                      {isAdmin && s.id !== me?.id && (
                        <button
                          onClick={() => handleDelete(s)}
                          className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {staffList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                    Chưa có nhân viên nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add modal */}
      {mode === 'add' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-900">Thêm nhân viên</h3>
            </div>
            <form
              onSubmit={createForm.handleSubmit(v => createMut.mutate(v))}
              className="px-6 py-4 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    {...createForm.register('username')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="chef_an"
                  />
                  {createForm.formState.errors.username && (
                    <p className="text-red-500 text-xs mt-1">{createForm.formState.errors.username.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                  <input
                    type="password"
                    {...createForm.register('password')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {createForm.formState.errors.password && (
                    <p className="text-red-500 text-xs mt-1">{createForm.formState.errors.password.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên đầy đủ</label>
                <input
                  {...createForm.register('full_name')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nguyễn Văn An"
                />
                {createForm.formState.errors.full_name && (
                  <p className="text-red-500 text-xs mt-1">{createForm.formState.errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                <select
                  {...createForm.register('role')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {roles.map(r => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    {...createForm.register('phone')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0901234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    {...createForm.register('email')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="an@quán.vn"
                  />
                  {createForm.formState.errors.email && (
                    <p className="text-red-500 text-xs mt-1">{createForm.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={createMut.isPending}
                  className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
                >
                  {createMut.isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {mode === 'edit' && editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-900">Sửa nhân viên — {editItem.username}</h3>
            </div>
            <form
              onSubmit={editForm.handleSubmit(v => editMut.mutate({ id: editItem.id, body: v }))}
              className="px-6 py-4 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên đầy đủ</label>
                <input
                  {...editForm.register('full_name')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {editForm.formState.errors.full_name && (
                  <p className="text-red-500 text-xs mt-1">{editForm.formState.errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                <select
                  {...editForm.register('role')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {roles.map(r => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    {...editForm.register('phone')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    {...editForm.register('email')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {editForm.formState.errors.email && (
                    <p className="text-red-500 text-xs mt-1">{editForm.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={editMut.isPending}
                  className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
                >
                  {editMut.isPending ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
