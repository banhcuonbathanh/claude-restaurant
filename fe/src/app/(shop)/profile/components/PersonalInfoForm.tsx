'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { UpdateProfileForm } from '@/hooks/useCustomerProfile'

const schema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  phone: z.string().regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)'),
  address: z.string().min(5, 'Địa chỉ quá ngắn'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
})

interface Props {
  defaultValues?: Partial<UpdateProfileForm>
  onSubmit: (data: UpdateProfileForm) => void
  isLoading: boolean
  formId: string
}

export function PersonalInfoForm({ defaultValues, onSubmit, isLoading, formId }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', address: '', email: '', ...defaultValues },
  })

  useEffect(() => {
    if (defaultValues) reset(defaultValues)
  }, [defaultValues, reset])

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="px-4 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">
          Họ và tên <span className="text-urgent">*</span>
        </Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Nguyễn Văn A"
          disabled={isLoading}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className={errors.name ? 'border-urgent focus-visible:ring-urgent' : ''}
        />
        {errors.name && (
          <p id="name-error" className="text-xs text-urgent" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">
          Số điện thoại <span className="text-urgent">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          inputMode="numeric"
          {...register('phone')}
          placeholder="0912 345 678"
          disabled={isLoading}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
          className={errors.phone ? 'border-urgent focus-visible:ring-urgent' : ''}
        />
        {errors.phone && (
          <p id="phone-error" className="text-xs text-urgent" role="alert">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">
          Số nhà / Địa chỉ <span className="text-urgent">*</span>
        </Label>
        <Input
          id="address"
          {...register('address')}
          placeholder="123 Đường Lê Lợi, Q.1, TP.HCM"
          disabled={isLoading}
          aria-describedby={errors.address ? 'address-error' : undefined}
          className={errors.address ? 'border-urgent focus-visible:ring-urgent' : ''}
        />
        {errors.address && (
          <p id="address-error" className="text-xs text-urgent" role="alert">
            {errors.address.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-muted-fg">
          Email <span className="text-muted-fg text-xs font-normal">(tùy chọn)</span>
        </Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          {...register('email')}
          placeholder="nguyenvana@email.com"
          disabled={isLoading}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={errors.email ? 'border-urgent focus-visible:ring-urgent' : ''}
        />
        {errors.email && (
          <p id="email-error" className="text-xs text-urgent" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>
    </form>
  )
}
