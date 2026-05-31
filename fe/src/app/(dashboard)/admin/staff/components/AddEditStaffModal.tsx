'use client'
import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Staff, ShiftSlot } from '@/types/staff'

const SHIFTS: { value: ShiftSlot; label: string }[] = [
  { value: 'sang',  label: 'Sáng' },
  { value: 'chieu', label: 'Chiều' },
  { value: 'toi',   label: 'Tối' },
]

const ROLES = [
  { value: 'chef',     label: 'Bếp' },
  { value: 'cashier',  label: 'Thu ngân' },
  { value: 'staff',    label: 'Nhân viên' },
  { value: 'manager',  label: 'Quản lý' },
]

const baseSchema = z.object({
  full_name:        z.string().min(2, 'Tối thiểu 2 ký tự').max(100),
  role:             z.enum(['chef', 'cashier', 'staff', 'manager']),
  job_title:        z.string().max(100).optional().or(z.literal('')),
  shifts:           z.array(z.enum(['sang', 'chieu', 'toi'])).min(0),
  responsibilities: z.string().max(500).optional().or(z.literal('')),
  phone:            z.string().max(11).optional().or(z.literal('')),
  email:            z.string().email('Email không hợp lệ').optional().or(z.literal('')),
})

const createSchema = baseSchema.extend({
  username: z.string().min(3, 'Tối thiểu 3 ký tự').max(50).regex(/^[a-z0-9_-]+$/, 'Chỉ dùng a-z, 0-9, _, -'),
  password: z.string().min(8, 'Tối thiểu 8 ký tự')
    .regex(/(?=.*[A-Z])/, 'Cần ít nhất 1 chữ hoa')
    .regex(/(?=.*[0-9])/, 'Cần ít nhất 1 số'),
})

const editSchema = baseSchema

type CreateValues = z.infer<typeof createSchema>
type EditValues   = z.infer<typeof editSchema>
type FormValues   = CreateValues

interface Props {
  open:    boolean
  mode:    'add' | 'edit'
  staff?:  Staff | null
  loading: boolean
  onClose: () => void
  onSubmit: (data: FormValues) => void
}

export function AddEditStaffModal({ open, mode, staff, loading, onClose, onSubmit }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(mode === 'add' ? createSchema : editSchema),
    defaultValues: {
      username:         '',
      password:         '',
      full_name:        '',
      role:             'cashier',
      job_title:        '',
      shifts:           [],
      responsibilities: '',
      phone:            '',
      email:            '',
    },
  })

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && staff) {
      form.reset({
        full_name:        staff.full_name,
        role:             staff.role as FormValues['role'],
        job_title:        staff.job_title ?? '',
        shifts:           (staff.shifts ?? []) as ShiftSlot[],
        responsibilities: staff.responsibilities ?? '',
        phone:            staff.phone ?? '',
        email:            staff.email ?? '',
      })
    } else if (mode === 'add') {
      form.reset({
        username: '', password: '', full_name: '', role: 'cashier',
        job_title: '', shifts: [], responsibilities: '', phone: '', email: '',
      })
    }
  }, [open, mode, staff])

  if (!open) return null

  const err = form.formState.errors

  const field = (name: string) =>
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">
            {mode === 'add' ? 'Thêm nhân viên' : `Sửa — ${staff?.username}`}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
          {mode === 'add' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input {...form.register('username')} className={field('username')} placeholder="chef_an" />
                {err.username && <p className="text-red-500 text-xs mt-1">{err.username.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
                <input type="password" {...form.register('password')} className={field('password')} />
                {err.password && <p className="text-red-500 text-xs mt-1">{err.password.message}</p>}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên đầy đủ *</label>
            <input {...form.register('full_name')} className={field('full_name')} placeholder="Nguyễn Văn An" />
            {err.full_name && <p className="text-red-500 text-xs mt-1">{err.full_name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò *</label>
              <select {...form.register('role')} className={field('role')}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí công việc</label>
              <input {...form.register('job_title')} className={field('job_title')} placeholder="Bếp trưởng" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ca làm việc</label>
            <Controller
              control={form.control}
              name="shifts"
              render={({ field: f }) => (
                <div className="flex gap-2">
                  {SHIFTS.map(sh => {
                    const active = (f.value ?? []).includes(sh.value)
                    return (
                      <button
                        key={sh.value}
                        type="button"
                        onClick={() => {
                          const cur = f.value ?? []
                          f.onChange(
                            active ? cur.filter(x => x !== sh.value) : [...cur, sh.value]
                          )
                        }}
                        className={`min-h-[44px] px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                          active
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-orange-400'
                        }`}
                      >
                        {sh.label}
                      </button>
                    )
                  })}
                </div>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trách nhiệm / Mô tả công việc</label>
            <textarea
              {...form.register('responsibilities')}
              rows={3}
              maxLength={500}
              placeholder="Mô tả công việc và trách nhiệm..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input {...form.register('phone')} className={field('phone')} placeholder="0901234567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" {...form.register('email')} className={field('email')} placeholder="an@quán.vn" />
              {err.email && <p className="text-red-500 text-xs mt-1">{err.email.message}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[44px] py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 min-h-[44px] py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : mode === 'add' ? 'Tạo tài khoản' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
