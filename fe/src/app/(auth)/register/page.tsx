'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { register } from '@/features/auth/auth.api'
import { useAuthStore } from '@/features/auth/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  username: z.string().min(3, 'Tối thiểu 3 ký tự'),
  password: z.string().min(6, 'Tối thiểu 6 ký tự'),
  confirm:  z.string().min(6, 'Tối thiểu 6 ký tự'),
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
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    try {
      const { user: newUser, access_token } = await register(values.username, values.password)
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
      </div>
    </div>
  )
}
