'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { register } from '@/features/auth/auth.api'
import { useAuthStore } from '@/features/auth/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const ROLES = [
  { value: 'customer', label: 'Khách hàng' },
  { value: 'chef',     label: 'Đầu bếp' },
  { value: 'cashier',  label: 'Thu ngân' },
  { value: 'manager',  label: 'Quản lý' },
  { value: 'admin',    label: 'Admin' },
] as const

const schema = z.object({
  username:  z.string().min(3, 'Tối thiểu 3 ký tự'),
  full_name: z.string().min(2, 'Tối thiểu 2 ký tự'),
  role:      z.enum(['customer', 'chef', 'cashier', 'manager', 'admin']),
  password:  z.string().min(6, 'Tối thiểu 6 ký tự'),
  confirm:   z.string().min(6, 'Tối thiểu 6 ký tự'),
}).refine(d => d.password === d.confirm, {
  message: 'Mật khẩu không khớp',
  path: ['confirm'],
})
type FormValues = z.infer<typeof schema>

const redirectByRole: Record<string, string> = {
  chef:     '/kds',
  cashier:  '/pos',
  manager:  '/admin',
  admin:    '/admin',
  customer: '/menu',
}

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth, user } = useAuthStore()

  useEffect(() => {
    if (user) router.push(redirectByRole[user.role] ?? '/dashboard')
  }, [user, router])

  const {
    register: field,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'customer' },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const { user: newUser, access_token } = await register(
        values.username,
        values.password,
        values.full_name,
        values.role,
      )
      setAuth(newUser, access_token)
      router.push(redirectByRole[newUser.role] ?? '/dashboard')
    } catch (err: unknown) {
      const code = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error
      if (code === 'USERNAME_TAKEN') {
        setError('username', { message: 'Tên đăng nhập đã tồn tại' })
      } else {
        setError('confirm', { message: 'Đã xảy ra lỗi, vui lòng thử lại' })
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-card rounded-2xl p-8 w-full max-w-sm shadow-lg">
        <h1 className="font-display text-2xl text-foreground text-center mb-2">
          Quán Bánh Cuốn
        </h1>
        <p className="text-muted-fg text-sm text-center mb-8">Tạo tài khoản mới</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-foreground text-sm">
              Tên đăng nhập
            </Label>
            <Input
              id="username"
              autoComplete="username"
              {...field('username')}
              className="bg-muted border-border text-foreground placeholder:text-muted-fg"
            />
            {errors.username && (
              <p className="text-urgent text-xs">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="full_name" className="text-foreground text-sm">
              Họ và tên
            </Label>
            <Input
              id="full_name"
              autoComplete="name"
              {...field('full_name')}
              className="bg-muted border-border text-foreground placeholder:text-muted-fg"
            />
            {errors.full_name && (
              <p className="text-urgent text-xs">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-foreground text-sm">
              Vai trò
            </Label>
            <select
              id="role"
              {...field('role')}
              className="w-full rounded-md bg-muted border border-border text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {errors.role && (
              <p className="text-urgent text-xs">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-foreground text-sm">
              Mật khẩu
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...field('password')}
              className="bg-muted border-border text-foreground placeholder:text-muted-fg"
            />
            {errors.password && (
              <p className="text-urgent text-xs">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-foreground text-sm">
              Xác nhận mật khẩu
            </Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              {...field('confirm')}
              className="bg-muted border-border text-foreground placeholder:text-muted-fg"
            />
            {errors.confirm && (
              <p className="text-urgent text-xs">{errors.confirm.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
          >
            {isSubmitting ? 'Đang tạo tài khoản…' : 'Đăng ký'}
          </Button>
        </form>

        <p className="text-muted-fg text-xs text-center mt-6">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}
